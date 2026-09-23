/** Escape registered example data before inserting it into trusted component markup. */
const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', '\'': '&#39;',
})[character]);

/**
 * Render a known `[example:id]` block as a static source/result pair. The
 * browser can enhance it, but its verified result remains readable without JS.
 * Unknown IDs fail rendering so stale markers cannot ship silently.
 * @param {import('markdown-it').StateBlock} state MarkdownIt block state.
 * @param {number} startLine First line of the candidate block.
 * @param {number} _endLine End of available lines.
 * @param {boolean} silent Probe-only mode.
 * @returns {boolean} Whether this line is a registered example marker.
 */
export function exampleBlock(state, startLine, _endLine, silent) {
  const start = state.bMarks[startLine] + state.tShift[startLine];
  const end = state.eMarks[startLine];
  const marker = /^\[example:([a-z0-9-]+)]$/.exec(state.src.slice(start, end).trim());
  if (!marker) return false;
  const example = state.md.options.uttori?.examples?.[marker[1]];
  if (!example) throw new Error(`Unknown Markdown example ID: ${marker[1]}`);
  if (silent) return true;
  if (typeof example.source !== 'string' || typeof example.expectedOutput !== 'string') {
    throw new Error(`Markdown example ${marker[1]} needs source and expectedOutput strings.`);
  }

  const id = escapeHtml(marker[1]);
  const source = escapeHtml(example.source);
  const expected = escapeHtml(example.expectedOutput);
  const inputLabel = escapeHtml(example.inputLabel ?? 'Input');
  const outputLabel = escapeHtml(example.outputLabel ?? 'Output');
  const token = state.push('html_block', '', 0);
  token.content = `<section class="uttori-example" data-example-id="${id}">
<div class="uttori-example-input"><label for="example-${id}">${inputLabel}</label><textarea id="example-${id}" spellcheck="false">${source}</textarea></div>
<div class="uttori-example-output"><strong>${outputLabel}</strong><output>${expected}</output><p class="uttori-example-status" role="status">Expected output</p></div>
<div class="uttori-example-controls"><button type="button" data-example-run>Run</button><button type="button" data-example-reset>Reset</button><button type="button" data-example-copy disabled>Copy output</button></div>
</section>\n`;
  state.line = startLine + 1;
  return true;
}
