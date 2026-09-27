import type {
  MarkdownASTNode, MarkdownASTHeaderEntry, MarkdownASTHeaderValue, MarkdownFootnoteMeta,
} from '../../types/plugins/chat-bot/utilities.js';

export type {
  MarkdownASTNode, MarkdownASTHeaderEntry, MarkdownASTHeaderStack, MarkdownASTHeaderValue,
  MarkdownFootnoteMeta,
} from '../../types/plugins/chat-bot/utilities.js';

/**
 * Coerce unknown markdown content into plain text.
 * @param value The value to coerce.
 * @returns Plain text.
 */
function toPlainText(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }
  if (Array.isArray(value)) {
    return value.flat().map(toPlainText).join(' ');
  }
  if (value == null) {
    return '';
  }
  return String(value);
}

/**
 * Read a footnote label from a MarkdownIt token meta object.
 * @param meta The token meta.
 * @returns The footnote label, if present.
 */
function footnoteLabelFromMeta(meta: unknown): string {
  if (!meta || typeof meta !== 'object' || !('label' in meta)) {
    return '';
  }
  const record = meta as MarkdownFootnoteMeta;
  const label = record.label;
  return typeof label === 'string' ? label : toPlainText(label);
}

/**
 * Normalize a header stack entry to plain text or a numeric level.
 * @param entry The header stack entry.
 * @returns The normalized header value.
 */
function normalizeHeaderStackEntry(entry: MarkdownASTHeaderEntry | null | undefined): MarkdownASTHeaderValue | null | undefined {
  if (entry === null) {
    return null;
  }
  if (entry === undefined) {
    return undefined;
  }
  if (typeof entry === 'string') {
    return stripImagesFromMarkdown(entry);
  }
  if (typeof entry === 'number' || typeof entry === 'boolean') {
    return entry;
  }
  if (Array.isArray(entry)) {
    return stripImagesFromMarkdown(entry.map(toPlainText).join(' '));
  }
  if (typeof entry === 'object') {
    const node = entry;
    if (typeof node.content === 'string') {
      return stripImagesFromMarkdown(node.content);
    }
    if (Array.isArray(node.content)) {
      return stripImagesFromMarkdown(node.content.map(toPlainText).join(' '));
    }
    const content = node.content;
    if (typeof content === 'string' || typeof content === 'number' || typeof content === 'boolean') {
      return content;
    }
    return toPlainText(content);
  }
  return toPlainText(entry);
}

/**
 * Convert newlines to spaces.
 * @param text The text to convert newlines to spaces.
 * @param [replace] The string to replace newlines with, defaults to a single space.
 * @returns The text with newlines converted to spaces.
 */
export const oneLine = (text: string, replace = ' '): string => text.replace(/(?:\n\s*)+/g, replace).trim();

/**
 * Takes an array of arrays and returns a `,` sparated csv file.
 * @param table The array of arrays of strings to join.
 * @param [seperator] The seperator to use when joining the items, defaults to `,`.
 * @param [newLine] The seperator to use when joining the rows, defaults to `\n`.
 * @param [alwaysDoubleQuote] Always double quote the cell, defaults to true.
 * @returns The joined CSV row.
 */
export const toCSV = (table: string[][], seperator = ',', newLine = '\n', alwaysDoubleQuote = true): string => table
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
 * Takes an array of arrays and returns a Markdown table.
 * @param table The array of arrays of strings to join.
 * @param [newLine] The seperator to use when joining the rows, defaults to `\n`.
 * @returns The Markdown table string.
 */
export const toMarkdown = (table: string[][], newLine = '\n'): string => {
  if (!table || table.length === 0) {
    return '';
  }

  // First row is the header
  const [header, ...bodyRows] = table;

  // Escape pipe characters in cells and handle newlines within cells
  const escapeCell = (cell: unknown) => {
    const cellStr = String(cell);
    return cellStr
      .replace(/\|/g, '\\|')
      .replace(/\n/g, ' ');
  };

  // Format a row with pipes
  /**
   * Format a row with pipes.
   * @param row The row to format.
   * @returns The formatted row.
   */
  const formatRow = (row: string[]): string => `| ${row.map(escapeCell).join(' | ')} |`;

  // Create separator row with appropriate number of columns
  const separator = `| ${header.map(() => '---').join(' | ')} |`;

  // Build the table
  const rows = [
    formatRow(header),
    separator,
    ...bodyRows.map(formatRow),
  ];

  return rows.join(newLine);
};

