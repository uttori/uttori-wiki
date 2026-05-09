## Classes

<dl>
<dt><a href="#AIChatBot">AIChatBot</a></dt>
<dd><p>Uttori AI Chat Bot
Search a UttoriWiki database using LLMs.</p>
</dd>
</dl>

## Members

<dl>
<dt><a href="#wss">wss</a> : <code>module:ws~WebSocketServer</code> | <code>undefined</code></dt>
<dd></dd>
</dl>

## Constants

<dl>
<dt><a href="#memStore">memStore</a></dt>
<dd><p>Setup the memory store.</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#RetrievedChunk">RetrievedChunk</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#RetrieveResponse">RetrieveResponse</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#FtsRow">FtsRow</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#Block">Block</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#ChunkWithMeta">ChunkWithMeta</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#BlendedChunk">BlendedChunk</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#ChatBotMessage">ChatBotMessage</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#AIChatBotConfig">AIChatBotConfig</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#AIChatBotApiRequestBody">AIChatBotApiRequestBody</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#AIChatBotSearchUpdate">AIChatBotSearchUpdate</a> : <code>object</code></dt>
<dd></dd>
</dl>

<a name="AIChatBot"></a>

## AIChatBot
Uttori AI Chat Bot
Search a UttoriWiki database using LLMs.

**Kind**: global class  

