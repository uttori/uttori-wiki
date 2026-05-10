import path from 'node:path';
import crypto from 'node:crypto';

import AIChatBot from '../ai-chat-bot.js';
import { extractAttachmentText } from './attachment-extractor.js';
import OllamaEmbedder from './ollama-embedder.js';
import MarkdownItRenderer from '../renderer-markdown-it.js';
import { consolidateSectionsByHeader, countWords, markdownItAST } from './utilities.js';

let debug = (..._) => {};
/* c8 ignore next 1 */
try { const { default: d } = await import('debug'); debug = d('Uttori.Plugin.AIChatBot.IndexDocuments'); } catch {}

/**
 * Build blocks from a document.
 * @param {import('../../wiki.js').UttoriWikiDocument} document The document to build blocks from.
 * @param {import('../ai-chat-bot.js').AIChatBotConfig} config The options.
 * @returns {Promise<import('../ai-chat-bot.js').Block[]>} The blocks.
 */
export async function buildBlocks(document, config) {
  debug('buildBlocks: document:', document?.slug ?? '');
  /** @type {import('../ai-chat-bot.js').Block[]} */
  const output = [];

  const tokens = MarkdownItRenderer.parse(document.content, config.markdownItPluginConfig);
  const sections = markdownItAST(tokens, document.title, {
    tableToCSV: config.tableToCSV,
    tableMaxRowsPerChunk: config.tableMaxRowsPerChunk,
    tableMaxTokensPerChunk: config.tableMaxTokensPerChunk,
  });

  /** @type {Record<string, { headers: string[], content: string[] }>} */
  const sectionHash = {};
  for (const section of sections) {
    if (
      section.type === 'paragraph' ||
      section.type === 'blockquote' ||
      section.type === 'bullet_list' ||
      section.type === 'ordered_list' ||
      section.type === 'code' ||
      section.type === 'table' ||
      section.type === 'footnote' ||
      section.type === 'image'
    ) {
      const sectionPath = section.headers.map((header) => String(header));
      const slug = sectionPath.join('-');
      if (!sectionHash[slug]) {
        sectionHash[slug] = {
          headers: sectionPath,
          content: [],
        };
      }
      sectionHash[slug].content.push(section.content.join(' '));
    } else if (section.type !== 'heading') {
      console.warn('🐛 Unknown Section Type:', section);
    }
  }

  // Loop through and create sections with title, headings & tags prepend to the content.
  /** @type {Array<{ headers: string[], content: string[] }>} */
  const sectionz = Object.values(sectionHash);

  for (const section of sectionz) {
    const content = section.content.join(' ').trim();
    const tokenCount = Object.keys(countWords(content)).length * 0.75;

    // Skip empty sections.
    if (!tokenCount) {
      console.warn('🐛 tokenCount is 0:', tokenCount);
      continue;
    }

    // Assert that the headers are an array of strings.
    if (!Array.isArray(section.headers)) {
      console.warn('🐛 section.headers is not an array:', section.headers);
    }
    if (Array.isArray(section.headers) && section.headers.some(header => typeof header !== 'string')) {
      console.warn('🐛 section.headers is not an array of strings:', section.headers);
    }

    output.push({
      sectionPath: section.headers,
      text: content,
      tokenCount,
      tags: [...document.tags],
      slug: document.slug,
    });
  }

  // Add attachments to the output
  if (config.includeAttachments && Array.isArray(document.attachments) && document.attachments.length > 0) {
    debug('buildBlocks: including attachments');
    for (const attachment of document.attachments) {
      if (attachment.skip) {
        debug('buildBlocks: skipping attachment:', attachment.path);
        continue;
      }
      const text = await (config.extractAttachmentText ?? extractAttachmentText)(config, attachment);
      if (!text) {
        debug('buildBlocks: attachment text is empty:', attachment.path);
        continue;
      }
      const label = `Attachment: ${path.basename(attachment.path)}`;
      const attachmentPath = (document.title ? [document.title] : []).concat(['Attachments', label]);

      // split attachment text into paragraphs to avoid ballooning a single chunk
      // First split by page boundaries (for PDFs) or major sections
      const sections = text.split(/\n\n---\n\n/);
      debug('buildBlocks: attachment sections:', sections.length);
      for (const section of sections) {
        if (!section.trim()) continue;

        // For each section, split into smaller paragraphs
        const paragraphs = section.split(/\n{2,}/g).map((s) => s.trim()).filter(Boolean);
        debug('buildBlocks: section paragraphs:', paragraphs.length);

        // If we have a single large paragraph, break it down further
        for (const paragraph of paragraphs) {
          if (paragraph.length > 2000) {
            // Break large paragraphs into sentences or smaller chunks
            const sentences = paragraph.split(/[!.?]+/).map(s => s.trim()).filter(Boolean);
            for (const sentence of sentences) {
              if (sentence.length > 500) {
                // Break very long sentences into words
                const words = sentence.split(/\s+/);
                const chunks = [];
                let currentChunk = [];
                let currentLength = 0;

                for (const word of words) {
                  if (currentLength + word.length > 500 && currentChunk.length > 0) {
                    chunks.push(currentChunk.join(' '));
                    currentChunk = [word];
                    currentLength = word.length;
                  } else {
                    currentChunk.push(word);
                    currentLength += word.length + 1; // +1 for space
                  }
                }
                if (currentChunk.length > 0) {
                  chunks.push(currentChunk.join(' '));
                }

                chunks.forEach(chunk => {
                  if (chunk.trim()) {
                    output.push({
                      text: chunk.trim(),
                      sectionPath: attachmentPath,
                      tokenCount: OllamaEmbedder.approxTokenLen(chunk.trim()),
                      tags: [...document.tags],
                      slug: document.slug,
                    });
                  }
                });
              } else if (sentence.trim()) {
                output.push({
                  text: sentence.trim(),
                  sectionPath: attachmentPath,
                  tokenCount: OllamaEmbedder.approxTokenLen(sentence.trim()),
                  tags: [...document.tags],
                  slug: document.slug,
                });
              }
            }
          } else if (paragraph.trim()) {
            output.push({
              text: paragraph.trim(),
              sectionPath: attachmentPath,
              tokenCount: OllamaEmbedder.approxTokenLen(paragraph.trim()),
              tags: [...document.tags],
              slug: document.slug,
            });
          }
        }
      }
    }
  }

  debug('buildBlocks: total sections per-merge:', output.length);
  /** @type {import('../ai-chat-bot.js').Block[]} */
  const newItems = consolidateSectionsByHeader(output, 500, 600);
  debug('buildBlocks: total sections after merge:', newItems.length);
  // debug('buildBlocks: sections:', newItems.map((section) => ( {
  //   tokenCount: section.tokenCount,
  //   sectionPath: section.sectionPath,
  //   slug: section.slug,
  // })));
  return newItems;
}

