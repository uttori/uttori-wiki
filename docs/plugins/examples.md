## Functions

<dl>
<dt><a href="#escapeHtml">escapeHtml()</a></dt>
<dd><p>Escape registered example data before inserting it into trusted component markup.</p>
</dd>
<dt><a href="#exampleBlock">exampleBlock(state, startLine, _endLine, silent)</a> ⇒ <code>boolean</code></dt>
<dd><p>Render a known <code>[example:id]</code> block as a static source/result pair. The
browser can enhance it, but its verified result remains readable without JS.
Unknown IDs fail rendering so stale markers cannot ship silently.</p>
</dd>
</dl>

<a name="escapeHtml"></a>

## escapeHtml()
Escape registered example data before inserting it into trusted component markup.

**Kind**: global function  
<a name="exampleBlock"></a>

## exampleBlock(state, startLine, _endLine, silent) ⇒ <code>boolean</code>
Render a known `[example:id]` block as a static source/result pair. The
browser can enhance it, but its verified result remains readable without JS.
Unknown IDs fail rendering so stale markers cannot ship silently.

**Kind**: global function  
**Returns**: <code>boolean</code> - Whether this line is a registered example marker.  

| Param | Type | Description |
| --- | --- | --- |
| state | <code>module:markdown-it~StateBlock</code> | MarkdownIt block state. |
| startLine | <code>number</code> | First line of the candidate block. |
| _endLine | <code>number</code> | End of available lines. |
| silent | <code>boolean</code> | Probe-only mode. |

