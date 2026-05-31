import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';
import * as sqliteVec from 'sqlite-vec';
import validateQuery from '../storeage-provider-json/validate-query.js';
import { retrieve as retrieveFromDatabase } from '../chat-bot/retrieval.js';
import {
  ensureChatIndexSchema,
  indexDocumentInDatabase,
  removeIndexedDocumentFromDatabase,
} from '../chat-bot/index-documents.js';

let debug = (..._) => {};
/* c8 ignore next 2 */
try {
  const { default: d } = await import('debug');
  debug = d('Uttori.SearchProvider.SQLite');
} catch {}

/**
 * @typedef {import('../search-provider-sqlite.js').SearchSQLiteConfig} SearchSQLiteConfig
 */

/** @import { SqlWhereParserAst, ParserOperand, Value as SqlWhereParserValue } from '../../../dist/custom.d.ts' */

/**
 * @typedef {import('../../../dist/custom.d.ts').UttoriContextWithPluginConfig<'uttori-plugin-search-provider-sqlite', SearchSQLiteConfig>} SearchSQLiteContext
 */

/**
 * @typedef {object} SearchSQLiteDocumentRow
 * @property {string} [slug] The document slug when selected explicitly.
 * @property {string} data_json The serialized document payload.
 */

/**
 * @typedef {object} SearchSQLiteSlugRow
 * @property {string} slug The document slug.
 * @property {string} data_json The serialized document payload.
 */

/**
 * @typedef {object} SearchSQLiteCountRow
 * @property {number} count The aggregate count result.
 */

/**
 * @typedef {object} SearchSQLiteRevisionRow
 * @property {string} revision The revision identifier.
 */

/**
 * @typedef {object} SearchSQLiteIndexUpdate
 * @property {import('../../wiki.js').UttoriWikiDocument} document The updated document.
 * @property {string} [originalSlug] The previous slug when the document was renamed.
 */

/**
 * Normalize an AST node value to its operand list.
 * @param {SqlWhereParserValue} nodeValue The AST node value.
 * @returns {ParserOperand[]} The operands for the operator.
 */
const toAstOperands = (nodeValue) => (Array.isArray(nodeValue) ? nodeValue : [nodeValue]);

/**
 * Read a field name operand as a string for SQL generation.
 * @param {ParserOperand | undefined} operand The field operand.
 * @returns {string} The field name.
 */
const toFieldName = (operand) => String(operand ?? '');

/**
 * @typedef {object} SearchSQLiteConfigSearchOptions
 * @property {string} query The value to search for.
 * @property {number} [limit] Limit for the number of returned documents.
 * @property {string[]} [slugs] Optional slugs to restrict search to.
 */

/**
 * Storage and search provider powered by SQLite, sqlite-vec, and FTS5.
 *
 * @class
 * @property {object} searchTerms The collection of search terms and their counts.
 * @property {SearchSQLiteConfig} config The provider configuration.
 */
class SearchProviderSQLite {
  /**
   * Creates an instance of SearchProviderSQLite.
   *
   * @param {Partial<SearchSQLiteConfig>} [config] Configuration object for the class.
   * @class
   */
  constructor(config = {}) {
    debug('constructor');
    this.searchTerms = {};
    this.config = {
      databasePath: './site/data/uttori-wiki.sqlite',
      databaseOptions: {},
      databseOptions: undefined,

      updateTimestamps: true,
      useHistory: true,

      ollamaBaseUrl: 'http://127.0.0.1:11434',
      embedModel: 'qwen3-embedding:8b',
      /** @type {(task: string, query: string) => string} */
      embedPrompt: (_task, query) => query,

      chunkLimit: 12,
      hybrid: true,
      fts: true,
      ftsWeight: 0.35,
      titleBoost: 0.25,
      textBoost: 0.10,
      ftsWeightBump: 0.15,
      maxContextTokens: 4096,
      maxPerSource: Infinity,
      batch: 8,

      ignoreSlugs: [],
      ignoreTags: [],
      bootstrapIndexOnStartup: true,
      rebuildIndexOnStartup: false,

      attachmentsRoot: './site/uploads',
      includeAttachments: true,
      tableToCSV: false,
      tableMaxRowsPerChunk: Infinity,
      tableMaxTokensPerChunk: 1000,
      ...config,
    };

    this.openDatabase().close();
  }

