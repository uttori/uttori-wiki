# MCP Provider

> Expose your wiki to AI clients (Cursor, Claude Desktop, custom agents) as a Model Context Protocol server.

```javascript
import { McpProvider } from '@uttori/wiki';
// or: import McpProvider from '@uttori/wiki/plugins/mcp-provider';
```

**configKey:** `uttori-plugin-mcp-provider`

## What it does

Runs a [Model Context Protocol](https://modelcontextprotocol.io/) server that lets external AI clients work _with_ your wiki. It advertises the same tools the [chat bot](ai-chat-bot.md) uses (search, retrieval, document access, history), lists wiki pages as MCP resources (`wiki://doc/<slug>`), and offers a bundled `wiki-assistant` prompt. Tool execution flows through the shared tool registry ➜ Uttori hooks, so there's one implementation behind both chat and MCP.

Two transports: **Streamable HTTP** (POST to `httpRoute`, stateless - a fresh server per request) and optional **stdio** (for CLI / child-process integrations).

## What it doesn't do

- **The `@modelcontextprotocol/sdk` dependency is optional** - without it, HTTP returns `501` and stdio won't start (though the handler methods still work).
- **It doesn't implement storage or search** - same provider dependencies as the chat bot.
- **It doesn't run the LLM** - it exposes tools/resources/prompts; the MCP _client_ runs the model.
- **HTTP is POST-only** - GET/DELETE on the MCP route return `405`.
- **stdio blocks the process** when enabled - usually off for web servers.
- **Resource URIs use the fixed `wiki://doc/` prefix.**

## How to use

```javascript
import { StorageProviderJsonFile, SearchProviderSQLite, McpProvider } from '@uttori/wiki';

const config = {
  plugins: [StorageProviderJsonFile, SearchProviderSQLite, McpProvider],

  [McpProvider.configKey]: {
    name: 'my-wiki',
    version: '1.0.0',
    httpRoute: '/mcp',
    enableHttp: true,
    enableStdio: false,
    tools: true,
    resources: true,
    prompts: true,
    middleware: [],
    events: {
      bindRoutes: ['bind-routes'],
      bindServer: ['server-listening'],
    },
  },
};
```

Point your MCP client at `POST http://your-wiki/mcp`. (Don't forget to dispatch `server-listening` from your `listen()` callback if you enable stdio.)

## Configuration

| Option | Default | What it does |
|--------|---------|--------------|
| `name` | `'uttori-wiki'` | MCP server name advertised to clients. |
| `version` | `'1.0.0'` | MCP server version string. |
| `httpRoute` | `'/mcp'` | Express POST route for the Streamable HTTP transport. |
| `enableHttp` | `true` | Mount the HTTP transport (via `bindRoutes`). |
| `enableStdio` | `false` | Start the stdio transport (via `bindServer` on `server-listening`). |
| `tools` | `true` | Expose wiki tools (`vectorSearch`, `getDocument`, etc.). |
| `resources` | `true` | Expose documents as `wiki://doc/<slug>` resources. |
| `prompts` | `true` | Expose the `wiki-assistant` prompt template. |
| `middleware` | `[]` | Express middleware for the HTTP MCP route. |
| `authorizeWrite` | unset | Optional per-request verifier that returns a stable writer identity for the HTTP write tools. |
| `citationVerification` | unset | Optional private archive directory and per-request authorization for the HTTP quote verifier. |
| `events` | `bindRoutes`, `bindServer` | Hook wiring. |

## Good to know

- Install the optional SDK to actually serve over HTTP/stdio: `npm install @modelcontextprotocol/sdk`.
- Use `middleware` to protect read access when the wiki is private. The write verifier controls write tools independently.
- Because it shares the [chat bot](ai-chat-bot.md)'s tool registry, the same retrieval quality you tune for chat shows up for MCP clients too.

## Hosted edits

Writes are opt-in on Streamable HTTP. Use the mutable JSON-file storage provider with history enabled, its default storage hooks, and Lunr for search. Use one Uttori process as the writer for those directories. The built-in browser save, delete, and import paths share the same write queue. Git-managed sidecars, SQLite, stdio, and the chat bot expose read access only through this workflow.

Configure `authorizeWrite(request)` to verify authentication **and** write permission on each request. Return a stable, non-secret account ID for a writer and `undefined` for everyone else. For example, an application can install its own authentication middleware and check the identity and role it verified. Use HTTPS for remote clients. Write authentication is separate from the browser form's edit key and CSRF checks.

```js
[McpProvider.configKey]: {
  ...McpProvider.defaultConfig(),
  middleware: [loadVerifiedIdentity],
  authorizeWrite: request => request.user?.canEditWiki ? request.user.id : undefined,
},
```

1. Call `getDocumentForEdit` for each target. Keep the version it returns before drafting. A missing page has version `null`.
2. Call `previewDocumentChanges` with an ordered array of patches. Each has `slug`, `expectedVersion`, and Markdown `content`. Supply `title` for new pages. Optional `title`, `excerpt`, `tags`, and allowlisted `metadata` patch the existing record. Other fields are preserved. The preview shows before and after values without running save filters or writing anything.
3. Present the preview for review, then call `applyDocumentChanges` with only its `previewId`. Apply checks all base versions before writing and uses the same save filters and search hooks as the browser. Filters may normalize ancillary fields, but changing the reviewed slug, title, or body aborts that page. Ordinary patches support creates and edits. Use the refactor tool for a rename or merge.
4. Inspect the receipt. Each saved page has its revision ID and current version. Partial results identify pending saves, history, or indexing. Retry with the **same preview ID** to resume. If a page goes stale, the retry can finish history or indexing for pages it already saved. Review any remaining edits against the current documents.

Previews accept up to 20 pages and 256 KiB of JSON changes, subject to the application's request body limit. They are bound to one writer identity and expire after 30 minutes. The wiki holds up to 16 previews and may evict completed receipts sooner to admit new ones. A process restart clears previews, so check the current pages, revision history, and search before preparing a new review. Each file replacement is atomic and a batch can be partially applied. Leave custom storage writers and external file edits outside this deployment mode.

## Revision-verified citations

Set `citationVerification: { archiveDirectory, authorize }` on the MCP provider to enable the read-only `verifyCitation` tool for authorized HTTP clients. `archiveDirectory` must be an absolute path to maintainer-controlled Markdown originals outside public content. The callback receives the Express request and must return `true` only for callers permitted to check the private archive. Use HTTPS for remote callers. Archive access is separate from general MCP reads and from write permission.

Call `getDocument` for the source note, then pass its `sourceSlug`, full `source.sha256` as `sha256`, and the candidate `quote` to `verifyCitation`. Optional `startLine` and `endLine` constrain the check to a one-based inclusive range. The tool resolves the archive path from the stored note, checks the original bytes against the digest, and matches the quote literally. It accepts UTF-8 Markdown up to 16 MiB and quotes up to 4,096 UTF-8 bytes. The response is `verified` with the actual line numbers, `mismatch` for a quote or range that does not match, or `unavailable` when the exact original cannot be checked. It returns neither archived text nor filesystem paths.

To verify a PDF or HTML source from the Capture Inbox, also set `citationVerification.captureDirectory` to the absolute private inbox path. The tool checks the original bytes and the pinned importer text against their digests. The receipt reports line numbers in that importer text. See [Capture Inbox setup](capture-inbox.md#publish-to-uttori-llm-wiki-sidecars).

## Rename and merge previews

On hosted wikis with verified retirement and the Markdown renderer installed, authenticated writers can call `previewDocumentRefactor` and apply its ID with `applyDocumentChanges`. A review includes the destination, inbound rewrites, and the retiring slug. Uttori checks the whole corpus before apply because even a previously unrelated page can introduce a backlink. The same page and payload limits apply, and a refactor exceeding them is rejected as a whole.

The destination and inbound pages save first. Uttori archives the old source under its original slug, removes it from live storage, and rebuilds search. The destination serves the old slug and its aliases as HTTP 301 redirects. Retry a partial apply with its original preview ID. If that preview goes stale after saving the destination, pass its ID as `resumePreviewId` with both current page versions to review the remaining work without merging the source twice. See [the refactor workflow](../skills/uttori-llm-wiki/references/refactors.md) for local commands and supported links.
