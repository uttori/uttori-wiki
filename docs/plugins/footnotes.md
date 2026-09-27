## Functions

<dl>
<dt><a href="#getFootnotesEnv">getFootnotesEnv(state)</a> ⇒</dt>
<dd><p>Ensure footnotes state exists on the MarkdownIt env object.</p>
</dd>
<dt><a href="#footnoteDefinition">footnoteDefinition(state, startLine, endLine, silent)</a> ⇒</dt>
<dd><p>Converts Footnote definitions to linkable anchor tags.</p>
</dd>
<dt><a href="#footnoteReferences">footnoteReferences(state, silent)</a> ⇒</dt>
<dd><p>Converts Footnote definitions to linkable anchor tags.</p>
</dd>
<dt><a href="#referenceTag">referenceTag(token)</a> ⇒</dt>
<dd><p>Default configuration for rendering footnote references.</p>
</dd>
<dt><a href="#definitionOpenTag">definitionOpenTag(token)</a> ⇒</dt>
<dd><p>Default configuration for rendering footnote definitions.</p>
</dd>
<dt><a href="#configFootnoteReference">configFootnoteReference(tokens, index, options, _env, _slf)</a> ⇒</dt>
<dd><p>Creates the tag for the Footnote reference.</p>
</dd>
<dt><a href="#configFootnoteOpen">configFootnoteOpen(tokens, index, options, _env, _slf)</a> ⇒</dt>
<dd><p>Creates the opening tag of the Footnote items block.</p>
</dd>
<dt><a href="#configFootnoteClose">configFootnoteClose(_tokens, _index, options, _env, _slf)</a> ⇒</dt>
<dd><p>Creates the closing tag of the Footnote items block.</p>
</dd>
</dl>

<a name="getFootnotesEnv"></a>

## getFootnotesEnv(state) ⇒
Ensure footnotes state exists on the MarkdownIt env object.

**Kind**: global function\
**Returns**: Footnotes env state.\

| Param | Description |
| --- | --- |
| state | MarkdownIt state. |

<a name="footnoteDefinition"></a>

## footnoteDefinition(state, startLine, endLine, silent) ⇒
Converts Footnote definitions to linkable anchor tags.

