/**
 * Converts WikiLinks to anchor tags.
 * @param {import('markdown-it/index.js').StateInline} state State of MarkdownIt.
 * @returns {boolean} Returns true when able to parse the wikilinks.
 * @see {@link https://markdown-it.github.io/markdown-it/#Ruler.before|Ruler.before}
 */
export function wikilinks(state: import("markdown-it/index.js").StateInline): boolean;
declare namespace _default {
    export { wikilinks };
}
export default _default;
//# sourceMappingURL=wikilinks.d.ts.map