/**
 * @typedef {object} ChatIndexSchemaOptions
 * @property {boolean} [rebuild] Whether to rebuild index tables.
 */

/**
 * Ensure the chat index tables exist.
 * @param {import('better-sqlite3/index.js').Database} db The database.
 * @param {import('../ai-chat-bot.js').AIChatBotConfig} config The options.
 * @param {ChatIndexSchemaOptions} [options] Schema options.
 * @returns {Promise<{ embedder: OllamaEmbedder, dim: number }>} The embedder and vector dimension.
 */
export async function ensureChatIndexSchema(db, config, options = {}) {
  try {
    const v = /** @type {Record<string, string>} */
      (db.prepare('SELECT vec_version() AS v').get());
    if (!v?.v) {
      throw new Error('vec_version() returned empty');
    }
    debug(`ensureChatIndexSchema: sqlite-vec loaded: ${v.v}`);
  } catch (error) {
    throw new Error('sqlite-vec is not loaded. Ensure the extension is installed.');
  }

  const embedder = new OllamaEmbedder(config.ollamaBaseUrl, config.embedModel);
  const dim = await embedder.probeDimension();
  debug(`ensureChatIndexSchema: dimension: ${dim}`);

  if (options.rebuild) {
    db.exec(`
      DROP TABLE IF EXISTS uttori_chunks_vec;
      DROP TABLE IF EXISTS uttori_chunks_fts;
      DELETE FROM uttori_chunks;
      DELETE FROM uttori_sources;
    `);
  }

  db.exec(`
    CREATE VIRTUAL TABLE IF NOT EXISTS uttori_chunks_vec USING vec0(
      embedding float[${dim}],
      source_id TEXT
    );
  `);

  // Ensure FTS Index
  // https://www.sqlite.org/fts5.html#unicode61_tokenizer
  if (config.fts) {
    db.exec(`
      CREATE VIRTUAL TABLE IF NOT EXISTS uttori_chunks_fts USING fts5(
        text,
        content='uttori_chunks',
        content_rowid='rowid',
        tokenize = "unicode61 remove_diacritics 1"
      );
      -- Populate FTS for existing rows if empty
      INSERT INTO uttori_chunks_fts(rowid, text)
        SELECT rowid, text FROM uttori_chunks
        WHERE NOT EXISTS (SELECT 1 FROM uttori_chunks_fts LIMIT 1);
    `);
  }

  return { embedder, dim };
}

