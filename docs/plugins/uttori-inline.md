## Functions

<dl>
<dt><a href="#getValue">getValue(token, key)</a> ⇒ <code>*</code> | <code>undefined</code></dt>
<dd></dd>
<dt><a href="#updateValue">updateValue(token, key, value)</a></dt>
<dd></dd>
<dt><a href="#uttoriInline">uttoriInline(state)</a> ⇒ <code>boolean</code></dt>
<dd><p>Uttori specific rules for manipulating the markup.
External Domains are filtered for SEO and security.</p>
</dd>
</dl>

<a name="getValue"></a>

## getValue(token, key) ⇒ <code>\*</code> \| <code>undefined</code>
**Kind**: global function  
**Returns**: <code>\*</code> \| <code>undefined</code> - The read value or undefined.  

| Param | Type | Description |
| --- | --- | --- |
| token | <code>module:markdown-it/index.js~Token</code> | The MarkdownIt token we are reading. |
| key | <code>string</code> | The key is the attribute name, like `src` or `href`. |

<a name="updateValue"></a>

## updateValue(token, key, value)
**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| token | <code>module:markdown-it/index.js~Token</code> | The MarkdownIt token we are updating. |
| key | <code>string</code> | The key is the attribute name, like `src` or `href`. |
| value | <code>string</code> | The value we want to set to the provided key. |

<a name="uttoriInline"></a>

## uttoriInline(state) ⇒ <code>boolean</code>
Uttori specific rules for manipulating the markup.
External Domains are filtered for SEO and security.

**Kind**: global function  
**Returns**: <code>boolean</code> - Returns if parsing was successful or not.  

| Param | Type | Description |
| --- | --- | --- |
| state | <code>module:markdown-it/index.js~StateCore</code> | State of MarkdownIt. |

