## Constants

<dl>
<dt><a href="#oneLine">oneLine</a> ⇒ <code>string</code></dt>
<dd><p>Convert newlines to spaces.</p>
</dd>
<dt><a href="#toCSV">toCSV</a> ⇒ <code>string</code></dt>
<dd><p>Takes an array of arrays and returns a <code>,</code> sparated csv file.</p>
</dd>
<dt><a href="#toMarkdown">toMarkdown</a> ⇒ <code>string</code></dt>
<dd><p>Takes an array of arrays and returns a Markdown table.</p>
</dd>
<dt><a href="#estimateTokenCount">estimateTokenCount</a> ⇒ <code>number</code></dt>
<dd><p>Estimate token count for text using word count approximation.</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#toPlainText">toPlainText(value)</a> ⇒ <code>string</code></dt>
<dd><p>Coerce unknown markdown content into plain text.</p>
</dd>
<dt><a href="#footnoteLabelFromMeta">footnoteLabelFromMeta(meta)</a> ⇒ <code>string</code></dt>
<dd><p>Read a footnote label from a MarkdownIt token meta object.</p>
</dd>
<dt><a href="#normalizeHeaderStackEntry">normalizeHeaderStackEntry(entry)</a> ⇒ <code><a href="#MarkdownASTHeaderValue">MarkdownASTHeaderValue</a></code> | <code>null</code> | <code>undefined</code></dt>
<dd><p>Normalize a header stack entry to plain text or a numeric level.</p>
</dd>
<dt><a href="#chunkTable">chunkTable(header, bodyRows, options)</a> ⇒ <code>Array.&lt;{header: Array.&lt;string&gt;, rows: Array.&lt;Array.&lt;string&gt;&gt;, chunkIndex: number, totalChunks: number}&gt;</code></dt>
<dd><p>Split table rows into chunks based on row count or token size.</p>
</dd>
<dt><a href="#genTreeNode">genTreeNode([token])</a> ⇒ <code><a href="#MarkdownASTNode">MarkdownASTNode</a></code></dt>
<dd><p>Create a node from a MarkdownIt Token.</p>
</dd>
<dt><a href="#stripImagesFromMarkdown">stripImagesFromMarkdown(text)</a> ⇒ <code>string</code></dt>
<dd><p>Strip images from markdown text, leaving only the text content.</p>
</dd>
<dt><a href="#joinContent">joinContent(items)</a> ⇒ <code><a href="#MarkdownASTNode">Array.&lt;MarkdownASTNode&gt;</a></code></dt>
<dd><p>Join the content of an item into a single string.</p>
</dd>
<dt><a href="#consolidateHeaders">consolidateHeaders(items)</a> ⇒ <code><a href="#MarkdownASTNode">Array.&lt;MarkdownASTNode&gt;</a></code></dt>
<dd><p>Consolidate header objects to their text content.</p>
</dd>
<dt><a href="#consolidateParagraph">consolidateParagraph(token)</a> ⇒ <code>Array.&lt;string&gt;</code></dt>
<dd><p>Consolidate a Token&#39;s children to plain text.</p>
</dd>
<dt><a href="#consolidateNestedItems">consolidateNestedItems(items, options)</a> ⇒ <code><a href="#MarkdownASTNode">Array.&lt;MarkdownASTNode&gt;</a></code></dt>
<dd><p>Flatten the tree structure for known types: bullet_list, ordered_list, table, footnote, blockquote</p>
</dd>
<dt><a href="#removeEmptyItems">removeEmptyItems(items)</a> ⇒ <code><a href="#MarkdownASTNode">Array.&lt;MarkdownASTNode&gt;</a></code></dt>
<dd><p>Remove any items with no content and no children.</p>
</dd>
<dt><a href="#countWords">countWords(input)</a> ⇒ <code>Record.&lt;string, number&gt;</code></dt>
<dd><p>Removes curly quotes, punctuation, normalizes whitespace, lowercase, split at the space, use a loop to count word occurrences into an index object.</p>
</dd>
<dt><a href="#longestCommonPrefix">longestCommonPrefix(paths)</a> ⇒ <code>Array.&lt;string&gt;</code></dt>
<dd><p>Find the longest common prefix of an array of paths.</p>
</dd>
<dt><a href="#approximateTokens">approximateTokens(text)</a> ⇒ <code>number</code></dt>
<dd><p>Approximate the number of tokens in a string (≈ 3/4 of the word count for English text).</p>
</dd>
<dt><a href="#splitTextToTokenBudget">splitTextToTokenBudget(text, maxTokens)</a> ⇒ <code>Array.&lt;string&gt;</code></dt>
<dd><p>Split a block of text into pieces that each fit within an approximate token budget.</p>
<p>Splits on line boundaries first (which keeps table rows and code lines intact), then falls back
to splitting an individually over-long line on word boundaries. This is used to break up sections
that are larger than the chunk cap so they can still be embedded, an un-split section can exceed
the embedding model&#39;s context window and fail to embed entirely.</p>
</dd>
<dt><a href="#consolidateSectionsByHeader">consolidateSectionsByHeader(items, [maximumTokenCount], [softMinTokens], [minAnchorDecrease])</a> ⇒ <code>Array.&lt;Block&gt;</code></dt>
<dd><p>Consolidate like sub-sections by their headers.</p>
</dd>
<dt><a href="#markdownItAST">markdownItAST(tokens, title, options)</a> ⇒ <code><a href="#MarkdownASTNode">Array.&lt;MarkdownASTNode&gt;</a></code></dt>
<dd><p>Convert MarkdownIt Tokens to an AST.</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#MarkdownASTNode">MarkdownASTNode</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#MarkdownASTHeaderEntry">MarkdownASTHeaderEntry</a> : <code>string</code> | <code>number</code> | <code><a href="#MarkdownASTNode">MarkdownASTNode</a></code> | <code>Array.&lt;(string|MarkdownASTNode|number)&gt;</code></dt>
<dd></dd>
<dt><a href="#MarkdownASTHeaderStack">MarkdownASTHeaderStack</a> : <code><a href="#MarkdownASTHeaderEntry">Array.&lt;MarkdownASTHeaderEntry&gt;</a></code></dt>
<dd></dd>
<dt><a href="#MarkdownASTHeaderValue">MarkdownASTHeaderValue</a> : <code>string</code> | <code>number</code> | <code>boolean</code> | <code>null</code> | <code>undefined</code> | <code><a href="#MarkdownASTHeaderStack">MarkdownASTHeaderStack</a></code></dt>
<dd><p>A header slot before or after consolidation.</p>
</dd>
<dt><a href="#MarkdownFootnoteMeta">MarkdownFootnoteMeta</a> : <code>object</code></dt>
<dd><p>Optional footnote metadata on a MarkdownIt token.</p>
</dd>
</dl>

