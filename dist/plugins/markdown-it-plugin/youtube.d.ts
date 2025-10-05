/**
 * @typedef {object} YoutubeTagAttributes
 * @property {string} v Video ID
 * @property {string} width Iframe width attribute
 * @property {string} height Iframe height attribute
 * @property {string} title Iframe title attribute
 * @property {string} start Video start offset time in seconds
 */
/**
 * Find and replace the <youtube> tags with safe iframes.
 * @param {import('markdown-it/index.js').StateCore} state State of MarkdownIt.
 * @see {@link https://markdown-it.github.io/markdown-it/#Ruler.after|Ruler.after}
 */
export function youtube(state: import("markdown-it/index.js").StateCore): void;
declare namespace _default {
    export { youtube };
}
export default _default;
export type YoutubeTagAttributes = {
    /**
     * Video ID
     */
    v: string;
    /**
     * Iframe width attribute
     */
    width: string;
    /**
     * Iframe height attribute
     */
    height: string;
    /**
     * Iframe title attribute
     */
    title: string;
    /**
     * Video start offset time in seconds
     */
    start: string;
};
//# sourceMappingURL=youtube.d.ts.map