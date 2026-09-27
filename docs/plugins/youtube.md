<a name="youtube"></a>

## youtube(state)
Find and replace the <youtube> tags with safe iframes.

**Kind**: global function\
**See**: [Ruler.after](https://markdown-it.github.io/markdown-it/#Ruler.after)\

| Param | Description |
| --- | --- |
| state | State of MarkdownIt. |

## TypeScript declarations

<details>
<summary>View documented types and signatures</summary>

```typescript
export type { YoutubeTagAttributes } from '../../types/plugins/markdown-it-plugin/youtube.js';
/**
 * Find and replace the <youtube> tags with safe iframes.
 * @param state State of MarkdownIt.
 * @see {@link https://markdown-it.github.io/markdown-it/#Ruler.after|Ruler.after}
 */
export declare function youtube(state: import('markdown-it').StateCore): void;
declare const _default: {
    youtube: typeof youtube;
};
export default _default;

export interface YoutubeTagAttributes {
    /** Video ID */
    v: string;
    /** Iframe width attribute */
    width: string;
    /** Iframe height attribute */
    height: string;
    /** Iframe title attribute */
    title: string;
    /** Video start offset time in seconds */
    start: string;
}
```

</details>
