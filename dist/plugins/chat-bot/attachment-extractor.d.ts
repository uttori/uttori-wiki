/**
 * Extract text from an attachment.
 * For PDFs, this now preserves page boundaries to help with chunking.
 * @param {import('../ai-chat-bot.js').AIChatBotConfig} config The configuration.
 * @param {import('../../wiki.js').UttoriWikiDocumentAttachment} attachment The attachment.
 * @returns {Promise<string>} The text of the attachment.
 */
export function extractAttachmentText(config: import("../ai-chat-bot.js").AIChatBotConfig, attachment: import("../../wiki.js").UttoriWikiDocumentAttachment): Promise<string>;
//# sourceMappingURL=attachment-extractor.d.ts.map