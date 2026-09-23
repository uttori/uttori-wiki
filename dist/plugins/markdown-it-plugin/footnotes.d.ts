/**
 * @typedef {object} MarkdownItFootnotesEnv
 * @property {number} length Next footnote id counter.
 * @property {Record<string, number>} refs Label to id mapping.
 */
export type MarkdownItFootnotesEnv = {
    /**
     * Next footnote id counter.
     */
    length: number;
    /**
     * Label to id mapping.
     */
    refs: Record<string, number>;
};
export type MarkdownItFootnotesStateEnv = {
    /**
     * Footnote definitions collected during parsing.
     */
    footnotes?: MarkdownItFootnotesEnv;
};
/**
 * Converts Footnote definitions to linkable anchor tags.
 * @param {import('markdown-it').StateBlock} state State of MarkdownIt.
 * @param {number} startLine The starting line of the block.
 * @param {number} endLine The ending line of the block.
 * @param {boolean} silent Used to validating parsing without output in MarkdownIt.
 * @returns {boolean} Returns if parsing was successful or not.
 * @see {@link https://markdown-it.github.io/markdown-it/#Ruler.before|Ruler.before}
 */
export declare function footnoteDefinition(state: import('markdown-it').StateBlock, startLine: number, endLine: number, silent: boolean): boolean;
/**
 * Converts Footnote definitions to linkable anchor tags.
 * @param {import('markdown-it').StateInline} state State of MarkdownIt.
 * @param {boolean} silent Used to validating parsing without output in MarkdownIt.
 * @returns {boolean} Returns if parsing was successful or not.
 * @see {@link https://markdown-it.github.io/markdown-it/#Ruler.after|Ruler.after}
 */
export declare function footnoteReferences(state: import('markdown-it').StateInline, silent: boolean): boolean;
/**
 * Default configuration for rendering footnote references.
 * @param {object} token The MarkdownIt Token meta object.
 * @param {number} token.id The ID of the current footnote.
 * @param {string} token.label The label of the current footnote.
 * @returns {string} The HTML markup for the current footnote reference.
 */
export declare function referenceTag({ id, label }: {
    id: number;
    label: string;
}): string;
/**
 * Default configuration for rendering footnote definitions.
 * @param {object} token The MarkdownIt Token meta object.
 * @param {number} token.id The ID of the current footnote.
 * @param {string} token.label The label of the current footnote.
 * @returns {string} The HTML markup for the current footnote definition.
 */
export declare function definitionOpenTag({ id, label }: {
    id: number;
    label: string;
}): string;
/**
 * Creates the tag for the Footnote reference.
 * @param {import('markdown-it').Token[]} tokens Collection of tokens to render.
 * @param {number} index The index of the current token in the Tokens array.
 * @param {import('markdown-it').MarkdownItOptions | { uttori: { footnotes: { referenceTag: Function } } }} options Option parameters of the parser instance.
 * @param {object} _env Additional data from parsed input (references, for example).
 * @param {import('markdown-it').Renderer} _slf The current parser instance.
 * @returns {string} The tag for the Footnote reference.
 */
export declare function configFootnoteReference(tokens: import('markdown-it').Token[], index: number, options: import('markdown-it').MarkdownItOptions | {
    uttori: {
        footnotes: {
            referenceTag: Function;
        };
    };
}, _env: object, _slf: import('markdown-it').Renderer): string;
/**
 * Creates the opening tag of the Footnote items block.
 * @param {import('markdown-it').Token[]} tokens Collection of tokens to render.
 * @param {number} index The index of the current token in the Tokens array.
 * @param {import('markdown-it').MarkdownItOptions} options Option parameters of the parser instance.
 * @param {object} _env Additional data from parsed input (references, for example).
 * @param {import('markdown-it').Renderer} _slf The current parser instance.
 * @returns {string} The opening tag of the Footnote items block.
 */
export declare function configFootnoteOpen(tokens: import('markdown-it').Token[], index: number, options: import('markdown-it').MarkdownItOptions, _env: object, _slf: import('markdown-it').Renderer): string;
/**
 * Creates the closing tag of the Footnote items block.
 * @param {import('markdown-it').Token[]} _tokens Collection of tokens to render.
 * @param {number} _index The index of the current token in the Tokens array.
 * @param {import('markdown-it').MarkdownItOptions} options Option parameters of the parser instance.
 * @param {object} _env Additional data from parsed input (references, for example).
 * @param {import('markdown-it').Renderer} _slf The current parser instance.
 * @returns {string} The closing tag of the Footnote section block.
 */
export declare function configFootnoteClose(_tokens: import('markdown-it').Token[], _index: number, options: import('markdown-it').MarkdownItOptions, _env: object, _slf: import('markdown-it').Renderer): string;
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