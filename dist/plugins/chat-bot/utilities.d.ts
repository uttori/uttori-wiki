import type { MarkdownASTNode } from '../../types/plugins/chat-bot/utilities.js';
export type { MarkdownASTNode, MarkdownASTHeaderEntry, MarkdownASTHeaderStack, MarkdownASTHeaderValue, MarkdownFootnoteMeta, } from '../../types/plugins/chat-bot/utilities.js';
/**
 * Convert newlines to spaces.
 * @param text The text to convert newlines to spaces.
 * @param [replace] The string to replace newlines with, defaults to a single space.
 * @returns The text with newlines converted to spaces.
 */
export declare const oneLine: (text: string, replace?: string) => string;
/**
 * Takes an array of arrays and returns a `,` sparated csv file.
 * @param table The array of arrays of strings to join.
 * @param [seperator] The seperator to use when joining the items, defaults to `,`.
 * @param [newLine] The seperator to use when joining the rows, defaults to `\n`.
 * @param [alwaysDoubleQuote] Always double quote the cell, defaults to true.
 * @returns The joined CSV row.
 */
export declare const toCSV: (table: string[][], seperator?: string, newLine?: string, alwaysDoubleQuote?: boolean) => string;
/**
 * Takes an array of arrays and returns a Markdown table.
 * @param table The array of arrays of strings to join.
 * @param [newLine] The seperator to use when joining the rows, defaults to `\n`.
 * @returns The Markdown table string.
 */
export declare const toMarkdown: (table: string[][], newLine?: string) => string;
/**
 * Estimate token count for text using word count approximation.
 * @param text The text to estimate tokens for.
 * @returns The estimated token count.
 */
export declare const estimateTokenCount: (text: string) => number;
/**
 * Split table rows into chunks based on row count or token size.
 * @param header The table header row.
 * @param bodyRows The table body rows.
 * @param options Chunking options.
 * @param [options.maxRowsPerChunk] Maximum number of rows per chunk.
 * @param [options.maxTokensPerChunk] Maximum estimated tokens per chunk.
 * @returns Array of table chunks.
 */
export declare function chunkTable(header: string[], bodyRows: string[][], options?: {
    maxRowsPerChunk?: number;
    maxTokensPerChunk?: number;
}): {
    header: string[];
    rows: string[][];
    chunkIndex: number;
    totalChunks: number;
}[];
/**
 * Create a node from a MarkdownIt Token.
 * @param [token] A token to convert.
 * @returns A newly created node.
 */
export declare function genTreeNode(token?: import('markdown-it').Token): MarkdownASTNode;
/**
 * Strip images from markdown text, leaving only the text content.
 * @param text The markdown text to clean.
 * @returns The text with images removed.
 */
export declare function stripImagesFromMarkdown(text: string): string;
/**
 * Join the content of an item into a single string.
 * @param items The array of itens to check.
 * @returns The array of items with the content joined into a single string.
 */
export declare function joinContent(items: MarkdownASTNode[]): MarkdownASTNode[];
/**
 * Consolidate header objects to their text content.
 * @param items The array of itens to check.
 * @returns The array of items with consolidated text headers.
 */
export declare function consolidateHeaders(items: MarkdownASTNode[]): MarkdownASTNode[];
/**
 * Consolidate a Token's children to plain text.
 * @param token The Token to consolidate.
 * @returns The consolidated text string.
 */
export declare function consolidateParagraph(token: MarkdownASTNode): string[];
/**
 * Flatten the tree structure for known types: bullet_list, ordered_list, table, footnote, blockquote
 * @param items The array of itens to consolidate.
 * @param options The options for the consolidation.
 * @param [options.tableToCSV] Whether to convert the table to CSV.
 * @param [options.tableMaxRowsPerChunk] The maximum number of rows per chunk for tables.
 * @param [options.tableMaxTokensPerChunk] The maximum number of tokens per chunk for tables.
 * @returns The array of items with flattened structures.
 */
export declare function consolidateNestedItems(items: MarkdownASTNode[], options?: {
    tableToCSV?: boolean;
    tableMaxRowsPerChunk?: number;
    tableMaxTokensPerChunk?: number;
}): MarkdownASTNode[];
/**
 * Remove any items with no content and no children.
 * @param items The array of itens to check.
 * @returns The array of items with empty items removed.
 */
export declare function removeEmptyItems(items: MarkdownASTNode[]): MarkdownASTNode[];
/**
 * Removes curly quotes, punctuation, normalizes whitespace, lowercase, split at the space, use a loop to count word occurrences into an index object.
 * @param input The text input to count words in.
 * @returns The word count hash.
 */
export declare function countWords(input: string): Record<string, number>;
/**
 * Find the longest common prefix of an array of paths.
 * @param paths The array of paths to find the longest common prefix of.
 * @returns The longest common prefix of the paths.
 */
export declare function longestCommonPrefix(paths: string[][]): string[];
/**
 * Split a block of text into pieces that each fit within an approximate token budget.
 *
 * Splits on line boundaries first (which keeps table rows and code lines intact), then falls back
 * to splitting an individually over-long line on word boundaries. This is used to break up sections
 * that are larger than the chunk cap so they can still be embedded, an un-split section can exceed
 * the embedding model's context window and fail to embed entirely.
 * @param text The text to split.
 * @param maxTokens The maximum approximate tokens per piece.
 * @returns The text split into token-bounded pieces.
 */
export declare function splitTextToTokenBudget(text: string, maxTokens: number): string[];
/**
 * Consolidate like sub-sections by their headers.
 * @param items The items to consolidate.
 * @param [maximumTokenCount] The maximum token count to consolidate to.
 * @param [softMinTokens] If we've already packed at least this many tokens, and the next item would shrink the anchor, flush early.
 * @param [minAnchorDecrease] How much the anchor must shrink (in header levels) to trigger early flush.
 * @returns The consolidated items.
 */
export declare function consolidateSectionsByHeader(items: import('../search-provider-sqlite.js').Block[], maximumTokenCount?: number, softMinTokens?: number, minAnchorDecrease?: number): import('../search-provider-sqlite.js').IndexedBlock[];
/**
 * Convert MarkdownIt Tokens to an AST.
 * @param tokens Tokens to convert.
 * @param title The document title used as the H1 in the header stack.
 * @param options The options for the conversion.
 * @param [options.tableToCSV] Whether to convert tables to CSV format. If false, converts to Markdown format instead.
 * @param [options.tableMaxRowsPerChunk] The maximum number of rows per chunk for tables.
 * @param [options.tableMaxTokensPerChunk] The maximum number of tokens per chunk for tables.
 * @returns The MarkdownIt tokens processed to a collection of MarkdownASTNodes.
 */
export declare function markdownItAST(tokens: import('markdown-it').Token[], title: string, options?: {
    tableToCSV?: boolean;
    tableMaxRowsPerChunk?: number;
    tableMaxTokensPerChunk?: number;
}): MarkdownASTNode[];
//# sourceMappingURL=utilities.d.ts.map