  /**
   * Open the SQLite database and create core tables.
   *
   * @returns {import('better-sqlite3').Database} The database.
   */
  openDatabase = () => {
    const options = {
      ...(this.config.databaseOptions ?? {}),
      ...(this.config.databseOptions ?? {}),
    };

    debug('openDatabase:', this.config.databasePath);
    fs.mkdirSync(path.dirname(this.config.databasePath), { recursive: true });

    /** @type {import('better-sqlite3').Database} */
    const db = new Database(this.config.databasePath, options);
    sqliteVec.load(db);

    db.pragma('journal_mode = WAL');
    db.pragma('synchronous = NORMAL');

    db.exec(`
      CREATE TABLE IF NOT EXISTS documents (
        slug TEXT PRIMARY KEY,
        title TEXT,
        content TEXT,
        tags TEXT,
        createDate INTEGER,
        updateDate INTEGER,
        data_json TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_documents_title
        ON documents(title COLLATE NOCASE);

      CREATE INDEX IF NOT EXISTS idx_documents_createDate
        ON documents(createDate);

      CREATE INDEX IF NOT EXISTS idx_documents_updateDate
        ON documents(updateDate);

      CREATE TABLE IF NOT EXISTS document_history (
        slug TEXT NOT NULL,
        revision TEXT NOT NULL,
        createDate INTEGER NOT NULL,
        data_json TEXT NOT NULL,
        PRIMARY KEY (slug, revision)
      );

      CREATE INDEX IF NOT EXISTS idx_document_history_slug
        ON document_history(slug);

      CREATE INDEX IF NOT EXISTS idx_document_history_createDate
        ON document_history(createDate);

      CREATE TABLE IF NOT EXISTS uttori_sources (
        id TEXT PRIMARY KEY,
        slug TEXT,
        title TEXT,
        update_date INTEGER,
        meta_json TEXT,
        content_hash TEXT
      );

      CREATE TABLE IF NOT EXISTS uttori_chunks (
        source_id TEXT NOT NULL,
        idx INTEGER NOT NULL,
        text TEXT NOT NULL,
        token_count INTEGER NOT NULL,
        meta_json TEXT,
        FOREIGN KEY(source_id) REFERENCES uttori_sources(id)
      );

      CREATE INDEX IF NOT EXISTS idx_uttori_sources_slug
        ON uttori_sources(slug);

      CREATE INDEX IF NOT EXISTS idx_uttori_chunks_source_id
        ON uttori_chunks(source_id);
    `);

    return db;
  };

  /**
   * Normalize a SQLite row into an Uttori Wiki document.
   *
   * @param {SearchSQLiteDocumentRow | undefined} row The database row.
   * @returns {import('../../wiki.js').UttoriWikiDocument | undefined} The document.
   */
  rowToDocument = (row) => {
    if (!row?.data_json || typeof row.data_json !== 'string') {
      return undefined;
    }

    try {
      return /** @type {import('../../wiki.js').UttoriWikiDocument} */ (JSON.parse(row.data_json));
    } catch (error) {
      debug('rowToDocument: error parsing document:', error);
      return undefined;
    }
  };

  /**
   * Persist a document row.
   *
   * @param {import('../../wiki.js').UttoriWikiDocument} document The document to persist.
   * @param {import('better-sqlite3').Database} [database] An optional existing database connection.
   * @returns {void}
   */
  saveDocument = (document, database) => {
    const db = database ?? this.openDatabase();

    try {
      db.prepare(`
        INSERT INTO documents(slug, title, content, tags, createDate, updateDate, data_json)
        VALUES (@slug, @title, @content, @tags, @createDate, @updateDate, @data_json)
        ON CONFLICT(slug) DO UPDATE SET
          title = excluded.title,
          content = excluded.content,
          tags = excluded.tags,
          createDate = excluded.createDate,
          updateDate = excluded.updateDate,
          data_json = excluded.data_json
      `).run({
        slug: document.slug,
        title: document.title ?? '',
        content: document.content ?? '',
        tags: JSON.stringify(document.tags ?? []),
        createDate: document.createDate ?? null,
        updateDate: document.updateDate ?? null,
        data_json: JSON.stringify(document),
      });
    } finally {
      if (!database) {
        db.close();
      }
    }
  };

  /**
   * Escapes a SQLite LIKE value.
   *
   * @param {string} value The value to escape.
   * @returns {string} The escaped value.
   */
  escapeLike = (value) => `${value}`.replaceAll('\\', '\\\\').replaceAll('%', '\\%').replaceAll('_', '\\_');

  /**
   * Returns a safe JSON path expression for a document field.
   *
   * @param {string} field The field.
   * @returns {string} The JSON path.
   */
  jsonPath = (field) => `$.${field.replaceAll('"', '\\"')}`;

  /**
   * Returns the SQL expression for a document field.
   *
   * @param {string} field The field.
   * @returns {string} The SQL expression.
   */
  fieldExpression = (field) => {
    switch (field) {
      case 'slug':
      case 'title':
      case 'content':
      case 'tags':
      case 'createDate':
      case 'updateDate':
        return field;
      default:
        return `json_extract(data_json, '${this.jsonPath(field)}')`;
    }
  };

  /**
   * Converts a value into a SQLite value.
   *
   * @param {unknown} value The value.
   * @returns {unknown} The SQLite value.
   */
  toSqlValue = (value) => {
    if (Array.isArray(value) || (value && typeof value === 'object')) {
      return JSON.stringify(value);
    }

    return value;
  };

