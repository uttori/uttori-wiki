import { createDebug } from '../../debug.js';
import { sidecarGeneration } from './sidecar-generation.js';
import { documentVersion } from '../../document-write.js';
import { promises as fs } from 'node:fs';
import sanitize from 'sanitize-filename';
import path from 'node:path';
import processQuery from './query-tools.js';
const debug = createDebug('Uttori.StorageProvider.JSON');
/**
 * Replace one file atomically, using a sibling temp file so the rename stays on the same filesystem.
 * @param file Destination file.
 * @param content Serialized document bytes.
 * @param revision Unique suffix for this write's temporary file.
 */
async function writeRevisionFile(file, content, revision) {
    const temporary = `${file}.${revision}.tmp`;
    try {
        await fs.writeFile(temporary, content, 'utf8');
        await fs.rename(temporary, file);
    }
    finally {
        await fs.rm(temporary, { force: true });
    }
}
/**
 * Accept sidecar JSON only when the filename slug and required fields are intact.
 * @param value Parsed sidecar JSON.
 * @param slug Slug taken from the metadata filename.
 * @returns Whether the value can be paired with Markdown content.
 */
const isSidecarMetadata = (value, slug) => {
    if (!value || typeof value !== 'object' || Array.isArray(value))
        return false;
    if (!/^[a-z0-9][a-z0-9-]*$/.test(slug))
        return false;
    if (Object.hasOwn(value, 'content') || Object.hasOwn(value, 'html'))
        return false;
    const { slug: metadataSlug, title, excerpt, tags, createDate, updateDate, } = value;
    if (metadataSlug !== slug)
        return false;
    if (typeof title !== 'string' || !title.trim())
        return false;
    if (excerpt !== undefined && typeof excerpt !== 'string')
        return false;
    if (tags !== undefined && !Array.isArray(tags))
        return false;
    if (createDate !== undefined && (typeof createDate !== 'number' || !Number.isFinite(createDate)))
        return false;
    if (updateDate !== undefined && (typeof updateDate !== 'number' || !Number.isFinite(updateDate)))
        return false;
    return true;
};
/**
 * Storage for Uttori documents using JSON files stored on the local file system.
 * @example <caption>Init StorageProviderJsonFile</caption>
 * const storageProvider = new StorageProviderJsonFile({ contentDirectory: 'content', historyDirectory: 'history', spacesDocument: 2 });
 */
