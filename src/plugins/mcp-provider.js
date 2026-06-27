import { createDebug } from '../debug.js';
import {
  WIKI_TOOLS,
  toMcpTool,
  executeWikiTool,
} from './chat-bot/tool-registry.js';
import { buildPromptMessages } from './chat-bot/prompts.js';

const debug = createDebug('Uttori.Plugin.MCPProvider');

/**
 * @typedef {object} MCPProviderConfig
 * @property {Record<string, string[]>} [events] Events to bind to.
 * @property {string} name The MCP server name advertised to clients.
 * @property {string} version The MCP server version advertised to clients.
 * @property {string} httpRoute The Express route the Streamable HTTP transport is mounted on.
 * @property {boolean} enableHttp Whether to expose the Streamable HTTP transport via `bindRoutes`.
 * @property {boolean} enableStdio Whether to start a stdio transport via `bindServer` (for CLI / child-process integrations).
 * @property {boolean} tools Whether to expose wiki tools.
 * @property {boolean} resources Whether to expose wiki documents as resources.
 * @property {boolean} prompts Whether to expose wiki prompts.
 * @property {import('express').RequestHandler[]} middleware Custom middleware for the HTTP route.
 */

/**
 * Uttori context narrowed to this plugin's config shape.
 * @typedef {import('../../dist/custom.d.ts').UttoriContextWithPluginConfig<'uttori-plugin-mcp-provider', MCPProviderConfig>} MCPProviderContext
 */

/**
 * @typedef {import('@modelcontextprotocol/sdk/server/index.js').Server} McpSdkServer
 * @typedef {import('@modelcontextprotocol/sdk/server/stdio.js').StdioServerTransport} McpStdioServerTransport
 * @typedef {import('@modelcontextprotocol/sdk/server/streamableHttp.js').StreamableHTTPServerTransport} McpStreamableHttpServerTransport
 */

/**
 * MCP SDK request schema constants used by {@link MCPProvider.buildServer}.
 * @typedef {object} McpSdkSchemas
 * @property {object} ListToolsRequestSchema The list-tools request schema.
 * @property {object} CallToolRequestSchema The call-tool request schema.
 * @property {object} ListResourcesRequestSchema The list-resources request schema.
 * @property {object} ReadResourceRequestSchema The read-resource request schema.
 * @property {object} ListPromptsRequestSchema The list-prompts request schema.
 * @property {object} GetPromptRequestSchema The get-prompt request schema.
 */

/**
 * @typedef {import('@modelcontextprotocol/sdk/types.js').CallToolRequest} McpCallToolRequest
 * @typedef {import('@modelcontextprotocol/sdk/types.js').ReadResourceRequest} McpReadResourceRequest
 * @typedef {import('@modelcontextprotocol/sdk/types.js').GetPromptRequest} McpGetPromptRequest
 * @typedef {import('@modelcontextprotocol/sdk/types.js').ServerCapabilities} McpServerCapabilities
 */

/**
 * MCP server metadata passed to the SDK constructor.
 * @typedef {object} McpSdkServerInfo
 * @property {string} name The server name.
 * @property {string} version The server version.
 */

/**
 * Options passed when constructing an MCP server instance.
 * @typedef {object} McpSdkServerOptions
 * @property {McpServerCapabilities} [capabilities] Advertised server capabilities.
 */

/**
 * Lazily loaded MCP SDK modules used by the provider transports.
 * @typedef {object} McpSdkModule
 * @property {Function} Server MCP Server constructor loaded from the SDK.
 * @property {Function} StdioServerTransport Stdio transport constructor loaded from the SDK.
 * @property {Function} StreamableHTTPServerTransport HTTP transport constructor loaded from the SDK.
 * @property {McpSdkSchemas} schemas The MCP request schema constants.
 */

/**
 * MCP tool call payload returned by {@link MCPProvider.callTool}.
 * @typedef {object} McpToolResultContent
 * @property {"text"} type The content block type.
 * @property {string} text The text payload.
 */

/**
 * MCP tool call payload returned by {@link MCPProvider.callTool}.
 * @typedef {object} McpToolResult
 * @property {McpToolResultContent[]} content The tool result content blocks.
 * @property {boolean} isError Whether the tool call failed.
 */

