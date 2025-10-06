## Constants

<dl>
<dt><a href="#oneLine">oneLine</a> ⇒ <code>string</code></dt>
<dd><p>Convert newlines to spaces.</p>
</dd>
<dt><a href="#toCSV">toCSV</a> ⇒ <code>string</code></dt>
<dd><p>Takes an array of arrays and returns a <code>,</code> sparated csv file.</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#genTreeNode">genTreeNode([token])</a> ⇒ <code><a href="#MarkdownASTNode">MarkdownASTNode</a></code></dt>
<dd><p>Create a node from a MarkdownIt Token.</p>
</dd>
<dt><a href="#stripImagesFromMarkdown">stripImagesFromMarkdown(text)</a> ⇒ <code>string</code></dt>
<dd><p>Strip images from markdown text, leaving only the text content.</p>
</dd>
<dt><a href="#joinContent">joinContent(items)</a> ⇒ <code><a href="#MarkdownASTNode">Array.&lt;MarkdownASTNode&gt;</a></code></dt>
<dd><p>Consolidate header objects to their text content.</p>
</dd>
<dt><a href="#consolidateHeaders">consolidateHeaders(items)</a> ⇒ <code><a href="#MarkdownASTNode">Array.&lt;MarkdownASTNode&gt;</a></code></dt>
<dd><p>Consolidate header objects to their text content.</p>
</dd>
<dt><a href="#consolidateParagraph">consolidateParagraph(token)</a> ⇒ <code>Array.&lt;string&gt;</code></dt>
<dd><p>Consolidate a Token&#39;s children to plain text.</p>
</dd>
<dt><a href="#consolidateNestedItems">consolidateNestedItems(items)</a> ⇒ <code><a href="#MarkdownASTNode">Array.&lt;MarkdownASTNode&gt;</a></code></dt>
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
<dt><a href="#consolidateSectionsByHeader">consolidateSectionsByHeader(items, [maximumTokenCount], [softMinTokens], [minAnchorDecrease])</a> ⇒ <code>Array.&lt;object&gt;</code></dt>
<dd><p>Consolidate like sub-sections by their headers.</p>
</dd>
<dt><a href="#markdownItAST">markdownItAST(tokens, title)</a> ⇒ <code><a href="#MarkdownASTNode">Array.&lt;MarkdownASTNode&gt;</a></code></dt>
<dd><p>Convert MarkdownIt Tokens to an AST.</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#MarkdownASTNode">MarkdownASTNode</a> : <code>object</code></dt>
<dd></dd>
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
Consolidate header objects to their text content.

**Kind**: global function  
**Returns**: [<code>Array.&lt;MarkdownASTNode&gt;</code>](#MarkdownASTNode) - The array of items with consolidated text headers.  

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

<a name="consolidateNestedItems"></a>

## consolidateNestedItems(items) ⇒ [<code>Array.&lt;MarkdownASTNode&gt;</code>](#MarkdownASTNode)
Flatten the tree structure for known types: bullet_list, ordered_list, table, footnote, blockquote

**Kind**: global function  
**Returns**: [<code>Array.&lt;MarkdownASTNode&gt;</code>](#MarkdownASTNode) - The array of items with flattened structures.  

| Param | Type | Description |
| --- | --- | --- |
| items | [<code>Array.&lt;MarkdownASTNode&gt;</code>](#MarkdownASTNode) | The array of itens to consolidate. |

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

<a name="consolidateSectionsByHeader"></a>

## consolidateSectionsByHeader(items, [maximumTokenCount], [softMinTokens], [minAnchorDecrease]) ⇒ <code>Array.&lt;object&gt;</code>
Consolidate like sub-sections by their headers.

**Kind**: global function  
**Returns**: <code>Array.&lt;object&gt;</code> - The consolidated items.  

| Param | Type | Description |
| --- | --- | --- |
| items | <code>Array.&lt;Block&gt;</code> | The items to consolidate. |
| [maximumTokenCount] | <code>number</code> | The maximum token count to consolidate to. |
| [softMinTokens] | <code>number</code> | If we've already packed at least this many tokens, and the next item would shrink the anchor, flush early. |
| [minAnchorDecrease] | <code>number</code> | How much the anchor must shrink (in header levels) to trigger early flush. |


* [consolidateSectionsByHeader(items, [maximumTokenCount], [softMinTokens], [minAnchorDecrease])](#consolidateSectionsByHeader) ⇒ <code>Array.&lt;object&gt;</code>
    * [~pack](#consolidateSectionsByHeader..pack) : <code>Array.&lt;Block&gt;</code>
    * [~bySlug](#consolidateSectionsByHeader..bySlug) : <code>Map.&lt;string, Array.&lt;Block&gt;&gt;</code>

<a name="consolidateSectionsByHeader..pack"></a>

### consolidateSectionsByHeader~pack : <code>Array.&lt;Block&gt;</code>
**Kind**: inner property of [<code>consolidateSectionsByHeader</code>](#consolidateSectionsByHeader)  
<a name="consolidateSectionsByHeader..bySlug"></a>

### consolidateSectionsByHeader~bySlug : <code>Map.&lt;string, Array.&lt;Block&gt;&gt;</code>
**Kind**: inner constant of [<code>consolidateSectionsByHeader</code>](#consolidateSectionsByHeader)  
<a name="markdownItAST"></a>

## markdownItAST(tokens, title) ⇒ [<code>Array.&lt;MarkdownASTNode&gt;</code>](#MarkdownASTNode)
Convert MarkdownIt Tokens to an AST.

**Kind**: global function  
**Returns**: [<code>Array.&lt;MarkdownASTNode&gt;</code>](#MarkdownASTNode) - The MarkdownIt tokens processed to a collection of MarkdownASTNodes.  

| Param | Type | Description |
| --- | --- | --- |
| tokens | <code>Array.&lt;module:markdown-it/index.js~Token&gt;</code> | Tokens to convert. |
| title | <code>string</code> | The document title used as the H1 in the header stack. |


* [markdownItAST(tokens, title)](#markdownItAST) ⇒ [<code>Array.&lt;MarkdownASTNode&gt;</code>](#MarkdownASTNode)
    * [~headerLevel](#markdownItAST..headerLevel) : <code>number</code>
    * [~headersStack](#markdownItAST..headersStack) : <code>Array.&lt;Array.&lt;(string\|MarkdownASTNode\|number)&gt;&gt;</code>

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
| content | <code>Array.&lt;string&gt;</code> | Text content for the node. |
| headers | <code>Array.&lt;Array.&lt;(string\|MarkdownASTNode\|number)&gt;&gt;</code> | The relevant headers for this node. |
| [open] | <code>module:markdown-it/index.js~Token</code> \| <code>null</code> | The MarkdownIt Token object for the opening tag. |
| [close] | <code>module:markdown-it/index.js~Token</code> \| <code>null</code> | The MarkdownIt Token object for the closing tag. |
| children | [<code>Array.&lt;MarkdownASTNode&gt;</code>](#MarkdownASTNode) | The child nodes for this node. |

