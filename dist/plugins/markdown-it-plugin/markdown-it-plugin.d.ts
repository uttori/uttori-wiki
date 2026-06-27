export default Plugin;
/**
 * Extend MarkdownIt with Uttori specific items:
 * - Table of Contents with `[toc]`
 * - External Links with Domain Filters
 * - Footnote Support with `[^label]` & `[^label]: Definition`
 * - Image Lazyloading
 * @param {import('markdown-it').default} md The MarkdownIt instance.
 * @returns {import('markdown-it').default} The MarkdownIt instance.
 */
declare function Plugin(md: import("markdown-it").default): import("markdown-it").default;
//# sourceMappingURL=markdown-it-plugin.d.ts.map