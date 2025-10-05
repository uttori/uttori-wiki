/**
 * Find and replace the <video> tags with safe <video> tags.
 * @param {import('markdown-it/index.js').StateCore} state State of MarkdownIt.
 * @see {@link https://markdown-it.github.io/markdown-it/#Ruler.after|Ruler.after}
 */
export function video(state) {
  let { tokens } = state;

  // Loop through all the tokens looking for ones to replace.
  for (let i = tokens.length - 1; i >= 0; i--) {
    const currentToken = tokens[i];
    if (currentToken.type !== 'inline') continue;

    // Does it start with "<video" and seem real?
    const videoRegExp = /<video\s[^>]*?(src)=["']([^"']*?)["'][^>]*?>/g;
    if (!videoRegExp.test(currentToken.content)) continue;

    // Pull the parts out of the tag:
    // <video src="/uploads/example.mp4" />

    /** @type {IterableIterator<RegExpMatchArray>} */
    // eslint-disable-next-line security/detect-unsafe-regex
    const parts = (currentToken.content ?? '')?.matchAll(/\s+(src)=('[^']*'|"[^"]*")?/g);
    /** @type {Record<string, string>} */
    const keys = [...parts].reduce((output, item) => {
      output[item[1]] = item[2]?.replace(/["']+/g, '') || '';
      return output;
    }, /** @type {Record<string, string>} */ ({}));
    const { src = '' } = keys;

    // Build the tokens
    const nodes = [];
    let { level } = currentToken;

    let token = new state.Token('div_open', 'div', 1);
    token.attrs = [['class', 'video-embed']];
    token.level = level++;
    nodes.push(token);

    // Only render an iframe with a valid video.
    if (src.startsWith('http://') || src.startsWith('https://')) {
      const url = new URL(src);
      // If a domain is not in this list, it is set to 'nofollow'.
      if (state.md.options?.uttori?.allowedExternalDomains?.includes(url.hostname)) {
        token = new state.Token('video_open', 'video', 1);
        token.attrs = [
          ['class', 'video-embed-video video-embed-external'],
          ['src', src],
          ['controls', 'true'],
          ['playsinline', 'true'],
          ['muted', 'true'],
        ];
        nodes.push(token);
        token = new state.Token('video_close', 'video', -1);
        nodes.push(token);
      }
    } else {
      token = new state.Token('video_open', 'video', 1);
      token.attrs = [
        ['class', 'video-embed-video'],
        ['src', src],
        ['controls', 'true'],
        ['playsinline', 'true'],
        ['muted', 'true'],
      ];
      nodes.push(token);
      token = new state.Token('video_close', 'video', -1);
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
  video,
};
