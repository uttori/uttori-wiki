## Functions

<dl>
<dt><a href="#escapeHtml">escapeHtml(value)</a> ⇒</dt>
<dd><p>Escape registered example data before inserting it into trusted component markup.</p>
</dd>
<dt><a href="#exampleBlock">exampleBlock(state, startLine, _endLine, silent)</a> ⇒</dt>
<dd><p>Render a known <code>[example:id]</code> block as a static source/result pair. The
browser can enhance it, but its verified result remains readable without JS.
Unknown IDs fail rendering so stale markers cannot ship silently.</p>
</dd>
</dl>

<a name="escapeHtml"></a>

## escapeHtml(value) ⇒
Escape registered example data before inserting it into trusted component markup.

**Kind**: global function\
**Returns**: HTML-escaped text.\

| Param | Description |
| --- | --- |
| value | Raw example text. |

<a name="exampleBlock"></a>

## exampleBlock(state, startLine, _endLine, silent) ⇒
Render a known `[example:id]` block as a static source/result pair. The
browser can enhance it, but its verified result remains readable without JS.
Unknown IDs fail rendering so stale markers cannot ship silently.

**Kind**: global function\
**Returns**: Whether this line is a registered example marker.\

| Param | Description |
| --- | --- |
| state | MarkdownIt block state. |
| startLine | First line of the candidate block. |
| _endLine | End of available lines. |
| silent | Probe-only mode. |

## TypeScript declarations

<details>
<summary>View documented types and signatures</summary>

```typescript
/**
 * Render a known `[example:id]` block as a static source/result pair. The
 * browser can enhance it, but its verified result remains readable without JS.
 * Unknown IDs fail rendering so stale markers cannot ship silently.
 * @param state MarkdownIt block state.
 * @param startLine First line of the candidate block.
 * @param _endLine End of available lines.
 * @param silent Probe-only mode.
 * @returns Whether this line is a registered example marker.
 */
export declare function exampleBlock(state: import('markdown-it').StateBlock, startLine: number, _endLine: number, silent: boolean): boolean;
```

</details>
