/**
 * @typedef {object} YoutubeTagAttributes
 * @property {string} v Video ID
 * @property {string} width Iframe width attribute
 * @property {string} height Iframe height attribute
 * @property {string} title Iframe title attribute
 * @property {string} start Video start offset time in seconds
 */
/**
 * Find and replace the <youtube> tags with safe iframes.
 * @param {import('markdown-it/index.js').StateCore} state State of MarkdownIt.
 * @see {@link https://markdown-it.github.io/markdown-it/#Ruler.after|Ruler.after}
 */
export function youtube(state) {
  let { tokens } = state;

  // Loop through all the tokens looking for ones to replace.
  for (let i = tokens.length - 1; i >= 0; i--) {
    const currentToken = tokens[i];
    if (currentToken.type !== 'inline') continue;

    // Does it start with "<youtube" and seem real?
    const youtubeRegExp = /<youtube\s[^>]*?(v|start|width|height|title)=["']([^"']*?)["'][^>]*?>/g;
    if (!youtubeRegExp.test(currentToken.content)) continue;

    // Pull the parts out of the tag:
    // <youtube v="XG9dCoTlJYA" start="0" width="560" height="315" title="YouTube Video Player" start="0">
    // eslint-disable-next-line security/detect-unsafe-regex
    const parts = [...currentToken.content.matchAll(/\s+(v|start|width|height|title)=('[^']*'|"[^"]*")?/g)];
    /** @type {YoutubeTagAttributes} */
    const keys = parts.reduce((output, item) => {
      output[item[1]] = item[2].replace(/["']+/g, '');
      return output;
    }, { v: '', width: '560', height: '315', title: '', start: '0' });
    const { v, width, height, title, start } = keys;

    // Build the tokens
    const nodes = [];
    let { level } = currentToken;

    let token = new state.Token('div_open', 'div', 1);
    token.attrs = [['class', 'youtube-embed']];
    token.level = level++;
    nodes.push(token);

    // Only render an iframe with a valid video.
    if (v) {
      token = new state.Token('iframe_open', 'iframe', 1);
      token.attrs = [
        ['class', 'youtube-embed-video'],
        ['width', width],
        ['height', height],
        ['src', `https://www.youtube-nocookie.com/embed/${v}?start=${start}`],
        ['title', title],
        ['frameborder', '0'],
        ['allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'],
        ['allowfullscreen', 'true'],
      ];
      nodes.push(token);
      token = new state.Token('iframe_close', 'iframe', -1);
      nodes.push(token);
    }

    token = new state.Token('div_close', 'div', -1);
    token.level = --level;
    nodes.push(token);

    // Remove closing P tag
    const closing = new state.Token('text', '', 0);
    closing.content = '\n';
    tokens = state.md.utils.arrayReplaceAt(tokens, i + 1, [closing]);

    // Replace inline content with new tags
    tokens = state.md.utils.arrayReplaceAt(tokens, i, nodes);

    // Remove opening P tag
    const opening = new state.Token('text', '', 0);
    opening.content = '';
    tokens = state.md.utils.arrayReplaceAt(tokens, i - 1, [opening]);

    // Update State
    state.tokens = tokens;
  }
}

export default {
  youtube,
};
