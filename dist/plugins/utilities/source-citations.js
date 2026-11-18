import { createHash } from 'node:crypto';
import { constants } from 'node:fs';
import { lstat, open, realpath } from 'node:fs/promises';
import path from 'node:path';
const sourceSlugPattern = /^source-[a-f0-9]{16}$/;
const digestPattern = /^[a-f0-9]{64}$/;
const maxArchiveBytes = 16 * 1024 * 1024;
const maxQuoteBytes = 4096;
const capturePathPattern = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\/original$/;
/**
 * Validate untrusted citation input before looking up a source note.
 * @param input Tool arguments or the CLI's JSON object.
 * @returns A request bound to the source slug's full digest.
 * @throws {Error} If the source identity, quote, or optional line range is invalid.
 */
export function parseCitationRequest(input) {
    if (!input || typeof input !== 'object' || Array.isArray(input))
        throw new Error('Expected a citation object.');
    const { sourceSlug, sha256, quote, startLine, endLine } = input;
    if (typeof sourceSlug !== 'string' || !sourceSlugPattern.test(sourceSlug)
        || typeof sha256 !== 'string' || !digestPattern.test(sha256) || sourceSlug !== `source-${sha256.slice(0, 16)}`) {
        throw new Error('Supply the source-note slug and its full lowercase SHA-256 digest.');
    }
    if (typeof quote !== 'string' || !quote.trim() || Buffer.byteLength(quote) > maxQuoteBytes) {
        throw new Error(`Supply a nonblank exact quote of at most ${maxQuoteBytes} UTF-8 bytes.`);
    }
    if (startLine === undefined && endLine === undefined)
        return { sourceSlug, sha256, quote };
    if (typeof startLine !== 'number' || typeof endLine !== 'number' || !Number.isSafeInteger(startLine)
        || !Number.isSafeInteger(endLine) || startLine < 1 || endLine < startLine) {
        throw new Error('Supply both startLine and endLine as an ordered, one-based inclusive range.');
    }
    return { sourceSlug, sha256, quote, startLine, endLine };
}
/**
 * Read a validated relative archive path without following symlinks or disclosing filesystem errors.
 * @param directory Maintainer-controlled archive root.
 * @param archivePath Safe relative path validated by the caller.
 * @param sha256 Required digest of the bytes read.
 * @param maxBytes Maximum bytes permitted for this file.
 * @returns The checked bytes or an unavailable reason.
 */
async function readPinnedFile(directory, archivePath, sha256, maxBytes) {
    try {
        if (!(await lstat(directory)).isDirectory())
            return { reason: 'source_unavailable' };
        const root = await realpath(directory);
        const file = path.join(root, archivePath);
        // Canonicalizing the parent path catches nested symlinks. O_NOFOLLOW also protects the final open.
        if (await realpath(file) !== file || !(await lstat(file)).isFile())
            return { reason: 'source_unavailable' };
        const handle = await open(file, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK);
        try {
            const info = await handle.stat();
            if (!info.isFile())
                return { reason: 'source_unavailable' };
            if (info.size > maxBytes)
                return { reason: 'source_too_large' };
            const bytes = await handle.readFile();
            if (bytes.length > maxBytes)
                return { reason: 'source_too_large' };
            if (createHash('sha256').update(bytes).digest('hex') !== sha256)
                return { reason: 'revision_mismatch' };
            return { bytes };
        }
        finally {
            await handle.close();
        }
    }
    catch {
        return { reason: 'source_unavailable' };
    }
}
/**
 * Resolve the quoteable text for a source note after checking the exact original revision.
 * @param document Source-note identity and archive metadata.
 * @param archiveDirectory Root for curated Markdown originals.
 * @param [maxBytes] Optional file size ceiling for network-facing verification.
 * @param [captureDirectory] Private inbox root. Required for PDF and HTML captures.
 * @returns Checked Markdown or importer text, or an unavailable reason.
 */
