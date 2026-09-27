/**
 * Render Mermaid fences as escaped source for the host page's Mermaid runtime.
 * Other fences retain the previously installed renderer, including syntax highlighting.
 * No scripts are injected and diagram syntax is deliberately left to Mermaid to validate.
 * @param {import('markdown-it').MarkdownIt} md The parser whose fence renderer is wrapped.
 */
export function mermaid(md) {
  const defaultFence = md.renderer.rules.fence;

  md.renderer.rules.fence = (tokens, index, options, env, renderer) => {
    const token = tokens[index];
    const language = token.info.trim().split(/\s+/)[0].toLowerCase();
    const { uttori } = /** @type {import('../renderer-markdown-it.js').MarkdownItRendererOptions} */ (
      /** @type {unknown} */ (options)
    );

    // Match the whole language name, allowing ordinary fence metadata after it.
    if (language !== 'mermaid' || uttori?.mermaid === false) {
      return defaultFence(tokens, index, options, env, renderer);
    }

    // Escaping is required even with html:true: diagram text must never become page markup.
    return `<pre class="mermaid">${md.utils.escapeHtml(token.content)}</pre>\n`;
  };
}
