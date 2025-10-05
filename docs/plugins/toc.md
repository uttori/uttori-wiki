## Functions

<dl>
<dt><a href="#headingOpen">headingOpen(tokens, index, options)</a> ⇒ <code>string</code></dt>
<dd><p>Adds deep links to the opening of the heading tags with IDs.</p>
</dd>
<dt><a href="#tocOpen">tocOpen(_tokens, _index, options)</a> ⇒ <code>string</code></dt>
<dd><p>Creates the opening tag of the TOC.</p>
</dd>
<dt><a href="#tocClose">tocClose(_tokens, _index, options)</a> ⇒ <code>string</code></dt>
<dd><p>Creates the closing tag of the TOC.</p>
</dd>
<dt><a href="#tocBody">tocBody(_tokens, _index, _options, env, _slf)</a> ⇒ <code>string</code></dt>
<dd><p>Creates the contents of the TOC.</p>
</dd>
<dt><a href="#tocRule">tocRule(state)</a> ⇒ <code>boolean</code></dt>
<dd><p>Find and replace the TOC tag with the TOC itself.</p>
</dd>
<dt><a href="#collectHeaders">collectHeaders(state)</a></dt>
<dd><p>Caches the headers for use in building the TOC body.</p>
</dd>
</dl>

<a name="headingOpen"></a>

## headingOpen(tokens, index, options) ⇒ <code>string</code>
Adds deep links to the opening of the heading tags with IDs.

**Kind**: global function  
**Returns**: <code>string</code> - The modified header tag with ID.  

| Param | Type | Description |
| --- | --- | --- |
| tokens | <code>Array.&lt;module:markdown-it/index.js~Token&gt;</code> | Collection of tokens. |
| index | <code>number</code> | The index of the current token in the Tokens array. |
| options | <code>MarkdownItRendererOptions</code> | The options for the current MarkdownIt instance. |

<a name="tocOpen"></a>

## tocOpen(_tokens, _index, options) ⇒ <code>string</code>
Creates the opening tag of the TOC.

**Kind**: global function  
**Returns**: <code>string</code> - The opening tag of the TOC.  

| Param | Type | Description |
| --- | --- | --- |
| _tokens | <code>Array.&lt;module:markdown-it/index.js~Token&gt;</code> | Collection of tokens. |
| _index | <code>number</code> | The index of the current token in the Tokens array. |
| options | <code>MarkdownItRendererOptions</code> | The options for the current MarkdownIt instance. |

<a name="tocClose"></a>

## tocClose(_tokens, _index, options) ⇒ <code>string</code>
Creates the closing tag of the TOC.

**Kind**: global function  
**Returns**: <code>string</code> - The closing tag of the TOC.  

| Param | Type | Description |
| --- | --- | --- |
| _tokens | <code>Array.&lt;module:markdown-it/index.js~Token&gt;</code> | Collection of tokens. |
| _index | <code>number</code> | The index of the current token in the Tokens array. |
| options | <code>MarkdownItRendererOptions</code> | The options for the current MarkdownIt instance. |

<a name="tocBody"></a>

## tocBody(_tokens, _index, _options, env, _slf) ⇒ <code>string</code>
Creates the contents of the TOC.

**Kind**: global function  
**Returns**: <code>string</code> - The contents tag of the TOC.  

| Param | Type | Description |
| --- | --- | --- |
| _tokens | <code>Array.&lt;module:markdown-it/index.js~Token&gt;</code> | Collection of tokens. |
| _index | <code>number</code> | The index of the current token in the Tokens array. |
| _options | <code>MarkdownItRendererOptions</code> | Option parameters of the parser instance. |
| env | <code>object</code> | Additional data from parsed input (the toc_headings, for example). |
| _slf | <code>module:markdown-it/index.js~Renderer</code> | The current parser instance. |

<a name="tocRule"></a>

## tocRule(state) ⇒ <code>boolean</code>
Find and replace the TOC tag with the TOC itself.

**Kind**: global function  
**Returns**: <code>boolean</code> - Returns true when able to parse a TOC.  
**See**: [Ruler.after](https://markdown-it.github.io/markdown-it/#Ruler.after)  

| Param | Type | Description |
| --- | --- | --- |
| state | <code>module:markdown-it/index.js~StateInline</code> | State of MarkdownIt. |

<a name="collectHeaders"></a>

## collectHeaders(state)
Caches the headers for use in building the TOC body.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| state | <code>module:markdown-it/index.js~StateCore</code> | State of MarkdownIt. |

