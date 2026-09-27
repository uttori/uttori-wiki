import { getPluginMethod } from './utilities/plugin-method.js';
import { createDebug } from '../debug.js';
import {
  WIKI_TOOLS,
  toMcpTool,
  executeWikiTool,
} from './chat-bot/tool-registry.js';
import { buildPromptMessages } from './chat-bot/prompts.js';
import type {
  McpServerCapabilities, McpStreamableHttpServerTransport, McpStdioServerTransport, MCPProviderConfig,
  MCPProviderContext, McpSdkServer, McpSdkModule, McpToolResult, McpWikiDocumentSummary,
  McpPromptArguments,
} from '../types/plugins/mcp-provider.js';

export type {
  McpServerCapabilities, McpGetPromptRequest, McpReadResourceRequest, McpStreamableHttpServerTransport,
  McpStdioServerTransport, MCPProviderConfig, MCPProviderContext, McpSdkServer, McpSdkSchemas,
  McpCallToolRequest, McpSdkServerInfo, McpSdkServerOptions, McpSdkModule, McpToolResult,
  McpWikiDocumentSummary, McpPromptArguments,
} from '../types/plugins/mcp-provider.js';

const debug = createDebug('Uttori.Plugin.MCPProvider');

/**
 * The URI scheme/prefix used for document resources, e.g. `wiki://doc/my-slug`.
 *
 */
const RESOURCE_PREFIX = 'wiki://doc/';

/**
 * The name of the bundled wiki assistant prompt.
 *
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
 */
class MCPProvider {
  /**
   * The configuration key for plugin to look for in the provided configuration.
   *
   * @returns The configuration key.
   */
  static get configKey(): 'uttori-plugin-mcp-provider' {
    return 'uttori-plugin-mcp-provider';
  }