  /**
   * Converts a parsed WHERE AST into SQLite SQL.
   *
   * @param {SqlWhereParserAst} ast The parsed WHERE AST.
   * @param {unknown[]} values The values to bind.
   * @returns {string} The SQL WHERE clause.
   */
  astToSql = (ast, values) => {
    const operations = Object.entries(ast).map(([key, rawOperands]) => {
      const operands = toAstOperands(rawOperands);
      switch (key) {
        case 'AND':
        case 'OR': {
          const subQueries = operands
            .filter(subQuery => typeof subQuery === 'object' && subQuery !== null && !Array.isArray(subQuery))
            .map(subQuery => /** @type {SqlWhereParserAst} */ (subQuery));
          const joiner = key === 'AND' ? ' AND ' : ' OR ';
          return `(${subQueries.map(subQuery => this.astToSql(subQuery, values)).join(joiner)})`;
        }

        case 'BETWEEN': {
          const field = toFieldName(operands[0]);
          const min = operands[1];
          const max = operands[2];
          values.push(this.toSqlValue(min), this.toSqlValue(max));
          return `(${this.fieldExpression(field)} BETWEEN ? AND ?)`;
        }

        case 'IN': {
          const field = toFieldName(operands[0]);
          const list = operands[1];
          const valuesList = Array.isArray(list) ? list : [list];

          if (valuesList.length === 0) {
            return '(0 = 1)';
          }

          values.push(...valuesList.map(value => this.toSqlValue(value)));
          return `(${this.fieldExpression(field)} IN (${valuesList.map(() => '?').join(', ')}))`;
        }

        case 'NOT_IN': {
          const field = toFieldName(operands[0]);
          const list = operands[1];
          const valuesList = Array.isArray(list) ? list : [list];

          if (valuesList.length === 0) {
            return `(${this.fieldExpression(field)} IS NOT NULL)`;
          }

          values.push(...valuesList.map(value => this.toSqlValue(value)));
          return `(${this.fieldExpression(field)} IS NOT NULL AND ${this.fieldExpression(field)} NOT IN (${valuesList.map(() => '?').join(', ')}))`;
        }

        case 'INCLUDES': {
          const field = toFieldName(operands[0]);
          const list = operands[1];
          const valuesList = Array.isArray(list) ? list : [list];

          if (valuesList.length === 0) {
            return '(0 = 1)';
          }

          values.push(...valuesList.map(value => this.toSqlValue(value)));

          return `(
            EXISTS (
              SELECT 1
              FROM json_each(${this.fieldExpression(field)})
              WHERE json_each.value IN (${valuesList.map(() => '?').join(', ')})
            )
          )`;
        }

        case 'EXCLUDES': {
          const field = toFieldName(operands[0]);
          const list = operands[1];
          const valuesList = Array.isArray(list) ? list : [list];

          if (valuesList.length === 0) {
            return '(1 = 1)';
          }

          values.push(...valuesList.map(value => this.toSqlValue(value)));

          return `(
            NOT EXISTS (
              SELECT 1
              FROM json_each(${this.fieldExpression(field)})
              WHERE json_each.value IN (${valuesList.map(() => '?').join(', ')})
            )
          )`;
        }

        case 'IS_NULL': {
          const field = toFieldName(operands[0]);
          return `(${this.fieldExpression(field)} IS NULL OR ${this.fieldExpression(field)} = '')`;
        }

        case 'IS_NOT_NULL': {
          const field = toFieldName(operands[0]);
          return `(${this.fieldExpression(field)} IS NOT NULL AND ${this.fieldExpression(field)} != '')`;
        }

        case 'LIKE': {
          const field = toFieldName(operands[0]);
          const value = operands[1];
          values.push(`%${this.escapeLike(String(value ?? ''))}%`);
          return `(${this.fieldExpression(field)} LIKE ? ESCAPE '\\')`;
        }

        case '=':
        case 'IS': {
          const field = toFieldName(operands[0]);
          const value = operands[1];
          values.push(this.toSqlValue(value));
          return `(${this.fieldExpression(field)} = ?)`;
        }

        case '!=': {
          const field = toFieldName(operands[0]);
          const value = operands[1];
          values.push(this.toSqlValue(value));
          return `(${this.fieldExpression(field)} IS NOT NULL AND ${this.fieldExpression(field)} != ?)`;
        }

        case '<':
        case '>':
        case '>=':
        case '<=': {
          const field = toFieldName(operands[0]);
          const value = operands[1];
          values.push(this.toSqlValue(value));
          return `(${this.fieldExpression(field)} ${key} ?)`;
        }

        default:
          debug('astToSql: Uncaught key:', key);
          return '(1 = 1)';
      }
    });

    return operations.length > 0 ? operations.join(' AND ') : '1 = 1';
  };

