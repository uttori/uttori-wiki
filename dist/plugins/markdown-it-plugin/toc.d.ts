/**
 * Adds deep links to the opening of the heading tags with IDs.
 * @param {import('markdown-it/index.js').Token[]} tokens Collection of tokens.
 * @param {number} index The index of the current token in the Tokens array.
 * @param {import('./../renderer-markdown-it.js').MarkdownItRendererOptions} options The options for the current MarkdownIt instance.
 * @returns {string} The modified header tag with ID.
 */
export function headingOpen(tokens: import("markdown-it/index.js").Token[], index: number, options: import("./../renderer-markdown-it.js").MarkdownItRendererOptions): string;
/**
 * Creates the opening tag of the TOC.
 * @param {import('markdown-it/index.js').Token[]} _tokens Collection of tokens.
 * @param {number} _index The index of the current token in the Tokens array.
 * @param {import('./../renderer-markdown-it.js').MarkdownItRendererOptions} options The options for the current MarkdownIt instance.
 * @returns {string} The opening tag of the TOC.
 */
export function tocOpen(_tokens: import("markdown-it/index.js").Token[], _index: number, options: import("./../renderer-markdown-it.js").MarkdownItRendererOptions): string;
/**
 * Creates the closing tag of the TOC.
 * @param {import('markdown-it/index.js').Token[]} _tokens Collection of tokens.
 * @param {number} _index The index of the current token in the Tokens array.
 * @param {import('./../renderer-markdown-it.js').MarkdownItRendererOptions} options The options for the current MarkdownIt instance.
 * @returns {string} The closing tag of the TOC.
 */
export function tocClose(_tokens: import("markdown-it/index.js").Token[], _index: number, options: import("./../renderer-markdown-it.js").MarkdownItRendererOptions): string;
/**
 * Creates the contents of the TOC.
 * @param {import('markdown-it/index.js').Token[]} _tokens Collection of tokens.
 * @param {number} _index The index of the current token in the Tokens array.
 * @param {import('./../renderer-markdown-it.js').MarkdownItRendererOptions} _options Option parameters of the parser instance.
 * @param {object} env Additional data from parsed input (the toc_headings, for example).
 * @param {import('markdown-it/index.js').Renderer} _slf The current parser instance.
 * @returns {string} The contents tag of the TOC.
 */
export function tocBody(_tokens: import("markdown-it/index.js").Token[], _index: number, _options: import("./../renderer-markdown-it.js").MarkdownItRendererOptions, env: object, _slf: import("markdown-it/index.js").Renderer): string;
/**
 * Find and replace the TOC tag with the TOC itself.
 * @param {import('markdown-it/index.js').StateInline} state State of MarkdownIt.
 * @returns {boolean} Returns true when able to parse a TOC.
 * @see {@link https://markdown-it.github.io/markdown-it/#Ruler.after|Ruler.after}
 */
export function tocRule(state: import("markdown-it/index.js").StateInline): boolean;
/**
 * Caches the headers for use in building the TOC body.
 * @param {import('markdown-it/index.js').StateCore} state State of MarkdownIt.
 */
export function collectHeaders(state: import("markdown-it/index.js").StateCore): void;
declare namespace _default {
    export { headingOpen };
    export { tocOpen };
    export { tocClose };
    export { tocBody };
    export { tocRule };
    export { collectHeaders };
}
export default _default;
//# sourceMappingURL=toc.d.ts.map