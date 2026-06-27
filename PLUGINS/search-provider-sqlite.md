# Search Provider: SQLite

> The power option: SQLite **storage + search in one**, with full-text *and* vector embeddings for AI retrieval.

```javascript
import { SearchProviderSQLite } from '@uttori/wiki';
// or: import SearchProviderSQLite from '@uttori/wiki/plugins/search-provider-sqlite';
```

**configKey:** `uttori-plugin-search-provider-sqlite`

## What it does

This is the all-in-one backend. A single SQLite database holds your **documents** (the full `storage-*` API), powers **classic search** (FTS5 full-text), and powers **AI retrieval** (vector embeddings via [Ollama](https://ollama.com/) + [sqlite-vec](https://github.com/asg017/sqlite-vec)). It answers `search-retrieve` for [the chat bot](ai-chat-bot.md)'s RAG, can index the text of uploaded attachments, and chunks documents for semantic search. On startup it can bootstrap or rebuild the index for you.

When you want one database for content, search, and AI - and you're willing to run Ollama - this is the modern stack.

## What it doesn't do

- **It doesn't run without its dependencies:** `better-sqlite3`, `sqlite-vec`, and a reachable Ollama server for embedding/index builds.
- **It replaces the JSON file provider - it doesn't sit beside it.** Both register on the `storage-*` hooks, so use one or the other.
- **It isn't zero-ops.** Heavier than Lunr; the startup index build can take a while on big wikis and needs network access to Ollama.

## How to use

```javascript
import { SearchProviderSQLite, AIChatBot } from '@uttori/wiki';

const config = {
  // SQLite provides BOTH storage and search - don't add a separate storage provider.
  plugins: [SearchProviderSQLite, AIChatBot],

  [SearchProviderSQLite.configKey]: {
    databasePath: './site/data/uttori-wiki.sqlite',
    ollamaBaseUrl: 'http://127.0.0.1:11434',
    embedModel: 'qwen3-embedding:8b',
    hybrid: true,
    bootstrapIndexOnStartup: true,
    rebuildIndexOnStartup: false,
  },
};
```

Before first run, pull the embedding model:

```bash
ollama pull qwen3-embedding:8b
```

## Configuration

| Option | Default | What it does |
|--------|---------|--------------|
| `databasePath` | `'./site/data/uttori-wiki.sqlite'` | Path to the SQLite database file. |
| `databaseOptions` | `{}` | Options passed straight to `better-sqlite3`. |
| `ollamaBaseUrl` | `'http://127.0.0.1:11434'` | Ollama server used for embeddings. |
| `embedModel` | `'qwen3-embedding:8b'` | Embedding model name. |
| `hybrid` | `true` | Blend vector similarity with FTS scores. |
| `fts` | `true` | Enable the FTS5 full-text index. |
| `chunkLimit` | `12` | Max chunks returned from RAG retrieval. |
| `ignoreSlugs` | `[]` | Slugs to skip when indexing. |
| `ignoreTags` | `[]` | Tags to skip when indexing. |
| `bootstrapIndexOnStartup` | `true` | Build the index at startup if the vector tables are missing. |
| `rebuildIndexOnStartup` | `false` | Force a full reindex on every startup. |
| `includeAttachments` | `true` | Index the text of uploaded attachments. |
| `attachmentsRoot` | `'./site/uploads'` | Root path where attachment files live. |
| `updateTimestamps` | `true` | Auto-set dates on document writes. |
| `useHistory` | `true` | Keep revision history in SQLite. |
| `events` | sensible defaults | Maps storage + search methods to hooks. |

## Good to know

- This plugin is the engine behind the [AI Chat Bot](ai-chat-bot.md) and [MCP Provider](mcp-provider.md) - they call its `search-retrieve` hook to ground answers in your content.
- Keep `rebuildIndexOnStartup: false` in production; use `bootstrapIndexOnStartup` so you only build when there's nothing to build.
- The embedding pipeline (chunking, embedding, hybrid retrieval, reranking) lives under `src/plugins/chat-bot/` and is documented in [docs/plugins/](../docs/plugins/) - see `index-documents`, `ollama-embedder`, and `retrieval`.
