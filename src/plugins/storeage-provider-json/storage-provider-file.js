import { promises as fs } from 'node:fs';
import sanitize from 'sanitize-filename';
import path from 'node:path';
import processQuery from './query-tools.js';

let debug = (..._) => {};
/* c8 ignore next 2 */

try { const { default: d } = await import('debug'); debug = d('Uttori.StorageProvider.JSON'); } catch {}

/**
 * @typedef StorageProviderJsonFileConfig The configuration object for the StorageProviderJsonFile.
 * @property {string} contentDirectory The directory to store documents.
 * @property {string} historyDirectory The directory to store document histories.
 * @property {string} [extension] The file extension to use for file.
 * @property {boolean} [updateTimestamps] Should update times be marked at the time of edit.
 * @property {boolean} [useHistory] Should history entries be created.
 * @property {boolean} [useCache] Should we cache files in memory?
 * @property {number} [spacesDocument] The spaces parameter for JSON stringifying documents.
 * @property {number} [spacesHistory] The spaces parameter for JSON stringifying history.
 * @property {Record<string, string[]>} [events] The events to listen for.
 */

/**
 * Storage for Uttori documents using JSON files stored on the local file system.
 * @property {StorageProviderJsonFileConfig} config The configuration object.
 * @property {Record<string, import('./wiki.js').UttoriWikiDocument>} documents The collection of documents where the slug is the key and the value is the document.
 * @example <caption>Init StorageProviderJsonFile</caption>
 * const storageProvider = new StorageProviderJsonFile({ contentDirectory: 'content', historyDirectory: 'history', spacesDocument: 2 });
 * @class
 */
class StorageProviderJsonFile {
/**
 * Creates an instance of StorageProvider.
 * @param {StorageProviderJsonFileConfig} config - A configuration object.
 * @class
 */
  constructor(config) {
    debug('constructor', config);
    if (!config) {
      debug('No config provided.');
      throw new Error('No config provided.');
    }
    if (!config.contentDirectory) {
      debug('No content directory provided.');
      throw new Error('No content directory provided.');
    }
    if (!config.historyDirectory) {
      debug('No history directory provided.');
      throw new Error('No history directory provided.');
    }

    this.config = {
      extension: 'json',
      updateTimestamps: true,
      useHistory: true,
      useCache: true,
      spacesDocument: undefined,
      spacesHistory: undefined,
      ...config,
    };

    this.refresh = true;
    /** @type {Record<string, import('../../wiki.js').UttoriWikiDocument>} The collection of documents where the slug is the key and the value is the document. */
    this.documents = {};

    // Ensure the directories exist.

    StorageProviderJsonFile.ensureDirectory(this.config.contentDirectory).catch(console.error);

    StorageProviderJsonFile.ensureDirectory(this.config.historyDirectory).catch(console.error);
  }

  /**
   * Returns all documents.
   * @returns {Promise<Record<string, import('../../wiki.js').UttoriWikiDocument>>} All documents.
   * @example
   * storageProvider.all();
   * ➜ { first-document: { slug: 'first-document', ... }, ...}
   */
  all = async () => {
    debug('all');
    if (this.config.useCache && this.refresh === false) {
      return this.documents;
    }

    /** @type {Record<string, import('../../wiki.js').UttoriWikiDocument>} */
    const documents = {};
    try {
      const fileNames = await fs.readdir(this.config.contentDirectory);
      const validFiles = fileNames.filter((name) => (name.length >= 6) && name.endsWith(this.config.extension));
      for (const name of validFiles) {
        const file = path.join(this.config.contentDirectory, name);
        debug('all: Reading', file);

        const content = await fs.readFile(file, 'utf8');
        /** @type {import('../../wiki.js').UttoriWikiDocument} */
        const data = JSON.parse(content);
        documents[data.slug] = data;
      }
      // TODO: This is resolving out of order or with an extra document.
      // const readPromises = validFiles.map(async (name) => {
      //   const file = path.join(this.config.contentDirectory, name);
      //   const content = await fs.readFile(file, 'utf8');
      //   /** @type {import('../../wiki.js').UttoriWikiDocument} */
      //   const data = JSON.parse(content);
      //   documents[data.slug] = data;
      // });
      // await Promise.all(readPromises);
      debug('all: found', Object.values(documents).length);
      if (this.config.useCache) {
        this.documents = documents;
        this.refresh = false;
      }
    } /* c8 ignore next 2 */ catch (error) {
      debug('all: Error:', error);
    }
    return documents;
  };

