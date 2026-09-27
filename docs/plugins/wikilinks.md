<a name="wikilinks"></a>

## wikilinks(state) ⇒
Converts WikiLinks to anchor tags.

**Kind**: global function\
**Returns**: Returns true when able to parse the wikilinks.\
**See**: [Ruler.before](https://markdown-it.github.io/markdown-it/#Ruler.before)\

| Param | Description |
| --- | --- |
| state | State of MarkdownIt. |

## TypeScript declarations

<details>
<summary>View documented types and signatures</summary>

```typescript
/**
 * Converts WikiLinks to anchor tags.
 * @param state State of MarkdownIt.
 * @returns Returns true when able to parse the wikilinks.
 * @see {@link https://markdown-it.github.io/markdown-it/#Ruler.before|Ruler.before}
 */
export declare function wikilinks(state: import('markdown-it').StateInline): boolean;
declare const _default: {
    wikilinks: typeof wikilinks;
};
export default _default;
```

</details>
