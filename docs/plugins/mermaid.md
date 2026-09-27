<a name="mermaid"></a>

## mermaid(md)
Render Mermaid fences as escaped source for the host page's Mermaid runtime.
Other fences retain the previously installed renderer, including syntax highlighting.
No scripts are injected and diagram syntax is deliberately left to Mermaid to validate.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| md | <code>module:markdown-it~MarkdownIt</code> | The parser whose fence renderer is wrapped. |