  /**
   * The default configuration.
   * @returns The configuration.
   */
  static defaultConfig(): import('../custom.js').DefaultPluginConfig<MCPProviderConfig, 'events' | 'name' | 'version' | 'httpRoute' | 'enableHttp' | 'enableStdio' | 'tools' | 'resources' | 'prompts' | 'middleware'> {
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
   * @param context A Uttori-like context.
   * @returns The merged configuration.
   */
  static mergeConfig(context: MCPProviderContext) {
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
   * @param config A provided configuration to use.
   * @param [_context] Unused.
   */
  static validateConfig(config: Record<string, MCPProviderConfig>, _context?: unknown) {
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
   * @param context A Uttori-like context.
   */
  static async register(context: MCPProviderContext): Promise<void> {
    debug('register');
    if (!context || !context.hooks || typeof context.hooks.on !== 'function') {
      throw new Error('Missing event dispatcher in \'context.hooks.on(event, callback)\' format.');
    }

    const config = MCPProvider.mergeConfig(context);
    if (!config.events) {
      throw new Error('Missing events to listen to for in \'config.events\'.');
    }

    for (const [method, eventNames] of Object.entries(config.events)) {
      const MCPProviderMethod = getPluginMethod<import('@uttori/event-dispatcher').UttoriEventCallback<unknown, unknown, unknown>>(MCPProvider, method);
      if (MCPProviderMethod) {
        for (const event of eventNames) {

          const callback = MCPProviderMethod;
          context.hooks.on(event, callback);
        }
      } else {
        debug(`Missing function "${method}"`);
      }
    }
  }

  /**
   * Lazily load the optional `@modelcontextprotocol/sdk` package.
   * @returns The SDK pieces, or undefined when the SDK is not installed.
   */
  static async loadSdk(): Promise<McpSdkModule | undefined> {
    try {
      const [serverModule, stdioModule, httpModule, schemas] = await Promise.all([
        import('@modelcontextprotocol/sdk/server/index.js'),
        import('@modelcontextprotocol/sdk/server/stdio.js'),
        import('@modelcontextprotocol/sdk/server/streamableHttp.js'),
        import('@modelcontextprotocol/sdk/types.js'),
      ]);
      return ({
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
   * @param context A Uttori-like context.
   * @returns The connected-ready MCP server, or undefined.
   */
  static async buildServer(context: MCPProviderContext): Promise<McpSdkServer | undefined> {
    const sdk = await MCPProvider.loadSdk();
    if (!sdk) {
      debug('buildServer: SDK unavailable, skipping server creation.');
      return undefined;
    }

    const config = MCPProvider.mergeConfig(context);
    const { Server, schemas } = sdk;


    const capabilities: McpServerCapabilities = {};
    if (config.tools) capabilities.tools = {};
    if (config.resources) capabilities.resources = {};
    if (config.prompts) capabilities.prompts = {};

    const server: McpSdkServer = new Server({ name: config.name, version: config.version }, { capabilities });

    if (config.tools) {
      server.setRequestHandler(schemas.ListToolsRequestSchema, async () => ({ tools: MCPProvider.listTools() }));
      server.setRequestHandler(schemas.CallToolRequestSchema, async (request) => {
        const { name, arguments: toolArguments } = request.params;
        return MCPProvider.callTool(name, toolArguments ?? {}, context);
      });
    }

    if (config.resources) {
      server.setRequestHandler(schemas.ListResourcesRequestSchema, async () => MCPProvider.listResources(context));
      server.setRequestHandler(schemas.ReadResourceRequestSchema, async (request) => {
        const { uri } = request.params;
        return MCPProvider.readResource(uri, context);
      });
    }

    if (config.prompts) {
      server.setRequestHandler(schemas.ListPromptsRequestSchema, async () => ({ prompts: MCPProvider.listPrompts() }));
      server.setRequestHandler(schemas.GetPromptRequestSchema, async (request) => {
        const { name, arguments: promptArguments } = request.params;
        return MCPProvider.getPrompt(name, promptArguments ?? {});
      });
    }

    return server;
  }

  /**
   * List the wiki tools in MCP `Tool` shape.
   * @returns The MCP tool descriptors.
   */
  static listTools(): import('./chat-bot/tool-registry.js').McpTool[] {
    return WIKI_TOOLS.map(toMcpTool);
  }

  /**
   * Execute a wiki tool and wrap the result in an MCP `CallToolResult`.
   * @param name The tool name.
   * @param args The tool arguments.
   * @param context A Uttori-like context.
   * @returns The MCP tool result.
   */
  static async callTool(name: string, args: Record<string, unknown>, context: MCPProviderContext): Promise<McpToolResult> {
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
   * @param context A Uttori-like context.
   * @returns The MCP resource list.
   */
  static async listResources(context: MCPProviderContext): Promise<{ resources: { uri: string, name: string, description: string, mimeType: string }[] }> {
    debug('listResources');

    const results: (McpWikiDocumentSummary)[][] = await context.hooks.fetch('search-documents', {}, context);
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
   * @param uri The resource URI.
   * @param context A Uttori-like context.
   * @returns The MCP resource contents.
   */
  static async readResource(uri: string, context: MCPProviderContext): Promise<{ contents: { uri: string, mimeType: string, text: string }[] }> {
    debug('readResource:', uri);
    const slug = typeof uri === 'string' && uri.startsWith(RESOURCE_PREFIX) ? uri.slice(RESOURCE_PREFIX.length) : '';
    if (!slug) {
      throw new Error(`Unknown resource URI: ${uri}`);
    }

    const results: (import('../wiki.js').UttoriWikiDocument | undefined)[] = await context.hooks.fetch('storage-get', slug, context);
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
   * @returns The MCP prompt list.
   */
  static listPrompts(): { name: string, description: string, arguments: ({ name: string, description: string, required: boolean })[] }[] {
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
   * @param name The prompt name.
   * @param args The prompt arguments.
   * @returns The MCP prompt result.
   */
  static async getPrompt(name: string, args: McpPromptArguments): Promise<{ messages: { role: string, content: { type: string, text: string } }[] }> {
    debug('getPrompt:', name, args);
    if (name !== ASSISTANT_PROMPT_NAME) {
      throw new Error(`Unknown prompt: ${name}`);
    }
    const query = typeof args.query === 'string' ? args.query : '';

    // MCP callers may provide comma-separated slugs or an already parsed list.
    let slugs: string[] = [];
    if (typeof args.slugs === 'string') {
      slugs = args.slugs.split(',').map(slug => slug.trim()).filter(Boolean);
    } else if (Array.isArray(args.slugs)) {
      slugs = args.slugs.filter((slug): slug is string => typeof slug === 'string');
    }

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
   * @param server An Express server instance.
   * @param context A Uttori-like context.
   */
  static bindRoutes(server: import('express').Application, context: MCPProviderContext): void {
    debug('bindRoutes');

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
   * @param context A Uttori-like context.
   * @returns The Express request handler.
   */
  static httpHandler(context: MCPProviderContext): import('express').RequestHandler {
    return (async (request, response) => {
      const sdk = await MCPProvider.loadSdk();
      if (!sdk) {
        response.status(501).json({ error: 'MCP SDK is not installed.' });
        return;
      }
      try {

        const server: McpSdkServer | undefined = await MCPProvider.buildServer(context);
        if (!server) {
          response.status(501).json({ error: 'MCP SDK is not installed.' });
          return;
        }

        const transport: McpStreamableHttpServerTransport = new sdk.StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
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
    }) as import('express').RequestHandler;
  }

  /**
   * Build an Express handler that rejects unsupported HTTP methods for the stateless transport.
   * @returns The Express request handler.
   */
  static methodNotAllowedHandler(): import('express').RequestHandler {
    return (_request, response) => {
      response.status(405).json({ error: 'Method not allowed. Use POST for the stateless MCP transport.' });
    };
  }

  /**
   * Start the stdio transport when enabled (for CLI / child-process integrations).
   * @param _server An Express server instance (unused).
   * @param context A Uttori-like context.
   */
  static async bindServer(_server: import('http').Server, context: MCPProviderContext): Promise<void> {
    debug('bindServer');

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

    const server: McpSdkServer | undefined = await MCPProvider.buildServer(context);
    if (!server) {
      debug('bindServer: MCP server unavailable.');
      return;
    }
    /* c8 ignore next 5 */

    const transport: McpStdioServerTransport = new sdk.StdioServerTransport();
    await server.connect(transport);
    debug('bindServer: stdio transport connected.');
  }
}

export default MCPProvider;
