import { createDebug } from '../../debug.js';

const debug = createDebug('Uttori.Plugin.AIChatBot.ToolRegistry');

/**
 * @typedef {object} WikiToolExecuteContext
 * @property {import('@uttori/event-dispatcher').EventDispatcher} hooks The Uttori event dispatcher used to reach storage and search providers.
 * @property {object} [context] The full Uttori context passed through to the hook callbacks.
 * @property {object} [config] The calling plugin's configuration, available to tool implementations.
 */

/**
 * Executes a wiki tool against the shared hook registry.
 * @callback WikiToolExecuteFunction
 * @param {Record<string, unknown>} args The tool arguments.
 * @param {WikiToolExecuteContext} executeContext The execution context with hooks and config.
 * @returns {Promise<unknown>} The raw structured result.
 */

/**
 * A single wiki capability exposed identically to the chat orchestrator and the MCP server.
 * @typedef {object} WikiToolDefinition
 * @property {string} name The unique tool name.
 * @property {string} description A human readable description of the tool.
 * @property {object} inputSchema The JSON Schema describing the tool arguments.
 * @property {string} hook The Uttori hook label the tool dispatches to.
 * @property {WikiToolExecuteFunction} execute Runs the tool and returns the raw structured result.
 */

/**
 * Ollama tool schema shape.
 * @typedef {import('./tools.js').OllamaTool} OllamaTool
 */

/**
 * MCP tool schema shape (a subset of the MCP `Tool` type).
 * @typedef {object} McpTool
 * @property {string} name The tool name.
 * @property {string} description The tool description.
 * @property {object} inputSchema The JSON Schema for the tool arguments.
 */

/**
 * @typedef {{ ok: true, value: unknown } | { ok: false, error: string }} FetchOneResult
 */

/**
 * Read a string tool argument when present.
 * @param {Record<string, unknown>} args The tool arguments.
 * @param {string} key The argument key.
 * @returns {string | undefined} The string value, if any.
 */
function readStringArg(args, key) {
  const value = args[key];
  return typeof value === 'string' ? value : undefined;
}

/**
 * Read a string array tool argument when present.
 * @param {Record<string, unknown>} args The tool arguments.
 * @param {string} key The argument key.
 * @returns {string[]} The string values.
 */
function readStringArrayArg(args, key) {
  const value = args[key];
  return Array.isArray(value) ? value.filter(item => typeof item === 'string') : [];
}

/**
 * Read a numeric tool argument when present.
 * @param {Record<string, unknown>} args The tool arguments.
 * @param {string} key The argument key.
 * @returns {number | undefined} The numeric value, if any.
 */
function readNumberArg(args, key) {
  const value = args[key];
  return typeof value === 'number' ? value : undefined;
}

/**
 * Fetch from a hook and return the first registered handler's result.
 * `EventDispatcher.fetch` returns an array of results (one per registered callback); the
 * wiki only ever registers a single provider per data hook, so we unwrap the first entry.
 * @param {import('@uttori/event-dispatcher').EventDispatcher} hooks The event dispatcher.
 * @param {string} label The hook label.
 * @param {unknown} data The data to pass to the hook callbacks.
 * @param {object} [context] The Uttori context.
 * @returns {Promise<FetchOneResult>} The unwrapped result or an error.
 */
async function fetchOne(hooks, label, data, context) {
  if (!hooks || typeof hooks.fetch !== 'function') {
    return { ok: false, error: `No event dispatcher available for '${label}'.` };
  }
  /** @type {any[]} */
  const results = await hooks.fetch(label, data, context);
  if (!Array.isArray(results) || results.length === 0) {
    debug(`fetchOne: no handler registered for '${label}'.`);
    return { ok: false, error: `No '${label}' handler registered. Is the search/storage provider installed?` };
  }
  return { ok: true, value: results[0] };
}

/**
 * The canonical set of wiki tools shared by the chat bot and the MCP provider.
 * Each tool maps a structured request onto an existing Uttori hook so there is a single
 * implementation surface regardless of whether the caller is the LLM orchestrator or an
 * external MCP client.
 * @type {WikiToolDefinition[]}
 */
