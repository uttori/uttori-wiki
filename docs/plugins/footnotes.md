## Functions

<dl>
<dt><a href="#getFootnotesEnv">getFootnotesEnv(state)</a> ⇒ <code><a href="#MarkdownItFootnotesEnv">MarkdownItFootnotesEnv</a></code></dt>
<dd><p>Ensure footnotes state exists on the MarkdownIt env object.</p>
</dd>
<dt><a href="#footnoteDefinition">footnoteDefinition(state, startLine, endLine, silent)</a> ⇒ <code>boolean</code></dt>
<dd><p>Converts Footnote definitions to linkable anchor tags.</p>
</dd>
<dt><a href="#footnoteReferences">footnoteReferences(state, silent)</a> ⇒ <code>boolean</code></dt>
<dd><p>Converts Footnote definitions to linkable anchor tags.</p>
</dd>
<dt><a href="#referenceTag">referenceTag(token)</a> ⇒ <code>string</code></dt>
<dd><p>Default configuration for rendering footnote references.</p>
</dd>
<dt><a href="#definitionOpenTag">definitionOpenTag(token)</a> ⇒ <code>string</code></dt>
<dd><p>Default configuration for rendering footnote definitions.</p>
</dd>
<dt><a href="#configFootnoteReference">configFootnoteReference(tokens, index, options, _env, _slf)</a> ⇒ <code>string</code></dt>
<dd><p>Creates the tag for the Footnote reference.</p>
</dd>
<dt><a href="#configFootnoteOpen">configFootnoteOpen(tokens, index, options, _env, _slf)</a> ⇒ <code>string</code></dt>
<dd><p>Creates the opening tag of the Footnote items block.</p>
</dd>
<dt><a href="#configFootnoteClose">configFootnoteClose(_tokens, _index, options, _env, _slf)</a> ⇒ <code>string</code></dt>
<dd><p>Creates the closing tag of the Footnote items block.</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#MarkdownItFootnotesEnv">MarkdownItFootnotesEnv</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#MarkdownItFootnotesStateEnv">MarkdownItFootnotesStateEnv</a> : <code>object</code></dt>
<dd><p>MarkdownIt env object extended with footnote state.</p>
</dd>
</dl>

<a name="getFootnotesEnv"></a>

## getFootnotesEnv(state) ⇒ [<code>MarkdownItFootnotesEnv</code>](#MarkdownItFootnotesEnv)
Ensure footnotes state exists on the MarkdownIt env object.

