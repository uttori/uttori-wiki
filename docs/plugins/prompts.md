<a name="buildPromptMessages"></a>

## buildPromptMessages(userQuestion, slugs, opts) ⇒ <code>Array.&lt;ChatBotMessage&gt;</code>
Build messages for the AI chat bot.

**Kind**: global function  
**Returns**: <code>Array.&lt;ChatBotMessage&gt;</code> - The messages for the AI chat bot.  

| Param | Type | Description |
| --- | --- | --- |
| userQuestion | <code>string</code> | The user's question. |
| slugs | <code>Array.&lt;string&gt;</code> | The slugs of the sources to use as context. |
| opts | <code>object</code> | The options for the prompt. |
| opts.maxContextCharacters | <code>number</code> | The maximum number of characters to include in the context. |

