import { createDebug } from '../../debug.js';
const debug = createDebug('Uttori.Plugin.AIChatBot.ToolRegistry');
/**
 * Read a string tool argument when present.
 * @param args The tool arguments.
 * @param key The argument key.
 * @returns The string value, if any.
 */
function readStringArg(args, key) {
    const value = args[key];
    return typeof value === 'string' ? value : undefined;
}
/**
 * Read a string array tool argument when present.
 * @param args The tool arguments.
 * @param key The argument key.
 * @returns The string values.
 */
function readStringArrayArg(args, key) {
    const value = args[key];
    return Array.isArray(value) ? value.filter(item => typeof item === 'string') : [];
}
/**
 * Read a numeric tool argument when present.
 * @param args The tool arguments.
 * @param key The argument key.
 * @returns The numeric value, if any.
 */
function readNumberArg(args, key) {
    const value = args[key];
    return typeof value === 'number' ? value : undefined;
}
/**
 * Fetch from a hook and return the first registered handler's result.
 * `EventDispatcher.fetch` returns an array of results (one per registered callback); the
 * wiki only ever registers a single provider per data hook, so we unwrap the first entry.
 * @param hooks The event dispatcher.
 * @param label The hook label.
 * @param data The data to pass to the hook callbacks.
 * @param [context] The Uttori context.
 * @returns The unwrapped result or an error.
 */
async function fetchOne(hooks, label, data, context) {
    if (!hooks || typeof hooks.fetch !== 'function') {
        return { ok: false, error: `No event dispatcher available for '${label}'.` };
    }
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
 *
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
            return result.value ?? { query, chunks: [], citations: [] };
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
            return (result.value ?? []);
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
            return (result.value ?? []);
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
            return (result.value ?? null);
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
            return (result.value ?? []);
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
            return (result.value ?? null);
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
            return (result.value ?? []);
        },
    },
];
/**
 * Map of wiki tool definitions indexed by their name.
 *
 */
export const WIKI_TOOLS_BY_NAME = new Map(WIKI_TOOLS.map(tool => [tool.name, tool]));
/**
 * Look up a wiki tool by name.
 * @param name The tool name.
 * @returns The matching definition, if any.
 */
export function getWikiTool(name) {
    return WIKI_TOOLS_BY_NAME.get(name);
}
/**
 * Convert a wiki tool definition into the Ollama `tools` array shape.
 * @param definition The wiki tool definition.
 * @returns The Ollama tool schema.
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
 * @param definition The wiki tool definition.
 * @returns The MCP tool descriptor.
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
 * @param name The tool name.
 * @param args The tool arguments.
 * @param executeContext The execution context with hooks and config.
 * @returns The raw structured result, or an `{ error }` object for unknown tools / missing handlers.
 */
export async function executeWikiTool(name, args, executeContext) {
    debug('executeWikiTool:', name, args);
    const definition = WIKI_TOOLS_BY_NAME.get(name);
    if (!definition) {
        return { error: `Unknown Tool: ${name}` };
    }
    return definition.execute(args ?? {}, executeContext);
}
//# sourceMappingURL=tool-registry.js.map