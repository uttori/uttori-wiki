/**
 * Render a known `[example:id]` block as a static source/result pair. The
 * browser can enhance it, but its verified result remains readable without JS.
 * Unknown IDs fail rendering so stale markers cannot ship silently.
 * @param state MarkdownIt block state.
 * @param startLine First line of the candidate block.
 * @param _endLine End of available lines.
 * @param silent Probe-only mode.
 * @returns Whether this line is a registered example marker.
 */
export declare function exampleBlock(state: import('markdown-it').StateBlock, startLine: number, _endLine: number, silent: boolean): boolean;
//# sourceMappingURL=examples.d.ts.map