/**
 * Remove a document and all of its chunks from the chat index.
 * @param {import('better-sqlite3/index.js').Database} db The database.
 * @param {string} slug The source slug to remove.
 */
export function removeIndexedDocumentFromDatabase(db, slug) {
  if (!slug) return;
  const rows = /** @type {Array<{rowid: number}>} */
    (db.prepare('SELECT rowid FROM uttori_chunks WHERE source_id = ?').all(slug));
  const rowids = rows.map(row => row.rowid);
  db.prepare('DELETE FROM uttori_chunks WHERE source_id = ?').run(slug);
  db.prepare('DELETE FROM uttori_sources WHERE id = ?').run(slug);
  if (rowids.length) {
    const placeholders = rowids.map(() => '?').join(',');
    try {
      db.prepare(`DELETE FROM uttori_chunks_vec WHERE rowid IN (${placeholders})`).run(...rowids);
    } catch (error) {
      debug('removeIndexedDocumentFromDatabase: vec cleanup skipped:', error);
    }
    try {
      db.prepare(`DELETE FROM uttori_chunks_fts WHERE rowid IN (${placeholders})`).run(...rowids);
    } catch (error) {
      debug('removeIndexedDocumentFromDatabase: fts cleanup skipped:', error);
    }
  }
}

/**
 * Remove a document from the chat index.
 * @param {Record<string, import('../ai-chat-bot.js').AIChatBotConfig>} fullConfig The configuration.
 * @param {string} slug The source slug to remove.
 */
export function removeIndexedDocument(fullConfig, slug) {
  if (!slug) return;
  const config = { ...AIChatBot.defaultConfig(), ...fullConfig[AIChatBot.configKey] };
  const db = AIChatBot.openDatabase(config);
  try {
    removeIndexedDocumentFromDatabase(db, slug);
  } finally {
    db.close();
  }
}

/**
 * Index one document using an already-open database.
 * @param {import('better-sqlite3/index.js').Database} db The database.
 * @param {import('../ai-chat-bot.js').AIChatBotConfig} config The options.
 * @param {OllamaEmbedder} embedder The embedder.
 * @param {import('../../wiki.js').UttoriWikiDocument} document The document to index.
 * @returns {Promise<{ chunks: number, skipped: boolean, errored: number }>} Indexing stats.
 */
