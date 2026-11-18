import { createDebug } from '../../debug.js';
import path from 'node:path';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import { PdfReader } from 'pdfreader';

const debug = createDebug('Uttori.Plugin.AIChatBot.AttachmentExtractor');

/**
 * Extract text from an attachment.
 * For PDFs, this now preserves page boundaries to help with chunking.
 * @param config The configuration.
 * @param attachment The attachment.
 * @returns The text of the attachment.
 */
export async function extractAttachmentText(config: import('../search-provider-sqlite.js').SearchSQLiteConfig, attachment: import('../../wiki.js').UttoriWikiDocumentAttachment): Promise<string> {
  // A missing attachment root cannot be resolved safely against the process directory.
  if (typeof config.attachmentsRoot !== 'string') throw new TypeError('Missing attachmentsRoot.');
  const absolutePath = path.resolve(config.attachmentsRoot, attachment.path);
  if (!fs.existsSync(absolutePath)) {
    debug('extractAttachmentText: file not found:', absolutePath);
    return '';
  }
  if (attachment.skip) {
    debug('extractAttachmentText: skipping attachment:', absolutePath);
    return '';
  }
  const fileExtension = path.extname(absolutePath).toLowerCase();
  const buffer = await fsp.readFile(absolutePath);
  debug('extractAttachmentText: absolutePath:', absolutePath);
  debug('extractAttachmentText: type:', attachment.type);
  debug('extractAttachmentText: file extension:', fileExtension);
  if (attachment.type?.includes('pdf') || fileExtension === '.pdf') {
    try {

      return await extractPdfText(buffer);
    } catch (error) {
      debug('extractAttachmentText: error parsing pdf:', error);
      return '';
    }
  }
  // Parse text files
  if (attachment.type?.startsWith('text/') || ['.txt', '.md', '.csv', '.log'].includes(fileExtension)) {
    return buffer.toString('utf8');
  }
  debug(`extractAttachmentText: mime type ${attachment.type} / file type ${fileExtension} is not yet supported: ${absolutePath}`);
  return '';
}

/**
 * Extract the text layer of a PDF and preserve its original page numbers.
 * @param buffer Original PDF bytes.
 * @returns Page-labeled text, or an empty string when the PDF has no text layer.
 * @throws {Error} If the PDF parser rejects the original.
 */
export function extractPdfText(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const pages: string[] = [];
    let page = 0;
    let chunks: string[] = [];
    const flush = () => {
      const text = chunks.join(' ').trim();
      if (page && text) pages.push(`[Page ${page}]\n${text}`);
      chunks = [];
    };

    new PdfReader().parseBuffer(buffer, (error, item) => {
      if (error) {
        reject(new Error(String(error)));
        return;
      }
      if (!item) {
        // The parser emits no following page event for the last page or for single-page files.
        flush();
        resolve(pages.join('\n\n---\n\n'));
        return;
      }
      if (item.page !== undefined && item.page !== page) {
        flush();
        page = item.page;
      }
      if (item.text) chunks.push(item.text);
    });
  });
}