  /**
   * Returns all documents matching a given query.
   * @async
   * @param {string} query The conditions on which documents should be returned.
   * @returns {Promise<import('../../wiki.js').UttoriWikiDocument[]|number>} Promise object represents all matching documents.
   */
  getQuery = async (query) => {
    debug('getQuery:', query);
    return processQuery(query, Object.values(await this.all()));
  };

  /**
   * Returns a document for a given slug.
   * @async
   * @param {string} slug The slug of the document to be returned.
   * @returns {Promise<import('../../wiki.js').UttoriWikiDocument|undefined>} Promise object represents the returned UttoriDocument.
   */
  get = async (slug) => {
    debug('get: slug:', slug);
    if (!slug) {
      debug('get: Cannot get document without slug.');
      return undefined;
    }
    slug = sanitize(`${slug}`);

    // Check the cache, fall back to reading the file.
    if (this.config.useCache && this.documents[slug]) {
      return { ...this.documents[slug] };
    }

    // Either not in cache or not using cache, read a document from a file.
    const file = path.join(this.config.contentDirectory, `${slug}.${this.config.extension}`);
    debug('get: file', file);
    try {
      const content = await fs.readFile(file, 'utf8');
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return JSON.parse(content);
    } catch (error) {
      debug(`get: Error reading "${file}":`, error);
      return undefined;
    }
  };

  /**
   * Saves a document to the file system.
   * @async
   * @param {import('../../wiki.js').UttoriWikiDocument} document The document to be added to the collection.
   */
  add = async (document) => {
    if (!document || !document.slug) {
      debug('add: Cannot add, missing slug.');
      return;
    }

    const file = path.join(this.config.contentDirectory, `${document.slug}.${this.config.extension}`);
    try {
      await fs.access(file, fs.constants.R_OK | fs.constants.W_OK);
      // The check succeeded
      debug('add: Cannot add, existing document!');
    } catch (_error) {
      // The check failed
      debug('add: new document', document);
      document.createDate = Date.now();
      document.updateDate = document.createDate;
      if (this.config.useHistory) {
        await this.updateHistory(document.slug, JSON.stringify(document, undefined, this.config.spacesHistory));
      }
      if (this.config.useCache) {
        this.documents[document.slug] = document;
      }
      try {
        debug('add: Creating content file:', file);
        await fs.writeFile(file, JSON.stringify(document, undefined, this.config.spacesDocument), 'utf8');
      } /* c8 ignore next 2 */ catch (error) {
        debug('add: Error creating content file:', error);
      }
    }
  };

  /**
   * Updates a document and saves to the file system.
   * @async
   * @private
   * @param {import('../../wiki.js').UttoriWikiDocument} document The document to be updated in the collection.
   * @param {string} originalSlug The original slug identifying the document, or the slug if it has not changed.
   */
  updateValid = async (document, originalSlug) => {
    debug('updateValid');
    if (this.config.updateTimestamps) {
      document.updateDate = Date.now();
    }
    if (this.config.useHistory) {
      await this.updateHistory(document.slug, JSON.stringify(document, undefined, this.config.spacesHistory), originalSlug);
    }
    if (this.config.useCache) {
      this.documents[document.slug] = document;
    }

    try {
      const file = path.join(this.config.contentDirectory, `${document.slug}.${this.config.extension}`);
      debug('updateValid: Updating content file:', file);
      await fs.writeFile(file, JSON.stringify(document, undefined, this.config.spacesDocument), 'utf8');
    } /* c8 ignore next 2 */ catch (error) {
      debug('updateValid: Error updating content file:', error);
    }
  };

