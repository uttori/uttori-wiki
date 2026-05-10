/**
 * Build messages for the AI chat bot.
 * @param {string} userQuestion The user's question.
 * @param {string[]} slugs The slugs of the sources to use as context.
 * @param {object} opts The options for the prompt.
 * @param {number} opts.maxContextCharacters The maximum number of characters to include in the context.
 * @returns {import('../ai-chat-bot.js').ChatBotMessage[]} The messages for the AI chat bot.
 */
export function buildPromptMessages(userQuestion: string, slugs: string[], opts: {
    maxContextCharacters: number;
}): import("../ai-chat-bot.js").ChatBotMessage[];
//# sourceMappingURL=prompts.d.ts.map