**Kind**: global function\
**Returns**: Returns if parsing was successful or not.\
**See**: [Ruler.before](https://markdown-it.github.io/markdown-it/#Ruler.before)\

| Param | Description |
| --- | --- |
| state | State of MarkdownIt. |
| startLine | The starting line of the block. |
| endLine | The ending line of the block. |
| silent | Used to validating parsing without output in MarkdownIt. |

<a name="footnoteReferences"></a>

## footnoteReferences(state, silent) ⇒
Converts Footnote definitions to linkable anchor tags.

**Kind**: global function\
**Returns**: Returns if parsing was successful or not.\
**See**: [Ruler.after](https://markdown-it.github.io/markdown-it/#Ruler.after)\

| Param | Description |
| --- | --- |
| state | State of MarkdownIt. |
| silent | Used to validating parsing without output in MarkdownIt. |

<a name="referenceTag"></a>

## referenceTag(token) ⇒
Default configuration for rendering footnote references.

**Kind**: global function\
**Returns**: The HTML markup for the current footnote reference.\

| Param | Description |
| --- | --- |
| token | The MarkdownIt Token meta object. |
| token.id | The ID of the current footnote. |
| token.label | The label of the current footnote. |

<a name="definitionOpenTag"></a>

## definitionOpenTag(token) ⇒
Default configuration for rendering footnote definitions.

**Kind**: global function\
**Returns**: The HTML markup for the current footnote definition.\

| Param | Description |
| --- | --- |
| token | The MarkdownIt Token meta object. |
| token.id | The ID of the current footnote. |
| token.label | The label of the current footnote. |

<a name="configFootnoteReference"></a>

## configFootnoteReference(tokens, index, options, _env, _slf) ⇒
Creates the tag for the Footnote reference.

**Kind**: global function\
**Returns**: The tag for the Footnote reference.\

| Param | Description |
| --- | --- |
| tokens | Collection of tokens to render. |
| index | The index of the current token in the Tokens array. |
| options | Option parameters of the parser instance. |
| _env | Additional data from parsed input (references, for example). |
| _slf | The current parser instance. |

<a name="configFootnoteOpen"></a>

## configFootnoteOpen(tokens, index, options, _env, _slf) ⇒
Creates the opening tag of the Footnote items block.

**Kind**: global function\
**Returns**: The opening tag of the Footnote items block.\

| Param | Description |
| --- | --- |
| tokens | Collection of tokens to render. |
| index | The index of the current token in the Tokens array. |
| options | Option parameters of the parser instance. |
| _env | Additional data from parsed input (references, for example). |
| _slf | The current parser instance. |

<a name="configFootnoteClose"></a>

## configFootnoteClose(_tokens, _index, options, _env, _slf) ⇒
Creates the closing tag of the Footnote items block.

**Kind**: global function\
**Returns**: The closing tag of the Footnote section block.\

| Param | Description |
| --- | --- |
| _tokens | Collection of tokens to render. |
| _index | The index of the current token in the Tokens array. |
| options | Option parameters of the parser instance. |
| _env | Additional data from parsed input (references, for example). |
| _slf | The current parser instance. |

## TypeScript declarations

<details>
<summary>View documented types and signatures</summary>

```typescript
export type { MarkdownItFootnotesEnv, MarkdownItFootnotesStateEnv, } from '../../types/plugins/markdown-it-plugin/footnotes.js';
/**
 * Converts Footnote definitions to linkable anchor tags.
 * @param state State of MarkdownIt.
 * @param startLine The starting line of the block.
 * @param endLine The ending line of the block.
 * @param silent Used to validating parsing without output in MarkdownIt.
 * @returns Returns if parsing was successful or not.
 * @see {@link https://markdown-it.github.io/markdown-it/#Ruler.before|Ruler.before}
 */
export declare function footnoteDefinition(state: import('markdown-it').StateBlock, startLine: number, endLine: number, silent: boolean): boolean;
/**
 * Converts Footnote definitions to linkable anchor tags.
 * @param state State of MarkdownIt.
 * @param silent Used to validating parsing without output in MarkdownIt.
 * @returns Returns if parsing was successful or not.
 * @see {@link https://markdown-it.github.io/markdown-it/#Ruler.after|Ruler.after}
 */
export declare function footnoteReferences(state: import('markdown-it').StateInline, silent: boolean): boolean;
/**
 * Default configuration for rendering footnote references.
 * @param token The MarkdownIt Token meta object.
 * @param token.id The ID of the current footnote.
 * @param token.label The label of the current footnote.
 * @returns The HTML markup for the current footnote reference.
 */
export declare function referenceTag({ id, label }: {
    id: number;
    label: string;
}): string;
/**
 * Default configuration for rendering footnote definitions.
 * @param token The MarkdownIt Token meta object.
 * @param token.id The ID of the current footnote.
 * @param token.label The label of the current footnote.
 * @returns The HTML markup for the current footnote definition.
 */
export declare function definitionOpenTag({ id, label }: {
    id: number;
    label: string;
}): string;
/**
 * Creates the tag for the Footnote reference.
 * @param tokens Collection of tokens to render.
 * @param index The index of the current token in the Tokens array.
 * @param options Option parameters of the parser instance.
 * @param _env Additional data from parsed input (references, for example).
 * @param _slf The current parser instance.
 * @returns The tag for the Footnote reference.
 */
export declare function configFootnoteReference(tokens: import('markdown-it').Token[], index: number, options: Partial<import('../renderer-markdown-it.js').MarkdownItRendererOptions>, _env: object | undefined, _slf: import('markdown-it').Renderer): string;
/**
 * Creates the opening tag of the Footnote items block.
 * @param tokens Collection of tokens to render.
 * @param index The index of the current token in the Tokens array.
 * @param options Option parameters of the parser instance.
 * @param _env Additional data from parsed input (references, for example).
 * @param _slf The current parser instance.
 * @returns The opening tag of the Footnote items block.
 */
export declare function configFootnoteOpen(tokens: import('markdown-it').Token[], index: number, options: Partial<import('../renderer-markdown-it.js').MarkdownItRendererOptions>, _env: object | undefined, _slf: import('markdown-it').Renderer): string;
/**
 * Creates the closing tag of the Footnote items block.
 * @param _tokens Collection of tokens to render.
 * @param _index The index of the current token in the Tokens array.
 * @param options Option parameters of the parser instance.
 * @param _env Additional data from parsed input (references, for example).
 * @param _slf The current parser instance.
 * @returns The closing tag of the Footnote section block.
 */
export declare function configFootnoteClose(_tokens: import('markdown-it').Token[], _index: number, options: Partial<import('../renderer-markdown-it.js').MarkdownItRendererOptions>, _env: object | undefined, _slf: import('markdown-it').Renderer): string;
declare const _default: {
    footnoteDefinition: typeof footnoteDefinition;
    footnoteReferences: typeof footnoteReferences;
    referenceTag: typeof referenceTag;
    definitionOpenTag: typeof definitionOpenTag;
    configFootnoteReference: typeof configFootnoteReference;
    configFootnoteOpen: typeof configFootnoteOpen;
    configFootnoteClose: typeof configFootnoteClose;
};
export default _default;

export interface MarkdownItFootnotesEnv {
    /** Next footnote id counter. */
    length: number;
    /** Label to id mapping. */
    refs: Record<string, number>;
}
/** MarkdownIt env object extended with footnote state. */
export interface MarkdownItFootnotesStateEnv {
    /** Footnote definitions collected during parsing. */
    footnotes?: MarkdownItFootnotesEnv;
}
```

</details>
