## Classes

<dl>
<dt><a href="#StorageProviderJsonFile">StorageProviderJsonFile</a></dt>
<dd><p>Storage for Uttori documents using JSON files stored on the local file system.</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#isSidecarMetadata">isSidecarMetadata(value, slug)</a> ⇒</dt>
<dd><p>Accept sidecar JSON only when the filename slug and required fields are intact.</p>
</dd>
</dl>

<a name="StorageProviderJsonFile"></a>

## StorageProviderJsonFile
Storage for Uttori documents using JSON files stored on the local file system.

**Kind**: global class\

* [StorageProviderJsonFile](#StorageProviderJsonFile)
    * [new StorageProviderJsonFile(config)](#new_StorageProviderJsonFile_new)
    * _instance_
        * [.loadSidecar](#StorageProviderJsonFile+loadSidecar) ⇒
        * [.all](#StorageProviderJsonFile+all) ⇒
        * [.getQuery](#StorageProviderJsonFile+getQuery) ⇒
        * [.get](#StorageProviderJsonFile+get) ⇒
        * [.add](#StorageProviderJsonFile+add)
        * [.updateValid](#StorageProviderJsonFile+updateValid) ℗
        * [.update](#StorageProviderJsonFile+update)
        * [.delete](#StorageProviderJsonFile+delete)
        * [.getHistory](#StorageProviderJsonFile+getHistory) ⇒
        * [.getRevision](#StorageProviderJsonFile+getRevision) ⇒
        * [.updateHistory](#StorageProviderJsonFile+updateHistory)
    * _static_
        * [.ensureDirectory(directory)](#StorageProviderJsonFile.ensureDirectory)

<a name="new_StorageProviderJsonFile_new"></a>

### new StorageProviderJsonFile(config)
Creates an instance of StorageProvider.


| Param | Description |
| --- | --- |
| config | A configuration object. |

**Example** *(Init StorageProviderJsonFile)*\
```js
const storageProvider = new StorageProviderJsonFile({ contentDirectory: 'content', historyDirectory: 'history', spacesDocument: 2 });
```
<a name="StorageProviderJsonFile+loadSidecar"></a>

### storageProviderJsonFile.loadSidecar ⇒
Read and validate one metadata/Markdown pair. Sidecar mode is intentionally
strict so a partial checkout cannot silently produce an incomplete site.

**Kind**: instance property of [<code>StorageProviderJsonFile</code>](#StorageProviderJsonFile)\
**Returns**: The complete document.\

| Param | Description |
| --- | --- |
| name | Metadata filename, relative to contentDirectory. |

<a name="StorageProviderJsonFile+all"></a>

### storageProviderJsonFile.all ⇒
Returns all documents.

**Kind**: instance property of [<code>StorageProviderJsonFile</code>](#StorageProviderJsonFile)\
**Returns**: All documents.\
**Example**\
```js
storageProvider.all();
➜ { first-document: { slug: 'first-document', ... }, ...}
```
<a name="StorageProviderJsonFile+getQuery"></a>

### storageProviderJsonFile.getQuery ⇒
Returns all documents matching a given query.

**Kind**: instance property of [<code>StorageProviderJsonFile</code>](#StorageProviderJsonFile)\
**Returns**: Promise object represents all matching documents.\

| Param | Description |
| --- | --- |
| query | The conditions on which documents should be returned. |

<a name="StorageProviderJsonFile+get"></a>

### storageProviderJsonFile.get ⇒
Returns a document for a given slug.

**Kind**: instance property of [<code>StorageProviderJsonFile</code>](#StorageProviderJsonFile)\
**Returns**: Promise object represents the returned UttoriDocument.\

| Param | Description |
| --- | --- |
| slug | The slug of the document to be returned. |

<a name="StorageProviderJsonFile+add"></a>

### storageProviderJsonFile.add
Saves a document to the file system.

**Kind**: instance property of [<code>StorageProviderJsonFile</code>](#StorageProviderJsonFile)\

| Param | Description |
| --- | --- |
| document | The document to be added to the collection. |

<a name="StorageProviderJsonFile+updateValid"></a>

### storageProviderJsonFile.updateValid ℗
Updates a document and saves to the file system.

**Kind**: instance property of [<code>StorageProviderJsonFile</code>](#StorageProviderJsonFile)\
**Access**: private\

| Param | Description |
| --- | --- |
| document | The document to be updated in the collection. |
| originalSlug | The original slug identifying the document, or the slug if it has not changed. |

<a name="StorageProviderJsonFile+update"></a>

### storageProviderJsonFile.update
Updates a document and figures out how to save to the file system.

**Kind**: instance property of [<code>StorageProviderJsonFile</code>](#StorageProviderJsonFile)\

| Param | Description |
| --- | --- |
| params | The params object. |
| params.document | The document to be updated in the collection. |
| params.originalSlug | The original slug identifying the document, or the slug if it has not changed. |

<a name="StorageProviderJsonFile+delete"></a>

### storageProviderJsonFile.delete
Removes a document from the file system.

**Kind**: instance property of [<code>StorageProviderJsonFile</code>](#StorageProviderJsonFile)\

| Param | Description |
| --- | --- |
| slug | The slug identifying the document. |

<a name="StorageProviderJsonFile+getHistory"></a>

### storageProviderJsonFile.getHistory ⇒
Returns the history of edits for a given slug.

**Kind**: instance property of [<code>StorageProviderJsonFile</code>](#StorageProviderJsonFile)\
**Returns**: Promise object represents the returned history.\

| Param | Description |
| --- | --- |
| slug | The slug of the document to get history for. |

<a name="StorageProviderJsonFile+getRevision"></a>

### storageProviderJsonFile.getRevision ⇒
Returns a specifc revision from the history of edits for a given slug and revision timestamp.

**Kind**: instance property of [<code>StorageProviderJsonFile</code>](#StorageProviderJsonFile)\
**Returns**: Promise object represents the returned revision of the document.\

| Param | Description |
| --- | --- |
| params | The params object. |
| params.slug | The slug of the document to be returned. |
| params.revision | The unix timestamp of the history to be returned. |

<a name="StorageProviderJsonFile+updateHistory"></a>

### storageProviderJsonFile.updateHistory
Updates History for a given slug, renaming the store file and history directory as needed.

**Kind**: instance property of [<code>StorageProviderJsonFile</code>](#StorageProviderJsonFile)\

| Param | Description |
| --- | --- |
| slug | The slug of the document to update history for. |
| content | The revision of the document to be saved. |
| [originalSlug] | The original slug identifying the document, or the slug if it has not changed. |

<a name="StorageProviderJsonFile.ensureDirectory"></a>

### StorageProviderJsonFile.ensureDirectory(directory)
Ensure a directory exists, and if not create it.

**Kind**: static method of [<code>StorageProviderJsonFile</code>](#StorageProviderJsonFile)\

| Param | Description |
| --- | --- |
| directory | The directory to ensure exists. |

<a name="isSidecarMetadata"></a>

## isSidecarMetadata(value, slug) ⇒
Accept sidecar JSON only when the filename slug and required fields are intact.

**Kind**: global function\
**Returns**: Whether the value can be paired with Markdown content.\

| Param | Description |
| --- | --- |
| value | Parsed sidecar JSON. |
| slug | Slug taken from the metadata filename. |

## TypeScript declarations

<details>
<summary>View documented types and signatures</summary>

```typescript
import type { StorageProviderJsonFileConfig } from '../../types/plugins/storeage-provider-json/storage-provider-file.js';
export type { StorageProviderJsonFileConfig, SidecarMetadata, } from '../../types/plugins/storeage-provider-json/storage-provider-file.js';
/**
 * Storage for Uttori documents using JSON files stored on the local file system.
 * @example <caption>Init StorageProviderJsonFile</caption>
 * const storageProvider = new StorageProviderJsonFile({ contentDirectory: 'content', historyDirectory: 'history', spacesDocument: 2 });
 */
declare class StorageProviderJsonFile {
    /** The configuration object. */
    config: {
        contentDirectory: string;
        historyDirectory: string;
        events?: Record<string, string[]>;
        extension: string;
        updateTimestamps: boolean;
        useHistory: boolean;
        useCache: boolean;
        spacesDocument: number | undefined;
        spacesHistory: number | undefined;
        sidecarContentExtension: string | undefined;
    };
    refresh: boolean;
    /** The collection of documents where the slug is the key and the value is the document. */
    documents: Record<string, import('../../wiki.js').UttoriWikiDocument>;
    /**
     * Creates an instance of StorageProvider.
     * @param config - A configuration object.
     */
    constructor(config: StorageProviderJsonFileConfig);
    /**
     * Read and validate one metadata/Markdown pair. Sidecar mode is intentionally
     * strict so a partial checkout cannot silently produce an incomplete site.
     * @param name Metadata filename, relative to contentDirectory.
     * @returns The complete document.
     */
    loadSidecar: (name: string) => Promise<import('../../wiki.js').UttoriWikiDocument>;
    /**
     * Returns all documents.
     * @returns All documents.
     * @example
     * storageProvider.all();
     * ➜ { first-document: { slug: 'first-document', ... }, ...}
     */
    all: () => Promise<Record<string, import('../../wiki.js').UttoriWikiDocument>>;
    /**
     * Returns all documents matching a given query.
     * @async
     * @param query The conditions on which documents should be returned.
     * @returns Promise object represents all matching documents.
     */
    getQuery: (query: string) => Promise<import('../../wiki.js').UttoriWikiDocument[] | number>;
    /**
     * Returns a document for a given slug.
     * @async
     * @param slug The slug of the document to be returned.
     * @returns Promise object represents the returned UttoriDocument.
     */
    get: (slug: string) => Promise<import('../../wiki.js').UttoriWikiDocument | undefined>;
    /**
     * Saves a document to the file system.
     * @async
     * @param document The document to be added to the collection.
     */
    add: (document: import('../../wiki.js').UttoriWikiDocument) => Promise<void>;
    /**
     * Updates a document and saves to the file system.
     * @async
     * @private
     * @param document The document to be updated in the collection.
     * @param originalSlug The original slug identifying the document, or the slug if it has not changed.
     */
    updateValid: (document: import('../../wiki.js').UttoriWikiDocument, originalSlug: string) => Promise<void>;
    /**
     * Updates a document and figures out how to save to the file system.
     * @async
     * @param params The params object.
     * @param params.document The document to be updated in the collection.
     * @param params.originalSlug The original slug identifying the document, or the slug if it has not changed.
     */
    update: ({ document, originalSlug }: {
        document: import('../../wiki.js').UttoriWikiDocument;
        originalSlug: string;
    }) => Promise<void>;
    /**
     * Removes a document from the file system.
     * @async
     * @param slug The slug identifying the document.
     */
    delete: (slug: string) => Promise<void>;
    /**
     * Returns the history of edits for a given slug.
     * @async
     * @param slug The slug of the document to get history for.
     * @returns Promise object represents the returned history.
     */
    getHistory: (slug: string) => Promise<string[]>;
    /**
     * Returns a specifc revision from the history of edits for a given slug and revision timestamp.
     * @async
     * @param params The params object.
     * @param params.slug The slug of the document to be returned.
     * @param params.revision The unix timestamp of the history to be returned.
     * @returns Promise object represents the returned revision of the document.
     */
    getRevision: ({ slug, revision }: {
        slug: string;
        revision: string | number;
    }) => Promise<import('../../wiki.js').UttoriWikiDocument | undefined>;
    /**
     * Updates History for a given slug, renaming the store file and history directory as needed.
     * @async
     * @param slug The slug of the document to update history for.
     * @param content The revision of the document to be saved.
     * @param [originalSlug] The original slug identifying the document, or the slug if it has not changed.
     */
    updateHistory: (slug: string, content: string, originalSlug?: string) => Promise<void>;
    /**
     * Ensure a directory exists, and if not create it.
     * @param directory The directory to ensure exists.
     */
    static ensureDirectory(directory: string): Promise<void>;
}
export default StorageProviderJsonFile;

export interface StorageProviderJsonFileConfig {
    /** The directory to store documents. */
    contentDirectory: string;
    /** The directory to store document histories. */
    historyDirectory: string;
    /** The file extension to use for file. */
    extension?: string;
    /**
     * When set, load Markdown content from a matching sidecar file and reject writes. For example, `md` pairs `page.json` with `page.md`.
     */
    sidecarContentExtension?: string;
    /** Should update times be marked at the time of edit. */
    updateTimestamps?: boolean;
    /** Should history entries be created. */
    useHistory?: boolean;
    /** Should we cache files in memory? */
    useCache?: boolean;
    /** The spaces parameter for JSON stringifying documents. */
    spacesDocument?: number;
    /** The spaces parameter for JSON stringifying history. */
    spacesHistory?: number;
    /** The events to listen for. */
    events?: Record<string, string[]>;
}
/** Metadata stored beside a Markdown sidecar. Body text stays in the paired file. */
export interface SidecarMetadata {
    /** Document slug; must match the metadata filename. */
    slug: string;
    /** Document title. */
    title: string;
    /** Optional summary. */
    excerpt?: string;
    /** Optional tag list. */
    tags?: unknown[];
    /** Optional creation time in Unix milliseconds. */
    createDate?: number;
    /** Optional update time in Unix milliseconds. */
    updateDate?: number;
}
```

</details>