/**
 * Document summary returned by the `search-documents` hook.
 * @typedef {object} McpWikiDocumentSummary
 * @property {string} id The document id.
 * @property {string} slug The document slug.
 * @property {string} title The document title.
 * @property {number} update_date The last update timestamp.
 */

/**
 * Arguments accepted by the bundled wiki assistant prompt.
 * @typedef {object} McpPromptArguments
 * @property {string} [query] The user question.
 * @property {string | string[]} [slugs] Optional document slugs to focus on.
 */

/**
 * The URI scheme/prefix used for document resources, e.g. `wiki://doc/my-slug`.
 * @type {string}
 */
const RESOURCE_PREFIX = 'wiki://doc/';

/**
 * The name of the bundled wiki assistant prompt.
 * @type {string}
 */
const ASSISTANT_PROMPT_NAME = 'wiki-assistant';

/**
 * Uttori MCP Provider.
 *
 * Runs a Model Context Protocol server that exposes the wiki's capabilities (search/retrieval,
 * document access, history) as MCP tools and resources, plus a wiki assistant prompt. The tools
 * share the same registry the chat bot uses, so every capability is implemented exactly once and
 * dispatched through the Uttori hook system to the registered storage / search providers.
 *
 * The `@modelcontextprotocol/sdk` package is loaded lazily and is an optional dependency: when it
 * is not installed the transports simply do not start, while the pure handler methods
 * ({@link MCPProvider.listTools}, {@link MCPProvider.callTool}, etc.) remain usable.
 * @example <caption>MCPProvider</caption>
 * MCPProvider.register(context);
 * @class
 */
class MCPProvider {
  /**
   * The configuration key for plugin to look for in the provided configuration.
   * @type {string}
   * @returns {string} The configuration key.
   * @static
   */
  static get configKey() {
    return 'uttori-plugin-mcp-provider';
  }

  /**
   * The default configuration.
   * @returns {MCPProviderConfig} The configuration.
   * @static
   */
  static defaultConfig() {
    return {
      events: {
        bindRoutes: ['bind-routes'],
        bindServer: ['server-listening'],
      },
      name: 'uttori-wiki',
      version: '1.0.0',
      httpRoute: '/mcp',
      enableHttp: true,
      enableStdio: false,
      tools: true,
      resources: true,
      prompts: true,
      middleware: [],
    };
  }

  /**
   * Merge the default configuration with the provided context configuration.
   * @param {MCPProviderContext} context A Uttori-like context.
   * @returns {MCPProviderConfig} The merged configuration.
   * @static
   */
  static mergeConfig(context) {
    const base = MCPProvider.defaultConfig();
    return {
      ...base,
      ...context.config[MCPProvider.configKey],
      events: {
        ...base.events,
        ...context.config[MCPProvider.configKey]?.events,
      },
    };
  }

  /**
   * Validates the provided configuration for required entries.
   * @param {Record<string, MCPProviderConfig>} config A provided configuration to use.
   * @param {MCPProviderContext} [_context] Unused.
   * @static
   */
  static validateConfig(config, _context) {
    debug('Validating config...');
    if (!config || !config[MCPProvider.configKey]) {
      const error = `Config Error: '${MCPProvider.configKey}' configuration key is missing.`;
      debug(error);
      throw new Error(error);
    }
    const pluginConfig = { ...MCPProvider.defaultConfig(), ...config[MCPProvider.configKey] };
    if (typeof pluginConfig.httpRoute !== 'string') {
      const error = 'Config Error: `httpRoute` should be a string server route.';
      debug(error);
      throw new Error(error);
    }
    if (!Array.isArray(pluginConfig.middleware)) {
      const error = 'Config Error: `middleware` should be an array of middleware.';
      debug(error);
      throw new Error(error);
    }
    debug('Validated config.');
  }