export const WIKI_TOOLS = [
  {
    name: 'vectorSearch',
    description: 'Search the wiki for information relevant to a question using hybrid vector + full text retrieval. Returns scored passages and citations.',
    hook: 'search-retrieve',
    inputSchema: {
      type: 'object',
      required: ['query'],
      properties: {
        query: { type: 'string', description: 'Concise search query derived from the user question.' },
        slugs: { type: 'array', items: { type: 'string' }, description: 'Optional array of document slugs to restrict the search to.' },
        limit: { type: 'number', description: 'Optional maximum number of chunks to return.' },
      },
    },
    async execute(args, { hooks, context }) {
      const query = readStringArg(args, 'query') ?? '';
      const result = await fetchOne(hooks, 'search-retrieve', {
        query,
        slugs: readStringArrayArg(args, 'slugs'),
        limit: readNumberArg(args, 'limit'),
      }, context);
      if (!result.ok) {
        return result;
      }
      return /** @type {import('../search-provider-sqlite.js').RetrieveResponse} */ (
        result.value ?? { query, chunks: [], citations: [] }
      );
    },
  },
  {
    name: 'searchDocuments',
    description: 'Search the wiki and return matching documents (full document records), ordered by relevance.',
    hook: 'search-query',
    inputSchema: {
      type: 'object',
      required: ['query'],
      properties: {
        query: { type: 'string', description: 'The search query.' },
        limit: { type: 'number', description: 'Optional maximum number of documents to return.' },
        slugs: { type: 'array', items: { type: 'string' }, description: 'Optional array of document slugs to restrict the search to.' },
      },
    },
    async execute(args, { hooks, context }) {
      const result = await fetchOne(hooks, 'search-query', {
        query: readStringArg(args, 'query'),
        limit: readNumberArg(args, 'limit'),
        slugs: readStringArrayArg(args, 'slugs'),
      }, context);
      if (!result.ok) {
        return result;
      }
      return /** @type {import('../../wiki.js').UttoriWikiDocument[]} */ (result.value ?? []);
    },
  },
  {
    name: 'listDocuments',
    description: 'List all available wiki documents with their id, slug, title, and last update date.',
    hook: 'search-documents',
    inputSchema: {
      type: 'object',
      properties: {},
    },
    async execute(_args, { hooks, context }) {
      const result = await fetchOne(hooks, 'search-documents', {}, context);
      if (!result.ok) {
        return result;
      }
      return /** @type {Array<{ id: string, slug: string, title: string, update_date: number }>} */ (result.value ?? []);
    },
  },
  {
    name: 'getDocument',
    description: 'Fetch a single wiki document by its slug.',
    hook: 'storage-get',
    inputSchema: {
      type: 'object',
      required: ['slug'],
      properties: {
        slug: { type: 'string', description: 'The slug of the document to fetch.' },
      },
    },
    async execute(args, { hooks, context }) {
      const result = await fetchOne(hooks, 'storage-get', readStringArg(args, 'slug'), context);
      if (!result.ok) {
        return result;
      }
      return /** @type {import('../../wiki.js').UttoriWikiDocument | null} */ (result.value ?? null);
    },
  },
  {
    name: 'getDocumentHistory',
    description: 'Fetch the list of revision identifiers for a document by its slug.',
    hook: 'storage-get-history',
    inputSchema: {
      type: 'object',
      required: ['slug'],
      properties: {
        slug: { type: 'string', description: 'The slug of the document to fetch history for.' },
      },
    },
    async execute(args, { hooks, context }) {
      const result = await fetchOne(hooks, 'storage-get-history', readStringArg(args, 'slug'), context);
      if (!result.ok) {
        return result;
      }
      return /** @type {string[]} */ (result.value ?? []);
    },
  },
  {
    name: 'getDocumentRevision',
    description: 'Fetch a specific historical revision of a document by slug and revision identifier.',
    hook: 'storage-get-revision',
    inputSchema: {
      type: 'object',
      required: ['slug', 'revision'],
      properties: {
        slug: { type: 'string', description: 'The slug of the document.' },
        revision: { type: 'string', description: 'The revision identifier to fetch.' },
      },
    },
    async execute(args, { hooks, context }) {
      const result = await fetchOne(hooks, 'storage-get-revision', {
        slug: readStringArg(args, 'slug'),
        revision: readStringArg(args, 'revision'),
      }, context);
      if (!result.ok) {
        return result;
      }
      return /** @type {import('../../wiki.js').UttoriWikiDocument | null} */ (result.value ?? null);
    },
  },
  {
    name: 'popularSearchTerms',
    description: 'Return the most popular search terms recorded by the search provider.',
    hook: 'search-popular-terms',
    inputSchema: {
      type: 'object',
      properties: {
        limit: { type: 'number', description: 'Optional maximum number of terms to return.' },
      },
    },
    async execute(args, { hooks, context }) {
      const result = await fetchOne(hooks, 'search-popular-terms', {
        limit: readNumberArg(args, 'limit') ?? 10,
      }, context);
      if (!result.ok) {
        return result;
      }
      return /** @type {Array<{ term: string, count: number }>} */ (result.value ?? []);
    },
  },
];

/**
 * Map of wiki tool definitions indexed by their name.
 * @type {Map<string, WikiToolDefinition>}
 */
export const WIKI_TOOLS_BY_NAME = new Map(WIKI_TOOLS.map(tool => [tool.name, tool]));

/**
 * Look up a wiki tool by name.
 * @param {string} name The tool name.
 * @returns {WikiToolDefinition | undefined} The matching definition, if any.
 */
export function getWikiTool(name) {
  return WIKI_TOOLS_BY_NAME.get(name);
}

/**
 * Convert a wiki tool definition into the Ollama `tools` array shape.
 * @param {WikiToolDefinition} definition The wiki tool definition.
 * @returns {OllamaTool} The Ollama tool schema.
 */
export function toOllamaTool(definition) {
  return {
    type: 'function',
    function: {
      name: definition.name,
      description: definition.description,
      parameters: definition.inputSchema,
    },
  };
}

/**
 * Convert a wiki tool definition into the MCP `Tool` shape.
 * @param {WikiToolDefinition} definition The wiki tool definition.
 * @returns {McpTool} The MCP tool descriptor.
 */
export function toMcpTool(definition) {
  return {
    name: definition.name,
    description: definition.description,
    inputSchema: definition.inputSchema,
  };
}

/**
 * Execute a wiki tool by name through the shared hook-backed implementation.
 * @param {string} name The tool name.
 * @param {Record<string, unknown>} args The tool arguments.
 * @param {WikiToolExecuteContext} executeContext The execution context with hooks and config.
 * @returns {Promise<unknown>} The raw structured result, or an `{ error }` object for unknown tools / missing handlers.
 */
export async function executeWikiTool(name, args, executeContext) {
  debug('executeWikiTool:', name, args);
  const definition = WIKI_TOOLS_BY_NAME.get(name);
  if (!definition) {
    return { error: `Unknown Tool: ${name}` };
  }
  return definition.execute(args ?? {}, executeContext);
}