**Kind**: global function  
**Returns**: [<code>MarkdownItFootnotesEnv</code>](#MarkdownItFootnotesEnv) - Footnotes env state.  

| Param | Type | Description |
| --- | --- | --- |
| state | <code>module:markdown-it/index.js~StateBlock</code> \| <code>module:markdown-it/index.js~StateInline</code> | MarkdownIt state. |

<a name="getFootnotesEnv..env"></a>

### getFootnotesEnv~env : [<code>MarkdownItFootnotesStateEnv</code>](#MarkdownItFootnotesStateEnv)
**Kind**: inner constant of [<code>getFootnotesEnv</code>](#getFootnotesEnv)  
<a name="footnoteDefinition"></a>

## footnoteDefinition(state, startLine, endLine, silent) ⇒ <code>boolean</code>
Converts Footnote definitions to linkable anchor tags.

**Kind**: global function  
**Returns**: <code>boolean</code> - Returns if parsing was successful or not.  
**See**: [Ruler.before](https://markdown-it.github.io/markdown-it/#Ruler.before)  

| Param | Type | Description |
| --- | --- | --- |
| state | <code>module:markdown-it/index.js~StateBlock</code> | State of MarkdownIt. |
| startLine | <code>number</code> | The starting line of the block. |
| endLine | <code>number</code> | The ending line of the block. |
| silent | <code>boolean</code> | Used to validating parsing without output in MarkdownIt. |

<a name="footnoteDefinition..pos"></a>

### footnoteDefinition~pos : <code>number</code>
**Kind**: inner property of [<code>footnoteDefinition</code>](#footnoteDefinition)  
<a name="footnoteReferences"></a>

## footnoteReferences(state, silent) ⇒ <code>boolean</code>
Converts Footnote definitions to linkable anchor tags.

**Kind**: global function  
**Returns**: <code>boolean</code> - Returns if parsing was successful or not.  
**See**: [Ruler.after](https://markdown-it.github.io/markdown-it/#Ruler.after)  

| Param | Type | Description |
| --- | --- | --- |
| state | <code>module:markdown-it/index.js~StateInline</code> | State of MarkdownIt. |
| silent | <code>boolean</code> | Used to validating parsing without output in MarkdownIt. |


* [footnoteReferences(state, silent)](#footnoteReferences) ⇒ <code>boolean</code>
    * [~pos](#footnoteReferences..pos) : <code>number</code>
    * [~env](#footnoteReferences..env) : [<code>MarkdownItFootnotesStateEnv</code>](#MarkdownItFootnotesStateEnv)

<a name="footnoteReferences..pos"></a>

### footnoteReferences~pos : <code>number</code>
**Kind**: inner property of [<code>footnoteReferences</code>](#footnoteReferences)  
<a name="footnoteReferences..env"></a>

### footnoteReferences~env : [<code>MarkdownItFootnotesStateEnv</code>](#MarkdownItFootnotesStateEnv)
**Kind**: inner constant of [<code>footnoteReferences</code>](#footnoteReferences)  
<a name="referenceTag"></a>

## referenceTag(token) ⇒ <code>string</code>
Default configuration for rendering footnote references.

**Kind**: global function  
**Returns**: <code>string</code> - The HTML markup for the current footnote reference.  

| Param | Type | Description |
| --- | --- | --- |
| token | <code>object</code> | The MarkdownIt Token meta object. |
| token.id | <code>number</code> | The ID of the current footnote. |
| token.label | <code>string</code> | The label of the current footnote. |

<a name="definitionOpenTag"></a>

## definitionOpenTag(token) ⇒ <code>string</code>
Default configuration for rendering footnote definitions.

**Kind**: global function  
**Returns**: <code>string</code> - The HTML markup for the current footnote definition.  

| Param | Type | Description |
| --- | --- | --- |
| token | <code>object</code> | The MarkdownIt Token meta object. |
| token.id | <code>number</code> | The ID of the current footnote. |
| token.label | <code>string</code> | The label of the current footnote. |

<a name="configFootnoteReference"></a>

## configFootnoteReference(tokens, index, options, _env, _slf) ⇒ <code>string</code>
Creates the tag for the Footnote reference.

**Kind**: global function  
**Returns**: <code>string</code> - The tag for the Footnote reference.  

| Param | Type | Description |
| --- | --- | --- |
| tokens | <code>Array.&lt;module:markdown-it/index.js~Token&gt;</code> | Collection of tokens to render. |
| index | <code>number</code> | The index of the current token in the Tokens array. |
| options | <code>module:markdown-it/index.js~Options</code> \| <code>Object</code> | Option parameters of the parser instance. |
| _env | <code>object</code> | Additional data from parsed input (references, for example). |
| _slf | <code>module:markdown-it/index.js~Renderer</code> | The current parser instance. |

<a name="configFootnoteReference..opts"></a>

### configFootnoteReference~opts : <code>module:markdown-it/index.js~Options</code> \| <code>Object</code>
**Kind**: inner constant of [<code>configFootnoteReference</code>](#configFootnoteReference)  
<a name="configFootnoteOpen"></a>

## configFootnoteOpen(tokens, index, options, _env, _slf) ⇒ <code>string</code>
Creates the opening tag of the Footnote items block.

**Kind**: global function  
**Returns**: <code>string</code> - The opening tag of the Footnote items block.  

| Param | Type | Description |
| --- | --- | --- |
| tokens | <code>Array.&lt;module:markdown-it/index.js~Token&gt;</code> | Collection of tokens to render. |
| index | <code>number</code> | The index of the current token in the Tokens array. |
| options | <code>module:markdown-it/index.js~Options</code> | Option parameters of the parser instance. |
| _env | <code>object</code> | Additional data from parsed input (references, for example). |
| _slf | <code>module:markdown-it/index.js~Renderer</code> | The current parser instance. |

<a name="configFootnoteOpen..opts"></a>

### configFootnoteOpen~opts : <code>module:markdown-it/index.js~Options</code> \| <code>Object</code>
**Kind**: inner constant of [<code>configFootnoteOpen</code>](#configFootnoteOpen)  
<a name="configFootnoteClose"></a>

## configFootnoteClose(_tokens, _index, options, _env, _slf) ⇒ <code>string</code>
Creates the closing tag of the Footnote items block.

**Kind**: global function  
**Returns**: <code>string</code> - The closing tag of the Footnote section block.  

| Param | Type | Description |
| --- | --- | --- |
| _tokens | <code>Array.&lt;module:markdown-it/index.js~Token&gt;</code> | Collection of tokens to render. |
| _index | <code>number</code> | The index of the current token in the Tokens array. |
| options | <code>module:markdown-it/index.js~Options</code> | Option parameters of the parser instance. |
| _env | <code>object</code> | Additional data from parsed input (references, for example). |
| _slf | <code>module:markdown-it/index.js~Renderer</code> | The current parser instance. |

<a name="configFootnoteClose..opts"></a>

### configFootnoteClose~opts : <code>module:markdown-it/index.js~Options</code> \| <code>Object</code>
**Kind**: inner constant of [<code>configFootnoteClose</code>](#configFootnoteClose)  
<a name="MarkdownItFootnotesEnv"></a>

## MarkdownItFootnotesEnv : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| length | <code>number</code> | Next footnote id counter. |
| refs | <code>Record.&lt;string, number&gt;</code> | Label to id mapping. |

<a name="MarkdownItFootnotesStateEnv"></a>

## MarkdownItFootnotesStateEnv : <code>object</code>
MarkdownIt env object extended with footnote state.

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| [footnotes] | [<code>MarkdownItFootnotesEnv</code>](#MarkdownItFootnotesEnv) | Footnote definitions collected during parsing. |

