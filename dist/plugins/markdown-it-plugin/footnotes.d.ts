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
//# sourceMappingURL=footnotes.d.ts.map