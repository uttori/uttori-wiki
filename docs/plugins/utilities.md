## Constants

<dl>
<dt><a href="#oneLine">oneLine</a> ⇒</dt>
<dd><p>Convert newlines to spaces.</p>
</dd>
<dt><a href="#toCSV">toCSV</a> ⇒</dt>
<dd><p>Takes an array of arrays and returns a <code>,</code> sparated csv file.</p>
</dd>
<dt><a href="#toMarkdown">toMarkdown</a> ⇒</dt>
<dd><p>Takes an array of arrays and returns a Markdown table.</p>
</dd>
<dt><a href="#estimateTokenCount">estimateTokenCount</a> ⇒</dt>
<dd><p>Estimate token count for text using word count approximation.</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#toPlainText">toPlainText(value)</a> ⇒</dt>
<dd><p>Coerce unknown markdown content into plain text.</p>
</dd>
<dt><a href="#footnoteLabelFromMeta">footnoteLabelFromMeta(meta)</a> ⇒</dt>
<dd><p>Read a footnote label from a MarkdownIt token meta object.</p>
</dd>
<dt><a href="#normalizeHeaderStackEntry">normalizeHeaderStackEntry(entry)</a> ⇒</dt>
<dd><p>Normalize a header stack entry to plain text or a numeric level.</p>
</dd>
<dt><a href="#chunkTable">chunkTable(header, bodyRows, options)</a> ⇒</dt>
<dd><p>Split table rows into chunks based on row count or token size.</p>
</dd>
<dt><a href="#genTreeNode">genTreeNode([token])</a> ⇒</dt>
<dd><p>Create a node from a MarkdownIt Token.</p>
</dd>
<dt><a href="#stripImagesFromMarkdown">stripImagesFromMarkdown(text)</a> ⇒</dt>
<dd><p>Strip images from markdown text, leaving only the text content.</p>
</dd>
<dt><a href="#joinContent">joinContent(items)</a> ⇒</dt>
<dd><p>Join the content of an item into a single string.</p>
</dd>
<dt><a href="#consolidateHeaders">consolidateHeaders(items)</a> ⇒</dt>
<dd><p>Consolidate header objects to their text content.</p>
</dd>
<dt><a href="#consolidateParagraph">consolidateParagraph(token)</a> ⇒</dt>
<dd><p>Consolidate a Token&#39;s children to plain text.</p>
</dd>
<dt><a href="#consolidateNestedItems">consolidateNestedItems(items, options)</a> ⇒</dt>
<dd><p>Flatten the tree structure for known types: bullet_list, ordered_list, table, footnote, blockquote</p>
</dd>
<dt><a href="#removeEmptyItems">removeEmptyItems(items)</a> ⇒</dt>
<dd><p>Remove any items with no content and no children.</p>
</dd>
<dt><a href="#countWords">countWords(input)</a> ⇒</dt>
<dd><p>Removes curly quotes, punctuation, normalizes whitespace, lowercase, split at the space, use a loop to count word occurrences into an index object.</p>
</dd>
<dt><a href="#longestCommonPrefix">longestCommonPrefix(paths)</a> ⇒</dt>
<dd><p>Find the longest common prefix of an array of paths.</p>
</dd>
<dt><a href="#approximateTokens">approximateTokens(text)</a> ⇒</dt>
<dd><p>Approximate the number of tokens in a string (≈ 3/4 of the word count for English text).</p>
</dd>
<dt><a href="#splitTextToTokenBudget">splitTextToTokenBudget(text, maxTokens)</a> ⇒</dt>
<dd><p>Split a block of text into pieces that each fit within an approximate token budget.</p>
<p>Splits on line boundaries first (which keeps table rows and code lines intact), then falls back
to splitting an individually over-long line on word boundaries. This is used to break up sections
that are larger than the chunk cap so they can still be embedded, an un-split section can exceed
the embedding model&#39;s context window and fail to embed entirely.</p>
</dd>
<dt><a href="#consolidateSectionsByHeader">consolidateSectionsByHeader(items, [maximumTokenCount], [softMinTokens], [minAnchorDecrease])</a> ⇒</dt>
<dd><p>Consolidate like sub-sections by their headers.</p>
</dd>
<dt><a href="#markdownItAST">markdownItAST(tokens, title, options)</a> ⇒</dt>
<dd><p>Convert MarkdownIt Tokens to an AST.</p>
</dd>
</dl>

<a name="oneLine"></a>

## oneLine ⇒
Convert newlines to spaces.

**Kind**: global constant\
**Returns**: The text with newlines converted to spaces.\

