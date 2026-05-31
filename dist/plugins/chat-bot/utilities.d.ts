/**
 * Split table rows into chunks based on row count or token size.
 * @param {string[]} header The table header row.
 * @param {string[][]} bodyRows The table body rows.
 * @param {object} options Chunking options.
 * @param {number} [options.maxRowsPerChunk] Maximum number of rows per chunk.
 * @param {number} [options.maxTokensPerChunk] Maximum estimated tokens per chunk.
 * @returns {Array<{header: string[], rows: string[][], chunkIndex: number, totalChunks: number}>} Array of table chunks.
 */
export function chunkTable(header: string[], bodyRows: string[][], options?: {
    maxRowsPerChunk?: number | undefined;
    maxTokensPerChunk?: number | undefined;
}): Array<{
    header: string[];
    rows: string[][];
    chunkIndex: number;
    totalChunks: number;
}>;
/**
 * Create a node from a MarkdownIt Token.
 * @param {import('markdown-it/index.js').Token} [token] A token to convert.
 * @returns {MarkdownASTNode} A newly created node.
 */
export function genTreeNode(token?: import("markdown-it/index.js").Token): MarkdownASTNode;
/**
 * Strip images from markdown text, leaving only the text content.
 * @param {string} text The markdown text to clean.
 * @returns {string} The text with images removed.
 */
export function stripImagesFromMarkdown(text: string): string;
/**
 * Join the content of an item into a single string.
 * @param {MarkdownASTNode[]} items The array of itens to check.
 * @returns {MarkdownASTNode[]} The array of items with the content joined into a single string.
 */
export function joinContent(items: MarkdownASTNode[]): MarkdownASTNode[];
/**
 * Consolidate header objects to their text content.
 * @param {MarkdownASTNode[]} items The array of itens to check.
 * @returns {MarkdownASTNode[]} The array of items with consolidated text headers.
 */
export function consolidateHeaders(items: MarkdownASTNode[]): MarkdownASTNode[];
/**
 * Consolidate a Token's children to plain text.
 * @param {MarkdownASTNode} token The Token to consolidate.
 * @returns {string[]} The consolidated text string.
 */
export function consolidateParagraph(token: MarkdownASTNode): string[];
/**
 * Flatten the tree structure for known types: bullet_list, ordered_list, table, footnote, blockquote
 * @param {MarkdownASTNode[]} items The array of itens to consolidate.
 * @param {object} options The options for the consolidation.
 * @param {boolean} [options.tableToCSV] Whether to convert the table to CSV.
 * @param {number} [options.tableMaxRowsPerChunk] The maximum number of rows per chunk for tables.
 * @param {number} [options.tableMaxTokensPerChunk] The maximum number of tokens per chunk for tables.
 * @returns {MarkdownASTNode[]} The array of items with flattened structures.
 */
export function consolidateNestedItems(items: MarkdownASTNode[], options?: {
    tableToCSV?: boolean | undefined;
    tableMaxRowsPerChunk?: number | undefined;
    tableMaxTokensPerChunk?: number | undefined;
}): MarkdownASTNode[];
/**
 * Remove any items with no content and no children.
 * @param {MarkdownASTNode[]} items The array of itens to check.
 * @returns {MarkdownASTNode[]} The array of items with empty items removed.
 */
export function removeEmptyItems(items: MarkdownASTNode[]): MarkdownASTNode[];
/**
 * Removes curly quotes, punctuation, normalizes whitespace, lowercase, split at the space, use a loop to count word occurrences into an index object.
 * @param {string} input The text input to count words in.
 * @returns {Record<string, number>} The word count hash.
 */
export function countWords(input: string): Record<string, number>;
/**
 * Find the longest common prefix of an array of paths.
 * @param {string[][]} paths The array of paths to find the longest common prefix of.
 * @returns {string[]} The longest common prefix of the paths.
 */
export function longestCommonPrefix(paths: string[][]): string[];
/**
 * Split a block of text into pieces that each fit within an approximate token budget.
 *
 * Splits on line boundaries first (which keeps table rows and code lines intact), then falls back
 * to splitting an individually over-long line on word boundaries. This is used to break up sections
 * that are larger than the chunk cap so they can still be embedded, an un-split section can exceed
 * the embedding model's context window and fail to embed entirely.
 * @param {string} text The text to split.
 * @param {number} maxTokens The maximum approximate tokens per piece.
 * @returns {string[]} The text split into token-bounded pieces.
 */
