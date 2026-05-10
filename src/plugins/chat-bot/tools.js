import { retrieve } from './retrieval.js';

let debug = (..._) => {};
/* c8 ignore next 1 */
try { const { default: d } = await import('debug'); debug = d('Uttori.Plugin.AIChatBot.Tools'); } catch {}

/**
 * @typedef {object} OllamaToolFunction
 * @property {string} name The function name.
 * @property {string} description The function description.
 * @property {object} parameters The JSON Schema for the function parameters.
 */

/**
 * @typedef {object} OllamaTool
 * @property {"function"} type The type of tool.
 * @property {OllamaToolFunction} function The function definition.
 */

/**
 * @typedef {object} ChatToolResult
 * @property {string} [error] Set when the tool name is unknown.
 */

/**
 * Maximum characters to include per retrieved chunk in the context block.
 * Chunks longer than this are truncated with an ellipsis.
 * @type {number}
 */
const MAX_CHUNK_CHARS = 1500;

/**
 * Built-in Ollama tool schema for `vectorSearch`.
 * Passed verbatim in the `tools` array of every `/api/chat` request.
 * @type {OllamaTool}
 */
export const vectorSearchTool = {
  type: 'function',
  function: {
    name: 'vectorSearch',
    description: 'Search the wiki for information relevant to the user question. Returns formatted source passages.',
    parameters: {
      type: 'object',
      required: ['query'],
      properties: {
        query: {
          type: 'string',
          description: 'Concise search query derived from the user question.',
        },
        slugs: {
          type: 'array',
          items: { type: 'string' },
          description: 'Optional array of document slugs to restrict the search to.',
        },
      },
    },
  },
};

/**
 * Map of all built-in chat tools indexed by their name.
 * Extend this map to register additional tools without changing `runChatPass`.
 * @type {Map<string, OllamaTool>}
 */
export const BUILT_IN_TOOLS = new Map([
  [vectorSearchTool.function.name, vectorSearchTool],
]);

/**
 * Build the array of Ollama tool schemas to include in an `/api/chat` request.
 * When `config.tools` is a non-empty array it is used as-is, so callers retain
 * full control. When it is empty or absent the built-in wiki tools are used.
 * Pass `config.tools = null` (or any non-array) to disable tools entirely.
 * @param {import('../ai-chat-bot.js').AIChatBotConfig} config The chat bot configuration.
 * @returns {OllamaTool[]} The tool schemas for Ollama.
 */
export function buildChatTools(config) {
  if (Array.isArray(config.tools) && config.tools.length > 0) {
    return config.tools;
  }
  if (Array.isArray(config.tools) && config.tools.length === 0) {
    // Empty array = "use built-ins"
    return [...BUILT_IN_TOOLS.values()];
  }
  // null / undefined / non-array = disabled
  return [];
}

/**
 * Format a {@link import('../ai-chat-bot.js').RetrieveResponse} into the compact context
 * block string that is sent back to the model as a tool result.
 * Each chunk becomes a block:
 * ```
 * SOURCE: <title>[ - <section path>]
 * SLUG: <slug>
 * ---
 * <text (truncated to MAX_CHUNK_CHARS)>
 * ```
 * Blocks are joined with `\n\n====\n\n`.
 * @param {import('../ai-chat-bot.js').RetrieveResponse} result The retrieval result.
 * @returns {string} The formatted context block.
 */
export function formatRetrievalResult(result) {
  /** @type {string[]} */
  const blocks = [];
  for (const chunk of result.chunks) {
    const srcTitle = chunk.source.title || chunk.source.id;
    const section = chunk.sectionPath?.length ? ` - ${chunk.sectionPath.join(' > ')}` : '';
    const text = chunk.text.length <= MAX_CHUNK_CHARS ? chunk.text : chunk.text.slice(0, MAX_CHUNK_CHARS - 1) + '…';
    blocks.push(`SOURCE: ${srcTitle}${section}\nSLUG: ${chunk.source.slug ?? ''}\n---\n${text}`);
  }
  return blocks.join('\n\n====\n\n');
}

/**
 * Execute a named chat tool and return its formatted result.
 * Unknown tool names return an error object consistent with the original behaviour.
 * @param {string} name The tool name as returned by the model.
 * @param {Record<string, any>} args The arguments object from the model's tool call.
 * @param {import('../ai-chat-bot.js').AIChatBotConfig} config The chat bot configuration.
 * @param {typeof retrieve} [retrieveFn] Optional retrieval function override, primarily for testing.
 * @returns {Promise<string | ChatToolResult>} The formatted result string, or an error object.
 */
export async function executeChatTool(name, args, config, retrieveFn = retrieve) {
  debug('executeChatTool:', name, args);
  if (name === 'vectorSearch') {
    const result = await retrieveFn(args?.query, config, args?.slugs ?? []);
    return formatRetrievalResult(result);
  }
  return { error: `Unknown Tool: ${name}` };
}
