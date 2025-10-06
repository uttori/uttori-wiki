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
 * Consolidate header objects to their text content.
 * @param {MarkdownASTNode[]} items The array of itens to check.
 * @returns {MarkdownASTNode[]} The array of items with consolidated text headers.
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
 * @returns {MarkdownASTNode[]} The array of items with flattened structures.
 */
export function consolidateNestedItems(items: MarkdownASTNode[]): MarkdownASTNode[];
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
 * Consolidate like sub-sections by their headers.
 * @param {import('../ai-chat-bot.js').Block[]} items The items to consolidate.
 * @param {number} [maximumTokenCount] The maximum token count to consolidate to.
 * @param {number} [softMinTokens] If we've already packed at least this many tokens, and the next item would shrink the anchor, flush early.
 * @param {number} [minAnchorDecrease] How much the anchor must shrink (in header levels) to trigger early flush.
 * @returns {object[]} The consolidated items.
 */
export function consolidateSectionsByHeader(items: import("../ai-chat-bot.js").Block[], maximumTokenCount?: number, softMinTokens?: number, minAnchorDecrease?: number): object[];
/**
 * Convert MarkdownIt Tokens to an AST.
 * @param {import('markdown-it/index.js').Token[]} tokens Tokens to convert.
 * @param {string} title The document title used as the H1 in the header stack.
 * @returns {MarkdownASTNode[]} The MarkdownIt tokens processed to a collection of MarkdownASTNodes.
 */
export function markdownItAST(tokens: import("markdown-it/index.js").Token[], title: string): MarkdownASTNode[];
export function oneLine(text: string, replace?: string): string;
export function toCSV(table: string[][], seperator?: string, newLine?: string, alwaysDoubleQuote?: boolean): string;
export type MarkdownASTNode = {
    /**
     * The type of node.
     */
    type: string;
    /**
     * Text content for the node.
     */
    content: string[];
    /**
     * The relevant headers for this node.
     */
    headers: Array<Array<string | MarkdownASTNode | number>>;
    /**
     * The MarkdownIt Token object for the opening tag.
     */
    open?: import("markdown-it/index.js").Token | null;
    /**
     * The MarkdownIt Token object for the closing tag.
     */
    close?: import("markdown-it/index.js").Token | null;
    /**
     * The child nodes for this node.
     */
    children: MarkdownASTNode[];
};
//# sourceMappingURL=utilities.d.ts.map