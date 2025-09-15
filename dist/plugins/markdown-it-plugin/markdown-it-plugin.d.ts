export default Plugin;
/**
 * Extend MarkdownIt with Uttori specific items:
 * - Table of Contents with `[toc]`
 * - External Links with Domain Filters
 * - Footnote Support with `[^label]` & `[^label]: Definition`
 * - Image Lazyloading
 * @param {MarkdownIt} md The MarkdownIt instance.
 * @returns {object} The instance of Plugin.
 */
declare function Plugin(md: MarkdownIt): object;
import MarkdownIt from 'markdown-it';
//# sourceMappingURL=markdown-it-plugin.d.ts.map