  /**
   * Register the plugin with a provided set of events on a provided Hook system.
   * @param {MCPProviderContext} context A Uttori-like context.
   * @returns {Promise<void>}
   * @static
   */
  static async register(context) {
    debug('register');
    if (!context || !context.hooks || typeof context.hooks.on !== 'function') {
      throw new Error('Missing event dispatcher in \'context.hooks.on(event, callback)\' format.');
    }
    /** @type {MCPProviderConfig} */
    const config = MCPProvider.mergeConfig(context);
    if (!config.events) {
      throw new Error('Missing events to listen to for in \'config.events\'.');
    }

    for (const [method, eventNames] of Object.entries(config.events)) {
      if (typeof MCPProvider[method] === 'function') {
        for (const event of eventNames) {
          /** @type {import('@uttori/event-dispatcher').UttoriEventCallback} */
          const callback = MCPProvider[method];
          context.hooks.on(event, callback);
        }
      } else {
        debug(`Missing function "${method}"`);
      }
    }
  }

  /**
   * Lazily load the optional `@modelcontextprotocol/sdk` package.
   * @returns {Promise<McpSdkModule | undefined>} The SDK pieces, or undefined when the SDK is not installed.
   * @static
   */
  static async loadSdk() {
    try {
      const [serverModule, stdioModule, httpModule, schemas] = await Promise.all([
        import('@modelcontextprotocol/sdk/server/index.js'),
        import('@modelcontextprotocol/sdk/server/stdio.js'),
        import('@modelcontextprotocol/sdk/server/streamableHttp.js'),
        import('@modelcontextprotocol/sdk/types.js'),
      ]);
      return /** @type {McpSdkModule} */ ({
        Server: serverModule.Server,
        StdioServerTransport: stdioModule.StdioServerTransport,
        StreamableHTTPServerTransport: httpModule.StreamableHTTPServerTransport,
        schemas,
      });
    } catch (error) {
      /* c8 ignore next 2 */
      debug('loadSdk: MCP SDK not available:', error);
      return undefined;
    }
  }

  /**
   * Build an MCP `Server` instance wired to the wiki capabilities.
   * Returns undefined when the SDK is not installed.
   * @param {MCPProviderContext} context A Uttori-like context.
   * @returns {Promise<McpSdkServer | undefined>} The connected-ready MCP server, or undefined.
   * @static
   */
  static async buildServer(context) {
    const sdk = await MCPProvider.loadSdk();
    if (!sdk) {
      debug('buildServer: SDK unavailable, skipping server creation.');
      return undefined;
    }
    /** @type {MCPProviderConfig} */
    const config = MCPProvider.mergeConfig(context);
    const { Server, schemas } = sdk;
    const ServerCtor = /** @type {any} */ (Server);

    /** @type {McpServerCapabilities} */
    const capabilities = {};
    if (config.tools) capabilities.tools = {};
    if (config.resources) capabilities.resources = {};
    if (config.prompts) capabilities.prompts = {};

    /** @type {McpSdkServer} */
    const server = new ServerCtor({ name: config.name, version: config.version }, { capabilities });

    if (config.tools) {
      server.setRequestHandler(schemas.ListToolsRequestSchema, async () => ({ tools: MCPProvider.listTools() }));
      server.setRequestHandler(schemas.CallToolRequestSchema, async (request) => {
        const { name, arguments: toolArguments } = /** @type {McpCallToolRequest} */ (request).params;
        return MCPProvider.callTool(name, toolArguments ?? {}, context);
      });
    }

    if (config.resources) {
      server.setRequestHandler(schemas.ListResourcesRequestSchema, async () => MCPProvider.listResources(context));
      server.setRequestHandler(schemas.ReadResourceRequestSchema, async (request) => {
        const { uri } = /** @type {McpReadResourceRequest} */ (request).params;
        return MCPProvider.readResource(uri, context);
      });
    }

    if (config.prompts) {
      server.setRequestHandler(schemas.ListPromptsRequestSchema, async () => ({ prompts: MCPProvider.listPrompts() }));
      server.setRequestHandler(schemas.GetPromptRequestSchema, async (request) => {
        const { name, arguments: promptArguments } = /** @type {McpGetPromptRequest} */ (request).params;
        return MCPProvider.getPrompt(name, promptArguments ?? {});
      });
    }

    return server;
  }

  /**
   * List the wiki tools in MCP `Tool` shape.
   * @returns {import('./chat-bot/tool-registry.js').McpTool[]} The MCP tool descriptors.
   * @static
   */
  static listTools() {
    return WIKI_TOOLS.map(toMcpTool);
  }