/**
 * Estimate token count for text using word count approximation.
 * @param text The text to estimate tokens for.
 * @returns The estimated token count.
 */
export const estimateTokenCount = (text: string): number => {
  const words = text.split(/\s+/).filter(w => w.length > 0);
  return Math.ceil(words.length * 0.75);
};

/**
 * Split table rows into chunks based on row count or token size.
 * @param header The table header row.
 * @param bodyRows The table body rows.
 * @param options Chunking options.
 * @param [options.maxRowsPerChunk] Maximum number of rows per chunk.
 * @param [options.maxTokensPerChunk] Maximum estimated tokens per chunk.
 * @returns Array of table chunks.
 */
export function chunkTable(header: string[], bodyRows: string[][], options: { maxRowsPerChunk?: number; maxTokensPerChunk?: number } = {}): {header: string[], rows: string[][], chunkIndex: number, totalChunks: number}[] {
  const { maxRowsPerChunk, maxTokensPerChunk } = options;

  // If no chunking limits specified, return entire table as single chunk
  if (!maxRowsPerChunk && !maxTokensPerChunk) {
    return [{
      header,
      rows: bodyRows,
      chunkIndex: 1,
      totalChunks: 1,
    }];
  }

  const chunks = [];
  let currentChunk = [];
  let currentTokenCount = 0;

  // Calculate header token count once
  const headerCSV = toCSV([header]);
  const headerTokens = estimateTokenCount(headerCSV);

  for (const row of bodyRows) {
    const rowCSV = toCSV([row]);
    const rowTokens = estimateTokenCount(rowCSV);

    // Check if we should start a new chunk
    const shouldChunkByRows = maxRowsPerChunk && currentChunk.length >= maxRowsPerChunk;
    const shouldChunkByTokens = maxTokensPerChunk &&
      (currentTokenCount + headerTokens + rowTokens) > maxTokensPerChunk;

    if (currentChunk.length > 0 && (shouldChunkByRows || shouldChunkByTokens)) {
      // Save current chunk
      chunks.push([...currentChunk]);
      currentChunk = [];
      currentTokenCount = 0;
    }

    currentChunk.push(row);
    currentTokenCount += rowTokens;
  }

  // Add the last chunk if it has rows
  if (currentChunk.length > 0) {
    chunks.push(currentChunk);
  }

  // Format chunks with metadata
  const totalChunks = chunks.length;
  return chunks.map((rows, index) => ({
    header,
    rows,
    chunkIndex: index + 1,
    totalChunks,
  }));
}

/**
 * Create a node from a MarkdownIt Token.
 * @param [token] A token to convert.
 * @returns A newly created node.
 */
export function genTreeNode(token?: import('markdown-it').Token): MarkdownASTNode {
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
 * Strip images from markdown text, leaving only the text content.
 * @param text The markdown text to clean.
 * @returns The text with images removed.
 */
export function stripImagesFromMarkdown(text: string): string {
  if (typeof text !== 'string') {
    return text;
  }

  // Remove image markdown syntax: ![alt](src) or ![alt](src "title")
  // Also handles data URLs and other image formats
  return text.replace(/!\[([^\]]*)\]\([^)]+\)/g, (_match, altText) => {
    const alt = typeof altText === 'string' ? altText : '';
    return alt ? alt : '';
  }).replace(/\s+/g, ' ').trim();
}

/**
 * Join the content of an item into a single string.
 * @param items The array of itens to check.
 * @returns The array of items with the content joined into a single string.
 */