  /**
   * Build a SQLite query from the storage-provider SQL-like query syntax.
   *
   * @param {string} query The SQL-like storage query.
   * @returns {{ sql: string, values: unknown[], countOnly: boolean, fields: string[] }} The SQLite query data.
   */
  buildStorageQuery = (query) => {
    const { fields, where, order, limit } = validateQuery(query);
    const values = [];
    const countOnly = fields.includes('COUNT(*)');

    const select = countOnly
      ? 'COUNT(*) AS count'
      : fields.includes('*')
        ? 'data_json'
        : fields.map((field) => `${this.fieldExpression(field)} AS "${field}"`).join(', ');

    const whereSql = this.astToSql(where, values);

    const orderSql = order[0]?.prop === 'RANDOM'
      ? 'RANDOM()'
      : order.map(({ prop, sort }) => `${this.fieldExpression(prop)} ${sort}`).join(', ');

    const limitSql = limit > 0 ? 'LIMIT ?' : '';
    if (limit > 0) {
      values.push(limit);
    }

    return {
      sql: `
        SELECT ${select}
        FROM documents
        WHERE ${whereSql}
        ORDER BY ${orderSql}
        ${limitSql}
      `,
      values,
      countOnly,
      fields,
    };
  };

  /**
   * Adds a history entry for a document.
   *
   * @param {object} params The params object.
   * @param {string} params.slug The slug of the document to update history for.
   * @param {import('../../wiki.js').UttoriWikiDocument} params.content The revision of the document to be saved.
   * @param {string} [params.originalSlug] The original slug identifying the document, or the slug if it has not changed.
   * @param {import('better-sqlite3').Database} [database] An optional existing database connection.
   * @returns {Promise<void>}
   */
  updateHistory = async ({ slug, content, originalSlug }, database) => {
    debug('updateHistory:', slug, originalSlug);

    if (!slug || !content) {
      return;
    }

    const db = database ?? this.openDatabase();

    try {
      if (slug && originalSlug && originalSlug !== slug) {
        db.prepare('UPDATE document_history SET slug = ? WHERE slug = ?').run(slug, originalSlug);
      }

      const date = Date.now();
      const random = Math.random().toString(36).slice(8);
      const revision = `${date}-${random}`;

      db.prepare(`
        INSERT INTO document_history(slug, revision, createDate, data_json)
        VALUES (?, ?, ?, ?)
      `).run(slug, revision, date, JSON.stringify(content));
    } finally {
      if (!database) {
        db.close();
      }
    }
  };

  /**
   * Returns all documents.
   *
   * @returns {Promise<Record<string, import('../../wiki.js').UttoriWikiDocument>>} All documents.
   */
  all = async () => {
    debug('all');
    const db = this.openDatabase();

    try {
      const rows = /** @type {SearchSQLiteSlugRow[]} */ (db.prepare('SELECT slug, data_json FROM documents ORDER BY title COLLATE NOCASE ASC, slug ASC').all());

      return rows.reduce((output, row) => {
        const document = this.rowToDocument(row);
        if (document?.slug) {
          output[document.slug] = document;
        }
        return output;
      }, /** @type {Record<string, import('../../wiki.js').UttoriWikiDocument>} */ ({}));
    } finally {
      db.close();
    }
  };

  /**
   * Returns all documents matching a given query using SQLite directly.
   *
   * @param {string} query The conditions on which documents should be returned.
   * @returns {Promise<import('../../wiki.js').UttoriWikiDocument[]|number>} The items matching the supplied query.
   */
  getQuery = async (query) => {
    debug('getQuery:', query);

    const db = this.openDatabase();

    try {
      const { sql, values, countOnly, fields } = this.buildStorageQuery(query);
      const rows = db.prepare(sql).all(...values);

      if (countOnly) {
        const countRow = /** @type {SearchSQLiteCountRow | undefined} */ (rows[0]);
        return countRow?.count ?? 0;
      }

      if (fields.includes('*')) {
        return rows
          .map(row => this.rowToDocument(/** @type {SearchSQLiteDocumentRow} */ (row)))
          .filter(document => document !== undefined);
      }

      return /** @type {import('../../wiki.js').UttoriWikiDocument[]} */ (rows.map((row) => {
        /** @type {Record<string, unknown>} */
        const output = {};

        for (const [key, value] of Object.entries(/** @type {Record<string, unknown>} */ (row))) {
          if (key === 'tags' && typeof value === 'string') {
            try {
              output[key] = JSON.parse(value);
            } catch {
              output[key] = value;
            }
          } else {
            output[key] = value;
          }
        }

        return output;
      }));
    } finally {
      db.close();
    }
  };

  /**
   * Returns a document for a given slug.
   *
   * @param {string} slug The slug of the document to be returned.
   * @returns {Promise<import('../../wiki.js').UttoriWikiDocument | undefined>} The returned UttoriDocument.
   */
  get = async (slug) => {
    debug('get:', slug);

    if (!slug) {
      debug('get: Cannot get document without slug.');
      return undefined;
    }

    const db = this.openDatabase();

    try {
      const row = /** @type {SearchSQLiteDocumentRow | undefined} */ (db.prepare('SELECT data_json FROM documents WHERE slug = ?').get(slug));
      const document = this.rowToDocument(row);

      if (!document) {
        debug('get: No document found:', slug);
      }

      return document ? { ...document } : undefined;
    } finally {
      db.close();
    }
  };