| Param | Description |
| --- | --- |
| text | The text to convert newlines to spaces. |
| [replace] | The string to replace newlines with, defaults to a single space. |

<a name="toCSV"></a>

## toCSV ⇒
Takes an array of arrays and returns a `,` sparated csv file.

**Kind**: global constant\
**Returns**: The joined CSV row.\

| Param | Description |
| --- | --- |
| table | The array of arrays of strings to join. |
| [seperator] | The seperator to use when joining the items, defaults to `,`. |
| [newLine] | The seperator to use when joining the rows, defaults to `\n`. |
| [alwaysDoubleQuote] | Always double quote the cell, defaults to true. |

<a name="toMarkdown"></a>

## toMarkdown ⇒
Takes an array of arrays and returns a Markdown table.

**Kind**: global constant\
**Returns**: The Markdown table string.\

| Param | Description |
| --- | --- |
| table | The array of arrays of strings to join. |
| [newLine] | The seperator to use when joining the rows, defaults to `\n`. |

<a name="toMarkdown..formatRow"></a>

### toMarkdown~formatRow(row) ⇒
Format a row with pipes.

**Kind**: inner method of [<code>toMarkdown</code>](#toMarkdown)\
**Returns**: The formatted row.\

| Param | Description |
| --- | --- |
| row | The row to format. |

<a name="estimateTokenCount"></a>

## estimateTokenCount ⇒
Estimate token count for text using word count approximation.

**Kind**: global constant\
**Returns**: The estimated token count.\

| Param | Description |
| --- | --- |
| text | The text to estimate tokens for. |

<a name="toPlainText"></a>

## toPlainText(value) ⇒
Coerce unknown markdown content into plain text.

**Kind**: global function\
**Returns**: Plain text.\

| Param | Description |
| --- | --- |
| value | The value to coerce. |

<a name="footnoteLabelFromMeta"></a>

## footnoteLabelFromMeta(meta) ⇒
Read a footnote label from a MarkdownIt token meta object.

**Kind**: global function\
**Returns**: The footnote label, if present.\

| Param | Description |
| --- | --- |
| meta | The token meta. |

<a name="normalizeHeaderStackEntry"></a>

## normalizeHeaderStackEntry(entry) ⇒
Normalize a header stack entry to plain text or a numeric level.

**Kind**: global function\
**Returns**: The normalized header value.\

| Param | Description |
| --- | --- |
| entry | The header stack entry. |

<a name="chunkTable"></a>

## chunkTable(header, bodyRows, options) ⇒
Split table rows into chunks based on row count or token size.

**Kind**: global function\
**Returns**: Array of table chunks.\

| Param | Description |
| --- | --- |
| header | The table header row. |
| bodyRows | The table body rows. |
| options | Chunking options. |
| [options.maxRowsPerChunk] | Maximum number of rows per chunk. |
| [options.maxTokensPerChunk] | Maximum estimated tokens per chunk. |

<a name="genTreeNode"></a>

## genTreeNode([token]) ⇒
Create a node from a MarkdownIt Token.

**Kind**: global function\
**Returns**: A newly created node.\

| Param | Description |
| --- | --- |
| [token] | A token to convert. |

<a name="stripImagesFromMarkdown"></a>

## stripImagesFromMarkdown(text) ⇒
Strip images from markdown text, leaving only the text content.

**Kind**: global function\
**Returns**: The text with images removed.\

| Param | Description |
| --- | --- |
| text | The markdown text to clean. |

<a name="joinContent"></a>

## joinContent(items) ⇒
Join the content of an item into a single string.

**Kind**: global function\
**Returns**: The array of items with the content joined into a single string.\

| Param | Description |
| --- | --- |
| items | The array of itens to check. |

<a name="consolidateHeaders"></a>

## consolidateHeaders(items) ⇒
Consolidate header objects to their text content.

**Kind**: global function\
**Returns**: The array of items with consolidated text headers.\

| Param | Description |
| --- | --- |
| items | The array of itens to check. |

<a name="consolidateParagraph"></a>

## consolidateParagraph(token) ⇒
Consolidate a Token's children to plain text.

**Kind**: global function\
**Returns**: The consolidated text string.\

| Param | Description |
| --- | --- |
| token | The Token to consolidate. |

<a name="consolidateNestedItems"></a>

## consolidateNestedItems(items, options) ⇒
Flatten the tree structure for known types: bullet_list, ordered_list, table, footnote, blockquote

**Kind**: global function\
**Returns**: The array of items with flattened structures.\

| Param | Description |
| --- | --- |
| items | The array of itens to consolidate. |
| options | The options for the consolidation. |
| [options.tableToCSV] | Whether to convert the table to CSV. |
| [options.tableMaxRowsPerChunk] | The maximum number of rows per chunk for tables. |
| [options.tableMaxTokensPerChunk] | The maximum number of tokens per chunk for tables. |

<a name="removeEmptyItems"></a>

## removeEmptyItems(items) ⇒
Remove any items with no content and no children.

**Kind**: global function\
**Returns**: The array of items with empty items removed.\

| Param | Description |
| --- | --- |
| items | The array of itens to check. |

<a name="countWords"></a>

## countWords(input) ⇒
Removes curly quotes, punctuation, normalizes whitespace, lowercase, split at the space, use a loop to count word occurrences into an index object.

**Kind**: global function\
**Returns**: The word count hash.\

| Param | Description |
| --- | --- |
| input | The text input to count words in. |

<a name="longestCommonPrefix"></a>

## longestCommonPrefix(paths) ⇒
Find the longest common prefix of an array of paths.

**Kind**: global function\
**Returns**: The longest common prefix of the paths.\

| Param | Description |
| --- | --- |
| paths | The array of paths to find the longest common prefix of. |

<a name="approximateTokens"></a>

## approximateTokens(text) ⇒
Approximate the number of tokens in a string (≈ 3/4 of the word count for English text).

**Kind**: global function\
**Returns**: The approximate token count.\

| Param | Description |
| --- | --- |
| text | The text to estimate. |

<a name="splitTextToTokenBudget"></a>

## splitTextToTokenBudget(text, maxTokens) ⇒
Split a block of text into pieces that each fit within an approximate token budget.

Splits on line boundaries first (which keeps table rows and code lines intact), then falls back
to splitting an individually over-long line on word boundaries. This is used to break up sections
that are larger than the chunk cap so they can still be embedded, an un-split section can exceed
the embedding model's context window and fail to embed entirely.

**Kind**: global function\
**Returns**: The text split into token-bounded pieces.\

| Param | Description |
| --- | --- |
| text | The text to split. |
| maxTokens | The maximum approximate tokens per piece. |

<a name="consolidateSectionsByHeader"></a>

## consolidateSectionsByHeader(items, [maximumTokenCount], [softMinTokens], [minAnchorDecrease]) ⇒
Consolidate like sub-sections by their headers.

**Kind**: global function\
**Returns**: The consolidated items.\

| Param | Description |
| --- | --- |
| items | The items to consolidate. |
| [maximumTokenCount] | The maximum token count to consolidate to. |
| [softMinTokens] | If we've already packed at least this many tokens, and the next item would shrink the anchor, flush early. |
| [minAnchorDecrease] | How much the anchor must shrink (in header levels) to trigger early flush. |

<a name="markdownItAST"></a>

## markdownItAST(tokens, title, options) ⇒
Convert MarkdownIt Tokens to an AST.

**Kind**: global function\
**Returns**: The MarkdownIt tokens processed to a collection of MarkdownASTNodes.\

| Param | Description |
| --- | --- |
| tokens | Tokens to convert. |
| title | The document title used as the H1 in the header stack. |
| options | The options for the conversion. |
| [options.tableToCSV] | Whether to convert tables to CSV format. If false, converts to Markdown format instead. |
| [options.tableMaxRowsPerChunk] | The maximum number of rows per chunk for tables. |
| [options.tableMaxTokensPerChunk] | The maximum number of tokens per chunk for tables. |

## TypeScript declarations

<details>
<summary>View documented types and signatures</summary>

```typescript
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

export interface MarkdownASTNode {
    /** The type of node. */
    type: string;
    /** Text content for the node. */
    content: (string | string[])[];
    /** The relevant headers for this node. */
    headers: MarkdownASTHeaderValue[];
    /** The MarkdownIt Token object for the opening tag. */
    open?: import('markdown-it').Token | null;
    /** The MarkdownIt Token object for the closing tag. */
    close?: import('markdown-it').Token | null;
    /** The child nodes for this node. */
    children: MarkdownASTNode[];
}
export type MarkdownASTHeaderEntry = string | number | MarkdownASTNode | (string | MarkdownASTNode | number)[];
export type MarkdownASTHeaderStack = MarkdownASTHeaderEntry[];
/** A header slot before or after consolidation. */
export type MarkdownASTHeaderValue = string | number | boolean | null | undefined | MarkdownASTHeaderStack;
/** Optional footnote metadata on a MarkdownIt token. */
export interface MarkdownFootnoteMeta {
    /** Footnote label text. */
    label?: unknown;
}
```

</details>