  /**
   * Updates a document and figures out how to save to the file system.
   * @async
   * @param {object} params The params object.
   * @param {import('../../wiki.js').UttoriWikiDocument} params.document The document to be updated in the collection.
   * @param {string} params.originalSlug The original slug identifying the document, or the slug if it has not changed.
   */
  update = async ({ document, originalSlug }) => {
    debug('update');
    if (!document || !document.slug) {
      debug('Cannot update, missing slug.');
      return;
    }
    debug('update:', document.slug, 'originalSlug:', originalSlug);
    const existing = await this.get(document.slug);
    let original;
    if (originalSlug) {
      original = await this.get(originalSlug);
    }
    if (existing && original && original.slug !== existing.slug) {
      debug(`update: Cannot update, existing document with new slug "${originalSlug}"!`);
    } else if (existing && original && original.slug === existing.slug) {
      debug(`update: Updating document with slug "${document.slug}"`);
      await this.updateValid(document, originalSlug);
    } else if (existing && !original) {
      debug(`update: Updating document with slug "${document.slug}" but no originalSlug`);
      await this.updateValid(document, document.slug);
    } else if (!existing && original) {
      debug(`update: Updating document and changing slug from "${originalSlug}" to "${document.slug}"`);
      if (this.config.useCache) {
        delete this.documents[originalSlug];
      }

      try {
        const file = path.join(this.config.contentDirectory, `${originalSlug}.${this.config.extension}`);
        debug('update: Deleting old file:', file);
        await fs.unlink(file);
      } /* c8 ignore next 2 */ catch (error) {
        debug('update: Error deleteing old file:', error);
      }
      await this.updateValid(document, originalSlug);
    } else {
      debug(`update: No document found to update with slug "${originalSlug}", adding document with slug "${document.slug}"`);
      await this.add(document);
    }
  };

  /**
   * Removes a document from the file system.
   * @async
   * @param {string} slug The slug identifying the document.
   */
  delete = async (slug) => {
    debug('delete:', slug);
    const existing = await this.get(slug);
    if (existing) {
      debug('Document found, deleting document:', slug);
      if (this.config.useHistory) {
        await this.updateHistory(slug, JSON.stringify(existing, undefined, this.config.spacesHistory));
      }
      if (this.config.useCache) {
        delete this.documents[slug];
      }

      try {
        const file = path.join(this.config.contentDirectory, `${slug}.${this.config.extension}`);
        debug('delete: Deleting content file:', file);
        await fs.unlink(file);
      } /* c8 ignore next 2 */ catch (error) {
        debug('delete: Error deleteing content file:', error);
      }
    } else {
      debug('Document not found:', slug);
    }
  };

  /**
   * Returns the history of edits for a given slug.
   * @async
   * @param {string} slug The slug of the document to get history for.
   * @returns {Promise<string[]>} Promise object represents the returned history.
   */
  getHistory = async (slug) => {
    debug('getHistory', slug);
    if (!slug) {
      debug('Cannot get document history without slug.', slug);
      return [];
    }

    /** @type {string[]} The history of edits for this slug. */
    let history = [];
    const directory = path.join(this.config.historyDirectory, sanitize(`${slug}`));
    debug('getHistory: directory', directory);
    try {
      await fs.access(directory, fs.constants.R_OK | fs.constants.W_OK);
      // The check succeeded
      history = await fs.readdir(directory);
      // Return the filename without extension, just the timestamp.
      history = history.map((file) => path.basename(file, `.${this.config.extension}`));
    } catch (error) {
      debug(`getHistory: cannot ready "${directory}" directory`);
    }
    debug('getHistory: history', history);
    return history;
  };

