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
//# sourceMappingURL=youtube.d.ts.map