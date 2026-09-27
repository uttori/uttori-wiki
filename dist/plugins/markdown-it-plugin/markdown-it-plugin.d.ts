/**
 * Extend MarkdownIt with Uttori specific items:
 * - Table of Contents with `[toc]`
 * - External Links with Domain Filters
 * - Footnote Support with `[^label]` & `[^label]: Definition`
 * - Image Lazyloading
 * - Mermaid fenced diagrams (requires Mermaid on the host page)
 * @param md The MarkdownIt instance.
 * @returns The MarkdownIt instance.
 */
declare function Plugin(md: import('markdown-it').MarkdownIt): import('markdown-it').MarkdownIt;
export default Plugin;
//# sourceMappingURL=markdown-it-plugin.d.ts.map