  /**
   * Execute a wiki tool and wrap the result in an MCP `CallToolResult`.
   * @param {string} name The tool name.
   * @param {Record<string, unknown>} args The tool arguments.
   * @param {MCPProviderContext} context A Uttori-like context.
   * @returns {Promise<McpToolResult>} The MCP tool result.
   * @static
   */
  static async callTool(name, args, context) {
    debug('callTool:', name, args);
    const config = MCPProvider.mergeConfig(context);
    const result = await executeWikiTool(name, args, {
      hooks: context.hooks,
      context,
      config,
    });
    const isError = Boolean(result && typeof result === 'object' && 'error' in result);
    const text = typeof result === 'string' ? result : JSON.stringify(result, null, 2);
    return { content: [{ type: 'text', text }], isError };
  }

  /**
   * List wiki documents as MCP resources.
   * @param {MCPProviderContext} context A Uttori-like context.
   * @returns {Promise<{ resources: Array<{ uri: string, name: string, description: string, mimeType: string }> }>} The MCP resource list.
   * @static
   */
  static async listResources(context) {
    debug('listResources');
    /** @type {Array<Array<McpWikiDocumentSummary>>} */
    const results = await context.hooks.fetch('search-documents', {}, context);
    const documents = Array.isArray(results?.[0]) ? results[0] : [];
    return {
      resources: documents
        .filter(document => document?.slug)
        .map(document => ({
          uri: `${RESOURCE_PREFIX}${document.slug}`,
          name: document.title || document.slug,
          description: `Wiki document: ${document.title || document.slug}`,
          mimeType: 'text/markdown',
        })),
    };
  }

  /**
   * Read a single wiki document resource by its `wiki://doc/<slug>` URI.
   * @param {string} uri The resource URI.
   * @param {MCPProviderContext} context A Uttori-like context.
   * @returns {Promise<{ contents: Array<{ uri: string, mimeType: string, text: string }> }>} The MCP resource contents.
   * @static
   */
  static async readResource(uri, context) {
    debug('readResource:', uri);
    const slug = typeof uri === 'string' && uri.startsWith(RESOURCE_PREFIX) ? uri.slice(RESOURCE_PREFIX.length) : '';
    if (!slug) {
      throw new Error(`Unknown resource URI: ${uri}`);
    }
    /** @type {Array<import('../wiki.js').UttoriWikiDocument | undefined>} */
    const results = await context.hooks.fetch('storage-get', slug, context);
    const document = results?.[0];
    if (!document) {
      throw new Error(`Resource not found: ${uri}`);
    }
    const text = typeof document.content === 'string' ? document.content : JSON.stringify(document);
    return {
      contents: [{
        uri,
        mimeType: 'text/markdown',
        text,
      }],
    };
  }

  /**
   * List the available MCP prompts.
   * @returns {Array<{ name: string, description: string, arguments: Array<{ name: string, description: string, required: boolean }> }>} The MCP prompt list.
   * @static
   */
  static listPrompts() {
    return [{
      name: ASSISTANT_PROMPT_NAME,
      description: 'The Uttori wiki assistant system prompt, primed for a user question with optional document focus.',
      arguments: [
        { name: 'query', description: 'The user question.', required: true },
        { name: 'slugs', description: 'Optional comma-separated document slugs to focus on.', required: false },
      ],
    }];
  }

  /**
   * Build a named MCP prompt.
   * @param {string} name The prompt name.
   * @param {McpPromptArguments} args The prompt arguments.
   * @returns {Promise<{ messages: Array<{ role: string, content: { type: string, text: string } }> }>} The MCP prompt result.
   * @static
   */
  static async getPrompt(name, args) {
    debug('getPrompt:', name, args);
    if (name !== ASSISTANT_PROMPT_NAME) {
      throw new Error(`Unknown prompt: ${name}`);
    }
    const query = typeof args.query === 'string' ? args.query : '';
    /** @type {string[]} */
    const slugs = typeof args.slugs === 'string'
      ? args.slugs.split(',').map(slug => slug.trim()).filter(Boolean)
      : Array.isArray(args.slugs)
        ? args.slugs.filter(slug => typeof slug === 'string')
        : [];

    const messages = buildPromptMessages(query, slugs, { maxContextCharacters: 20000 });
    return {
      // MCP prompt messages only support the `user` and `assistant` roles, so the system
      // prompt is surfaced as a leading user message.
      messages: messages.map(message => ({
        role: message.role === 'assistant' ? 'assistant' : 'user',
        content: { type: 'text', text: message.content },
      })),
    };
  }

