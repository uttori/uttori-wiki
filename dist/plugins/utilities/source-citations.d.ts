import type { UttoriWikiDocument } from '../../wiki.js';
/** Public-safe reference to private original bytes and the exact importer output used for line citations. */
export interface CapturedSource {
    path: string;
    sha256: string;
    format: 'pdf' | 'html';
    textSha256: string;
}
/** The full digest pins the archived bytes. Line bounds, when supplied, are one-based and inclusive. */
interface CitationRequest {
    sourceSlug: string;
    sha256: string;
    quote: string;
    startLine?: number;
    endLine?: number;
}
/** Failure reasons safe to return to clients without disclosing filesystem paths or original text. */
type ArchiveUnavailable = 'invalid_source' | 'invalid_path' | 'source_unavailable' | 'revision_mismatch' | 'source_too_large';
/**
 * Validate untrusted citation input before looking up a source note.
 * @param input Tool arguments or the CLI's JSON object.
 * @returns A request bound to the source slug's full digest.
 * @throws {Error} If the source identity, quote, or optional line range is invalid.
 */
export declare function parseCitationRequest(input: unknown): CitationRequest;
/**
 * Resolve the quoteable text for a source note after checking the exact original revision.
 * @param document Source-note identity and archive metadata.
 * @param archiveDirectory Root for curated Markdown originals.
 * @param [maxBytes] Optional file size ceiling for network-facing verification.
 * @param [captureDirectory] Private inbox root. Required for PDF and HTML captures.
 * @returns Checked Markdown or importer text, or an unavailable reason.
 */
export declare function readArchivedSource({ slug, source }: Pick<UttoriWikiDocument, 'slug'> & {
    source?: unknown;
}, archiveDirectory: string, maxBytes?: number, captureDirectory?: string): Promise<{
    bytes: Buffer;
} | {
    reason: ArchiveUnavailable;
}>;
/**
 * Verify a literal quotation against one revision. The receipt deliberately omits raw text and paths.
 * @param request Validated citation, including the digest the reader saw.
 * @param document The source note looked up by slug in the wiki's storage.
 * @param archiveDirectory Maintainer-controlled archive root.
 * @param [captureDirectory] Private inbox root for captured originals and importer text.
 * @returns Verification status and source identity. A match includes the quote's actual line numbers.
 */
export declare function verifySourceCitation(request: CitationRequest, document: UttoriWikiDocument | undefined, archiveDirectory: string, captureDirectory?: string): Promise<{
    readonly sourceSlug: string;
    readonly sha256: string;
    readonly status: 'unavailable';
    readonly reason: 'source_note_unavailable';
} | {
    readonly sourceSlug: string;
    readonly sha256: string;
    readonly status: 'unavailable';
    readonly reason: ArchiveUnavailable;
} | {
    readonly sourceSlug: string;
    readonly sha256: string;
    readonly status: 'unavailable';
    readonly reason: 'invalid_utf8';
} | {
    readonly sourceSlug: string;
    readonly sha256: string;
    readonly status: 'mismatch';
    readonly reason: 'line_range_unavailable';
} | {
    readonly sourceSlug: string;
    readonly sha256: string;
    readonly status: 'mismatch';
    readonly reason: 'quote_not_found';
} | {
    readonly sourceSlug: string;
    readonly sha256: string;
    readonly status: 'verified';
    readonly startLine: number;
    readonly endLine: number;
}>;
export {};
//# sourceMappingURL=source-citations.d.ts.map