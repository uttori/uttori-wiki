import slugify from 'slugify';

/**
 * Adds deep links to the opening of the heading tags with IDs.
 * @param {import('markdown-it/index.js').Token[]} tokens Collection of tokens.
 * @param {number} index The index of the current token in the Tokens array.
 * @param {import('./../renderer-markdown-it.js').MarkdownItRendererOptions} options The options for the current MarkdownIt instance.
 * @returns {string} The modified header tag with ID.
 */
export function headingOpen(tokens, index, options) {
  // The opening tag itself (#, ##, etc.)
  const { tag } = tokens[index];
  // The text content inside of that tag (# Heading, Heading in this example)
  const label = tokens[index + 1];
  // Guard against empty headers
  if (label.type === 'inline' && Array.isArray(label.children) && label.children.length > 0) {
    // We want to use slugify to provide nicer deep links
    // @ts-expect-error slugify is not typed
    const slug = slugify(label.content, options.uttori.toc.slugify);
    // Return the new tag HTML
    const id = `${slug}-${label.map ? label.map[0] : 'MISSING_MAP'}`;
    return `<${tag} id="${id}">`;
  }
  return `<${tag}>`;
}

/**
 * Creates the opening tag of the TOC.
 * @param {import('markdown-it/index.js').Token[]} _tokens Collection of tokens.
 * @param {number} _index The index of the current token in the Tokens array.
 * @param {import('./../renderer-markdown-it.js').MarkdownItRendererOptions} options The options for the current MarkdownIt instance.
 * @returns {string} The opening tag of the TOC.
 */
export function tocOpen(_tokens, _index, options) {
  return options.uttori.toc.openingTag;
}

/**
 * Creates the closing tag of the TOC.
 * @param {import('markdown-it/index.js').Token[]} _tokens Collection of tokens.
 * @param {number} _index The index of the current token in the Tokens array.
 * @param {import('./../renderer-markdown-it.js').MarkdownItRendererOptions} options The options for the current MarkdownIt instance.
 * @returns {string} The closing tag of the TOC.
 */
export function tocClose(_tokens, _index, options) {
  return options.uttori.toc.closingTag;
}

/**
 * Creates the contents of the TOC.
 * @param {import('markdown-it/index.js').Token[]} _tokens Collection of tokens.
 * @param {number} _index The index of the current token in the Tokens array.
 * @param {import('./../renderer-markdown-it.js').MarkdownItRendererOptions} _options Option parameters of the parser instance.
 * @param {object} env Additional data from parsed input (the toc_headings, for example).
 * @param {import('markdown-it/index.js').Renderer} _slf The current parser instance.
 * @returns {string} The contents tag of the TOC.
 */
export function tocBody(_tokens, _index, _options, env, _slf) {
  let indent_level = 0;

  // Reduce the headers down into a string of the TOC
  const list = env.toc_headings.reduce((accumulator, heading) => {
    // Increase / Decrease depth of nesting
    if (heading.level > indent_level) {
      const level_diff = (heading.level - indent_level);
      for (let i = 0; i < level_diff; i++) {
        accumulator += `<li><ul class="table-of-contents-h${heading.level}">`;
        indent_level++;
      }
    } else if (heading.level < indent_level) {
      const level_diff = (indent_level - heading.level);
      for (let i = 0; i < level_diff; i++) {
        accumulator += '</ul></li>';
        indent_level--;
      }
    }
    // New item at the current level
    accumulator += `<li><a href="#${heading.slug}-${heading.index}" title="${heading.content}">${heading.content}</a></li>`;
    return accumulator;
  }, '');

  // Add the ending tags at the number of indent levels nested
  let output = `${list}${'</ul></li>'.repeat(indent_level)}`;

  // Remove empty nesting levels that result from missing levels, such as no H1 or H2 tags.
  while (output.includes('<ul class="table-of-contents-h2"><li><ul')) {
    output = output.replace('<ul class="table-of-contents-h2"><li><ul', '<ul');
    output = output.replace('</ul></li></ul>', '</ul>');
  }
  while (output.includes('<ul class="table-of-contents-h3"><li><ul')) {
    output = output.replace('<ul class="table-of-contents-h3"><li><ul', '<ul');
    output = output.replace('</ul></li></ul>', '</ul>');
  }

  // Remove first & last LI tags
  return output.slice(0, -5).slice(4);
}

/**
 * Find and replace the TOC tag with the TOC itself.
 * @param {import('markdown-it/index.js').StateInline} state State of MarkdownIt.
 * @returns {boolean} Returns true when able to parse a TOC.
 * @see {@link https://markdown-it.github.io/markdown-it/#Ruler.after|Ruler.after}
 */
export function tocRule(state) {
  // If the token does not start with `[` it cannot be `[toc]`
  if (state.src.charCodeAt(state.pos) !== 0x5B) {
    return false;
  }

  const match = /^\[toc]$/im.exec(state.src) || [];
  if (!match || match.length === 0 || match[0] !== '[toc]') {
    return false;
  }

  let token;
  token = state.push('toc_open', 'toc', 1);
  token.markup = '[toc]';
  token = state.push('toc_body', '', 0);
  token.content = '';
  state.push('toc_close', 'toc', -1);

  // Update the position and continue parsing.
  const newline = state.src.indexOf('\n', state.pos);
  state.pos = (newline !== -1) ? newline : state.pos + state.posMax + 1;

  return true;
}

/**
 * Caches the headers for use in building the TOC body.
 * @param {import('markdown-it/index.js').StateCore} state State of MarkdownIt.
 */
export function collectHeaders(state) {
  // Create a mapping of all the headers, their indentation level, content and slug.
  state.env.toc_headings = state.env.toc_headings || [];
  state.tokens.forEach((token, i, tokens) => {
    if (token.type === 'heading_close') {
      const inline = tokens[i - 1];
      state.env.toc_headings.push({
        content: inline.content,
        index: inline.map ? inline.map[0] : 'MISSING_MAP',
        level: Number.parseInt(token.tag.slice(1, 2), 10),
        // @ts-expect-error slugify is not typed
        slug: slugify(inline.content, state.md.options.uttori.toc.slugify),
      });
    }
  });
}

export default {
  headingOpen,
  tocOpen,
  tocClose,
  tocBody,
  tocRule,
  collectHeaders,
};