<a name="oneLine"></a>

## oneLine ⇒ <code>string</code>
Convert newlines to spaces.

**Kind**: global constant  
**Returns**: <code>string</code> - The text with newlines converted to spaces.  

| Param | Type | Description |
| --- | --- | --- |
| text | <code>string</code> | The text to convert newlines to spaces. |
| [replace] | <code>string</code> | The string to replace newlines with, defaults to a single space. |

<a name="toCSV"></a>

## toCSV ⇒ <code>string</code>
Takes an array of arrays and returns a `,` sparated csv file.

**Kind**: global constant  
**Returns**: <code>string</code> - The joined CSV row.  

| Param | Type | Description |
| --- | --- | --- |
| table | <code>Array.&lt;Array.&lt;string&gt;&gt;</code> | The array of arrays of strings to join. |
| [seperator] | <code>string</code> | The seperator to use when joining the items, defaults to `,`. |
| [newLine] | <code>string</code> | The seperator to use when joining the rows, defaults to `\n`. |
| [alwaysDoubleQuote] | <code>boolean</code> | Always double quote the cell, defaults to true. |

<a name="toMarkdown"></a>

## toMarkdown ⇒ <code>string</code>
Takes an array of arrays and returns a Markdown table.

**Kind**: global constant  
**Returns**: <code>string</code> - The Markdown table string.  

| Param | Type | Description |
| --- | --- | --- |
| table | <code>Array.&lt;Array.&lt;string&gt;&gt;</code> | The array of arrays of strings to join. |
| [newLine] | <code>string</code> | The seperator to use when joining the rows, defaults to `\n`. |

<a name="toMarkdown..formatRow"></a>

### toMarkdown~formatRow(row) ⇒ <code>string</code>
Format a row with pipes.