  /**
   * Returns the history of edits for a given slug.
   *
   * @param {string} slug The slug of the document to get history for.
   * @returns {Promise<string[]>} The returned history object.
   */
  getHistory = async (slug) => {
    debug('getHistory:', slug);

    if (!slug) {
      debug('getHistory: Cannot get document history without slug.');
      return [];
    }

    const db = this.openDatabase();

    try {
      const rows = /** @type {SearchSQLiteRevisionRow[]} */ (db.prepare(`
        SELECT revision
        FROM document_history
        WHERE slug = ?
        ORDER BY createDate ASC
      `).all(slug));

      return rows.map(row => row.revision);
    } finally {
      db.close();
    }
  };

  /**
   * Returns a specific revision from the history of edits for a given slug and revision timestamp.
   *
   * @param {object} params The params object.
   * @param {string} params.slug The slug of the document to be returned.
   * @param {string|number} params.revision The revision to be returned.
   * @returns {Promise<import('../../wiki.js').UttoriWikiDocument | undefined>} The returned revision of the document.
   */
  getRevision = async ({ slug, revision }) => {
    debug('getRevision:', slug, revision);

    if (!slug) {
      debug('getRevision: Cannot get document history without slug.');
      return undefined;
    }

    if (!revision) {
      debug('getRevision: Cannot get document history without revision.');
      return undefined;
    }

    const db = this.openDatabase();

    try {
      const row = /** @type {SearchSQLiteDocumentRow | undefined} */ (db.prepare(`
        SELECT data_json
        FROM document_history
        WHERE slug = ? AND revision = ?
      `).get(slug, String(revision)));

      const document = this.rowToDocument(row);

      if (!document) {
        debug(`getRevision: Document history not found for "${slug}", with revision "${revision}"`);
        return undefined;
      }

      return document;
    } finally {
      db.close();
    }
  };

  /**
   * Saves a document to SQLite.
   *
   * @param {import('../../wiki.js').UttoriWikiDocument} document The document to be added to the collection.
   * @param {SearchSQLiteContext} [context] A Uttori-like context.
   * @returns {Promise<void>}
   */
  add = async (document, context) => {
    debug('add:', document?.slug);

    if (!document || !document.slug) {
      debug('add: Cannot add, missing slug.');
      return;
    }

    const existing = await this.get(document.slug);

    if (existing) {
      debug('add: Cannot add, existing document:', document.slug);
      return;
    }

    const db = this.openDatabase();

    try {
      const date = document.createDate || Date.now();
      const nextDocument = {
        ...document,
        createDate: date,
        updateDate: document.updateDate || date,
      };

      this.saveDocument(nextDocument, db);

      if (this.config.useHistory) {
        await this.updateHistory({ slug: nextDocument.slug, content: nextDocument }, db);
      }

      await this.indexDocument(nextDocument, context, db);
    } finally {
      db.close();
    }
  };

  /**
   * Updates a document and saves it to SQLite.
   *
   * @param {object} params The params object.
   * @param {import('../../wiki.js').UttoriWikiDocument} params.document The document to be updated in the collection.
   * @param {string} [params.originalSlug] The original slug identifying the document, or the slug if it has not changed.
   * @param {SearchSQLiteContext} [context] A Uttori-like context.
   * @returns {Promise<void>}
   */
  update = async ({ document, originalSlug }, context) => {
    debug('update:', document?.slug, originalSlug);

    if (!document || !document.slug) {
      debug('update: Cannot update, missing slug.');
      return;
    }

    const existing = await this.get(document.slug);
    const original = originalSlug ? await this.get(originalSlug) : undefined;

    if (existing && original && original.slug !== existing.slug) {
      debug(`update: Cannot update, existing document with slug "${document.slug}".`);
      return;
    }

    if (!existing && !original) {
      debug(`update: No document found to update with slug "${originalSlug || ''}", adding document with slug "${document.slug}".`);
      await this.add(document, context);
      return;
    }

    const db = this.openDatabase();

    try {
      const nextDocument = {
        ...document,
        updateDate: this.config.updateTimestamps ? Date.now() : document.updateDate,
      };

      if (originalSlug && originalSlug !== nextDocument.slug) {
        db.prepare('DELETE FROM documents WHERE slug = ?').run(originalSlug);
        removeIndexedDocumentFromDatabase(db, originalSlug);
      }

      this.saveDocument(nextDocument, db);

      if (this.config.useHistory) {
        await this.updateHistory({
          slug: nextDocument.slug,
          content: nextDocument,
          originalSlug,
        }, db);
      }

      await this.indexDocument(nextDocument, context, db);
    } finally {
      db.close();
    }
  };

