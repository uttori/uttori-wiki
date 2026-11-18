/**
 * Extract text from an attachment.
 * For PDFs, this now preserves page boundaries to help with chunking.
 * @param config The configuration.
 * @param attachment The attachment.
 * @returns The text of the attachment.
 */
export declare function extractAttachmentText(config: import('../search-provider-sqlite.js').SearchSQLiteConfig, attachment: import('../../wiki.js').UttoriWikiDocumentAttachment): Promise<string>;
/**
 * Extract the text layer of a PDF and preserve its original page numbers.
 * @param buffer Original PDF bytes.
 * @returns Page-labeled text, or an empty string when the PDF has no text layer.
 * @throws {Error} If the PDF parser rejects the original.
 */
export declare function extractPdfText(buffer: Buffer): Promise<string>;
//# sourceMappingURL=attachment-extractor.d.ts.map