export function joinContent(items: MarkdownASTNode[]): MarkdownASTNode[] {
  // debug('joinContent: items:', items);
  return items.map((item) => {
    if (item.content && item.content.length > 0) {
      item.content = [item.content.join(' ')];
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
 * @param items The array of itens to check.
 * @returns The array of items with consolidated text headers.
 */
export function consolidateHeaders(items: MarkdownASTNode[]): MarkdownASTNode[] {
  // debug('consolidateHeaders: items:', items);
  return items.map((item) => {
    if (item.headers && item.headers.length > 0) {
      item.headers = item.headers.map((header) => {
        if (!Array.isArray(header)) {
          return header;
        }
        return normalizeHeaderStackEntry(header[0]);
      });
    }
    return item;
  });
}

/**
 * Consolidate a Token's children to plain text.
 * @param token The Token to consolidate.
 * @returns The consolidated text string.
 */
export function consolidateParagraph(token: MarkdownASTNode): string[] {
  if (token.children && token.children.length > 0) {

    const content: string[] = [];
    for (const childToken of token.children) {
      // Images can be ignored and links contain text.
      if (['image', 'link_open', 'link_close'].includes(childToken.type)) {
        continue;
      }

      // Text will be added to the buffer.
      if (childToken.type === 'text') {
        if (Array.isArray(childToken.content)) {
          content.push(...childToken.content.flat());
        } else {
          content.push(childToken.content);
        }
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
        if (Array.isArray(childToken.content)) {
          content.push(...childToken.content.flat());
        } else if (childToken.content !== undefined && childToken.content !== null) {
          content.push(childToken.content);
        }
        continue;
      }

      // Text will be added to the buffer.
      if (childToken.type === 'paragraph') {
        if (childToken.children) {
          for (const p of childToken.children) {
            content.push(...consolidateParagraph(p));
          }
        }
        if (Array.isArray(childToken.content)) {
          content.push(...childToken.content.flat());
        } else {
          content.push(childToken.content);
        }
        continue;
      }

      console.warn('🐛 Unknown Consolidate Child Token Type:', childToken);
    }
    return content;
  }
  return Array.isArray(token.content) ? token.content.flat() : [token.content];
}

/**
 * Flatten the tree structure for known types: bullet_list, ordered_list, table, footnote, blockquote
 * @param items The array of itens to consolidate.
 * @param options The options for the consolidation.
 * @param [options.tableToCSV] Whether to convert the table to CSV.
 * @param [options.tableMaxRowsPerChunk] The maximum number of rows per chunk for tables.
 * @param [options.tableMaxTokensPerChunk] The maximum number of tokens per chunk for tables.
 * @returns The array of items with flattened structures.
 */
export function consolidateNestedItems(items: MarkdownASTNode[], options: { tableToCSV?: boolean; tableMaxRowsPerChunk?: number; tableMaxTokensPerChunk?: number } = {}): MarkdownASTNode[] {
  return items.flatMap<MarkdownASTNode>((item) => {
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

      const header: string[] = [];

      const bodyRows: string[][] = [];
      for (const child of item.children) {
        // Check for table header
        if (child.type === 'thead') {
          // Is there ever two TR rows? Never seen this in MarkdownIt output.
          child.children[0].children.forEach((th) => {
            if (th.children.length > 0) {
              console.warn('🐛 Unhandled TH Children');
            }
            if (th.type === 'th') {
              header.push(...th.content.flat());
            }
          });
        } else if (child.type === 'tbody') {
          child.children.forEach((tr) => {

            const bodyRow: string[] = [];
            tr.children.forEach((td) => {
              if (td.children.length > 0) {
                console.warn('🐛 Unhandled TD Children');
              }
              bodyRow.push(...td.content.flat());
            });
            bodyRows.push(bodyRow);
          });
        } else {
          console.warn('🐛 Unknown Table Child:', child);
        }
      }

      // Chunk the table if needed based on options
      const chunks = chunkTable(header, bodyRows, {
        maxRowsPerChunk: options.tableMaxRowsPerChunk,
        maxTokensPerChunk: options.tableMaxTokensPerChunk,
      });

      // Return separate items for each chunk instead of combining them
      return chunks.map(chunk => {
        let content;

        // Convert table into Markdown for embedding
        if (!options.tableToCSV) {
          const chunkInfo = chunk.totalChunks > 1
            ? `Table as Markdown (Chunk ${chunk.chunkIndex} of ${chunk.totalChunks}):\n`
            : 'Table as Markdown:\n';

          content = [chunkInfo + toMarkdown([
            chunk.header,
            ...chunk.rows,
          ])];
        } else {
          // Convert Table chunk to CSV with metadata
          const chunkInfo = chunk.totalChunks > 1
            ? `Table as CSV (Chunk ${chunk.chunkIndex} of ${chunk.totalChunks}):\n`
            : 'Table as CSV:\n';

          content = [chunkInfo + toCSV([
            chunk.header,
            ...chunk.rows,
          ])];
        }

        // Create a unique header path for multi-chunk tables
        // Headers are tuples of [content, level], so we need to add a proper tuple
        let headers = item.headers;
        if (chunk.totalChunks > 1) {
          const lastHeader = item.headers[item.headers.length - 1];
          const lastHeaderLevel = Array.isArray(lastHeader) ? lastHeader[1] : undefined;
          const newLevel = typeof lastHeaderLevel === 'number' ? lastHeaderLevel + 1 : 2;
          headers = [...item.headers, [`Table Part ${chunk.chunkIndex}`, newLevel]];
        }

        return ({
          type: item.type,
          content,
          children: [],
          headers,
        });
      });
    }

    // Unordered List
    if (item.type === 'bullet_list') {
      // Loop over list items and pull out their paragraphs
      const content = [];
      let { headers } = item;
      for (const li of item.children) {
        for (const p of li.children) {
          headers = p.headers;
          const paragraphContent = consolidateParagraph(p);
          content.push(paragraphContent);
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
          const paragraphContent = consolidateParagraph(p);
          const contentString = Array.isArray(paragraphContent) ? paragraphContent.join('') : paragraphContent;
          item.content.push(`${i + 1}.) ${contentString}`);
        }
      }
      item.headers = headers;
      item.children = [];
    }

    // Footnotes
    if (item.type === 'footnote') {
      // Loop over children and pull out their paragraphs
      const footnoteLabel = footnoteLabelFromMeta(item.open?.meta);
      for (const child of item.children) {
        item.content.push(`Footenote ${footnoteLabel}: ${consolidateParagraph(child).join('; ')}`);
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
 * @param items The array of itens to check.
 * @returns The array of items with empty items removed.
 */
export function removeEmptyItems(items: MarkdownASTNode[]): MarkdownASTNode[] {
  return items.map((item) => {
    if (item.children && item.children.length > 0) {
      item.children = removeEmptyItems(item.children);
    }
    return item;
  }).filter((item) => (item.content && item.content.length > 0) || (item.children && item.children.length > 0));
}

/**
 * Removes curly quotes, punctuation, normalizes whitespace, lowercase, split at the space, use a loop to count word occurrences into an index object.
 * @param input The text input to count words in.
 * @returns The word count hash.
 */
export function countWords(input: string): Record<string, number> {
  return input
    .replace(/[\u2018\u2019]/g, ' ') // ‘’
    .replace(/[\u201C\u201D]/g, ' ') // “”
    .replace(/[!"#$%&()*,./:;<=?[\]^_`{|}~“”≈►◄\-]/g, ' ')
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .split(' ')
    .reduce<Record<string, number>>((hash, word) => {
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
 * Find the longest common prefix of an array of paths.
 * @param paths The array of paths to find the longest common prefix of.
 * @returns The longest common prefix of the paths.
 */
export function longestCommonPrefix(paths: string[][]): string[] {
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
 * Approximate the number of tokens in a string (≈ 3/4 of the word count for English text).
 * @param text The text to estimate.
 * @returns The approximate token count.
 */
function approximateTokens(text: string): number {
  return (typeof text === 'string' ? text : '').trim().split(/\s+/).filter(Boolean).length * 0.75;
}

/**
 * Split a block of text into pieces that each fit within an approximate token budget.
 *
 * Splits on line boundaries first (which keeps table rows and code lines intact), then falls back
 * to splitting an individually over-long line on word boundaries. This is used to break up sections
 * that are larger than the chunk cap so they can still be embedded, an un-split section can exceed
 * the embedding model's context window and fail to embed entirely.
 * @param text The text to split.
 * @param maxTokens The maximum approximate tokens per piece.
 * @returns The text split into token-bounded pieces.
 */
export function splitTextToTokenBudget(text: string, maxTokens: number): string[] {
  const safeText = typeof text === 'string' ? text : '';
  // A non-positive or infinite budget means "do not split".
  if (!Number.isFinite(maxTokens) || maxTokens <= 0) {
    return safeText.trim() ? [safeText] : [];
  }

  const pieces: string[] = [];

  let current: string[] = [];
  let currentTokens = 0;

  const flush = () => {
    if (current.length) {
      pieces.push(current.join('\n'));
      current = [];
      currentTokens = 0;
    }
  };

  // Hard-split a single line that is itself larger than the budget, on word boundaries.
  const splitLongLine = (line: string) => {

    let buffer: string[] = [];
    let bufferTokens = 0;
    for (const word of line.split(/\s+/).filter(Boolean)) {
      const wordTokens = Math.max(1, word.length / 4);
      if (buffer.length && bufferTokens + wordTokens > maxTokens) {
        pieces.push(buffer.join(' '));
        buffer = [];
        bufferTokens = 0;
      }
      buffer.push(word);
      bufferTokens += wordTokens;
    }
    if (buffer.length) {
      pieces.push(buffer.join(' '));
    }
  };

  for (const line of safeText.split('\n')) {
    const lineTokens = approximateTokens(line);

    if (lineTokens > maxTokens) {
      flush();
      splitLongLine(line);
      continue;
    }

    if (current.length && currentTokens + lineTokens > maxTokens) {
      flush();
    }
    current.push(line);
    currentTokens += lineTokens;
  }
  flush();

  return pieces.filter(piece => piece.trim());
}

/**
 * Consolidate like sub-sections by their headers.
 * @param items The items to consolidate.
 * @param [maximumTokenCount] The maximum token count to consolidate to.
 * @param [softMinTokens] If we've already packed at least this many tokens, and the next item would shrink the anchor, flush early.
 * @param [minAnchorDecrease] How much the anchor must shrink (in header levels) to trigger early flush.
 * @returns The consolidated items.
 */
export function consolidateSectionsByHeader(items: import('../search-provider-sqlite.js').Block[], maximumTokenCount = Infinity, softMinTokens = 600, minAnchorDecrease = 1): import('../search-provider-sqlite.js').IndexedBlock[] {

  const result: import('../search-provider-sqlite.js').IndexedBlock[] = [];

  // Group items by slug

  const bySlug = new Map<string | undefined, import('../search-provider-sqlite.js').Block[]>();
  for (const item of items) {
    const parent = item.slug;
    const arrayOfItems = bySlug.get(parent) || [];
    arrayOfItems.push(item);
    bySlug.set(parent, arrayOfItems);
  }

  for (const [_slug, slugItems] of bySlug.entries()) {

    let pack: import('../search-provider-sqlite.js').Block[] = [];
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
      const tokenCount = item.tokenCount ?? approximateTokens(item.text ?? '');

      // If a single item is bigger than the cap, emit the current pack (if any), then split the
      // oversized item down to the budget. Emitting it verbatim could exceed the embedding model's
      // context window and fail to embed (e.g. very large tables), leaving the chunk unindexed.
      if (tokenCount > maximumTokenCount) {
        flush();
        const pieces = splitTextToTokenBudget(item.text ?? '', maximumTokenCount);
        for (const piece of pieces) {
          result.push({ ...item, text: piece, tokenCount: approximateTokens(piece), idx: index++ });
        }
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

/**
 * Convert MarkdownIt Tokens to an AST.
 * @param tokens Tokens to convert.
 * @param title The document title used as the H1 in the header stack.
 * @param options The options for the conversion.
 * @param [options.tableToCSV] Whether to convert tables to CSV format. If false, converts to Markdown format instead.
 * @param [options.tableMaxRowsPerChunk] The maximum number of rows per chunk for tables.
 * @param [options.tableMaxTokensPerChunk] The maximum number of tokens per chunk for tables.
 * @returns The MarkdownIt tokens processed to a collection of MarkdownASTNodes.
 */
export function markdownItAST(tokens: import('markdown-it').Token[], title: string, options: { tableToCSV?: boolean; tableMaxRowsPerChunk?: number; tableMaxTokensPerChunk?: number } = {}): MarkdownASTNode[] {
  const rootNode = genTreeNode();
  let current = rootNode;

  const headersStack: (string | MarkdownASTNode | number)[][] = [[title, 1]];
  const stack = [];

  let tmp: MarkdownASTNode | undefined;
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
        /* c8 ignore next 3 */
      ].includes(token.type)) {
        console.warn('🐛 Unknown Token 1:', token);
      }
      tmp = genTreeNode(token);
      current.children.push(tmp);
      stack.push(current);
      current = tmp;

      if (token.type === 'heading_open') {
        const currentLevel = Number.parseInt(token.tag.substring(1), 10);

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
      /* c8 ignore next 3 */
      if (!stack.length) {
        throw new Error('AST stack underflow.');
      }

      /* c8 ignore next 22 */
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

      // Keep unmatched closing tokens from losing the root used by subsequent tokens.
      current = stack.pop() ?? rootNode;
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
              current.content.push(`(See footnote ${footnoteLabelFromMeta(childToken.meta)})`);
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
          content: [`\n\n\`\`\`${token.info}\n${token.content.trim()}\n\`\`\`\n\n`],
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
  rootNode.children = consolidateNestedItems(rootNode.children, options);
  rootNode.children = joinContent(rootNode.children);
  rootNode.children = removeEmptyItems(rootNode.children);
  rootNode.children = consolidateHeaders(rootNode.children);

  return rootNode.children;
}
