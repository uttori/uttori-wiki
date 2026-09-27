## Functions

<dl>
<dt><a href="#headingOpen">headingOpen(tokens, index, options)</a> ⇒</dt>
<dd><p>Adds deep links to the opening of the heading tags with IDs.</p>
</dd>
<dt><a href="#tocOpen">tocOpen(_tokens, _index, options)</a> ⇒</dt>
<dd><p>Creates the opening tag of the TOC.</p>
</dd>
<dt><a href="#tocClose">tocClose(_tokens, _index, options)</a> ⇒</dt>
<dd><p>Creates the closing tag of the TOC.</p>
</dd>
<dt><a href="#tocBody">tocBody(_tokens, _index, _options, env, _slf)</a> ⇒</dt>
<dd><p>Creates the contents of the TOC.</p>
</dd>
<dt><a href="#tocRule">tocRule(state)</a> ⇒</dt>
<dd><p>Find and replace the TOC tag with the TOC itself.</p>
</dd>
<dt><a href="#collectHeaders">collectHeaders(state)</a></dt>
<dd><p>Caches the headers for use in building the TOC body.</p>
</dd>
</dl>

<a name="headingOpen"></a>

## headingOpen(tokens, index, options) ⇒
Adds deep links to the opening of the heading tags with IDs.

**Kind**: global function\
**Returns**: The modified header tag with ID.\

| Param | Description |
| --- | --- |
| tokens | Collection of tokens. |
| index | The index of the current token in the Tokens array. |
| options | The options for the current MarkdownIt instance. |

<a name="tocOpen"></a>

## tocOpen(_tokens, _index, options) ⇒
Creates the opening tag of the TOC.

**Kind**: global function\
**Returns**: The opening tag of the TOC.\

| Param | Description |
| --- | --- |
| _tokens | Collection of tokens. |
| _index | The index of the current token in the Tokens array. |
| options | The options for the current MarkdownIt instance. |

<a name="tocClose"></a>

## tocClose(_tokens, _index, options) ⇒
Creates the closing tag of the TOC.

**Kind**: global function\
**Returns**: The closing tag of the TOC.\

| Param | Description |
| --- | --- |
| _tokens | Collection of tokens. |
| _index | The index of the current token in the Tokens array. |
| options | The options for the current MarkdownIt instance. |

<a name="tocBody"></a>

## tocBody(_tokens, _index, _options, env, _slf) ⇒
Creates the contents of the TOC.

**Kind**: global function\
**Returns**: The contents tag of the TOC.\

| Param | Description |
| --- | --- |
| _tokens | Collection of tokens. |
| _index | The index of the current token in the Tokens array. |
| _options | Option parameters of the parser instance. |
| env | Additional data from parsed input (the toc_headings, for example). |
| _slf | The current parser instance. |

<a name="tocRule"></a>

## tocRule(state) ⇒
Find and replace the TOC tag with the TOC itself.

**Kind**: global function\
**Returns**: Returns true when able to parse a TOC.\
**See**: [Ruler.after](https://markdown-it.github.io/markdown-it/#Ruler.after)\

| Param | Description |
| --- | --- |
| state | State of MarkdownIt. |

<a name="collectHeaders"></a>

## collectHeaders(state)
Caches the headers for use in building the TOC body.

**Kind**: global function\

| Param | Description |
| --- | --- |
| state | State of MarkdownIt. |

## TypeScript declarations

<details>
<summary>View documented types and signatures</summary>

```typescript
import type { MarkdownItTocStateEnv } from '../../types/plugins/markdown-it-plugin/toc.js';
export type { MarkdownItTocHeading, MarkdownItTocStateEnv } from '../../types/plugins/markdown-it-plugin/toc.js';
/**
 * Adds deep links to the opening of the heading tags with IDs.
 * @param tokens Collection of tokens.
 * @param index The index of the current token in the Tokens array.
 * @param options The options for the current MarkdownIt instance.
 * @returns The modified header tag with ID.
 */
export declare function headingOpen(tokens: import('markdown-it').Token[], index: number, options: import('./../renderer-markdown-it.js').MarkdownItRendererOptions): string;
/**
 * Creates the opening tag of the TOC.
 * @param _tokens Collection of tokens.
 * @param _index The index of the current token in the Tokens array.
 * @param options The options for the current MarkdownIt instance.
 * @returns The opening tag of the TOC.
 */
export declare function tocOpen(_tokens: import('markdown-it').Token[], _index: number, options: import('./../renderer-markdown-it.js').MarkdownItRendererOptions): string;
/**
 * Creates the closing tag of the TOC.
 * @param _tokens Collection of tokens.
 * @param _index The index of the current token in the Tokens array.
 * @param options The options for the current MarkdownIt instance.
 * @returns The closing tag of the TOC.
 */
export declare function tocClose(_tokens: import('markdown-it').Token[], _index: number, options: import('./../renderer-markdown-it.js').MarkdownItRendererOptions): string;
/**
 * Creates the contents of the TOC.
 * @param _tokens Collection of tokens.
 * @param _index The index of the current token in the Tokens array.
 * @param _options Option parameters of the parser instance.
 * @param env Additional data from parsed input (the toc_headings, for example).
 * @param _slf The current parser instance.
 * @returns The contents tag of the TOC.
 */
export declare function tocBody(_tokens: import('markdown-it').Token[], _index: number, _options: import('./../renderer-markdown-it.js').MarkdownItRendererOptions, env: MarkdownItTocStateEnv | undefined, _slf: import('markdown-it').Renderer): string;
/**
 * Find and replace the TOC tag with the TOC itself.
 * @param state State of MarkdownIt.
 * @returns Returns true when able to parse a TOC.
 * @see {@link https://markdown-it.github.io/markdown-it/#Ruler.after|Ruler.after}
 */
export declare function tocRule(state: import('markdown-it').StateInline): boolean;
/**
 * Caches the headers for use in building the TOC body.
 * @param state State of MarkdownIt.
 */
export declare function collectHeaders(state: import('markdown-it').StateCore): void;
declare const _default: {
    headingOpen: typeof headingOpen;
    tocOpen: typeof tocOpen;
    tocClose: typeof tocClose;
    tocBody: typeof tocBody;
    tocRule: typeof tocRule;
    collectHeaders: typeof collectHeaders;
};
export default _default;

export interface MarkdownItTocHeading {
    /** Heading text content. */
    content: string;
    /** Heading map index. */
    index: string | number;
    /** Heading level (1-6). */
    level: number;
    /** Slugified heading id prefix. */
    slug: string;
    /** The final heading ID, including duplicate suffixes in stable mode. */
    id?: string;
}
/** MarkdownIt env object extended with cached TOC headings. */
export interface MarkdownItTocStateEnv {
    /** Cached headings for the table of contents. */
    toc_headings?: MarkdownItTocHeading[];
}
```

</details>
