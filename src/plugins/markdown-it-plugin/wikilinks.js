import slugify from 'slugify';

/**
 * Converts WikiLinks to anchor tags.
 * @param {import('markdown-it/index.js').StateInline} state State of MarkdownIt.
 * @returns {boolean} Returns true when able to parse the wikilinks.
 * @see {@link https://markdown-it.github.io/markdown-it/#Ruler.before|Ruler.before}
 */
export function wikilinks(state) {
  const max = state.posMax;
  let current = state.src.charAt(state.pos);
  let next = state.src.charAt(state.pos + 1);

  // Check for opening brackets `[[`
  if (current !== '[' || next !== '[') {
    return false;
  }

  // Simple parser to find the closing tags
  let openTagCount = 1;
  let end = -1;
  let skipNext = false;
  let text = '';
  for (let i = state.pos + 1; i < max && end === -1; i++) {
    current = next;
    next = state.src.charAt(i + 1);
    text += next;
    if (skipNext) {
      skipNext = false;
      continue;
    }
    if (current === '\n') {
      // Bad input, abort
      return false;
    }
    if (current === ']' && next === ']') {
      openTagCount -= 1;
      // Last closing tag found
      if (openTagCount === 0) {
        end = i;
      }
      // Skip the next `]`
      skipNext = true;
    } else if (current === '[' && next === '[') {
      openTagCount += 1;
      // Skip the next `[`
      skipNext = true;
    } else if (current === '\\') {
      // Escape character, skip
      skipNext = true;
    }
  }

  // No closing tag, bad input
  if (end === -1) {
    return false;
  }

  // Build the links parts
  const parts = text.slice(0, -2).split('|');
  const link = slugify(parts[0], state.md.options?.uttori?.wikilinks?.slugify);
  const anchor_text = parts.length > 1 && parts[1] ? parts[1] : parts[0];

  // Create our tag
  let token = state.push('link_open', 'a', 1);
  token.attrs = [['href', link]];

  state.pos += 2;
  state.posMax = end;

  // We want to use the provided text if any, rather than the whole internal string.
  // state.md.inline.tokenize(state);
  token = state.push('text', '', 0);
  token.content = anchor_text;

  state.pos = end + 2;
  state.posMax = max;
  state.push('link_close', 'a', -1);

  return true;
}

export default {
  wikilinks,
};