* [AIChatBot](#AIChatBot)
    * [new AIChatBot()](#new_AIChatBot_new)
    * [.configKey](#AIChatBot.configKey) ⇒ <code>string</code>
    * [.defaultConfig()](#AIChatBot.defaultConfig) ⇒ [<code>AIChatBotConfig</code>](#AIChatBotConfig)
    * [.validateConfig(config, [_context])](#AIChatBot.validateConfig)
    * [.register(context)](#AIChatBot.register)
    * [.bootstrapIndex(config, context)](#AIChatBot.bootstrapIndex) ⇒ <code>Promise.&lt;void&gt;</code>
    * [.onSearchUpdate(payload, context)](#AIChatBot.onSearchUpdate) ⇒ <code>Promise.&lt;void&gt;</code>
    * [.onSearchDelete(document, context)](#AIChatBot.onSearchDelete)
    * [.bindRoutes(server, context)](#AIChatBot.bindRoutes)
    * [.bindWebSocket(server, context)](#AIChatBot.bindWebSocket)
    * [.runChatPass(ws, messages, config)](#AIChatBot.runChatPass) ⇒ <code>Promise.&lt;{messages: Array.&lt;ChatBotMessage&gt;, finished: boolean}&gt;</code>
    * [.documentsHandler(context)](#AIChatBot.documentsHandler) ⇒ <code>module:express~RequestHandler</code>
    * [.summarizeTurn(baseUrl, model, prevSummary, lastTurns, newUser, newAssistant)](#AIChatBot.summarizeTurn) ⇒ <code>Promise.&lt;string&gt;</code>
    * [.openDatabase(config)](#AIChatBot.openDatabase) ⇒ <code>module:better-sqlite3~Database</code>

<a name="new_AIChatBot_new"></a>

### new AIChatBot()
**Example** *(AIChatBot)*  
```js
const content = AIChatBot.chat(context);
```
<a name="AIChatBot.configKey"></a>

### AIChatBot.configKey ⇒ <code>string</code>
The configuration key for plugin to look for in the provided configuration.

**Kind**: static property of [<code>AIChatBot</code>](#AIChatBot)  
**Returns**: <code>string</code> - The configuration key.  
**Example** *(AIChatBot.configKey)*  
```js
const config = { ...AIChatBot.defaultConfig(), ...context.config[AIChatBot.configKey] };
```
<a name="AIChatBot.defaultConfig"></a>

### AIChatBot.defaultConfig() ⇒ [<code>AIChatBotConfig</code>](#AIChatBotConfig)
The default configuration.

**Kind**: static method of [<code>AIChatBot</code>](#AIChatBot)  
**Returns**: [<code>AIChatBotConfig</code>](#AIChatBotConfig) - The configuration.  
**Example** *(AIChatBot.defaultConfig())*  
```js
const config = { ...AIChatBot.defaultConfig(), ...context.config[AIChatBot.configKey] };
```
<a name="AIChatBot.validateConfig"></a>

### AIChatBot.validateConfig(config, [_context])
Validates the provided configuration for required entries.

**Kind**: static method of [<code>AIChatBot</code>](#AIChatBot)  

| Param | Type | Description |
| --- | --- | --- |
| config | <code>Record.&lt;string, AIChatBotConfig&gt;</code> | A provided configuration to use. |
| [_context] | <code>UttoriContextWithPluginConfig.&lt;&#x27;uttori-plugin-ai-chat-bot&#x27;, AIChatBotConfig&gt;</code> | Unused. |

**Example** *(AIChatBot.validateConfig(config, _context))*  
```js
AIChatBot.validateConfig({ ... });
```
<a name="AIChatBot.register"></a>

### AIChatBot.register(context)
Register the plugin with a provided set of events on a provided Hook system.

**Kind**: static method of [<code>AIChatBot</code>](#AIChatBot)  

| Param | Type | Description |
| --- | --- | --- |
| context | <code>UttoriContextWithPluginConfig.&lt;&#x27;uttori-plugin-ai-chat-bot&#x27;, AIChatBotConfig&gt;</code> | A Uttori-like context. |

**Example** *(AIChatBot.register(context))*  
```js
const context = {
  hooks: {
    on: (event, callback) => { ... },
  },
  config: {
    [AIChatBot.configKey]: {
      ...,
      events: {
        bindRoutes: ['bind-routes'],
      },
    },
  },
};
AIChatBot.register(context);
```
<a name="AIChatBot.bootstrapIndex"></a>

### AIChatBot.bootstrapIndex(config, context) ⇒ <code>Promise.&lt;void&gt;</code>
Bootstrap the chat index at startup when configured.

**Kind**: static method of [<code>AIChatBot</code>](#AIChatBot)  
**Returns**: <code>Promise.&lt;void&gt;</code> - The indexing promise.  

| Param | Type | Description |
| --- | --- | --- |
| config | [<code>AIChatBotConfig</code>](#AIChatBotConfig) | The plugin configuration. |
| context | <code>UttoriContextWithPluginConfig.&lt;&#x27;uttori-plugin-ai-chat-bot&#x27;, AIChatBotConfig&gt;</code> | A Uttori-like context. |

<a name="AIChatBot.onSearchUpdate"></a>

### AIChatBot.onSearchUpdate(payload, context) ⇒ <code>Promise.&lt;void&gt;</code>
Update the chat index after documents are saved.

**Kind**: static method of [<code>AIChatBot</code>](#AIChatBot)  
**Returns**: <code>Promise.&lt;void&gt;</code> - The indexing promise.  

| Param | Type | Description |
| --- | --- | --- |
| payload | [<code>AIChatBotSearchUpdate</code>](#AIChatBotSearchUpdate) \| [<code>Array.&lt;AIChatBotSearchUpdate&gt;</code>](#AIChatBotSearchUpdate) | The search update payload. |
| context | <code>UttoriContextWithPluginConfig.&lt;&#x27;uttori-plugin-ai-chat-bot&#x27;, AIChatBotConfig&gt;</code> | A Uttori-like context. |

<a name="AIChatBot.onSearchDelete"></a>

### AIChatBot.onSearchDelete(document, context)
Remove deleted documents from the chat index.

**Kind**: static method of [<code>AIChatBot</code>](#AIChatBot)  

| Param | Type | Description |
| --- | --- | --- |
| document | <code>UttoriWikiDocument</code> | The deleted document. |
| context | <code>UttoriContextWithPluginConfig.&lt;&#x27;uttori-plugin-ai-chat-bot&#x27;, AIChatBotConfig&gt;</code> | A Uttori-like context. |

<a name="AIChatBot.bindRoutes"></a>

### AIChatBot.bindRoutes(server, context)
Add the upload route to the server object.

**Kind**: static method of [<code>AIChatBot</code>](#AIChatBot)  

| Param | Type | Description |
| --- | --- | --- |
| server | <code>module:express~Application</code> | An Express server instance. |
| context | <code>UttoriContextWithPluginConfig.&lt;&#x27;uttori-plugin-ai-chat-bot&#x27;, AIChatBotConfig&gt;</code> | A Uttori-like context. |

**Example** *(AIChatBot.bindRoutes(server, context))*  
```js
const context = {
  config: {
    [AIChatBot.configKey]: {
      middlewarePublicRoute: [],
    },
  },
};
AIChatBot.bindRoutes(server, context);
```
<a name="AIChatBot.bindWebSocket"></a>

### AIChatBot.bindWebSocket(server, context)
Bind the WebSocket server to the server object.

**Kind**: static method of [<code>AIChatBot</code>](#AIChatBot)  

| Param | Type | Description |
| --- | --- | --- |
| server | <code>module:http~Server</code> | An Express server instance. |
| context | <code>UttoriContextWithPluginConfig.&lt;&#x27;uttori-plugin-ai-chat-bot&#x27;, AIChatBotConfig&gt;</code> | A Uttori-like context. |

**Example** *(AIChatBot.bindWebSocket(server, context))*  
```js
AIChatBot.bindWebSocket(server, context);
```
<a name="AIChatBot.runChatPass"></a>

### AIChatBot.runChatPass(ws, messages, config) ⇒ <code>Promise.&lt;{messages: Array.&lt;ChatBotMessage&gt;, finished: boolean}&gt;</code>
Helper: stream one /api/chat call and forward chunks to client,
intercepting tool calls. Returns {messages, finished}
messages: updated transcript to continue if tool used
finished: true once an assistant final turn is produced

**Kind**: static method of [<code>AIChatBot</code>](#AIChatBot)  
**Returns**: <code>Promise.&lt;{messages: Array.&lt;ChatBotMessage&gt;, finished: boolean}&gt;</code> - The messages and finished status.  

| Param | Type | Description |
| --- | --- | --- |
| ws | <code>module:ws~WebSocket</code> | The WebSocket instance. |
| messages | [<code>Array.&lt;ChatBotMessage&gt;</code>](#ChatBotMessage) | The messages. |
| config | [<code>AIChatBotConfig</code>](#AIChatBotConfig) | The configuration. |

<a name="AIChatBot.documentsHandler"></a>

### AIChatBot.documentsHandler(context) ⇒ <code>module:express~RequestHandler</code>
Handle requests to fetch available documents for the document selector.

**Kind**: static method of [<code>AIChatBot</code>](#AIChatBot)  
**Returns**: <code>module:express~RequestHandler</code> - The function to pass to Express.  

| Param | Type | Description |
| --- | --- | --- |
| context | <code>UttoriContextWithPluginConfig.&lt;&#x27;uttori-plugin-ai-chat-bot&#x27;, AIChatBotConfig&gt;</code> | A Uttori-like context. |

<a name="AIChatBot.summarizeTurn"></a>

### AIChatBot.summarizeTurn(baseUrl, model, prevSummary, lastTurns, newUser, newAssistant) ⇒ <code>Promise.&lt;string&gt;</code>
Summarize the conversation between the user and the assistant.

**Kind**: static method of [<code>AIChatBot</code>](#AIChatBot)  
**Returns**: <code>Promise.&lt;string&gt;</code> - The new summary of the conversation.  

| Param | Type | Description |
| --- | --- | --- |
| baseUrl | <code>string</code> | The base URL of the API. |
| model | <code>string</code> | The model to use for the summarizer. |
| prevSummary | <code>string</code> | The previous summary of the conversation. |
| lastTurns | <code>Array.&lt;object&gt;</code> | The last turns of the conversation. |
| newUser | <code>string</code> | The new user message. |
| newAssistant | <code>string</code> | The new assistant message. |

<a name="AIChatBot.openDatabase"></a>

### AIChatBot.openDatabase(config) ⇒ <code>module:better-sqlite3~Database</code>
Open the database and create the necessary tables if they don't exist.

**Kind**: static method of [<code>AIChatBot</code>](#AIChatBot)  
**Returns**: <code>module:better-sqlite3~Database</code> - The database.  

| Param | Type | Description |
| --- | --- | --- |
| config | [<code>Partial.&lt;AIChatBotConfig&gt;</code>](#AIChatBotConfig) | The configuration. |

<a name="wss"></a>

## wss : <code>module:ws~WebSocketServer</code> \| <code>undefined</code>
**Kind**: global variable  
<a name="memStore"></a>

## memStore
Setup the memory store.

**Kind**: global constant  
<a name="RetrievedChunk"></a>

## RetrievedChunk : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| rowid | <code>number</code> | The rowid of the chunk. |
| source_id | <code>string</code> | The source id of the chunk. |
| idx | <code>number</code> | The index of the chunk. |
| text | <code>string</code> | The text of the chunk. |
| token_count | <code>number</code> | The token count of the chunk. |
| sectionPath | <code>Array.&lt;string&gt;</code> | The section path of the chunk. |
| source | <code>object</code> | The source of the chunk. |
| source.id | <code>string</code> | The id of the source. |
| [source.title] | <code>string</code> | The title of the source. |
| [source.slug] | <code>string</code> | The slug of the source. |
| score | <code>number</code> | The score of the chunk. |

<a name="RetrieveResponse"></a>

## RetrieveResponse : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| query | <code>string</code> | The query. |
| chunks | [<code>Array.&lt;RetrievedChunk&gt;</code>](#RetrievedChunk) | The chunks. |
| citations | <code>Array.&lt;any&gt;</code> | The citations. |

<a name="FtsRow"></a>

## FtsRow : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| rowid | <code>number</code> | The rowid of the chunk. |
| source_id | <code>string</code> | The source id of the chunk. |
| idx | <code>number</code> | The index of the chunk. |
| text | <code>string</code> | The text of the chunk. |
| token_count | <code>number</code> | The token count of the chunk. |
| meta_json | <code>string</code> | The meta JSON of the chunk. |
| source_title | <code>string</code> | The title of the source. |
| source_slug | <code>string</code> | The slug of the source. |
| rank | <code>number</code> | The rank of the chunk. |

<a name="Block"></a>

## Block : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| [type] | <code>&quot;heading&quot;</code> \| <code>&quot;paragraph&quot;</code> | The type of block. |
| [idx] | <code>number</code> | The index of the block. |
| [level] | <code>number</code> | The level of the heading. |
| text | <code>string</code> | The text of the block. |
| sectionPath | <code>Array.&lt;string&gt;</code> | The section path of the block. |
| [tokenCount] | <code>number</code> | The token count of the block. |
| [tags] | <code>Array.&lt;string&gt;</code> | The tags of the block. |
| [slug] | <code>string</code> | The slug of the block. |

<a name="ChunkWithMeta"></a>

## ChunkWithMeta : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| text | <code>string</code> | The text of the chunk. |
| idx | <code>number</code> | The index of the chunk. |
| token_count | <code>number</code> | The token count of the chunk. |
| sectionPath | <code>Array.&lt;string&gt;</code> | The section path of the chunk. |
| [source_id] | <code>string</code> | The source id of the chunk. |
| [embedding] | <code>Array.&lt;number&gt;</code> | The embedding of the chunk. |
| [meta] | <code>object</code> | The meta JSON of the chunk. |

<a name="BlendedChunk"></a>

## BlendedChunk : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| rowid | <code>number</code> | The rowid of the chunk. |
| score | <code>number</code> | The score of the chunk. |
| titleBoost | <code>number</code> | The title boost of the chunk. |
| textBoost | <code>number</code> | The text boost of the chunk. |

<a name="ChatBotMessage"></a>

## ChatBotMessage : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| role | <code>&quot;system&quot;</code> \| <code>&quot;user&quot;</code> \| <code>&quot;assistant&quot;</code> \| <code>&quot;tool&quot;</code> | The role of the message. |
| content | <code>string</code> | The content of the message. |
| [name] | <code>string</code> | The name of the tool. |
| [slugs] | <code>Array.&lt;string&gt;</code> | The slugs of the sources to use as context. |

<a name="AIChatBotConfig"></a>

## AIChatBotConfig : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| [events] | <code>Record.&lt;string, Array.&lt;string&gt;&gt;</code> | Events to bind to. |
| websocketRoute | <code>string</code> | The WebSocket route for streaming to and from the chat bot interface. |
| publicRoute | <code>string</code> | Server route to show the chat bot interface. |
| documentsRoute | <code>string</code> | Server route to fetch available documents for the document selector. |
| [interfaceRequestHandler] | <code>function</code> | A request handler for the interface route. |
| middlewarePublicRoute | <code>Array.&lt;module:express~RequestHandler&gt;</code> | Custom Middleware for the public route. |
| databasePath | <code>string</code> | The path to the database. |
| databseOptions | <code>Database.Options</code> | The options for the database. |
| ollamaBaseUrl | <code>string</code> | The base URL for the Ollama server. |
| embedModel | <code>string</code> | The model to use for the embedder. |
| [embedPrompt] | <code>function</code> | The prompt to use for the embedder. |
| tools | <code>Array.&lt;object&gt;</code> | The tools to use for the chat. |
| chatModel | <code>string</code> | The model to use for the chat. |
| maxTokens | <code>number</code> | The maximum number of tokens to generate. The default value for `num_predict` is typically 128 tokens, though it can also be set to -1 for infinite generation (no limit) or -2 to fill the entire context window. |
| temperature | <code>number</code> | The temperature for the model. |
| chunkLimit | <code>number</code> | The limit for the number of chunks to return. |
| hybrid | <code>boolean</code> | Whether to use the hybrid approach of vector & FTS. |
| fts | <code>boolean</code> | Whether to use the FTS index. |
| ftsWeight | <code>number</code> | The weight for the FTS index. |
| titleBoost | <code>number</code> | The title boost for the entities. |
| textBoost | <code>number</code> | The text boost for the entities. |
| ftsWeightBump | <code>number</code> | The FTS weight bump for the entities. |
| maxContextTokens | <code>number</code> | The maximum number of tokens to use for the context. |
| maxPerSource | <code>number</code> | The maximum number of sources to use per source. |
| batch | <code>number</code> | The batch size for the embedder. |
| ignoreSlugs | <code>Array.&lt;string&gt;</code> | Slugs to ignore. |
| ignoreTags | <code>Array.&lt;string&gt;</code> | Tags to ignore. |
| bootstrapIndexOnStartup | <code>boolean</code> | Whether to create the chat index when index tables are missing on startup. |
| rebuildIndexOnStartup | <code>boolean</code> | Whether to rebuild the chat index on startup. |
| attachmentsRoot | <code>string</code> | The root path to the attachments. |
| includeAttachments | <code>boolean</code> | Whether to include attachments. |
| [extractAttachmentText] | <code>function</code> | The function to use to extract text from an attachment. |
| markdownItPluginConfig | <code>MarkdownItRendererConfig</code> | The markdown-it plugin configuration. |
| [tableToCSV] | <code>boolean</code> | Whether to convert tables to CSV format. If false, converts to Markdown format instead. Defaults to false. |
| [tableMaxRowsPerChunk] | <code>number</code> | Maximum number of rows per table chunk for embedding. |
| [tableMaxTokensPerChunk] | <code>number</code> | Maximum estimated tokens per table chunk for embedding. |
| summary | <code>object</code> | The summary configuration. |
| summary.enabled | <code>boolean</code> | Whether to use the summary. |
| summary.baseUrl | <code>string</code> | The base URL for the summary. |
| summary.model | <code>string</code> | The model to use for the summary. |

<a name="AIChatBotApiRequestBody"></a>

## AIChatBotApiRequestBody : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| sessionId | <code>string</code> | The session ID. |
| query | <code>string</code> | The query. |
| slugs | <code>Array.&lt;string&gt;</code> | The slugs. |

<a name="AIChatBotSearchUpdate"></a>

## AIChatBotSearchUpdate : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| document | <code>UttoriWikiDocument</code> | The saved document. |
| [originalSlug] | <code>string</code> | The document slug before the save, when renamed. |