export async function indexDocumentInDatabase(db, config, embedder, document) {
  const chunks = await buildBlocks(document, config);
  const plainForHash = chunks.map(b => `[${b.sectionPath.join(' > ')}] ${b.text}`).join('\n\n');
  const contentHash = crypto.createHash('sha256').update(`${document.updateDate ?? ''}|${plainForHash}`).digest('hex');

  const row = /** @type {Record<string, string>} */
    (db.prepare('SELECT content_hash FROM uttori_sources WHERE id = ?').get(document.slug));
  if (row?.content_hash === contentHash) {
    debug(`indexDocumentInDatabase: ♾️️ ${document.slug} (${document.title}) has not changed`, contentHash);
    return { chunks: 0, skipped: true, errored: 0 };
  }

  debug(`indexDocumentInDatabase: updating ${document.slug} (${document.title})`);
  const batchSize = Math.max(1, config.batch ?? 24);
  /** @type {number[][]} */
  const embeddings = [];
  for (let i = 0; i < chunks.length; i += batchSize) {
    const slice = chunks.slice(i, i + batchSize);
    const sectionPath = slice.map(s => s.sectionPath.join(' > ')).join(' > ');
    const start = Date.now();
    debug(`indexDocumentInDatabase: embedding ${slice.length} chunks for ${document.slug} ${sectionPath}`);
    const vecs = await embedder.embedBatch(
      slice.map(s => s.text),
      config.embedPrompt('Represent the document for retrieval.', slice.map(s => s.text).join('\n\n')),
      Math.min(8, slice.length),
    );
    const end = Date.now();
    debug(`indexDocumentInDatabase: time to embed: ${sectionPath} ${end - start}ms`);
    embeddings.push(...vecs);
  }

  db.prepare(`
    INSERT INTO uttori_sources(id, slug, title, update_date, meta_json, content_hash)
    VALUES (@id, @slug, @title, @updateDate, @metaJson, @contentHash)
    ON CONFLICT(id) DO UPDATE SET
      slug=excluded.slug,
      title=excluded.title,
      update_date=excluded.update_date,
      meta_json=excluded.meta_json,
      content_hash=excluded.content_hash
  `).run({
    id: document.slug,
    title: document.title,
    slug: document.slug,
    updateDate: document.updateDate,
    metaJson: JSON.stringify({ tags: document.tags ?? [] }),
    contentHash,
  });

  removeIndexedDocumentFromDatabase(db, document.slug);
  db.prepare(`
    INSERT INTO uttori_sources(id, slug, title, update_date, meta_json, content_hash)
    VALUES (@id, @slug, @title, @updateDate, @metaJson, @contentHash)
  `).run({
    id: document.slug,
    title: document.title,
    slug: document.slug,
    updateDate: document.updateDate,
    metaJson: JSON.stringify({ tags: document.tags ?? [] }),
    contentHash,
  });

  /** @type {import('../ai-chat-bot.js').ChunkWithMeta[]} */
  const chunksWithVectors = chunks.map((c, i) => ({
    source_id: document.slug,
    idx: c.idx,
    text: c.text,
    token_count: c.tokenCount,
    meta: { sectionPath: c.sectionPath },
    sectionPath: c.sectionPath,
    embedding: embeddings[i],
  }));
  const insertChunk = db.prepare(`
    INSERT INTO uttori_chunks(source_id, idx, text, token_count, meta_json)
    VALUES (@source_id, @idx, @text, @token_count, @meta_json)
  `);
  const insertVec = db.prepare('INSERT INTO uttori_chunks_vec(rowid, embedding, source_id) VALUES (?, ?, ?)');
  const insertFts = (() => {
    try { return db.prepare('INSERT INTO uttori_chunks_fts(rowid, text) VALUES (?, ?)'); }
    catch { return null; }
  })();

  let errored = 0;
  const tx = db.transaction(() => {
    for (const c of chunksWithVectors) {
      const info = insertChunk.run({
        source_id: c.source_id,
        idx: c.idx,
        text: c.text,
        token_count: c.token_count,
        meta_json: c.meta ? JSON.stringify(c.meta) : null,
      });

      const rowid = Number(info.lastInsertRowid);
      if (!Number.isInteger(rowid)) {
        throw new Error(`Unexpected non-integer rowid: ${String(info.lastInsertRowid)}`);
      }
      if (insertFts) {
        insertFts.run(rowid, c.text);
      }
      if (!c.embedding || !Array.isArray(c.embedding) || c.embedding.length === 0) {
        debug(`💀 Skipping vec insert for chunk with empty embedding: ${c.source_id} [${c.sectionPath.join(' > ')}]`);
        errored++;
        continue;
      }
      const f32 = new Float32Array(c.embedding);
      if (!f32 || f32.length === 0) {
        debug(`💀 Invalid Float32Array for chunk: ${c.source_id} [${c.sectionPath.join(' > ')}]`);
        errored++;
        continue;
      }
      insertVec.run(BigInt(rowid), Buffer.from(f32.buffer), c.source_id);
    }
  });
  tx();

  return { chunks: chunks.length, skipped: false, errored };
}

