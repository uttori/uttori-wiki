/**
 * @param {import('markdown-it/index.js').Token} token The MarkdownIt token we are reading.
 * @param {string} key The key is the attribute name, like `src` or `href`.
 * @returns {*|undefined} The read value or undefined.
 */
export function getValue(token, key) {
  let value;
  /* c8 ignore next 3 */
  if (!token.attrs) {
    token.attrs = [];
  }
  token.attrs.forEach((attribute) => {
    // Parameter is set, read it.
    if (attribute[0] === key) {
      value = attribute[1];
    }
  });
  // Parameter is not set, return undefined.
  return value;
}

/**
 * @param {import('markdown-it/index.js').Token} token The MarkdownIt token we are updating.
 * @param {string} key The key is the attribute name, like `src` or `href`.
 * @param {string} value The value we want to set to the provided key.
 */
export function updateValue(token, key, value) {
  let found;
  /* c8 ignore next 3 */
  if (!token.attrs) {
    token.attrs = [];
  }
  token.attrs.forEach((attribute) => {
    // Parameter is set, change it.
    if (attribute[0] === key) {
      attribute[1] = value;
      found = true;
    }
  });
  // Parameter is not set, add it.
  if (!found) {
    token.attrs.push([key, value]);
  }
}

/**
 * Uttori specific rules for manipulating the markup.
 * External Domains are filtered for SEO and security.
 * @param {import('markdown-it/index.js').StateCore} state State of MarkdownIt.
 * @returns {boolean} Returns if parsing was successful or not.
 */
export function uttoriInline(state) {
  state.tokens.forEach((blockToken) => {
    if (blockToken.type === 'inline' && blockToken.children) {
      // https://markdown-it.github.io/markdown-it/#Token
      /** @type {import('markdown-it/index.js').Options | { uttori: { lazyImages: boolean, allowedExternalDomains: string[], openNewWindow: boolean, baseUrl: string } }} */
      const options = {
        uttori: {
          lazyImages: false,
          allowedExternalDomains: [],
          openNewWindow: false,
          baseUrl: '',
        },
        ...state.md.options,
      };
      blockToken.children.forEach((token) => {
        switch (token.type) {
          case 'image': {
            if (options?.uttori?.lazyImages) {
              updateValue(token, 'loading', 'lazy');
            }
            break;
          }
          case 'link_open': {
            /** @type {string} */
            const href = getValue(token, 'href');
            if (href) {
              // Absolute URLs
              if (href.startsWith('http://') || href.startsWith('https://')) {
                const url = new URL(href);
                // If a domain is not in this list, it is set to 'nofollow'.
                if (options?.uttori?.allowedExternalDomains?.includes(url.hostname)) {
                  updateValue(token, 'rel', 'external noopener noreferrer');
                } else {
                  updateValue(token, 'rel', 'external nofollow noopener noreferrer');
                }
                // Open external domains in a new window.
                if (options?.uttori?.openNewWindow) {
                  updateValue(token, 'target', '_blank');
                }
              } else if (href.startsWith('color:')) {
                // Convert the anchor tag to a span tag and add the link as the class.
                token.tag = 'span';
                token.attrs = [
                  ['style', `color: ${href.slice(6)}`],
                ];
              } else {
                // Prefix for relative URLs
                if (options?.uttori?.baseUrl) {
                  // Check for opening slash
                  updateValue(token, 'href', `${options.uttori.baseUrl}/${href.startsWith('/') ? href.substring(1) : href}`);
                }
              }
            }
            break;
          }
          default:
            break;
        }
      });
    }
  });

  return false;
}

export default {
  getValue,
  updateValue,
  uttoriInline,
};
