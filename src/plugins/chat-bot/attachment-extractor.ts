import { createDebug } from '../../debug.js';
import path from 'node:path';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import type { Output } from 'pdf2json';

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
export async function extractPdfText(buffer: Buffer): Promise<string> {
  // The parser emits no completion event for an empty buffer.
  if (!buffer.length) throw new Error('Cannot parse an empty PDF.');
  const { default: PDFParser } = await import('pdf2json');
  const parser = new PDFParser();
  try {
    const { Pages } = await new Promise<Output>((resolve, reject) => {
      parser.on('pdfParser_dataReady', resolve);
      parser.on('pdfParser_dataError', error => reject(error instanceof Error ? error : new Error(String(error.parserError))));
      parser.parseBuffer(buffer, 0);
    });
    const pages: string[] = [];
    for (const [index, page] of Pages.entries()) {
      // A style change inside a text block need not separate words. The parser supplies literal text, including percent signs.
      const text = page.Texts.map(block => block.R.map(run => run.T).join('')).filter(Boolean).join(' ').trim();
      if (text) pages.push(`[Page ${index + 1}]\n${text}`);
    }
    return pages.join('\n\n---\n\n');
  } finally {
    parser.destroy();
  }
}