  /**
   * Returns a specifc revision from the history of edits for a given slug and revision timestamp.
   * @async
   * @param {object} params The params object.
   * @param {string} params.slug The slug of the document to be returned.
   * @param {string|number} params.revision The unix timestamp of the history to be returned.
   * @returns {Promise<import('../../wiki.js').UttoriWikiDocument|undefined>} Promise object represents the returned revision of the document.
   */
  getRevision = async ({ slug, revision }) => {
    debug('getRevision', slug, revision);
    if (!slug) {
      debug('getRevision: Cannot get document history without slug.', slug);
      return undefined;
    }
    if (!revision) {
      debug('getRevision: Cannot get document history without revision.', revision);
      return undefined;
    }
    try {
      const file = path.join(this.config.historyDirectory, sanitize(`${slug}`), sanitize(`${revision}.${this.config.extension}`));
      debug('getRevision: Reading history file:', file);
      const content = await fs.readFile(file, 'utf8');
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return JSON.parse(content);
    } catch (error) {
      debug('getRevision: Error reading history file:', error);
      return undefined;
    }
  };

  // Format Specific Methods

  /**
   * Updates History for a given slug, renaming the store file and history directory as needed.
   * @async
   * @param {string} slug The slug of the document to update history for.
   * @param {string} content The revision of the document to be saved.
   * @param {string} [originalSlug] The original slug identifying the document, or the slug if it has not changed.
   */
  updateHistory = async (slug, content, originalSlug) => {
    debug('updateHistory:', slug, content, originalSlug);
    const original_directory = path.join(this.config.historyDirectory, sanitize(`${originalSlug}`));
    const new_directory = path.join(this.config.historyDirectory, sanitize(`${slug}`));

    // Rename old history directory if one existed
    if (slug && originalSlug && originalSlug !== slug) {
      debug(`updateHistory: Updating history directory from "${originalSlug}" to "${slug}"`);
      try {
        await fs.access(original_directory, fs.constants.R_OK | fs.constants.W_OK);
        // The check succeeded
        debug(`updateHistory: Renaming history directory from "${original_directory}" to "${new_directory}"`);
        try {
          await fs.rename(original_directory, new_directory);
        } /* c8 ignore next 2 */ catch (error) {
          debug(`updateHistory: Error renaming history directory from "${original_directory}" to "${new_directory}"`, error);
        }
      } /* c8 ignore next 3 */ catch (error) {
        // The check failed
        debug(`updateHistory: Old directory "${original_directory}" does not exist, nothing to move to "${new_directory}"`, error);
      }
    }

    try {
      await fs.access(new_directory, fs.constants.R_OK | fs.constants.W_OK);
      // The check succeeded
      debug(`updateHistory: New history directory "${new_directory}" exists`);
    } catch (_error) {
      // The check failed
      try {
        await fs.mkdir(new_directory, { recursive: true });
      } /* c8 ignore next 2 */ catch (error) {
        debug('updateHistory: Error creating document history directory:', new_directory, error);
      }
    }

    /* c8 ignore next */
    try {
      let file = path.join(new_directory, `${Date.now()}.${this.config.extension}`);

      // We need to handle the edge case where the file already exists.

      while (true) {
        try {

          await fs.access(file);
          // File exists, update timestamp and path.
          file = path.join(new_directory, `${Date.now()}.${this.config.extension}`);
        } catch {
          // File does not exist, write and break.
          debug('updateHistory: Creating history file:', file);

          await fs.writeFile(file, content, 'utf8');
          break;
        }
      }
    } /* c8 ignore next 2 */ catch (error) {
      debug('updateHistory: Error creating history file:', error);
    }
  };

  /**
   * Ensure a directory exists, and if not create it.
   * @param {string} directory The directory to ensure exists.
   */
  static async ensureDirectory(directory) {
    try {
      await fs.access(directory, fs.constants.R_OK | fs.constants.W_OK);
      // The check succeeded
    } catch (_error) {
      try {
        await fs.mkdir(directory, { recursive: true });
      } /* c8 ignore next 2 */ catch (error) {
        debug(`StorageProvider.ensureDirectory: Error creating directory "${directory}":`, error);
      }
    }
  }
}

export default StorageProviderJsonFile;