  /**
   * Removes a document from SQLite.
   *
   * @param {string|import('../../wiki.js').UttoriWikiDocument} slug The slug identifying the document.
   * @returns {Promise<void>}
   */
  delete = async (slug) => {
    const sourceSlug = typeof slug === 'string' ? slug : slug?.slug;
    debug('delete:', sourceSlug);

    if (!sourceSlug) {
      debug('delete: Cannot delete without slug.');
      return;
    }

    const existing = await this.get(sourceSlug);
    const db = this.openDatabase();

    try {
      if (existing && this.config.useHistory) {
        await this.updateHistory({ slug: sourceSlug, content: existing }, db);
      }

      db.prepare('DELETE FROM documents WHERE slug = ?').run(sourceSlug);
      removeIndexedDocumentFromDatabase(db, sourceSlug);
    } finally {
      db.close();
    }
  };

  /**
   * Resets to the initial state.
   *
   * @returns {void}
   */
  reset = () => {
    debug('reset');
    const db = this.openDatabase();

    try {
      db.exec(`
        DELETE FROM document_history;
        DELETE FROM documents;
        DELETE FROM uttori_chunks;
        DELETE FROM uttori_sources;
      `);

      try {
        db.exec('DELETE FROM uttori_chunks_vec;');
      } catch (error) {
        debug('reset: vector cleanup skipped:', error);
      }

      try {
        db.exec('DELETE FROM uttori_chunks_fts;');
      } catch (error) {
        debug('reset: fts cleanup skipped:', error);
      }
    } finally {
      db.close();
    }
  };

  /**
   * Bootstrap the search index at startup when configured.
   *
   * @param {unknown} _data Unused.
   * @param {SearchSQLiteContext} context A Uttori-like context.
   * @returns {Promise<void>}
   */
  bootstrapIndex = async (_data, context) => {
    debug('bootstrapIndex');

    if (!this.config.bootstrapIndexOnStartup && !this.config.rebuildIndexOnStartup) {
      return;
    }

    const db = this.openDatabase();

    try {
      const vectorTable = db.prepare('SELECT name FROM sqlite_master WHERE type = ? AND name = ?').get('table', 'uttori_chunks_vec');

      if (this.config.rebuildIndexOnStartup || !vectorTable) {
        await this.buildIndex(undefined, context);
      }
    } finally {
      db.close();
    }
  };

  /**
   * Rebuild the search index of documents.
   *
   * @param {unknown} _data Unused.
   * @param {SearchSQLiteContext} context A Uttori-like context.
   * @returns {Promise<void>}
   */
  buildIndex = async (_data, context) => {
    debug('buildIndex');

    const db = this.openDatabase();

    try {
      const { embedder } = await ensureChatIndexSchema(db, this.config, { rebuild: true });
      const documents = await this.loadIndexableDocuments(context);

      debug('buildIndex: documents:', documents.length);

      // Full rebuild: the chunk tables were just cleared by ensureChatIndexSchema, so clear the
      // document mirror too and repopulate it as we index, keeping `listDocuments` consistent.
      db.prepare('DELETE FROM documents').run();

      let totalChunks = 0;
      let skipped = 0;
      let errored = 0;

      for (const document of documents) {
        if (!document) {
          continue;
        }

        const result = await indexDocumentInDatabase(db, this.config, embedder, document);
        this.saveDocument(document, db);
        totalChunks += result.chunks;
        skipped += result.skipped ? 1 : 0;
        errored += result.errored;
      }

      debug(`buildIndex: Done. Chunks indexed: ${totalChunks}. Unchanged skipped: ${skipped}. Errored: ${errored}.`);
    } finally {
      db.close();
    }
  };

  /**
   * Load all documents that should be indexed.
   *
   * @param {SearchSQLiteContext} context A Uttori-like context.
   * @returns {Promise<import('../../wiki.js').UttoriWikiDocument[]>} The documents.
   */
  loadIndexableDocuments = async (context) => {
    const notIn = `"${this.config.ignoreSlugs.join('", "')}"`;
    const excludedTags = `"${this.config.ignoreTags.join('", "')}"`;
    const query = `SELECT * FROM documents WHERE slug NOT_IN (${notIn}) AND tags EXCLUDES (${excludedTags}) ORDER BY createDate DESC LIMIT -1`;

    try {
      if (context?.hooks?.fetch) {
        const [documents] = await context.hooks.fetch('storage-query', query, context);

        if (Array.isArray(documents)) {
          return /** @type {import('../../wiki.js').UttoriWikiDocument[]} */ (documents);
        }
      }
    } catch (error) {
      debug('loadIndexableDocuments: storage-query failed, falling back to local SQLite store:', error);
    }

    return this.filterIndexableDocuments(Object.values(await this.all()));
  };

  /**
   * Filter documents using configured ignore lists.
   *
   * @param {import('../../wiki.js').UttoriWikiDocument[]} documents The documents.
   * @returns {import('../../wiki.js').UttoriWikiDocument[]} The filtered documents.
   */
  filterIndexableDocuments = (documents) => {
    return documents.filter((document) => {
      if (!document?.slug) {
        return false;
      }

      if (this.config.ignoreSlugs.includes(document.slug)) {
        return false;
      }

      const tags = Array.isArray(document.tags) ? document.tags : [];
      return !tags.some(tag => this.config.ignoreTags.includes(tag));
    });
  };

