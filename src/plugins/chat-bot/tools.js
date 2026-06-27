import { createDebug } from '../../debug.js';
import {
  WIKI_TOOLS,
  getWikiTool,
  toOllamaTool,
  executeWikiTool,
} from './tool-registry.js';

const debug = createDebug('Uttori.Plugin.AIChatBot.Tools');

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
 * @property {string} [error] Set when the tool name is unknown or no provider handled it.
 */

/**
 * Maximum characters to include per retrieved chunk in the context block.
 * Chunks longer than this are truncated with an ellipsis.
 * @type {number}
 */
const MAX_CHUNK_CHARS = 1500;

/**
 * Built-in Ollama tool schema for `vectorSearch`.
 * Derived from the shared registry so the chat bot and MCP provider stay in sync.
 * @type {OllamaTool}
 */
export const vectorSearchTool = toOllamaTool(/** @type {import('./tool-registry.js').WikiToolDefinition} */ (getWikiTool('vectorSearch')));

/**
 * Map of all built-in chat tools indexed by their name.
 * Built from the shared wiki tool registry.
 * @type {Map<string, OllamaTool>}
 */
export const BUILT_IN_TOOLS = new Map(WIKI_TOOLS.map(definition => [definition.name, toOllamaTool(definition)]));

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
 * Format a {@link import('../search-provider-sqlite.js').RetrieveResponse} into the compact context
 * block string that is sent back to the model as a tool result.
 * Each chunk becomes a block:
 * ```
 * SOURCE: <title>[ - <section path>]
 * SLUG: <slug>
 * ---
 * <text (truncated to MAX_CHUNK_CHARS)>
 * ```
 * Blocks are joined with `\n\n====\n\n`.
 * @param {import('../search-provider-sqlite.js').RetrieveResponse} result The retrieval result.
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
 * @typedef {object} ChatToolExecutionContext
 * @property {import('@uttori/event-dispatcher').EventDispatcher} [hooks] The Uttori event dispatcher.
 * @property {object} [context] The full Uttori context.
 * @property {import('../ai-chat-bot.js').AIChatBotConfig} [config] The chat bot configuration.
 */

/**
 * Execute a named chat tool and return its result.
 * Tools are resolved through the shared wiki tool registry, which dispatches to the
 * registered storage / search providers via the Uttori hook system. The `vectorSearch`
 * tool result is post-formatted into the compact context block expected by the model;
 * all other tools return their structured result JSON-serialized.
 * Unknown tool names and missing providers return an error object.
 * @param {string} name The tool name as returned by the model.
 * @param {Record<string, any>} args The arguments object from the model's tool call.
 * @param {import('../ai-chat-bot.js').AIChatBotConfig} config The chat bot configuration.
 * @param {ChatToolExecutionContext} context A Uttori-like context exposing `hooks`.
 * @returns {Promise<string | ChatToolResult>} The formatted/serialized result string, or an error object.
 */
export async function executeChatTool(name, args, config, context) {
  debug('executeChatTool:', name, args);
  const definition = getWikiTool(name);
  if (!definition) {
    return { error: `Unknown Tool: ${name}` };
  }

  // Inject the configured default chunk limit for vectorSearch when the model omits one.
  const effectiveArgs = name === 'vectorSearch' && (args == null || args.limit == null) && config?.retrieveLimit != null
    ? { ...args, limit: config.retrieveLimit }
    : args;

  const result = await executeWikiTool(name, effectiveArgs, {
    hooks: context.hooks,
    context,
    config,
  });

  // Propagate registry errors (unknown tool / missing provider) verbatim.
  if (result && typeof result === 'object' && 'error' in result && !('chunks' in result)) {
    return /** @type {ChatToolResult} */ (result);
  }

  // The vectorSearch tool returns a RetrieveResponse that is formatted into a context block.
  if (name === 'vectorSearch') {
    return formatRetrievalResult(/** @type {import('../search-provider-sqlite.js').RetrieveResponse} */ (result));
  }

  return JSON.stringify(result);
}