**Kind**: inner method of [<code>toMarkdown</code>](#toMarkdown)  
**Returns**: <code>string</code> - The formatted row.  

| Param | Type | Description |
| --- | --- | --- |
| row | <code>Array.&lt;string&gt;</code> | The row to format. |

<a name="estimateTokenCount"></a>

## estimateTokenCount ⇒ <code>number</code>
Estimate token count for text using word count approximation.

**Kind**: global constant  
**Returns**: <code>number</code> - The estimated token count.  

| Param | Type | Description |
| --- | --- | --- |
| text | <code>string</code> | The text to estimate tokens for. |

<a name="toPlainText"></a>

## toPlainText(value) ⇒ <code>string</code>
Coerce unknown markdown content into plain text.

**Kind**: global function  
**Returns**: <code>string</code> - Plain text.  

| Param | Type | Description |
| --- | --- | --- |
| value | <code>unknown</code> | The value to coerce. |

<a name="footnoteLabelFromMeta"></a>

## footnoteLabelFromMeta(meta) ⇒ <code>string</code>
Read a footnote label from a MarkdownIt token meta object.

**Kind**: global function  
**Returns**: <code>string</code> - The footnote label, if present.  

| Param | Type | Description |
| --- | --- | --- |
| meta | <code>unknown</code> | The token meta. |

<a name="normalizeHeaderStackEntry"></a>

## normalizeHeaderStackEntry(entry) ⇒ [<code>MarkdownASTHeaderValue</code>](#MarkdownASTHeaderValue) \| <code>null</code> \| <code>undefined</code>
Normalize a header stack entry to plain text or a numeric level.

**Kind**: global function  
**Returns**: [<code>MarkdownASTHeaderValue</code>](#MarkdownASTHeaderValue) \| <code>null</code> \| <code>undefined</code> - The normalized header value.  

| Param | Type | Description |
| --- | --- | --- |
| entry | [<code>MarkdownASTHeaderEntry</code>](#MarkdownASTHeaderEntry) \| <code>null</code> \| <code>undefined</code> | The header stack entry. |

<a name="chunkTable"></a>

## chunkTable(header, bodyRows, options) ⇒ <code>Array.&lt;{header: Array.&lt;string&gt;, rows: Array.&lt;Array.&lt;string&gt;&gt;, chunkIndex: number, totalChunks: number}&gt;</code>
Split table rows into chunks based on row count or token size.

**Kind**: global function  
**Returns**: <code>Array.&lt;{header: Array.&lt;string&gt;, rows: Array.&lt;Array.&lt;string&gt;&gt;, chunkIndex: number, totalChunks: number}&gt;</code> - Array of table chunks.  

| Param | Type | Description |
| --- | --- | --- |
| header | <code>Array.&lt;string&gt;</code> | The table header row. |
| bodyRows | <code>Array.&lt;Array.&lt;string&gt;&gt;</code> | The table body rows. |
| options | <code>object</code> | Chunking options. |
| [options.maxRowsPerChunk] | <code>number</code> | Maximum number of rows per chunk. |
| [options.maxTokensPerChunk] | <code>number</code> | Maximum estimated tokens per chunk. |

<a name="genTreeNode"></a>

## genTreeNode([token]) ⇒ [<code>MarkdownASTNode</code>](#MarkdownASTNode)
Create a node from a MarkdownIt Token.

**Kind**: global function  
**Returns**: [<code>MarkdownASTNode</code>](#MarkdownASTNode) - A newly created node.  

| Param | Type | Description |
| --- | --- | --- |
| [token] | <code>module:markdown-it/index.js~Token</code> | A token to convert. |

<a name="stripImagesFromMarkdown"></a>

## stripImagesFromMarkdown(text) ⇒ <code>string</code>
Strip images from markdown text, leaving only the text content.

**Kind**: global function  
**Returns**: <code>string</code> - The text with images removed.  

| Param | Type | Description |
| --- | --- | --- |
| text | <code>string</code> | The markdown text to clean. |

<a name="joinContent"></a>

## joinContent(items) ⇒ [<code>Array.&lt;MarkdownASTNode&gt;</code>](#MarkdownASTNode)
Join the content of an item into a single string.

**Kind**: global function  
**Returns**: [<code>Array.&lt;MarkdownASTNode&gt;</code>](#MarkdownASTNode) - The array of items with the content joined into a single string.  

| Param | Type | Description |
| --- | --- | --- |
| items | [<code>Array.&lt;MarkdownASTNode&gt;</code>](#MarkdownASTNode) | The array of itens to check. |

<a name="consolidateHeaders"></a>

## consolidateHeaders(items) ⇒ [<code>Array.&lt;MarkdownASTNode&gt;</code>](#MarkdownASTNode)
Consolidate header objects to their text content.

**Kind**: global function  
**Returns**: [<code>Array.&lt;MarkdownASTNode&gt;</code>](#MarkdownASTNode) - The array of items with consolidated text headers.  

| Param | Type | Description |
| --- | --- | --- |
| items | [<code>Array.&lt;MarkdownASTNode&gt;</code>](#MarkdownASTNode) | The array of itens to check. |

<a name="consolidateParagraph"></a>

## consolidateParagraph(token) ⇒ <code>Array.&lt;string&gt;</code>
Consolidate a Token's children to plain text.

**Kind**: global function  
**Returns**: <code>Array.&lt;string&gt;</code> - The consolidated text string.  

| Param | Type | Description |
| --- | --- | --- |
| token | [<code>MarkdownASTNode</code>](#MarkdownASTNode) | The Token to consolidate. |

<a name="consolidateParagraph..content"></a>

### consolidateParagraph~content : <code>Array.&lt;string&gt;</code>
**Kind**: inner constant of [<code>consolidateParagraph</code>](#consolidateParagraph)  
<a name="consolidateNestedItems"></a>

## consolidateNestedItems(items, options) ⇒ [<code>Array.&lt;MarkdownASTNode&gt;</code>](#MarkdownASTNode)
Flatten the tree structure for known types: bullet_list, ordered_list, table, footnote, blockquote

**Kind**: global function  
**Returns**: [<code>Array.&lt;MarkdownASTNode&gt;</code>](#MarkdownASTNode) - The array of items with flattened structures.  

| Param | Type | Description |
| --- | --- | --- |
| items | [<code>Array.&lt;MarkdownASTNode&gt;</code>](#MarkdownASTNode) | The array of itens to consolidate. |
| options | <code>object</code> | The options for the consolidation. |
| [options.tableToCSV] | <code>boolean</code> | Whether to convert the table to CSV. |
| [options.tableMaxRowsPerChunk] | <code>number</code> | The maximum number of rows per chunk for tables. |
| [options.tableMaxTokensPerChunk] | <code>number</code> | The maximum number of tokens per chunk for tables. |

<a name="removeEmptyItems"></a>

## removeEmptyItems(items) ⇒ [<code>Array.&lt;MarkdownASTNode&gt;</code>](#MarkdownASTNode)
Remove any items with no content and no children.

**Kind**: global function  
**Returns**: [<code>Array.&lt;MarkdownASTNode&gt;</code>](#MarkdownASTNode) - The array of items with empty items removed.  

| Param | Type | Description |
| --- | --- | --- |
| items | [<code>Array.&lt;MarkdownASTNode&gt;</code>](#MarkdownASTNode) | The array of itens to check. |

<a name="countWords"></a>

## countWords(input) ⇒ <code>Record.&lt;string, number&gt;</code>
Removes curly quotes, punctuation, normalizes whitespace, lowercase, split at the space, use a loop to count word occurrences into an index object.

**Kind**: global function  
**Returns**: <code>Record.&lt;string, number&gt;</code> - The word count hash.  

| Param | Type | Description |
| --- | --- | --- |
| input | <code>string</code> | The text input to count words in. |

<a name="longestCommonPrefix"></a>

## longestCommonPrefix(paths) ⇒ <code>Array.&lt;string&gt;</code>
Find the longest common prefix of an array of paths.

**Kind**: global function  
**Returns**: <code>Array.&lt;string&gt;</code> - The longest common prefix of the paths.  

| Param | Type | Description |
| --- | --- | --- |
| paths | <code>Array.&lt;Array.&lt;string&gt;&gt;</code> | The array of paths to find the longest common prefix of. |

<a name="approximateTokens"></a>

## approximateTokens(text) ⇒ <code>number</code>
Approximate the number of tokens in a string (≈ 3/4 of the word count for English text).

**Kind**: global function  
**Returns**: <code>number</code> - The approximate token count.  

| Param | Type | Description |
| --- | --- | --- |
| text | <code>string</code> | The text to estimate. |

<a name="splitTextToTokenBudget"></a>

## splitTextToTokenBudget(text, maxTokens) ⇒ <code>Array.&lt;string&gt;</code>
Split a block of text into pieces that each fit within an approximate token budget.

Splits on line boundaries first (which keeps table rows and code lines intact), then falls back
to splitting an individually over-long line on word boundaries. This is used to break up sections
that are larger than the chunk cap so they can still be embedded, an un-split section can exceed
the embedding model's context window and fail to embed entirely.

**Kind**: global function  
**Returns**: <code>Array.&lt;string&gt;</code> - The text split into token-bounded pieces.  

| Param | Type | Description |
| --- | --- | --- |
| text | <code>string</code> | The text to split. |
| maxTokens | <code>number</code> | The maximum approximate tokens per piece. |


* [splitTextToTokenBudget(text, maxTokens)](#splitTextToTokenBudget) ⇒ <code>Array.&lt;string&gt;</code>
    * [~current](#splitTextToTokenBudget..current) : <code>Array.&lt;string&gt;</code>
    * [~pieces](#splitTextToTokenBudget..pieces) : <code>Array.&lt;string&gt;</code>
    * [~splitLongLine(line)](#splitTextToTokenBudget..splitLongLine)
        * [~buffer](#splitTextToTokenBudget..splitLongLine..buffer) : <code>Array.&lt;string&gt;</code>

<a name="splitTextToTokenBudget..current"></a>

### splitTextToTokenBudget~current : <code>Array.&lt;string&gt;</code>
**Kind**: inner property of [<code>splitTextToTokenBudget</code>](#splitTextToTokenBudget)  
<a name="splitTextToTokenBudget..pieces"></a>

### splitTextToTokenBudget~pieces : <code>Array.&lt;string&gt;</code>
**Kind**: inner constant of [<code>splitTextToTokenBudget</code>](#splitTextToTokenBudget)  
<a name="splitTextToTokenBudget..splitLongLine"></a>

### splitTextToTokenBudget~splitLongLine(line)
**Kind**: inner method of [<code>splitTextToTokenBudget</code>](#splitTextToTokenBudget)  

| Param | Type |
| --- | --- |
| line | <code>string</code> | 

<a name="splitTextToTokenBudget..splitLongLine..buffer"></a>

#### splitLongLine~buffer : <code>Array.&lt;string&gt;</code>
**Kind**: inner property of [<code>splitLongLine</code>](#splitTextToTokenBudget..splitLongLine)  
<a name="consolidateSectionsByHeader"></a>

## consolidateSectionsByHeader(items, [maximumTokenCount], [softMinTokens], [minAnchorDecrease]) ⇒ <code>Array.&lt;Block&gt;</code>
Consolidate like sub-sections by their headers.

**Kind**: global function  
**Returns**: <code>Array.&lt;Block&gt;</code> - The consolidated items.  

| Param | Type | Description |
| --- | --- | --- |
| items | <code>Array.&lt;Block&gt;</code> | The items to consolidate. |
| [maximumTokenCount] | <code>number</code> | The maximum token count to consolidate to. |
| [softMinTokens] | <code>number</code> | If we've already packed at least this many tokens, and the next item would shrink the anchor, flush early. |
| [minAnchorDecrease] | <code>number</code> | How much the anchor must shrink (in header levels) to trigger early flush. |


* [consolidateSectionsByHeader(items, [maximumTokenCount], [softMinTokens], [minAnchorDecrease])](#consolidateSectionsByHeader) ⇒ <code>Array.&lt;Block&gt;</code>
    * [~pack](#consolidateSectionsByHeader..pack) : <code>Array.&lt;Block&gt;</code>
    * [~result](#consolidateSectionsByHeader..result) : <code>Array.&lt;Block&gt;</code>
    * [~bySlug](#consolidateSectionsByHeader..bySlug) : <code>Map.&lt;string, Array.&lt;Block&gt;&gt;</code>

<a name="consolidateSectionsByHeader..pack"></a>

### consolidateSectionsByHeader~pack : <code>Array.&lt;Block&gt;</code>
**Kind**: inner property of [<code>consolidateSectionsByHeader</code>](#consolidateSectionsByHeader)  
<a name="consolidateSectionsByHeader..result"></a>

### consolidateSectionsByHeader~result : <code>Array.&lt;Block&gt;</code>
**Kind**: inner constant of [<code>consolidateSectionsByHeader</code>](#consolidateSectionsByHeader)  
<a name="consolidateSectionsByHeader..bySlug"></a>

### consolidateSectionsByHeader~bySlug : <code>Map.&lt;string, Array.&lt;Block&gt;&gt;</code>
**Kind**: inner constant of [<code>consolidateSectionsByHeader</code>](#consolidateSectionsByHeader)  
<a name="markdownItAST"></a>

## markdownItAST(tokens, title, options) ⇒ [<code>Array.&lt;MarkdownASTNode&gt;</code>](#MarkdownASTNode)
Convert MarkdownIt Tokens to an AST.

**Kind**: global function  
**Returns**: [<code>Array.&lt;MarkdownASTNode&gt;</code>](#MarkdownASTNode) - The MarkdownIt tokens processed to a collection of MarkdownASTNodes.  

| Param | Type | Description |
| --- | --- | --- |
| tokens | <code>Array.&lt;module:markdown-it/index.js~Token&gt;</code> | Tokens to convert. |
| title | <code>string</code> | The document title used as the H1 in the header stack. |
| options | <code>object</code> | The options for the conversion. |
| [options.tableToCSV] | <code>boolean</code> | Whether to convert tables to CSV format. If false, converts to Markdown format instead. |
| [options.tableMaxRowsPerChunk] | <code>number</code> | The maximum number of rows per chunk for tables. |
| [options.tableMaxTokensPerChunk] | <code>number</code> | The maximum number of tokens per chunk for tables. |


* [markdownItAST(tokens, title, options)](#markdownItAST) ⇒ [<code>Array.&lt;MarkdownASTNode&gt;</code>](#MarkdownASTNode)
    * [~tmp](#markdownItAST..tmp) : [<code>MarkdownASTNode</code>](#MarkdownASTNode) \| <code>undefined</code>
    * [~headerLevel](#markdownItAST..headerLevel) : <code>number</code>
    * [~headersStack](#markdownItAST..headersStack) : <code>Array.&lt;Array.&lt;(string\|MarkdownASTNode\|number)&gt;&gt;</code>

<a name="markdownItAST..tmp"></a>

### markdownItAST~tmp : [<code>MarkdownASTNode</code>](#MarkdownASTNode) \| <code>undefined</code>
**Kind**: inner property of [<code>markdownItAST</code>](#markdownItAST)  
<a name="markdownItAST..headerLevel"></a>

### markdownItAST~headerLevel : <code>number</code>
**Kind**: inner property of [<code>markdownItAST</code>](#markdownItAST)  
<a name="markdownItAST..headersStack"></a>

### markdownItAST~headersStack : <code>Array.&lt;Array.&lt;(string\|MarkdownASTNode\|number)&gt;&gt;</code>
**Kind**: inner constant of [<code>markdownItAST</code>](#markdownItAST)  
<a name="MarkdownASTNode"></a>

## MarkdownASTNode : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| type | <code>string</code> | The type of node. |
| content | <code>Array.&lt;(string\|Array.&lt;string&gt;)&gt;</code> | Text content for the node. |
| headers | [<code>Array.&lt;MarkdownASTHeaderValue&gt;</code>](#MarkdownASTHeaderValue) | The relevant headers for this node. |
| [open] | <code>module:markdown-it/index.js~Token</code> \| <code>null</code> | The MarkdownIt Token object for the opening tag. |
| [close] | <code>module:markdown-it/index.js~Token</code> \| <code>null</code> | The MarkdownIt Token object for the closing tag. |
| children | [<code>Array.&lt;MarkdownASTNode&gt;</code>](#MarkdownASTNode) | The child nodes for this node. |

<a name="MarkdownASTHeaderEntry"></a>

## MarkdownASTHeaderEntry : <code>string</code> \| <code>number</code> \| [<code>MarkdownASTNode</code>](#MarkdownASTNode) \| <code>Array.&lt;(string\|MarkdownASTNode\|number)&gt;</code>
**Kind**: global typedef  
<a name="MarkdownASTHeaderStack"></a>

## MarkdownASTHeaderStack : [<code>Array.&lt;MarkdownASTHeaderEntry&gt;</code>](#MarkdownASTHeaderEntry)
**Kind**: global typedef  
<a name="MarkdownASTHeaderValue"></a>

## MarkdownASTHeaderValue : <code>string</code> \| <code>number</code> \| <code>boolean</code> \| <code>null</code> \| <code>undefined</code> \| [<code>MarkdownASTHeaderStack</code>](#MarkdownASTHeaderStack)
A header slot before or after consolidation.

**Kind**: global typedef  
<a name="MarkdownFootnoteMeta"></a>

## MarkdownFootnoteMeta : <code>object</code>
Optional footnote metadata on a MarkdownIt token.

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| [label] | <code>unknown</code> | Footnote label text. |