  /**
   * Index one document.
   *
   * @param {import('../../wiki.js').UttoriWikiDocument} document The document to index.
   * @param {SearchSQLiteContext} [_context] A Uttori-like context.
   * @param {import('better-sqlite3').Database} [database] An optional existing database connection.
   * @returns {Promise<void>}
   */
  indexDocument = async (document, _context, database) => {
    if (!document?.slug) {
      return;
    }

    const ignoredSlug = this.config.ignoreSlugs.includes(document.slug);
    const tags = Array.isArray(document.tags) ? document.tags : [];
    const ignoredTag = tags.some(tag => this.config.ignoreTags.includes(tag));

    const db = database ?? this.openDatabase();

    try {
      if (ignoredSlug || ignoredTag) {
        removeIndexedDocumentFromDatabase(db, document.slug);
        // Keep the `documents` mirror (read by `listDocuments`) in sync with the chunk index.
        db.prepare('DELETE FROM documents WHERE slug = ?').run(document.slug);
        return;
      }

      const { embedder } = await ensureChatIndexSchema(db, this.config);
      await indexDocumentInDatabase(db, this.config, embedder, document);
      // Mirror the document metadata so `listDocuments` works even when the storage `add` hook is
      // not bound to this provider (i.e. search-only deployments alongside another storage provider).
      this.saveDocument(document, db);
    } catch (error) {
      debug('indexDocument: error indexing document:', error);
    } finally {
      if (!database) {
        db.close();
      }
    }
  };

  /**
   * Adds documents to the index.
   *
   * @param {import('../../wiki.js').UttoriWikiDocument|import('../../wiki.js').UttoriWikiDocument[]} documents An array of documents to be indexed.
   * @param {SearchSQLiteContext} context A Uttori-like context.
   * @returns {Promise<void>}
   */
  indexAdd = async (documents, context) => {
    debug('indexAdd');

    const items = Array.isArray(documents) ? documents : [documents];

    for (const document of items) {
      await this.indexDocument(document, context);
    }
  };

  /**
   * Updates documents in the index.
   *
   * @param {SearchSQLiteIndexUpdate | import('../../wiki.js').UttoriWikiDocument | Array<SearchSQLiteIndexUpdate | import('../../wiki.js').UttoriWikiDocument>} payload An array of documents to be indexed or update payloads.
   * @param {SearchSQLiteContext} context A Uttori-like context.
   * @returns {Promise<void>}
   */
  indexUpdate = async (payload, context) => {
    debug('indexUpdate');

    /** @type {Array<SearchSQLiteIndexUpdate | import('../../wiki.js').UttoriWikiDocument>} */
    const updates = Array.isArray(payload) ? payload : [payload];

    for (const update of updates) {
      /** @type {import('../../wiki.js').UttoriWikiDocument} */
      const document = 'document' in update && update.document
        ? update.document
        : /** @type {import('../../wiki.js').UttoriWikiDocument} */ (update);
      const originalSlug = 'originalSlug' in update ? update.originalSlug : undefined;

      if (!document?.slug) {
        continue;
      }

      if (originalSlug && originalSlug !== document.slug) {
        await this.indexRemove(originalSlug, context);
      }

      await this.indexDocument(document, context);
    }
  };

  /**
   * Removes documents from the index.
   *
   * @param {string|import('../../wiki.js').UttoriWikiDocument|string[]|import('../../wiki.js').UttoriWikiDocument[]} documents An array of documents to be removed.
   * @param {SearchSQLiteContext} [_context] A Uttori-like context.
   * @returns {Promise<void>}
   */
  indexRemove = async (documents, _context) => {
    debug('indexRemove:', documents);

    const items = Array.isArray(documents) ? documents : [documents];
    const db = this.openDatabase();

    try {
      for (const document of items) {
        const slug = typeof document === 'string' ? document : document?.slug;

        if (slug) {
          removeIndexedDocumentFromDatabase(db, slug);
          // Keep the `documents` mirror (read by `listDocuments`) in sync with the chunk index.
          db.prepare('DELETE FROM documents WHERE slug = ?').run(slug);
        }
      }
    } finally {
      db.close();
    }
  };

  /**
   * Retrieve scored search chunks for RAG consumers.
   *
   * @param {SearchSQLiteConfigSearchOptions|string} options The search options or query.
   * @returns {Promise<import('../search-provider-sqlite.js').RetrieveResponse>} The retrieval result.
   */
  retrieve = async (options) => {
    const query = typeof options === 'string' ? options : options?.query;
    const slugs = typeof options === 'string' ? [] : options?.slugs ?? [];
    const limit = typeof options === 'string' ? undefined : options?.limit;

    debug('retrieve:', { query, slugs, limit });

    if (!query) {
      return { query: '', chunks: [], citations: [] };
    }

    return retrieveFromDatabase(query, {
      ...this.config,
      chunkLimit: limit ?? this.config.chunkLimit,
    }, slugs);
  };