class StorageProviderJsonFile {
    /**
     * Creates an instance of StorageProvider.
     * @param config - A configuration object.
     */
    constructor(config) {
        debug('constructor');
        if (!config) {
            debug('No config provided.');
            throw new Error('No config provided.');
        }
        if (!config.contentDirectory) {
            debug('No content directory provided.');
            throw new Error('No content directory provided.');
        }
        if (!config.sidecarContentExtension && !config.historyDirectory) {
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
            sidecarContentExtension: undefined,
            ...config,
        };
        if (this.config.sidecarContentExtension && (this.config.useHistory || !/^[a-z0-9]+$/i.test(this.config.sidecarContentExtension))) {
            throw new Error('Sidecar content requires useHistory: false and a simple content extension.');
        }
        this.refresh = true;
        // The collection of documents where the slug is the key and the value is the document.
        this.documents = {};
        // Ensure the directories exist.
        if (!this.config.sidecarContentExtension) {
            StorageProviderJsonFile.ensureDirectory(this.config.contentDirectory).catch(console.error);
            StorageProviderJsonFile.ensureDirectory(this.config.historyDirectory).catch(console.error);
        }
    }
    /**
     * Read and validate one metadata/Markdown pair. Sidecar mode is intentionally
     * strict so a partial checkout cannot silently produce an incomplete site.
     * @param name Metadata filename, relative to the selected generation.
     * @param directory Directory containing both sidecar partners.
     * @returns The complete document.
     */
    loadSidecar = async (name, directory = this.config.contentDirectory) => {
        const metadataPath = path.join(directory, name);
        const slug = path.basename(name, `.${this.config.extension}`);
        const contentPath = path.join(directory, `${slug}.${this.config.sidecarContentExtension}`);
        let metadata;
        try {
            metadata = JSON.parse(await fs.readFile(metadataPath, 'utf8'));
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            throw new Error(`Invalid metadata at ${metadataPath}: ${message}`, { cause: error });
        }
        if (!isSidecarMetadata(metadata, slug)) {
            throw new Error(`Invalid sidecar metadata or mismatched slug at ${metadataPath}`);
        }
        let content;
        try {
            content = await fs.readFile(contentPath, 'utf8');
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            throw new Error(`Missing or unreadable content at ${contentPath}: ${message}`, { cause: error });
        }
        return ({
            ...metadata,
            content,
        });
    };
    /** Retry a read spanning promotion so one response never combines two complete generations. */
    async readSidecars() {
        const root = this.config.contentDirectory;
        let generation = await sidecarGeneration(root);
        while (true) {
            const { directory, identity } = generation;
            const documents = {};
            try {
                const fileNames = await fs.readdir(directory);
                const metadataSuffix = `.${this.config.extension}`;
                const contentSuffix = `.${this.config.sidecarContentExtension}`;
                const metadataNames = fileNames.filter((name) => name.endsWith(metadataSuffix)).sort();
                const contentNames = fileNames.filter((name) => name.endsWith(contentSuffix)).sort();
                const expectedContent = new Set(metadataNames.map((name) => `${name.slice(0, -metadataSuffix.length)}${contentSuffix}`));
                for (const name of contentNames) {
                    if (!expectedContent.has(name)) {
                        throw new Error(`Missing metadata for ${path.join(directory, name)}`);
                    }
                }
                const loadedDocuments = await Promise.all(metadataNames.map((name) => this.loadSidecar(name, directory)));
                for (const document of loadedDocuments) {
                    if (documents[document.slug]) {
                        throw new Error(`Duplicate sidecar slug ${document.slug} in ${directory}`);
                    }
                    documents[document.slug] = document;
                }
            }
            catch (error) {
                generation = await sidecarGeneration(root);
                if (generation.identity === identity && generation.directory === directory)
                    throw error;
                continue;
            }
            generation = await sidecarGeneration(root);
            if (generation.identity === identity && generation.directory === directory)
                return documents;
        }
    }
    /**
     * Returns all documents.
     * @returns All documents.
     * @example
     * storageProvider.all();
     * ➜ { first-document: { slug: 'first-document', ... }, ...}
     */
    all = async () => {
        debug('all');
        if (this.config.useCache && this.refresh === false) {
            return this.documents;
        }
        if (this.config.sidecarContentExtension) {
            const pages = await this.readSidecars();
            if (this.config.useCache) {
                this.documents = pages;
                this.refresh = false;
            }
            return pages;
        }
        const documents = {};
        try {
            const fileNames = await fs.readdir(this.config.contentDirectory);
            const validFiles = fileNames.filter((name) => (name.length >= 6) && name.endsWith(this.config.extension));
            const readPromises = validFiles.map(async (name) => {
                const file = path.join(this.config.contentDirectory, name);
                debug('all: Reading', file);
                const content = await fs.readFile(file, 'utf8');
                const data = JSON.parse(content);
                return { name, data };
            });
            const loadedDocuments = await Promise.all(readPromises);
            for (const { name, data } of loadedDocuments.sort((a, b) => a.name.localeCompare(b.name))) {
                if (documents[data.slug]) {
                    debug('all: Duplicate slug found, overwriting:', data.slug, name);
                }
                if (path.basename(name, `.${this.config.extension}`) !== data.slug) {
                    debug('all: File name does not match document slug:', name, data.slug);
                }
                documents[data.slug] = data;
            }
            debug('all: found', Object.values(documents).length);
            if (this.config.useCache) {
                this.documents = documents;
                this.refresh = false;
            }
        } /* c8 ignore next 2 */
        catch (error) {
            debug('all: Error:', error);
        }
        return documents;
    };
    /**
     * Returns all documents matching a given query.
     * @async
     * @param query The conditions on which documents should be returned.
     * @returns Promise object represents all matching documents.
     */
    getQuery = async (query) => {
        debug('getQuery:', query);
        return processQuery(query, Object.values(await this.all()));
    };
    /**
     * Returns a document for a given slug.
     * @async
     * @param slug The slug of the document to be returned.
     * @returns Promise object represents the returned UttoriDocument.
     */
    get = async (slug) => {
        debug('get: slug:', slug);
        if (!slug) {
            debug('get: Cannot get document without slug.');
            return undefined;
        }
        slug = sanitize(`${slug}`);
        // Collection and direct reads share validation, including missing partners.
        if (this.config.sidecarContentExtension) {
            const document = (await this.all())[slug];
            return document ? { ...document } : undefined;
        }
        // Check the cache, fall back to reading the file.
        if (this.config.useCache && this.documents[slug]) {
            return { ...this.documents[slug] };
        }
        // Either not in cache or not using cache, read a document from a file.
        const file = path.join(this.config.contentDirectory, `${slug}.${this.config.extension}`);
        debug('get: file', file);
        try {
            const content = await fs.readFile(file, 'utf8');
            const parsed = JSON.parse(content);
            return parsed;
        }
        catch (error) {
            debug(`get: Error reading "${file}":`, error);
            return undefined;
        }
    };
    /**
     * Saves a document to the file system.
     * @async
     * @param document The document to be added to the collection.
     */
    add = async (document) => {
        if (this.config.sidecarContentExtension) {
            throw new Error('Sidecar content is read-only.');
        }
        if (!document || !document.slug) {
            debug('add: Cannot add, missing slug.');
            return;
        }
        const file = path.join(this.config.contentDirectory, `${document.slug}.${this.config.extension}`);
        try {
            await fs.access(file, fs.constants.R_OK | fs.constants.W_OK);
            // The check succeeded
            debug('add: Cannot add, existing document!');
        }
        catch (_error) {
            // The check failed
            debug('add: new document', document);
            document.createDate = Date.now();
            document.updateDate = document.createDate;
            if (this.config.useHistory) {
                await this.updateHistory(document.slug, JSON.stringify(document, undefined, this.config.spacesHistory));
            }
            try {
                debug('add: Creating content file:', file);
                await fs.writeFile(file, JSON.stringify(document, undefined, this.config.spacesDocument), 'utf8');
                if (this.config.useCache)
                    this.documents[document.slug] = document;
            } /* c8 ignore next 2 */
            catch (error) {
                debug('add: Error creating content file:', error);
            }
        }
    };
    /**
     * Updates a document and saves to the file system.
     * @async
     * @private
     * @param document The document to be updated in the collection.
     * @param originalSlug The original slug identifying the document, or the slug if it has not changed.
     */
    updateValid = async (document, originalSlug) => {
        debug('updateValid');
        if (this.config.updateTimestamps) {
            document.updateDate = Date.now();
        }
        if (this.config.useHistory) {
            await this.updateHistory(document.slug, JSON.stringify(document, undefined, this.config.spacesHistory), originalSlug);
        }
        try {
            const file = path.join(this.config.contentDirectory, `${document.slug}.${this.config.extension}`);
            debug('updateValid: Updating content file:', file);
            await fs.writeFile(file, JSON.stringify(document, undefined, this.config.spacesDocument), 'utf8');
            // A failed browser save must not give a later MCP preview a version that was never stored.
            if (this.config.useCache)
                this.documents[document.slug] = document;
        } /* c8 ignore next 2 */
        catch (error) {
            debug('updateValid: Error updating content file:', error);
        }
    };
    /**
     * Updates a document and figures out how to save to the file system.
     * @async
     * @param params The params object.
     * @param params.document The document to be updated in the collection.
     * @param params.originalSlug The original slug identifying the document, or the slug if it has not changed.
     */
    update = async ({ document, originalSlug }) => {
        if (this.config.sidecarContentExtension) {
            throw new Error('Sidecar content is read-only.');
        }
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
        }
        else if (existing && original && original.slug === existing.slug) {
            debug(`update: Updating document with slug "${document.slug}"`);
            await this.updateValid(document, originalSlug);
        }
        else if (existing && !original) {
            debug(`update: Updating document with slug "${document.slug}" but no originalSlug`);
            await this.updateValid(document, document.slug);
        }
        else if (!existing && original) {
            debug(`update: Updating document and changing slug from "${originalSlug}" to "${document.slug}"`);
            if (this.config.useCache) {
                delete this.documents[originalSlug];
            }
            try {
                const file = path.join(this.config.contentDirectory, `${originalSlug}.${this.config.extension}`);
                debug('update: Deleting old file:', file);
                await fs.unlink(file);
            } /* c8 ignore next 2 */
            catch (error) {
                debug('update: Error deleteing old file:', error);
            }
            await this.updateValid(document, originalSlug);
        }
        else {
            debug(`update: No document found to update with slug "${originalSlug}", adding document with slug "${document.slug}"`);
            await this.add(document);
        }
    };
    /**
     * Save a fixed revision while the caller holds the wiki write slot. Repeating the same
     * revision can repair a missing history file after an interrupted save.
     * @param params The filtered document, its base version, and its caller-assigned revision ID.
     * @returns The acknowledged revision ID, or throws if the write is incomplete.
     */
    writeRevision = async ({ document, revision, expectedVersion }) => {
        if (this.config.sidecarContentExtension)
            throw new Error('Sidecar content is read-only.');
        if (!/^[a-z0-9][a-z0-9-]{0,127}$/.test(document.slug) || !/^\d+-[a-f0-9-]{36}$/.test(revision)) {
            throw new Error('Invalid document slug or revision.');
        }
        const file = path.join(this.config.contentDirectory, `${document.slug}.${this.config.extension}`);
        const currentVersion = documentVersion(await this.readRevisionDocument(file, document.slug));
        if (currentVersion !== documentVersion(document)) {
            if (currentVersion !== expectedVersion)
                throw new Error('Document changed before storage could save it.');
            await writeRevisionFile(file, JSON.stringify(document, undefined, this.config.spacesDocument), revision);
        }
        // Only expose bytes that reached disk, even if the history write still needs a retry.
        if (this.config.useCache)
            this.documents[document.slug] = document;
        if (this.config.useHistory) {
            // Keep the history name stable across retries, even when the page already reached disk.
            const directory = path.join(this.config.historyDirectory, document.slug);
            await fs.mkdir(directory, { recursive: true });
            await writeRevisionFile(path.join(directory, `${revision}.${this.config.extension}`), JSON.stringify(document, undefined, this.config.spacesHistory), revision);
        }
        return revision;
    };
    /**
     * Read a checked write's current file without confusing corrupt content with a missing page.
     * @param file Absolute path inside storage or history.
     * @param slug The identity expected in the record.
     * @returns The record, or undefined only when the file is missing.
     */
    async readRevisionDocument(file, slug) {
        try {
            const document = JSON.parse(await fs.readFile(file, 'utf8'));
            if (document?.slug !== slug)
                throw new Error('Stored document has an invalid slug.');
            return document;
        }
        catch (error) {
            if (error.code !== 'ENOENT')
                throw error;
            return undefined;
        }
    }
    /**
     * Archive the exact reviewed source before removing it from live storage. The caller holds the wiki write slot.
     * @param params Source slug, reviewed version and stable history revision ID.
     * @returns The revision ID, including when retrying an already retired source.
     */
    retireRevision = async ({ slug, expectedVersion, revision }) => {
        if (this.config.sidecarContentExtension || !this.config.useHistory || !/^[a-z0-9][a-z0-9-]{0,127}$/.test(slug) || !/^\d+-[a-f0-9-]{36}$/.test(revision)) {
            throw new Error('Retiring a page requires mutable storage with revision history.');
        }
        const file = path.join(this.config.contentDirectory, `${slug}.${this.config.extension}`);
        const directory = path.join(this.config.historyDirectory, slug);
        const history = path.join(directory, `${revision}.${this.config.extension}`);
        const current = await this.readRevisionDocument(file, slug);
        if (current) {
            if (documentVersion(current) !== expectedVersion)
                throw new Error('Document changed before retirement.');
            await fs.mkdir(directory, { recursive: true });
            await writeRevisionFile(history, JSON.stringify(current, undefined, this.config.spacesHistory), revision);
            await fs.unlink(file);
        }
        else if (documentVersion(await this.readRevisionDocument(history, slug)) !== expectedVersion) {
            throw new Error('The retired page could not be verified in history.');
        }
        if (this.config.useCache)
            delete this.documents[slug];
        return revision;
    };
    /**
     * Removes a document from the file system.
     * @async
     * @param slug The slug identifying the document.
     */
    delete = async (slug) => {
        if (this.config.sidecarContentExtension) {
            throw new Error('Sidecar content is read-only.');
        }
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
            } /* c8 ignore next 2 */
            catch (error) {
                debug('delete: Error deleteing content file:', error);
            }
        }
        else {
            debug('Document not found:', slug);
        }
    };
    /**
     * Returns the history of edits for a given slug.
     * @async
     * @param slug The slug of the document to get history for.
     * @returns Promise object represents the returned history.
     */
    getHistory = async (slug) => {
        if (this.config.sidecarContentExtension) {
            return [];
        }
        debug('getHistory', slug);
        if (!slug) {
            debug('Cannot get document history without slug.', slug);
            return [];
        }
        /** The history of edits for this slug. */
        let history = [];
        const directory = path.join(this.config.historyDirectory, sanitize(`${slug}`));
        debug('getHistory: directory', directory);
        try {
            await fs.access(directory, fs.constants.R_OK | fs.constants.W_OK);
            // The check succeeded
            history = await fs.readdir(directory);
            // Return the filename without extension, just the timestamp.
            history = history.map((file) => path.basename(file, `.${this.config.extension}`));
        }
        catch (error) {
            debug(`getHistory: cannot ready "${directory}" directory`);
        }
        debug('getHistory: history', history);
        return history;
    };
    /**
     * Returns a specifc revision from the history of edits for a given slug and revision timestamp.
     * @async
     * @param params The params object.
     * @param params.slug The slug of the document to be returned.
     * @param params.revision The unix timestamp of the history to be returned.
     * @returns Promise object represents the returned revision of the document.
     */
    getRevision = async ({ slug, revision }) => {
        if (this.config.sidecarContentExtension) {
            return undefined;
        }
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
            return JSON.parse(content);
        }
        catch (error) {
            debug('getRevision: Error reading history file:', error);
            return undefined;
        }
    };
    // Format Specific Methods
    /**
     * Updates History for a given slug, renaming the store file and history directory as needed.
     * @async
     * @param slug The slug of the document to update history for.
     * @param content The revision of the document to be saved.
     * @param [originalSlug] The original slug identifying the document, or the slug if it has not changed.
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
                } /* c8 ignore next 2 */
                catch (error) {
                    debug(`updateHistory: Error renaming history directory from "${original_directory}" to "${new_directory}"`, error);
                }
            } /* c8 ignore next 3 */
            catch (error) {
                // The check failed
                debug(`updateHistory: Old directory "${original_directory}" does not exist, nothing to move to "${new_directory}"`, error);
            }
        }
        try {
            await fs.access(new_directory, fs.constants.R_OK | fs.constants.W_OK);
            // The check succeeded
            debug(`updateHistory: New history directory "${new_directory}" exists`);
        }
        catch (_error) {
            // The check failed
            try {
                await fs.mkdir(new_directory, { recursive: true });
            } /* c8 ignore next 2 */
            catch (error) {
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
                }
                catch {
                    // File does not exist, write and break.
                    debug('updateHistory: Creating history file:', file);
                    await fs.writeFile(file, content, 'utf8');
                    break;
                }
            }
        } /* c8 ignore next 2 */
        catch (error) {
            debug('updateHistory: Error creating history file:', error);
        }
    };
    /**
     * Ensure a directory exists, and if not create it.
     * @param directory The directory to ensure exists.
     */
    static async ensureDirectory(directory) {
        try {
            await fs.access(directory, fs.constants.R_OK | fs.constants.W_OK);
            // The check succeeded
        }
        catch (_error) {
            try {
                await fs.mkdir(directory, { recursive: true });
            } /* c8 ignore next 2 */
            catch (error) {
                debug(`StorageProvider.ensureDirectory: Error creating directory "${directory}":`, error);
            }
        }
    }
}
export default StorageProviderJsonFile;
//# sourceMappingURL=storage-provider-file.js.map