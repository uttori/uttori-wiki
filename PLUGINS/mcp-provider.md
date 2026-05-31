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
| `events` | `bindRoutes`, `bindServer` | Hook wiring. |

## Good to know

- Install the optional SDK to actually serve over HTTP/stdio: `npm install @modelcontextprotocol/sdk`.
- Put auth/rate-limiting middleware on `httpRoute` if your wiki is public - MCP tools can read (and, depending on your tools, write) content.
- Because it shares the [chat bot](ai-chat-bot.md)'s tool registry, the same retrieval quality you tune for chat shows up for MCP clients too.
