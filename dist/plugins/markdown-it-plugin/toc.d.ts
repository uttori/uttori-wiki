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
//# sourceMappingURL=toc.d.ts.map