export function splitTextToTokenBudget(text: string, maxTokens: number): string[];
/**
 * Consolidate like sub-sections by their headers.
 * @param {import('../search-provider-sqlite.js').Block[]} items The items to consolidate.
 * @param {number} [maximumTokenCount] The maximum token count to consolidate to.
 * @param {number} [softMinTokens] If we've already packed at least this many tokens, and the next item would shrink the anchor, flush early.
 * @param {number} [minAnchorDecrease] How much the anchor must shrink (in header levels) to trigger early flush.
 * @returns {import('../search-provider-sqlite.js').Block[]} The consolidated items.
 */
export function consolidateSectionsByHeader(items: import("../search-provider-sqlite.js").Block[], maximumTokenCount?: number, softMinTokens?: number, minAnchorDecrease?: number): import("../search-provider-sqlite.js").Block[];
/**
 * Convert MarkdownIt Tokens to an AST.
 * @param {import('markdown-it/index.js').Token[]} tokens Tokens to convert.
 * @param {string} title The document title used as the H1 in the header stack.
 * @param {object} options The options for the conversion.
 * @param {boolean} [options.tableToCSV] Whether to convert tables to CSV format. If false, converts to Markdown format instead.
 * @param {number} [options.tableMaxRowsPerChunk] The maximum number of rows per chunk for tables.
 * @param {number} [options.tableMaxTokensPerChunk] The maximum number of tokens per chunk for tables.
 * @returns {MarkdownASTNode[]} The MarkdownIt tokens processed to a collection of MarkdownASTNodes.
 */
export function markdownItAST(tokens: import("markdown-it/index.js").Token[], title: string, options?: {
    tableToCSV?: boolean | undefined;
    tableMaxRowsPerChunk?: number | undefined;
    tableMaxTokensPerChunk?: number | undefined;
}): MarkdownASTNode[];
export function oneLine(text: string, replace?: string): string;
export function toCSV(table: string[][], seperator?: string, newLine?: string, alwaysDoubleQuote?: boolean): string;
export function toMarkdown(table: string[][], newLine?: string): string;
export function estimateTokenCount(text: string): number;
export type MarkdownASTNode = {
    /**
     * The type of node.
     */
    type: string;
    /**
     * Text content for the node.
     */
    content: Array<string | string[]>;
    /**
     * The relevant headers for this node.
     */
    headers: MarkdownASTHeaderValue[];
    /**
     * The MarkdownIt Token object for the opening tag.
     */
    open?: {
        type: string;
        tag: string;
        attrs: Array<[string, string]> | null;
        map: [number, number] | null;
        nesting: import("markdown-it/dist/index.cjs.js").Token.Nesting;
        level: number;
        children: /*elided*/ any[] | null;
        content: string;
        markup: string;
        info: string;
        meta: any;
        block: boolean;
        hidden: boolean;
        attrIndex(name: string): number;
        attrPush(attrData: [string, string]): void;
        attrSet(name: string, value: string): void;
        attrGet(name: string): string | null;
        attrJoin(name: string, value: string): void;
    } | null | undefined;
    /**
     * The MarkdownIt Token object for the closing tag.
     */
    close?: {
        type: string;
        tag: string;
        attrs: Array<[string, string]> | null;
        map: [number, number] | null;
        nesting: import("markdown-it/dist/index.cjs.js").Token.Nesting;
        level: number;
        children: /*elided*/ any[] | null;
        content: string;
        markup: string;
        info: string;
        meta: any;
        block: boolean;
        hidden: boolean;
        attrIndex(name: string): number;
        attrPush(attrData: [string, string]): void;
        attrSet(name: string, value: string): void;
        attrGet(name: string): string | null;
        attrJoin(name: string, value: string): void;
    } | null | undefined;
    /**
     * The child nodes for this node.
     */
    children: MarkdownASTNode[];
};
export type MarkdownASTHeaderEntry = string | number | MarkdownASTNode | Array<string | MarkdownASTNode | number>;
export type MarkdownASTHeaderStack = MarkdownASTHeaderEntry[];
/**
 * A header slot before or after consolidation.
 */
export type MarkdownASTHeaderValue = string | number | boolean | null | undefined | MarkdownASTHeaderStack;
/**
 * Optional footnote metadata on a MarkdownIt token.
 */
export type MarkdownFootnoteMeta = {
    /**
     * Footnote label text.
     */
    label?: unknown;
};
//# sourceMappingURL=utilities.d.ts.map