  /**
   * Searches for documents matching the provided query with SQLite FTS first,
   * then falls back to LIKE matching when the vector / FTS index is unavailable.
   *
   * @param {SearchSQLiteConfigSearchOptions} options The passed in options.
   * @param {SearchSQLiteContext} [_context] A Uttori-like context.
   * @returns {Promise<import('../../wiki.js').UttoriWikiDocument[]>} Returns an array of search results no longer than limit.
   */
  internalSearch = async ({ query, limit = 100, slugs = [] }, _context) => {
    debug('internalSearch:', { query, limit, slugs });

    if (!query) {
      return [];
    }

    const db = this.openDatabase();

    try {
      try {
        const slugWhere = slugs.length > 0
          ? `AND s.slug IN (${slugs.map(() => '?').join(', ')})`
          : '';

        const rows = db.prepare(`
          SELECT
            d.data_json,
            MIN(fts.rank) AS rank
          FROM uttori_chunks_fts AS fts
          JOIN uttori_chunks AS c ON c.rowid = fts.rowid
          JOIN uttori_sources AS s ON s.id = c.source_id
          JOIN documents AS d ON d.slug = s.slug
          WHERE uttori_chunks_fts MATCH ?
          ${slugWhere}
          GROUP BY d.slug
          ORDER BY rank ASC, d.updateDate DESC
          LIMIT ?
        `).all(query, ...slugs, limit);

        if (rows.length > 0) {
          return rows
            .map(row => this.rowToDocument(/** @type {SearchSQLiteDocumentRow} */ (row)))
            .filter(document => document !== undefined);
        }
      } catch (error) {
        debug('internalSearch: FTS query failed, falling back to document LIKE query:', error);
      }

      const like = `%${this.escapeLike(query)}%`;
      const slugWhere = slugs.length > 0
        ? `AND slug IN (${slugs.map(() => '?').join(', ')})`
        : '';

      const rows = db.prepare(`
        SELECT data_json
        FROM documents
        WHERE (
          title LIKE ? ESCAPE '\\'
          OR content LIKE ? ESCAPE '\\'
          OR data_json LIKE ? ESCAPE '\\'
        )
        ${slugWhere}
        ORDER BY
          CASE
            WHEN title LIKE ? ESCAPE '\\' THEN 0
            WHEN content LIKE ? ESCAPE '\\' THEN 1
            ELSE 2
          END ASC,
          updateDate DESC
        LIMIT ?
      `).all(like, like, like, ...slugs, like, like, limit);

      return rows
        .map(row => this.rowToDocument(/** @type {SearchSQLiteDocumentRow} */ (row)))
        .filter(document => document !== undefined);
    } finally {
      db.close();
    }
  };

  /**
   * External method for searching documents matching the provided query and updates the count for the query used.
   *
   * @param {SearchSQLiteConfigSearchOptions} options The passed in options.
   * @param {SearchSQLiteContext} context A Uttori-like context.
   * @returns {Promise<import('../../wiki.js').UttoriWikiDocument[]>} Returns an array of search results no longer than limit.
   */
  search = async ({ query, limit = 100, slugs = [] }, context) => {
    debug('search:', query, limit, slugs);
    this.updateTermCount(query);
    return this.internalSearch({ query, limit, slugs }, context);
  };

  /**
   * Handle requests to fetch available documents for document selectors.
   *
   * @returns {Promise<Array<{id: string, slug: string, title: string, update_date: number}>>} The documents.
   */
  listDocuments = async () => {
    debug('listDocuments');

    const db = this.openDatabase();

    try {
      return /** @type {Array<{id: string, slug: string, title: string, update_date: number}>} */ (db.prepare(`
        SELECT
          slug AS id,
          slug,
          title,
          updateDate AS update_date
        FROM documents
        ORDER BY title COLLATE NOCASE ASC, slug ASC
      `).all());
    } finally {
      db.close();
    }
  };

  /**
   * Updates the search query in the query counts.
   *
   * @param {string} query The query to increment.
   * @returns {void}
   */
  updateTermCount = (query) => {
    debug('updateTermCount:', query);

    if (!query) {
      return;
    }

    if (this.searchTerms[query]) {
      this.searchTerms[query]++;
    } else {
      this.searchTerms[query] = 1;
    }
  };

  /**
   * Returns the most popular search terms.
   *
   * @param {SearchSQLiteConfigSearchOptions} options The passed in options.
   * @returns {string[]} Returns an array of search results no longer than limit.
   */
  getPopularSearchTerms = ({ limit = 10 }) => {
    debug('getPopularSearchTerms:', { limit });

    const output = Object.keys(this.searchTerms)
      .sort((a, b) => this.searchTerms[b] - this.searchTerms[a])
      .slice(0, limit);

    debug('getPopularSearchTerms:', output);
    return output;
  };
}

export default SearchProviderSQLite;