export async function readArchivedSource({ slug, source }, archiveDirectory, maxBytes = Infinity, captureDirectory) {
    const { path: archivePath, sha256, format, textSha256 } = (source ?? {});
    if (typeof sha256 !== 'string' || !digestPattern.test(sha256) || slug !== `source-${sha256.slice(0, 16)}`) {
        return { reason: 'invalid_source' };
    }
    if (format !== undefined) {
        if ((format !== 'pdf' && format !== 'html') || typeof textSha256 !== 'string' || !digestPattern.test(textSha256)) {
            return { reason: 'invalid_source' };
        }
        // A source note may name only an original, never queue metadata or other private files.
        if (typeof archivePath !== 'string' || !capturePathPattern.test(archivePath))
            return { reason: 'invalid_path' };
        if (!captureDirectory)
            return { reason: 'source_unavailable' };
        const original = await readPinnedFile(captureDirectory, archivePath, sha256, maxBytes);
        if ('reason' in original)
            return original;
        return readPinnedFile(captureDirectory, `${archivePath.slice(0, -'original'.length)}citation.txt`, textSha256, maxBytes);
    }
    // Reject traversal, absolute paths, and Windows drive-relative paths before touching the filesystem.
    if (typeof archivePath !== 'string' || !archivePath.endsWith('.md') || /^[a-z]:/i.test(archivePath)
        || archivePath.includes('\\') || archivePath.includes('\0')
        || archivePath.split('/').some(part => !part || part === '.' || part === '..')) {
        return { reason: 'invalid_path' };
    }
    return readPinnedFile(archiveDirectory, archivePath, sha256, maxBytes);
}
/**
 * Resolve the character offsets of a requested inclusive line range without normalizing newlines.
 * @param source Decoded archive text.
 * @param startLine One-based first line.
 * @param endLine One-based last line.
 * @returns The allowed half-open character range, or undefined if those lines do not exist.
 */
function lineRange(source, startLine, endLine) {
    let line = 1;
    let start = 0;
    for (const newline of source.matchAll(/\r\n|[\r\n]/g)) {
        if (line === endLine)
            return { start, end: newline.index + newline[0].length };
        line++;
        if (line === startLine)
            start = newline.index + newline[0].length;
    }
    if (line === endLine && (source.length === 0 || !/[\r\n]$/.test(source)))
        return { start, end: source.length };
    return undefined;
}
/**
 * Find the one-based source line containing a character offset. The newline belongs to the preceding line.
 * @param source Decoded archive text.
 * @param offset Zero-based character offset into the source.
 * @returns One-based line number.
 */
function lineAt(source, offset) {
    let line = 1;
    for (const newline of source.matchAll(/\r\n|[\r\n]/g)) {
        if (newline.index + newline[0].length > offset)
            break;
        line++;
    }
    return line;
}
/**
 * Verify a literal quotation against one revision. The receipt deliberately omits raw text and paths.
 * @param request Validated citation, including the digest the reader saw.
 * @param document The source note looked up by slug in the wiki's storage.
 * @param archiveDirectory Maintainer-controlled archive root.
 * @param [captureDirectory] Private inbox root for captured originals and importer text.
 * @returns Verification status and source identity. A match includes the quote's actual line numbers.
 */
export async function verifySourceCitation(request, document, archiveDirectory, captureDirectory) {
    const { sourceSlug, sha256, quote, startLine, endLine } = request;
    const identity = { sourceSlug, sha256 };
    if (document?.slug !== sourceSlug || document.wikiKind !== 'source') {
        return { ...identity, status: 'unavailable', reason: 'source_note_unavailable' };
    }
    if (document.source?.sha256 !== sha256) {
        return { ...identity, status: 'unavailable', reason: 'revision_mismatch' };
    }
    const original = await readArchivedSource(document, archiveDirectory, maxArchiveBytes, captureDirectory);
    if ('reason' in original)
        return { ...identity, status: 'unavailable', reason: original.reason };
    let source;
    try {
        // Fatal decoding prevents a corrupt byte from passing as a literal replacement character.
        source = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(original.bytes);
    }
    catch {
        return { ...identity, status: 'unavailable', reason: 'invalid_utf8' };
    }
    let range = { start: 0, end: source.length };
    if (startLine !== undefined && endLine !== undefined) {
        const requested = lineRange(source, startLine, endLine);
        if (!requested)
            return { ...identity, status: 'mismatch', reason: 'line_range_unavailable' };
        range = requested;
    }
    const offset = source.indexOf(quote, range.start);
    if (offset < 0 || offset + quote.length > range.end) {
        return { ...identity, status: 'mismatch', reason: 'quote_not_found' };
    }
    return { ...identity, status: 'verified', startLine: lineAt(source, offset), endLine: lineAt(source, offset + quote.length - 1) };
}
//# sourceMappingURL=source-citations.js.map