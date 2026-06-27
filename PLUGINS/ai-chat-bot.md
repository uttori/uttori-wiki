# AI Chat Bot

> A streaming, tool-calling chat bot over your wiki, powered by a local Ollama model and RAG retrieval.

```javascript
import { AIChatBot } from '@uttori/wiki';
// or: import AIChatBot from '@uttori/wiki/plugins/ai-chat-bot';
```

**configKey:** `uttori-plugin-ai-chat-bot`

## What it does

Adds a conversational interface to your wiki. It serves a chat UI over HTTP, streams answers via Server-Sent Events (POST) or WebSocket, and drives an [Ollama](https://ollama.com/) LLM through a tool-calling loop. When the model needs facts, it calls built-in tools (search, list documents, fetch history, ...) that route through the Uttori hook system to your storage and search providers - so the bot answers from _your_ content, not its imagination. It builds prompts, can keep a rolling per-session conversation summary, and exposes a programmatic `chat-query` hook for other plugins.

The retrieval brains (chunking, embeddings, hybrid vector + full-text search, reranking) live in [SQLite search](search-provider-sqlite.md) and the `chat-bot/` helpers - the bot calls `search-retrieve` to get grounded passages.

## What it doesn't do

- **It doesn't store documents, build indexes, or embed anything itself** - it needs a [storage provider](storage-provider-json-file.md) and [SQLite search](search-provider-sqlite.md).
- **It needs a running Ollama server** for chat (and, optionally, summarization).
- **You must supply `interfaceRequestHandler`** - there's no default UI template; validation fails without it.
- **WebSocket transport only starts after `server-listening`** is dispatched (from your `listen()` callback).
- **Conversation memory is in-process** (TTL ~1h, last few turns) - not persisted across restarts.
- **Tool calling depends on the model** supporting tools and thinking streams.

## How to use

```javascript
import { StorageProviderJsonFile, SearchProviderSQLite, AIChatBot } from '@uttori/wiki';

const config = {
  plugins: [StorageProviderJsonFile, SearchProviderSQLite, AIChatBot],

  [AIChatBot.configKey]: {
    publicRoute: '/chat',
    websocketRoute: '/chat-api',
    documentsRoute: '/chat-documents',
    ollamaBaseUrl: 'http://127.0.0.1:11434',
    chatModel: 'qwen3.5:9b',
    retrieveLimit: 12,
    interfaceRequestHandler: (context) => async (req, res) => {
      res.render('chat', { title: 'Chat', config: context.config });
    },
    events: {
      bindRoutes: ['bind-routes'],
      bindWebSocket: ['server-listening'],
      chatQuery: ['chat-query'],
    },
  },

  [SearchProviderSQLite.configKey]: {
    ollamaBaseUrl: 'http://127.0.0.1:11434',
    embedModel: 'qwen3-embedding:8b',
  },
};
```

Pull the models first:

```bash
ollama pull qwen3.5:9b           # chat model
ollama pull qwen3-embedding:8b   # embedding model (for SQLite search)
```

And remember to dispatch `server-listening` in your server's `listen()` callback (see the main [README](../README.md#wiring-it-into-express)).

## Configuration

| Option | Default | What it does |
|--------|---------|--------------|
| `publicRoute` | `'/chat'` | GET route for the chat UI (via `interfaceRequestHandler`). |
| `websocketRoute` | `'/chat-api'` | POST endpoint for SSE streaming + WebSocket upgrade path. |
| `documentsRoute` | `'/chat-documents'` | GET route listing documents for the doc picker. |
| `interfaceRequestHandler` | `undefined` | **Required.** `(context) => Express handler` for the UI route. |
| `middlewarePublicRoute` | `[]` | Middleware before the UI handler. |
| `ollamaBaseUrl` | `'http://127.0.0.1:11434'` | Ollama server for chat. |
| `chatModel` | `'qwen3.5:9b'` | Ollama model used for `/api/chat`. |
| `tools` | `[]` | Empty = built-in wiki tools; non-empty = override schemas; `null` = disable tools. |
| `maxTokens` | `-2` | Ollama `num_predict` (`-2` fills the context window). |
| `temperature` | `0.6` | Sampling temperature. |
| `retrieveLimit` | `12` | Default chunk limit when the model omits one. |
| `summary.enabled` | `false` | Keep a rolling conversation summary via a second Ollama call. |
| `summary.baseUrl` | `'http://127.0.0.1:11434'` | Ollama URL for the summarizer. |
| `summary.model` | `'qwen3.5:9b'` | Model used for summarization. |
| `events` | `bindRoutes`, `bindWebSocket`, `chatQuery` | Hook wiring. |

## Good to know

- This and [MCP Provider](mcp-provider.md) share one tool implementation (`chat-bot/tool-registry.js`), so a wiki tool you fix once works in both.
- For purely programmatic use, call the `chat-query` hook (a `fetch`) from another plugin to get a non-streaming answer.
- Keep the chat and embedding models consistent between this plugin and SQLite search.
