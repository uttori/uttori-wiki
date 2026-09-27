/**
 * Render Mermaid fences as escaped source for the host page's Mermaid runtime.
 * Other fences retain the previously installed renderer, including syntax highlighting.
 * No scripts are injected and diagram syntax is deliberately left to Mermaid to validate.
 * @param {import('markdown-it').MarkdownIt} md The parser whose fence renderer is wrapped.
 */
export declare function mermaid(md: import('markdown-it').MarkdownIt): void;
//# sourceMappingURL=mermaid.d.ts.map