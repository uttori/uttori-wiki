/**
 * Converts Footnote definitions to linkable anchor tags.
 * @param {import('markdown-it/index.js').StateBlock} state State of MarkdownIt.
 * @param {number} startLine The starting line of the block.
 * @param {number} endLine The ending line of the block.
 * @param {boolean} silent Used to validating parsing without output in MarkdownIt.
 * @returns {boolean} Returns if parsing was successful or not.
 * @see {@link https://markdown-it.github.io/markdown-it/#Ruler.before|Ruler.before}
 */
export function footnoteDefinition(state, startLine, endLine, silent) {
  const start = state.bMarks[startLine] + state.tShift[startLine];
  const max = state.eMarks[startLine];

  // Validate that we have a footnote, it should match: `[^n]:`
  // Is it too short?
  if (start + 4 > max) return false;
  // Does it start with the opening bracket: `[`
  if (state.src.charCodeAt(start) !== 0x5B) return false;
  // Is the second character a carrot: `^`
  if (state.src.charCodeAt(start + 1) !== 0x5E) return false;
  // Do we have content that isn't a space?
  // Stop when we reach the end bracket: `]`
  let pos;
  for (pos = start + 2; pos < max; pos++) {
    if (state.src.charCodeAt(pos) === 0x20) return false;
    if (state.src.charCodeAt(pos) === 0x5D) break;
  }

  // It is invalid if it has no label.
  if (pos === start + 2) return false;
  // Does it have the trailing colon?
  if (pos + 1 >= max || state.src.charCodeAt(++pos) !== 0x3A) return false;

  // We have a valid token.
  /* c8 ignore next */
  if (silent) return true;
  pos++;

  // Setup the footnotes collection if we haven't.
  if (!state.env.footnotes) { state.env.footnotes = { length: 0, refs: {} }; }

  // Setup the token based on the label.
  const label = state.src.slice(start + 2, pos - 2);
  const id = state.env.footnotes.length++;
  state.env.footnotes.refs[`:${label}`] = id;

  // Build the actual token.
  let token = new state.Token('footnote_open', '', 1);
  token.meta = { id, label };
  token.level = state.level++;
  state.tokens.push(token);

  // Process the definition as Markdown content.
  // Store the old line begin offets.
  const oldBMark = state.bMarks[startLine];
  // Store the old offsets of the first non-space character (tabs not expanded).
  const oldTShift = state.tShift[startLine];
  // Store the old indents for each line.
  const oldSCount = state.sCount[startLine];
  // Store the original parent type.
  const oldParentType = state.parentType;

  // Start after the colon.
  const posAfterColon = pos;
  let offset = state.sCount[startLine] + pos - (state.bMarks[startLine] + state.tShift[startLine]);
  const initial = offset;

  // Find the start of the non-whitespace content.
  while (pos < max) {
    const ch = state.src.charCodeAt(pos);
    if (ch === 0x20 || ch === 0x09) {
      if (ch === 0x09) {
        offset += 4 - (offset % 4);
      } else {
        offset++;
      }
    } else {
      break;
    }

    pos++;
  }

  // Setup the state for processing content inside the footnote definition.
  state.tShift[startLine] = pos - posAfterColon;
  state.sCount[startLine] = offset - initial;
  state.bMarks[startLine] = posAfterColon;
  state.blkIndent += 4;
  state.parentType = 'root';

  // Ensure the block indentation is maintained for the footnote content.
  if (state.sCount[startLine] < state.blkIndent) {
    state.sCount[startLine] += state.blkIndent;
  }

  // Process the internal content.
  state.md.block.tokenize(state, startLine, endLine);

  // Reset the state back to where it was before we needed to process content.
  state.parentType = oldParentType;
  state.blkIndent -= 4;
  state.tShift[startLine] = oldTShift;
  state.sCount[startLine] = oldSCount;
  state.bMarks[startLine] = oldBMark;

  // Create the closing token.
  token = new state.Token('footnote_close', '', -1);
  token.level = --state.level;
  state.tokens.push(token);

  return true;
}

/**
 * Converts Footnote definitions to linkable anchor tags.
 * @param {import('markdown-it/index.js').StateInline} state State of MarkdownIt.
 * @param {boolean} silent Used to validating parsing without output in MarkdownIt.
 * @returns {boolean} Returns if parsing was successful or not.
 * @see {@link https://markdown-it.github.io/markdown-it/#Ruler.after|Ruler.after}
 */
