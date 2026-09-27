<a name="buildPromptMessages"></a>

## buildPromptMessages(userQuestion, slugs, opts) ⇒
Build messages for the AI chat bot.

**Kind**: global function\
**Returns**: The messages for the AI chat bot.\

| Param | Description |
| --- | --- |
| userQuestion | The user's question. |
| slugs | The slugs of the sources to use as context. |
| opts | The options for the prompt. |
| opts.maxContextCharacters | The maximum number of characters to include in the context. |

## TypeScript declarations

<details>
<summary>View documented types and signatures</summary>

```typescript
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
```

</details>
