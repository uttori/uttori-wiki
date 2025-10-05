/**
 * Convert newlines to spaces.
 * @param {string} text The text to convert newlines to spaces.
 * @param {string} [replace] The string to replace newlines with, defaults to a single space.
 * @returns {string} The text with newlines converted to spaces.
 */
export const oneLine = (text, replace = ' ') => text.replace(/(?:\n\s*)+/g, replace).trim();

/**
 * Takes an array of arrays and returns a `,` sparated csv file.
 * @param {string[][]} table The array of arrays of strings to join.
 * @param {string} [seperator] The seperator to use when joining the items, defaults to `,`.
 * @param {string} [newLine] The seperator to use when joining the rows, defaults to `\n`.
 * @param {boolean} [alwaysDoubleQuote] Always double quote the cell, defaults to true.
 * @returns {string} The joined CSV row.
 */
export const toCSV = (table, seperator = ',', newLine = '\n', alwaysDoubleQuote = true) => table
  .map((row) => row
    .map((cell) => {
      // We remove blanks and check if the column contains other whitespace, `,` or `"`.
      // In that case, we need to quote the column.
      if (alwaysDoubleQuote || cell.replace(/ /g, '').match(/[\s",]/)) {
        return `"${cell.replace(/"/g, '""')}"`;
      }
      return cell;
    })
    .join(seperator))
  .join(newLine);

/**
 * @typedef {object} MarkdownASTNode
 * @property {string} type The type of node.
 * @property {string[]} content Text content for the node.
 * @property {Array<Array<string | MarkdownASTNode | number>>} headers The relevant headers for this node.
 * @property {import('markdown-it/index.js').Token | null} [open] The MarkdownIt Token object for the opening tag.
 * @property {import('markdown-it/index.js').Token | null} [close] The MarkdownIt Token object for the closing tag.
 * @property {MarkdownASTNode[]} children The child nodes for this node.
 */

/**
 * Create a node from a MarkdownIt Token.
 * @param {import('markdown-it/index.js').Token} [token] A token to convert.
 * @returns {MarkdownASTNode} A newly created node.
 */
export function genTreeNode(token) {
  if (!token) {
    return {
      type: 'root',
      content: [],
      // open: null,
      // close: null,
      headers: [],
      children: [],
    };
  }
  return {
    type: token.type.replace('_open', ''),
    content: [],
    // open: token,
    // close: null,
    headers: [],
    children: [],
  };
}

/**
 * Convert MarkdownIt Tokens to an AST.
 * @param {import('markdown-it/index.js').Token[]} tokens Tokens to convert.
 * @param {string} title The document title used as the H1 in the header stack.
 * @returns {MarkdownASTNode[]} The MarkdownIt tokens processed to a collection of MarkdownASTNodes.
 */
export function markdownItAST(tokens, title) {
  const rootNode = genTreeNode();
  let current = rootNode;
  /** @type {Array<Array<string | MarkdownASTNode | number>>} */
  const headersStack = [[title, 1]];
  const stack = [];

  let tmp;
  for (const token of tokens) {
    if (token.nesting === 1) {
      if (![
        'blockquote_open',
        'bullet_list_open',
        'div_open',
        'footnote_open',
        'heading_open',
        'iframe_open',
        'list_item_open',
        'ordered_list_open',
        'paragraph_open',
        'table_open',
        'tbody_open',
        'td_open',
        'th_open',
        'thead_open',
        'tr_open',
        'video_open',
      ].includes(token.type)) {
        console.warn('🐛 Unknown Token 1:', token);
      }
      tmp = genTreeNode(token);
      current.children.push(tmp);
      stack.push(current);
      current = tmp;

      if (token.type === 'heading_open') {
        const currentLevel = Number.parseInt(token.tag.substring(1), 10);
        /** @type {number} */
        let headerLevel = Number(headersStack[headersStack.length - 1][1]);
        // If we are chaning header levels, pop off the stack until we are at the same level.
        while (headersStack.length > 0 && headerLevel >= currentLevel) {
          headersStack.pop();
          headerLevel--;
        }
        headersStack.push([current, currentLevel]);
      } else {
        current.headers = [...headersStack];
      }
    } else if (token.nesting === -1) {
      // current.close = token;
      if (!stack.length) {
        throw new Error('AST stack underflow.');
      }

      if (![
        'blockquote_close',
        'bullet_list_close',
        'code_block',
        'div_close',
        'footnote_close',
        'heading_close',
        'iframe_close',
        'list_item_close',
        'ordered_list_close',
        'paragraph_close',
        'strong_close',
        'table_close',
        'tbody_close',
        'td_close',
        'th_close',
        'thead_close',
        'tr_close',
        'video_close',
      ].includes(token.type)) {
        console.warn('Unknown Token -1:', token);
      }

      current = stack.pop();
    } else if (token.nesting === 0) {
      current.headers = [...headersStack];

      // If inline, we extract the text.
      if (token.type === 'inline') {
        // Check for children, we may need to extract data.
        if (token.children) {
          for (const childToken of token.children) {
            if (['image', 'link_open', 'link_close'].includes(childToken.type)) {
              continue;
            }

            if (childToken.type === 'text') {
              if (childToken.content.trim()) {
                current.content.push(childToken.content.trim());
              } else {
                // Usually a paragraph that starts with any additional markup like bold, italic.
                // console.warn('🐛 TEXT WITH NO CONTENT:', childToken);
              }
              continue;
            }

            if (childToken.type === 'code_inline') {
              current.content.push(`\`${childToken.content.trim()}\``);
              continue;
            }

            // Softbreak, do nothing.
            if (childToken.type === 'softbreak' || childToken.type === 'hardbreak') {
              continue;
            }

            // Formatting (bold), do nothing.
            if (childToken.type === 'strong_open' || childToken.type === 'strong_close') {
              continue;
            }

            // Formatting, (emphasis / italic), do nothing.
            if (childToken.type === 'em_open' || childToken.type === 'em_close') {
              continue;
            }

            // We do not need the table of contents.
            if (['toc_open', 'toc_body', 'toc_close'].includes(childToken.type)) {
              continue;
            }

            if (childToken.type === 'footnote_ref') {
              current.content.push(`(See footnote ${childToken.meta.label})`);
              continue;
            }

            console.warn('🐛 Unknown Child Token Type:', childToken);
          }
          continue;
        }

        // No children, just store the content.
        current.content.push(token.content.trim());
        continue;
      }

      if (token.type === 'fence' || token.type === 'code_block') {
        current.children.push({
          type: 'code',
          content: [`\n\`\`\`${token.info}\n${token.content.trim()}\n\`\`\``],
          children: [],
          headers: [...headersStack],
          // open: token,
          // close: null,
        });
        continue;
      }

      if (token.type === 'text') {
        current.content.push(token.content);
        continue;
      }

      // Whitespace or dividers, skip.
      if (['hr', 'softbreak', 'hardbreak'].includes(token.type)) {
        continue;
      }

      console.warn('🐛 Unknown Token 0:', token);
      current.children.push(genTreeNode(token));
    } else {
      throw new Error(`Invalid nesting level found in token: ${JSON.stringify(token)}`);
    }
  }

  if (stack.length !== 0) {
    throw new Error('Unbalanced block open/close tokens.');
  }

  // Clean up nested objects like lists
  rootNode.children = removeEmptyItems(rootNode.children);
  rootNode.children = consolidateNestedItems(rootNode.children);
  rootNode.children = joinContent(rootNode.children);
  rootNode.children = removeEmptyItems(rootNode.children);
  rootNode.children = consolidateHeaders(rootNode.children);

  return rootNode.children;
}

/**
 * Consolidate header objects to their text content.
 * @param {MarkdownASTNode[]} items The array of itens to check.
 * @returns {MarkdownASTNode[]} The array of items with consolidated text headers.
 */
export function joinContent(items) {
  return items.map((item) => {
    if (item.content && item.content.length > 0) {
      item.content = item.content.join(' ');
    } else {
      console.warn('🐛 Mush', item);
    }
    if (item.children.length > 0) {
      console.warn('🐛? item.children', item.children);
    }
    return item;
  });
}

/**
 * Consolidate header objects to their text content.
 * @param {MarkdownASTNode[]} items The array of itens to check.
 * @returns {MarkdownASTNode[]} The array of items with consolidated text headers.
 */
export function consolidateHeaders(items) {
  return items.map((item) => {
    if (item.headers && item.headers.length > 0) {
      item.headers = item.headers.map((header) => {
        if (typeof header[0] === 'string') {
          return header[0];
        }
        if (typeof header[0] === 'number') {
          return header[0];
        }
        if (typeof header[0] === 'object' && header[0].content) {
          return header[0].content;
        }
        return header[0];
      });
    }
    return item;
  });
}

/**
 * Consolidate a Token's children to plain text.
 * @param {MarkdownASTNode} token The Token to consolidate.
 * @returns {string[]} The consolidated text string.
 */
export function consolidateParagraph(token) {
  if (token.children && token.children.length > 0) {
    const content = [];
    for (const childToken of token.children) {
      // Images can be ignored and links contain text.
      if (['image', 'link_open', 'link_close'].includes(childToken.type)) {
        continue;
      }

      // Text will be added to the buffer.
      if (childToken.type === 'text') {
        content.push(...childToken.content);
        continue;
      }

      // List items
      if (childToken.type === 'list_item') {
        if (childToken.children) {
          for (const p of childToken.children) {
            content.push(...consolidateParagraph(p));
          }
        }
        if (childToken.content && childToken.content.length !== 0) {
          console.warn('🐛 Unhandled list_item content', childToken, childToken.children[0]);
        }
        content.push(...childToken.content);
        continue;
      }

      // Text will be added to the buffer.
      if (childToken.type === 'paragraph') {
        if (childToken.children) {
          for (const p of childToken.children) {
            content.push(...consolidateParagraph(p));
          }
        }
        content.push(...childToken.content);
        continue;
      }

      console.warn('🐛 Unknown Consolidate Child Token Type:', childToken);
    }
    return content; // .join('; ');
  }
  return token.content;
}

/**
 * Flatten the tree structure for known types: bullet_list, ordered_list, table, footnote, blockquote
 * @param {MarkdownASTNode[]} items The array of itens to consolidate.
 * @returns {MarkdownASTNode[]} The array of items with flattened structures.
 */
export function consolidateNestedItems(items) {
  return items.map((item) => {
    if (![
      'blockquote',
      'bullet_list',
      'code',
      'footnote',
      'heading',
      'ordered_list',
      'paragraph',
      'table',
    ].includes(item.type)) {
      console.warn('🐛 Unknown Item Type to Consolidate:', item);
    }

    // Every table is laid out differently, making parsing very difficult.
    // Examples; tables with x & y labels; tables comparing across various products
    if (item.type === 'table') {
      /** @type {string[]} */
      const header = [];
      /** @type {string[][]} */
      const bodyRows = [];
      for (const child of item.children) {
        // Check for table header
        if (child.type === 'thead') {
          // Is there ever two TR rows? Never seen this in MarkdownIt output.
          child.children[0].children.forEach((th) => {
            if (th.children.length > 0) {
              console.warn('🐛 Unhandled TH Children');
            }
            if (th.type === 'th') {
              header.push(...th.content);
            }
          });
        } else if (child.type === 'tbody') {
          child.children.forEach((tr) => {
            /** @type {string[]} */
            const bodyRow = [];
            tr.children.forEach((td) => {
              if (td.children.length > 0) {
                console.warn('🐛 Unhandled TD Children');
              }
              bodyRow.push(...td.content);
            });
            bodyRows.push(bodyRow);
          });
        } else {
          console.warn('🐛 Unknown Table Child:', child);
        }
      }

      // Loop over the rows to build the inline text output by appending the cell content to the header.
      // const content = bodyRows.reduce((tableContent, bodyRow) => {
      //   // Combine each header with each row value and append.
      //   const output = bodyRow.reduce((rowContent, cell, index) => {
      //     if (!header[index]) {
      //       console.warn('🐛 Table Header Missing');
      //     }
      //     if (cell) {
      //       return [...rowContent, `${header[index] || ''}: ${cell.trim()}`];
      //     }

      //     console.warn('🐛 No cell?');
      //     return rowContent;
      //   }, []);

      //   return [...tableContent, output];
      // }, []);

      // Convert Table to CSV
      const content = [
        'Table as CSV:\n',
        toCSV([
          header,
          ...bodyRows,
        ]),
      ];

      // Clean up any duplicate text items like seperators and remove extra whitespace.
      // item.content = content.split('; ')
      //   .filter(Boolean)
      //   .join('; ')
      //   .replace(/\s\s+/g, ' ')
      //   .trim();
      item.content = content;
      item.children = [];
    }

    // Unordered List
    if (item.type === 'bullet_list') {
      // Loop over list items and pull out their paragraphs
      const content = [];
      let { headers } = item;
      for (const li of item.children) {
        for (const p of li.children) {
          headers = p.headers;
          content.push(consolidateParagraph(p));
        }
      }
      item.headers = headers;
      item.content = content; // .join('; ');
      item.children = [];
    }

    // Ordered List
    if (item.type === 'ordered_list') {
      let { headers } = item;
      // Loop over list items and pull out their paragraphs
      for (const [i, li] of item.children.entries()) {
        for (const p of li.children) {
          headers = p.headers;
          item.content.push(`${i + 1}.) ${consolidateParagraph(p)}`);
        }
      }
      item.headers = headers;
      item.children = [];
    }

    // Footnotes
    if (item.type === 'footnote') {
      // Loop over children and pull out their paragraphs
      for (const child of item.children) {
        item.content.push(`Footenote ${item?.open?.meta?.label || ''}: ${consolidateParagraph(child).join('; ')}`);
      }
      item.children = [];
    }

    // Blockquote
    if (item.type === 'blockquote') {
      // Loop over children and pull out their paragraphs
      for (const child of item.children) {
        item.content.push(...consolidateParagraph(child));
      }
      // item.content = item.content.trim();
      item.children = [];
    }

    return item;
  });
}

/**
 * Remove any items with no content and no children.
 * @param {MarkdownASTNode[]} items The array of itens to check.
 * @returns {MarkdownASTNode[]} The array of items with empty items removed.
 */
export function removeEmptyItems(items) {
  return items.map((item) => {
    if (item.children && item.children.length > 0) {
      item.children = removeEmptyItems(item.children);
    }

    // Clean up any duplicate text items like seperators and remove extra whitespace.
    // if (item.content) {
    //   item.content = item.content.split('; ')
    //     .filter(Boolean)
    //     .join('; ')
    //     .replace(/\s\s+/g, ' ')
    //     .trim();
    // }

    return item;
  }).filter((item) => (item.content && item.content.length > 0) || (item.children && item.children.length > 0));
}

/**
 * Replace curly quotes with regular quotes, remove punctuation, normalize whitespace, lowercase, split at the space, use a loop to count word occurrences into an index object.
 * @param {string} input The text input to count words in.
 * @returns {Record<string, number>} The word count hash.
 */
export function countWords(input) {
  return input
    .replace(/[\u2018\u2019]/g, '\'') // ‘’
    .replace(/[\u201C\u201D]/g, '"') // “”
    .replace(/[!"#$%&()*,./:;<=?[\]^_`{|}~“”≈►◄\-]/g, ' ')
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .split(' ')
    .reduce((hash, word) => {
      if (word) {
        if (!Object.prototype.hasOwnProperty.call(hash, word)) {
          hash[word] = 0;
        }
        hash[word]++;
      }
      return hash;
    }, {});
}

/**
 * Find the longest common prefix of a list of paths.
 * @param {string[][]} paths The paths to find the longest common prefix of.
 * @returns {string[]} The longest common prefix of the paths.
 */
function longestCommonPrefix(paths) {
  if (paths.length === 0) return [];
  let i = 0;
  while (true) {
    const segment = paths[0][i];
    if (segment === undefined) {
      break;
    }
    for (let k = 1; k < paths.length; k++) {
      if (paths[k][i] !== segment) {
        return paths[0].slice(0, i);
      }
    }
    i++;
  }
  return paths[0].slice(0, i);
}

/**
 * Consolidate like sub-sections by their headers.
 * @param {import('../ai-chat-bot.js').Block[]} items The items to consolidate.
 * @param {number} [maximumTokenCount] The maximum token count to consolidate to.
 * @param {number} [softMinTokens] If we've already packed at least this many tokens, and the next item would shrink the anchor, flush early.
 * @param {number} [minAnchorDecrease] How much the anchor must shrink (in header levels) to trigger early flush.
 * @returns {object[]} The consolidated items.
 */
export function consolidateSectionsByHeader(items, maximumTokenCount = Infinity, softMinTokens = 600, minAnchorDecrease = 1) {
  const result = [];

  // Group items by slug
  /** @type {Map<string, import('../ai-chat-bot.js').Block[]>} */
  const bySlug = new Map();
  for (const item of items) {
    const parent = item.slug;
    const arrayOfItems = bySlug.get(parent) || [];
    arrayOfItems.push(item);
    bySlug.set(parent, arrayOfItems);
  }

  for (const [_slug, slugItems] of bySlug.entries()) {
    /** @type {import('../ai-chat-bot.js').Block[]} */
    let pack = [];
    let packTokens = 0;
    let index = 1;

    const flush = () => {
      if (!pack.length) return;
      const anchor = longestCommonPrefix(pack.map(p => p.sectionPath));
      // never let anchor be empty: default to top-level header
      const parentPath = anchor.length ? anchor : [pack[0].sectionPath[0]];

      result.push({
        ...pack[0],
        sectionPath: parentPath,
        text: pack.map(p => {
          const tail = p.sectionPath.slice(parentPath.length).join(' - ');
          return tail ? `${tail} - ${p.text}` : p.text;
        }).join('\n'),
        tokenCount: packTokens,
        idx: index++,
      });
      pack = [];
      packTokens = 0;
    };

    for (const item of slugItems) {
      const tokenCount = item.tokenCount ?? countWords(item.text ?? '').length * 0.75;

      // If single item is bigger than the cap, emit current pack (if any),
      // then emit the item as-is (can't split further here).
      if (tokenCount > maximumTokenCount) {
        flush();
        result.push({ ...item, tokenCount: tokenCount, idx: index++ });
        continue;
      }

      // Soft-minimum early flush if the next item would shrink the anchor (LCP)
      if (pack.length && packTokens >= softMinTokens) {
        const currentAnchorLen = longestCommonPrefix(pack.map(p => p.sectionPath)).length;
        const prospectiveAnchorLen = longestCommonPrefix([...pack, item].map(p => p.sectionPath)).length;
        const anchorDecrease = currentAnchorLen - prospectiveAnchorLen;
        if (anchorDecrease >= minAnchorDecrease) {
          flush();
        }
      }

      // If adding this item would exceed the cap, flush current pack first.
      if (pack.length && packTokens + tokenCount > maximumTokenCount) {
        flush();
      }

      // Start/extend the pack.
      pack.push(item);
      packTokens += tokenCount;
    }

    // Handle last section for this slug
    flush();
  }

  return result;
}