export function footnoteReferences(state, silent) {
  const max = state.posMax;
  const start = state.pos;

  // Validate that we have a footnote, it should match: `[^n]`
  // Is it too short?
  if (start + 3 > max) return false;

  // Do we have no definitions?
  if (!state.env.footnotes || !state.env.footnotes.refs) return false;
  // Does it start with the opening bracket: `[`
  if (state.src.charCodeAt(start) !== 0x5B) return false;
  // Is the second character a carrot: `^`
  if (state.src.charCodeAt(start + 1) !== 0x5E) return false;

  // Do we have content that isn't a space or a new line?
  // Stop when we reach the end bracket: `]`
  let pos;
  for (pos = start + 2; pos < max; pos++) {
    if (state.src.charCodeAt(pos) === 0x20) return false;
    if (state.src.charCodeAt(pos) === 0x0A) return false;
    if (state.src.charCodeAt(pos) === 0x5D) break;
  }

  // It is invalid if it has no label.
  if (pos === start + 2) return false;
  // It is invalid if it goes beyong the max length.
  /* c8 ignore next */
  if (pos >= max) return false;
  pos++;

  // Check for the current label in the definitions.
  const label = state.src.slice(start + 2, pos - 1);
  if (typeof state.env.footnotes.refs[`:${label}`] === 'undefined') return false;

  if (!silent) {
    // Build the actual token.
    const id = state.env.footnotes.refs[`:${label}`];
    const token = state.push('footnote_ref', '', 0);
    token.meta = { id, label };
  }

  // Update the state.
  state.pos = pos;
  state.posMax = max;
  return true;
}

/**
 * Default configuration for rendering footnote references.
 * @param {object} token The MarkdownIt Token meta object.
 * @param {number} token.id The ID of the current footnote.
 * @param {string} token.label The label of the current footnote.
 * @returns {string} The HTML markup for the current footnote reference.
 */
export function referenceTag({ id, label }) {
  return `<sup class="footnote-reference"><a href="#footnote-definition-${id}" aria-describedby="footnote-definition-${id}" id="footnote-${id}">[${label}]</a></sup>`;
}
/**
 * Default configuration for rendering footnote definitions.
 * @param {object} token The MarkdownIt Token meta object.
 * @param {number} token.id The ID of the current footnote.
 * @param {string} token.label The label of the current footnote.
 * @returns {string} The HTML markup for the current footnote definition.
 */
export function definitionOpenTag({ id, label }) {
  return `<div id="footnote-definition-${id}" class="footnote-definition"><span class="footnote-id">${label}:</span>`;
}

/**
 * Creates the tag for the Footnote reference.
 * @param {import('markdown-it/index.js').Token[]} tokens Collection of tokens to render.
 * @param {number} index The index of the current token in the Tokens array.
 * @param {import('markdown-it/index.js').Options | { uttori: { footnotes: { referenceTag: Function } } }} options Option parameters of the parser instance.
 * @param {object} _env Additional data from parsed input (references, for example).
 * @param {import('markdown-it/index.js').Renderer} _slf The current parser instance.
 * @returns {string} The tag for the Footnote reference.
 */
export function configFootnoteReference(tokens, index, options, _env, _slf) {
  /** @type {import('markdown-it/index.js').Options | { uttori: { footnotes: { referenceTag: Function } } }} */
  const opts = { uttori: { footnotes: { referenceTag: () => '' } }, ...options };
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return opts.uttori.footnotes.referenceTag(tokens[index].meta);
}

/**
 * Creates the opening tag of the Footnote items block.
 * @param {import('markdown-it/index.js').Token[]} tokens Collection of tokens to render.
 * @param {number} index The index of the current token in the Tokens array.
 * @param {import('markdown-it/index.js').Options} options Option parameters of the parser instance.
 * @param {object} _env Additional data from parsed input (references, for example).
 * @param {import('markdown-it/index.js').Renderer} _slf The current parser instance.
 * @returns {string} The opening tag of the Footnote items block.
 */
export function configFootnoteOpen(tokens, index, options, _env, _slf) {
  /** @type {import('markdown-it/index.js').Options | { uttori: { footnotes: { definitionOpenTag: Function } } }} */
  const opts = { uttori: { footnotes: { definitionOpenTag: () => '' } }, ...options };
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return opts.uttori.footnotes.definitionOpenTag(tokens[index].meta);
}

/**
 * Creates the closing tag of the Footnote items block.
 * @param {import('markdown-it/index.js').Token[]} _tokens Collection of tokens to render.
 * @param {number} _index The index of the current token in the Tokens array.
 * @param {import('markdown-it/index.js').Options} options Option parameters of the parser instance.
 * @param {object} _env Additional data from parsed input (references, for example).
 * @param {import('markdown-it/index.js').Renderer} _slf The current parser instance.
 * @returns {string} The closing tag of the Footnote section block.
 */
export function configFootnoteClose(_tokens, _index, options, _env, _slf) {
  /** @type {import('markdown-it/index.js').Options | { uttori: { footnotes: { definitionCloseTag: string } } }} */
  const opts = { uttori: { footnotes: { definitionCloseTag: '' } }, ...options };
  return opts.uttori.footnotes.definitionCloseTag;
}

export default {
  footnoteDefinition,
  footnoteReferences,
  referenceTag,
  definitionOpenTag,
  configFootnoteReference,
  configFootnoteOpen,
  configFootnoteClose,
};
