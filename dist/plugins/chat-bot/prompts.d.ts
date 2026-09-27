/**
 * Build messages for the AI chat bot.
 * @param userQuestion The user's question.
 * @param slugs The slugs of the sources to use as context.
 * @param opts The options for the prompt.
 * @param opts.maxContextCharacters The maximum number of characters to include in the context.
 * @returns The messages for the AI chat bot.
 */
export declare function buildPromptMessages(userQuestion: string, slugs: string[], opts: {
    maxContextCharacters: number;
}): import('../ai-chat-bot.js').ChatBotMessage[];
//# sourceMappingURL=prompts.d.ts.map