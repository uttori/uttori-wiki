/**
 * Extract text from an attachment.
 * For PDFs, this now preserves page boundaries to help with chunking.
 * @param {import('../search-provider-sqlite.js').SearchSQLiteConfig} config The configuration.
 * @param {import('../../wiki.js').UttoriWikiDocumentAttachment} attachment The attachment.
 * @returns {Promise<string>} The text of the attachment.
 */
export function extractAttachmentText(config: import("../search-provider-sqlite.js").SearchSQLiteConfig, attachment: import("../../wiki.js").UttoriWikiDocumentAttachment): Promise<string>;
//# sourceMappingURL=attachment-extractor.d.ts.map