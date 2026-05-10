import path from 'node:path';
import fs from 'node:fs';
import fsp from 'node:fs/promises';

import { PdfReader } from 'pdfreader';

let debug = (..._) => {};
/* c8 ignore next 1 */
try { const { default: d } = await import('debug'); debug = d('Uttori.Plugin.AIChatBot.AttachmentExtractor'); } catch {}

/**
 * Extract text from an attachment.
 * For PDFs, this now preserves page boundaries to help with chunking.
 * @param {import('../ai-chat-bot.js').AIChatBotConfig} config The configuration.
 * @param {import('../../wiki.js').UttoriWikiDocumentAttachment} attachment The attachment.
 * @returns {Promise<string>} The text of the attachment.
 */
export async function extractAttachmentText(config, attachment) {
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
      /** @type {string} */
      const text = await new Promise((resolve, reject) => {
        const reader = new PdfReader();
        const textChunks = [];
        let currentPage = 0;
        /** @type {string[]} */
        const pageTexts = [];

        reader.parseBuffer(buffer, (err, item) => {
          if (err) {
            debug('extractAttachmentText: error parsing pdf:', err);
            reject(new Error(String(err)));
            return;
          }
          if (!item) {
            // End of parsing, resolve with page-separated text
            debug('extractAttachmentText: end of parsing pdf:', textChunks.length, 'pages:', pageTexts.length);
            // Join pages with clear separators to help with chunking
            const pageSeparatedText = pageTexts.map((pageText, idx) =>
              `[Page ${idx + 1}]\n${pageText.trim()}`,
            ).join('\n\n---\n\n');
            resolve(pageSeparatedText);
            return;
          }
          if (item.text) {
            textChunks.push(item.text);
          }
          // Detect page breaks - PdfReader emits page items
          if (item.page !== undefined && item.page !== currentPage) {
            if (currentPage > 0 && textChunks.length > 0) {
              // Save the previous page's text
              const pageText = textChunks.join(' ');
              debug('extractAttachmentText: page', currentPage, 'text length:', pageText.length);
              pageTexts.push(pageText);
              textChunks.length = 0; // Clear for next page
            }
            currentPage = item.page;
            debug('extractAttachmentText: new page:', currentPage);
          }
        });
      });
      return text || '';
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