/**
 * Index one document in the database.
 * @param {Record<string, import('../ai-chat-bot.js').AIChatBotConfig>} fullConfig The configuration.
 * @param {import('../../../dist/custom.js').UttoriContextWithPluginConfig<'uttori-plugin-ai-chat-bot', import('../ai-chat-bot.js').AIChatBotConfig>} _context The context.
 * @param {import('../../wiki.js').UttoriWikiDocument} document The document to index.
 * @returns {Promise<void>} The indexed document.
 */
export async function indexDocument(fullConfig, _context, document) {
  const config = { ...AIChatBot.defaultConfig(), ...fullConfig[AIChatBot.configKey] };
  const db = AIChatBot.openDatabase(config);
  try {
    const { embedder } = await ensureChatIndexSchema(db, config);
    await indexDocumentInDatabase(db, config, embedder, document);
  } catch (error) {
    debug('indexDocument: error indexing document:', error);
  } finally {
    db.close();
  }
}

/**
 * Index all documents in the database.
 * @param {Record<string, import('../ai-chat-bot.js').AIChatBotConfig>} fullConfig The configuration.
 * @param {import('../../../dist/custom.js').UttoriContextWithPluginConfig<'uttori-plugin-ai-chat-bot', import('../ai-chat-bot.js').AIChatBotConfig>} context The context.
 * @returns {Promise<void>} The indexed documents.
 */
export async function indexAllDocuments(fullConfig, context) {
  /** @type {import('../ai-chat-bot.js').AIChatBotConfig} */
  const config = { ...AIChatBot.defaultConfig(), ...fullConfig[AIChatBot.configKey] };
  debug('indexAllDocuments:', config.databasePath);
  /** @type {import('better-sqlite3/index.js').Database} */
  const db = AIChatBot.openDatabase(config);

  try {
    const { embedder } = await ensureChatIndexSchema(db, config, { rebuild: true });
    /** @type {import('../../wiki.js').UttoriWikiDocument[]} */
    let documents = [];
    try {
      const query = `SELECT * FROM documents WHERE slug NOT_IN ("${config.ignoreSlugs.join('", "')}") AND tags EXCLUDES ("${config.ignoreTags.join('", "')}") ORDER BY createDate DESC LIMIT -1`;
      [documents] = await context.hooks.fetch('storage-query', query, context);
    } catch (error) {
      debug('indexAllDocuments: error getting documents:', error);
      return;
    }
    debug(`indexAllDocuments: documents: ${documents.length}`);

    let totalChunks = 0;
    let skipped = 0;
    let errored = 0;
    for (const document of documents) {
      if (!document) continue;
      const result = await indexDocumentInDatabase(db, config, embedder, document);
      totalChunks += result.chunks;
      skipped += result.skipped ? 1 : 0;
      errored += result.errored;
    }
    debug(`indexAllDocuments: Done. Chunks indexed: ${totalChunks}. Unchanged skipped: ${skipped}. Errored: ${errored}.`);
  } finally {
    db.close();
  }
}
