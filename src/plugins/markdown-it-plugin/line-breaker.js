/**
 * Converts HTML line breaks or other patterns to line break HTML tags.
 * @param {import('markdown-it/index.js').StateCore} state State of MarkdownIt.
 * @see {@link https://markdown-it.github.io/markdown-it/#Ruler.after|Ruler.after}
 */
export function lineBreaker(state) {
  let { tokens } = state;

  // Loop through all the tokens looking for ones to replace.
  for (let i = tokens.length - 1; i >= 0; i--) {
    const currentToken = tokens[i];
    if (currentToken.type !== 'inline') continue;

    // Check for any break tags.
    const breakRegExp = /<br\s?\/?>/ig;
    if (!breakRegExp.test(currentToken.content)) continue;

    // Split the parts that need a break between them:
    const parts = currentToken.content.split(breakRegExp);

    // Build the tokens
    const nodes = [];

    // Start with the first part so the loop only needs to add breaks
    let token = new state.Token('inline', '', 0);
    token.content = parts.shift() || '';
    token.children = [];
    nodes.push(token);

    // Loop over the chunks of text
    for (const part of parts) {
      // Add the line break
      token = new state.Token('hardbreak', 'br', 0);
      token.children = [];
      nodes.push(token);

      // Add the text
      token = new state.Token('inline', '', 0);
      token.content = part;
      token.children = [];
      nodes.push(token);
    }

    // Replace inline content with new tags
    tokens = state.md.utils.arrayReplaceAt(tokens, i, nodes);

    // Update State
    state.tokens = tokens;
  }
}

export default {
  lineBreaker,
};
