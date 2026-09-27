<a name="mermaid"></a>

## mermaid(md)
Render Mermaid fences as escaped source for the host page's Mermaid runtime.
Other fences retain the previously installed renderer, including syntax highlighting.
No scripts are injected and diagram syntax is deliberately left to Mermaid to validate.

**Kind**: global function\

| Param | Description |
| --- | --- |
| md | The parser whose fence renderer is wrapped. |

## TypeScript declarations

<details>
<summary>View documented types and signatures</summary>

```typescript
/**
 * Render Mermaid fences as escaped source for the host page's Mermaid runtime.
 * Other fences retain the previously installed renderer, including syntax highlighting.
 * No scripts are injected and diagram syntax is deliberately left to Mermaid to validate.
 * @param md The parser whose fence renderer is wrapped.
 */
export declare function mermaid(md: import('markdown-it').MarkdownIt): void;
```

</details>
