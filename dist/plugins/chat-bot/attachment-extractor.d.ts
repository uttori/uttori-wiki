/**
 * Extract text from an attachment.
 * For PDFs, this now preserves page boundaries to help with chunking.
 * @param config The configuration.
 * @param attachment The attachment.
 * @returns The text of the attachment.
 */
export declare function extractAttachmentText(config: import('../search-provider-sqlite.js').SearchSQLiteConfig, attachment: import('../../wiki.js').UttoriWikiDocumentAttachment): Promise<string>;
//# sourceMappingURL=attachment-extractor.d.ts.map