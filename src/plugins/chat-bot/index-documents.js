import path from 'node:path';
import crypto from 'node:crypto';

import AIChatBot from '../ai-chat-bot.js';
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
  const sections = markdownItAST(tokens, document.title);

  const sectionHash = {};
  for (const section of sections) {
    if (section.type === 'paragraph' || section.type === 'bullet_list' || section.type === 'ordered_list' || section.type === 'code' || section.type === 'table' || section.type === 'footnote') {
      const slug = section.headers.join('-');
      if (!sectionHash[slug]) {
        sectionHash[slug] = {
          headers: section.headers,
          content: [],
        };
      }
      sectionHash[slug].content.push(section.content);
    } else if (section.type !== 'heading') {
      console.warn('🐛 Unknown Section Type:', section);
    }
  }

  // Loop through and create sections with title, headings & tags prepend to the content.
  const sectionz = Object.values(sectionHash);

  for (const section of sectionz) {
    const content = Array.isArray(section.content) ? section.content.join(' ').trim() : section.content.trim();
    const tokenCount = Object.keys(countWords(content)).length * 0.75;

    // Skip empty sections.
    if (!tokenCount) {
      continue;
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
    for (const attachment of document.attachments) {
      if (attachment.skip) {
        debug('buildBlocks: skipping attachment:', attachment.path);
        continue;
      }
      const text = await config.extractAttachmentText(config, attachment);
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
  const newItems = consolidateSectionsByHeader(output, 500, 600);
  debug('buildBlocks: total sections after merge:', newItems.length);
  debug('buildBlocks: sections:', x.map((section) => ( {
    tokenCount: section.tokenCount,
    sectionPath: section.sectionPath,
    slug: section.slug,
  })));
  return newItems;
}

/**
 * Index all documents in the database.
 * @param {Record<string, import('../ai-chat-bot.js').AIChatBotConfig>} fullConfig The configuration.
 * @param {import('../../../dist/custom.js').UttoriContextWithPluginConfig<'uttori-plugin-ai-chat-bot', import('../ai-chat-bot.js').AIChatBotConfig>} context The context.
 * @returns {Promise<void>} The indexed documents.
 */
export async function indexAllDocuments (fullConfig, context) {
  /** @type {import('../ai-chat-bot.js').AIChatBotConfig} */
  const config = { ...AIChatBot.defaultConfig(), ...fullConfig[AIChatBot.configKey] };
  debug('indexAllDocuments:', config.databasePath);
  // Open or create the database
  /** @type {import('better-sqlite3/index.js').Database} */
  const db = AIChatBot.openDatabase(config);

  // Assert that the sqlite-vec extension is loaded.
  try {
    const v = /** @type {Record<string, string>} */
      (db.prepare('SELECT vec_version() AS v').get());
    if (!v?.v) {
      throw new Error('vec_version() returned empty');
    }
    debug(`indexAllDocuments: sqlite-vec loaded: ${v.v}`);
  } catch (error) {
    throw new Error('sqlite-vec is not loaded. Ensure the extension is installed.');
  }

  // Setup the embedder
  const embedder = new OllamaEmbedder(config.ollamaBaseUrl, config.embedModel);
  const dim = await embedder.probeDimension();
  debug(`indexAllDocuments: dimension: ${dim}`);

  // Ensure Vector Index
  db.exec(`DROP TABLE IF EXISTS uttori_chunks_vec;
    CREATE VIRTUAL TABLE uttori_chunks_vec USING vec0(
      embedding float[${dim}],
      source_id TEXT
    );`);

  // Ensure FTS Index
  // https://www.sqlite.org/fts5.html#unicode61_tokenizer
  if (config.fts) {
    db.exec(`
      CREATE VIRTUAL TABLE IF NOT EXISTS uttori_chunks_fts USING fts5(
        text,                                      -- column name
        content='uttori_chunks',                   -- table name
        content_rowid='rowid',                     -- rowid in base table
        tokenize = "unicode61 remove_diacritics 1" -- tokenizer
      );
      -- Populate FTS for existing rows if empty
      INSERT INTO uttori_chunks_fts(rowid, text)
        SELECT rowid, text FROM uttori_chunks
        WHERE NOT EXISTS (SELECT 1 FROM uttori_chunks_fts LIMIT 1);
    `);
  }

  // Get all documents
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
  for (const document of documents) {
    if (!document) continue;

    const chunks = await buildBlocks(document, config);
    const plainForHash = chunks.map(b => `[${b.sectionPath.join(' > ')}] ${b.text}`).join('\n\n');
    const contentHash = crypto.createHash('sha256').update(`${document.updateDate ?? ''}|${plainForHash}`).digest('hex');

    // Check the hash of the source and the content to see if it has changed
    const row = /** @type {Record<string, string>} */
      (db.prepare('SELECT content_hash FROM uttori_sources WHERE id = ?').get(document.slug));
    if (row?.content_hash === contentHash) {
      debug(`indexAllDocuments: ${document.slug} (${document.title}) has not changed`);
      skipped++;
      continue;
    }

    // Reindex this document
    debug(`indexAllDocuments: updating ${document.slug} (${document.title})`);

    // embed in batches
    const batchSize = Math.max(1, config.batch ?? 24);
    /** @type {number[][]} */
    const embeddings = [];
    for (let i = 0; i < chunks.length; i += batchSize) {
      const slice = chunks.slice(i, i + batchSize);
      const vecs = await embedder.embedBatch(slice.map(s => s.text), Math.min(8, slice.length));
      embeddings.push(...vecs);
      debug(`indexAllDocuments: embedded ${Math.min(i + batchSize, chunks.length)}/${chunks.length}`);
    }

    // upsert source, delete old chunks, insert new
    const stmt = db.prepare(`
      INSERT INTO uttori_sources(id, slug, title, update_date, meta_json, content_hash)
      VALUES (@id, @slug, @title, @updateDate, @metaJson, @contentHash)
      ON CONFLICT(id) DO UPDATE SET
        slug=excluded.slug,
        title=excluded.title,
        update_date=excluded.update_date,
        meta_json=excluded.meta_json,
        content_hash=excluded.content_hash
    `);
    stmt.run({
      id: document.slug,
      title: document.title,
      slug: document.slug,
      updateDate: document.updateDate,
      metaJson: JSON.stringify({ tags: document.tags ?? [] }),
      contentHash,
    });

    // delete chunks for source
    // cascade-like cleanup
    const rows = /** @type {Array<{rowid: number}>} */
      (db.prepare('SELECT rowid FROM uttori_chunks WHERE source_id = ?').all(document.slug));
    /** @type {number[]} */
    const rowids = rows.map(row => row.rowid);
    const del1 = db.prepare('DELETE FROM uttori_chunks WHERE source_id = ?');
    del1.run(document.slug);
    if (rowids.length) {
      const placeholders = rowids.map(() => '?').join(',');
      db.prepare(`DELETE FROM uttori_chunks_vec WHERE rowid IN (${placeholders})`).run(...rowids);
      try {
        db.prepare(`DELETE FROM uttori_chunks_fts WHERE rowid IN (${placeholders})`).run(...rowids);
      } catch {}
    }
    debug('indexAllDocuments: cleaned up database');
    debug('indexAllDocuments: chunks:', chunks.length);
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
    const insertVec = db.prepare(`
      INSERT INTO uttori_chunks_vec(rowid, embedding, source_id) VALUES (?, ?, ?)
    `);
    const insertFts = (() => {
      try { return db.prepare('INSERT INTO uttori_chunks_fts(rowid, text) VALUES (?, ?)'); }
      catch { return null; }
    })();

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

        // sqlite-vec accepts Float32Array or a Buffer of f32s
        const f32 = new Float32Array(c.embedding);
        insertVec.run(BigInt(rowid), Buffer.from(f32.buffer), c.source_id);
        if (insertFts) {
          insertFts.run(rowid, c.text);
        }
      }
    });
    tx();

    totalChunks += chunks.length;
  }

  debug(`indexAllDocuments: Done. Chunks indexed: ${totalChunks}. Unchanged skipped: ${skipped}.`);
  db.close();
}