  /**
   * Mount the Streamable HTTP transport on the configured Express route.
   * Uses a stateless transport: a fresh server + transport is created per request.
   * @param {import('express').Application} server An Express server instance.
   * @param {MCPProviderContext} context A Uttori-like context.
   * @returns {void}
   * @static
   */
  static bindRoutes(server, context) {
    debug('bindRoutes');
    /** @type {MCPProviderConfig} */
    const config = MCPProvider.mergeConfig(context);
    if (!config.enableHttp) {
      debug('bindRoutes: HTTP transport disabled.');
      return;
    }
    server.post(`${config.httpRoute}`, ...config.middleware, MCPProvider.httpHandler(context));
    server.get(`${config.httpRoute}`, MCPProvider.methodNotAllowedHandler());
    server.delete(`${config.httpRoute}`, MCPProvider.methodNotAllowedHandler());
  }

  /**
   * Build the Express handler for the Streamable HTTP transport (stateless mode).
   * @param {MCPProviderContext} context A Uttori-like context.
   * @returns {import('express').RequestHandler} The Express request handler.
   * @static
   */
  static httpHandler(context) {
    return /** @type {import('express').RequestHandler} */ (async (request, response) => {
      const sdk = await MCPProvider.loadSdk();
      if (!sdk) {
        response.status(501).json({ error: 'MCP SDK is not installed.' });
        return;
      }
      try {
        /** @type {McpSdkServer | undefined} */
        const server = await MCPProvider.buildServer(context);
        if (!server) {
          response.status(501).json({ error: 'MCP SDK is not installed.' });
          return;
        }
        /** @type {McpStreamableHttpServerTransport} */
        const transport = new (/** @type {any} */ (sdk.StreamableHTTPServerTransport))({ sessionIdGenerator: undefined });
        response.on('close', () => {
          transport.close();
          server.close();
        });
        await server.connect(transport);
        await transport.handleRequest(request, response, request.body);
      } catch (error) {
        debug('httpHandler error:', error);
        /* c8 ignore next 3 */
        if (!response.headersSent) {
          response.status(500).json({ error: 'MCP request failed.' });
        }
      }
    });
  }

  /**
   * Build an Express handler that rejects unsupported HTTP methods for the stateless transport.
   * @returns {import('express').RequestHandler} The Express request handler.
   * @static
   */
  static methodNotAllowedHandler() {
    return (_request, response) => {
      response.status(405).json({ error: 'Method not allowed. Use POST for the stateless MCP transport.' });
    };
  }

  /**
   * Start the stdio transport when enabled (for CLI / child-process integrations).
   * @param {import('http').Server} _server An Express server instance (unused).
   * @param {MCPProviderContext} context A Uttori-like context.
   * @returns {Promise<void>}
   * @static
   */
  static async bindServer(_server, context) {
    debug('bindServer');
    /** @type {MCPProviderConfig} */
    const config = MCPProvider.mergeConfig(context);
    if (!config.enableStdio) {
      debug('bindServer: stdio transport disabled.');
      return;
    }
    const sdk = await MCPProvider.loadSdk();
    if (!sdk) {
      debug('bindServer: SDK unavailable, stdio transport not started.');
      return;
    }
    /** @type {McpSdkServer | undefined} */
    const server = await MCPProvider.buildServer(context);
    if (!server) {
      debug('bindServer: MCP server unavailable.');
      return;
    }
    /* c8 ignore next 5 */
    /** @type {McpStdioServerTransport} */
    const transport = new (/** @type {any} */ (sdk.StdioServerTransport))();
    await server.connect(transport);
    debug('bindServer: stdio transport connected.');
  }
}

export default MCPProvider;
