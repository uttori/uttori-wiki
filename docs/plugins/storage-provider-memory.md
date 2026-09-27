<a name="StorageProvider"></a>

## StorageProvider
Storage for Uttori documents using JSON objects in memory.

**Kind**: global class\

* [StorageProvider](#StorageProvider)
    * [new StorageProvider([config])](#new_StorageProvider_new)
    * [.documents](#StorageProvider+documents)
    * [.history](#StorageProvider+history)
    * [.histories](#StorageProvider+histories)
    * [.all](#StorageProvider+all) ⇒
    * [.getQuery](#StorageProvider+getQuery) ⇒
    * [.get](#StorageProvider+get) ⇒
    * [.getHistory](#StorageProvider+getHistory) ⇒
    * [.getRevision](#StorageProvider+getRevision) ⇒
    * [.add](#StorageProvider+add)
    * [.updateValid](#StorageProvider+updateValid) ℗
    * [.update](#StorageProvider+update)
    * [.delete](#StorageProvider+delete)
    * [.updateHistory](#StorageProvider+updateHistory)
    * [.reset()](#StorageProvider+reset)

<a name="new_StorageProvider_new"></a>

### new StorageProvider([config])
Creates an instance of StorageProvider.


| Param | Description |
| --- | --- |
| [config] | A configuration object. |

**Example** *(Init StorageProvider)*\
```js
const storageProvider = new StorageProvider();
```
<a name="StorageProvider+documents"></a>

### storageProvider.documents
The collection of documents where the slug is the key and the value is the document.

**Kind**: instance property of [<code>StorageProvider</code>](#StorageProvider)\
<a name="StorageProvider+history"></a>

### storageProvider.history
The collection of document histories indexes.

**Kind**: instance property of [<code>StorageProvider</code>](#StorageProvider)\
<a name="StorageProvider+histories"></a>

### storageProvider.histories
The collection of document revisions by timestamp.

**Kind**: instance property of [<code>StorageProvider</code>](#StorageProvider)\
<a name="StorageProvider+all"></a>

### storageProvider.all ⇒
Returns all documents.

**Kind**: instance property of [<code>StorageProvider</code>](#StorageProvider)\
**Returns**: All documents.\
**Example**\
```js
storageProvider.all();
➜ { 'first-document': { slug: 'first-document', ... }, ... }
```
<a name="StorageProvider+getQuery"></a>

### storageProvider.getQuery ⇒
Returns all documents matching a given query.

**Kind**: instance property of [<code>StorageProvider</code>](#StorageProvider)\
**Returns**: The items matching the supplied query.\

| Param | Description |
| --- | --- |
| query | The conditions on which documents should be returned. |

<a name="StorageProvider+get"></a>

### storageProvider.get ⇒
Returns a document for a given slug.

**Kind**: instance property of [<code>StorageProvider</code>](#StorageProvider)\
**Returns**: The returned UttoriDocument.\

| Param | Description |
| --- | --- |
| slug | The slug of the document to be returned. |

<a name="StorageProvider+getHistory"></a>

### storageProvider.getHistory ⇒
Returns the history of edits for a given slug.

**Kind**: instance property of [<code>StorageProvider</code>](#StorageProvider)\
**Returns**: The returned history object.\

| Param | Description |
| --- | --- |
| slug | The slug of the document to get history for. |

<a name="StorageProvider+getRevision"></a>

### storageProvider.getRevision ⇒
Returns a specifc revision from the history of edits for a given slug and revision timestamp.

**Kind**: instance property of [<code>StorageProvider</code>](#StorageProvider)\
**Returns**: The returned revision of the document.\

| Param | Description |
| --- | --- |
| params | The params object. |
| params.slug | The slug of the document to be returned. |
| params.revision | The unix timestamp of the history to be returned. |

<a name="StorageProvider+add"></a>

### storageProvider.add
Saves a document to internal array.

**Kind**: instance property of [<code>StorageProvider</code>](#StorageProvider)\

| Param | Description |
| --- | --- |
| document | The document to be added to the collection. |

<a name="StorageProvider+updateValid"></a>

### storageProvider.updateValid ℗
Updates a document and saves to memory.

**Kind**: instance property of [<code>StorageProvider</code>](#StorageProvider)\
**Access**: private\

| Param | Description |
| --- | --- |
| params | The params object. |
| params.document | The document to be updated in the collection. |
| params.originalSlug | The original slug identifying the document, or the slug if it has not changed. |

<a name="StorageProvider+update"></a>

### storageProvider.update
Updates a document and figures out how to save to memory.
Calling with a new document will add that document.

**Kind**: instance property of [<code>StorageProvider</code>](#StorageProvider)\

| Param | Description |
| --- | --- |
| params | The params object. |
| params.document | The document to be updated in the collection. |
| params.originalSlug | The original slug identifying the document, or the slug if it has not changed. |

<a name="StorageProvider+delete"></a>

### storageProvider.delete
Removes a document from memory.

**Kind**: instance property of [<code>StorageProvider</code>](#StorageProvider)\

| Param | Description |
| --- | --- |
| slug | The slug identifying the document. |

<a name="StorageProvider+updateHistory"></a>

### storageProvider.updateHistory
Updates History for a given slug, renaming the key and history key as needed.

**Kind**: instance property of [<code>StorageProvider</code>](#StorageProvider)\

| Param | Description |
| --- | --- |
| params | The params object. |
| params.slug | The slug of the document to update history for. |
| params.content | The revision of the document to be saved. |
| [params.originalSlug] | The original slug identifying the document, or the slug if it has not changed. |

<a name="StorageProvider+reset"></a>

### storageProvider.reset()
Resets to the initial state.

**Kind**: instance method of [<code>StorageProvider</code>](#StorageProvider)\

## TypeScript declarations

<details>
<summary>View documented types and signatures</summary>

```typescript
import type { StorageProviderConfig } from '../../types/plugins/storeage-provider-json/storage-provider-memory.js';
export type { StorageProviderConfig } from '../../types/plugins/storeage-provider-json/storage-provider-memory.js';
/**
 * Storage for Uttori documents using JSON objects in memory.
 * @example <caption>Init StorageProvider</caption>
 * const storageProvider = new StorageProvider();
 */
declare class StorageProvider {
    config: {
        events?: Record<string, string[]>;
        updateTimestamps: boolean;
        useHistory: boolean;
    };
    /** The collection of documents where the slug is the key and the value is the document. */
    documents: Record<string, import('../../wiki.js').UttoriWikiDocument>;
    /** The collection of document histories indexes. */
    history: Record<string, string[]>;
    /** The collection of document revisions by timestamp. */
    histories: Record<string, import('../../wiki.js').UttoriWikiDocument>;
    /**
     * Creates an instance of StorageProvider.
     * @param [config] A configuration object.
     */
    constructor(config?: StorageProviderConfig);
    /**
     * Returns all documents.
     * @returns All documents.
     * @example
     * ```js
     * storageProvider.all();
     * ➜ { 'first-document': { slug: 'first-document', ... }, ... }
     * ```
     */
    all: () => Promise<Record<string, import('../../wiki.js').UttoriWikiDocument>>;
    /**
     * Returns all documents matching a given query.
     * @param query The conditions on which documents should be returned.
     * @returns The items matching the supplied query.
     */
    getQuery: (query: string) => Promise<number | import('../../wiki.js').UttoriWikiDocument[]>;
    /**
     * Returns a document for a given slug.
     * @param slug The slug of the document to be returned.
     * @returns The returned UttoriDocument.
     */
    get: (slug: string) => Promise<import('../../wiki.js').UttoriWikiDocument | undefined>;
    /**
     * Returns the history of edits for a given slug.
     * @param slug The slug of the document to get history for.
     * @returns The returned history object.
     */
    getHistory: (slug: string) => Promise<string[]>;
    /**
     * Returns a specifc revision from the history of edits for a given slug and revision timestamp.
     * @param params The params object.
     * @param params.slug The slug of the document to be returned.
     * @param params.revision The unix timestamp of the history to be returned.
     * @returns The returned revision of the document.
     */
    getRevision: ({ slug, revision }: {
        slug: string;
        revision: string | number;
    }) => Promise<import('../../wiki.js').UttoriWikiDocument | undefined>;
    /**
     * Saves a document to internal array.
     * @param document The document to be added to the collection.
     */
    add: (document: import('../../wiki.js').UttoriWikiDocument) => Promise<void>;
    /**
     * Updates a document and saves to memory.
     * @private
     * @param params The params object.
     * @param params.document - The document to be updated in the collection.
     * @param params.originalSlug - The original slug identifying the document, or the slug if it has not changed.
     */
    updateValid: ({ document, originalSlug }: {
        document: import('../../wiki.js').UttoriWikiDocument;
        originalSlug: string;
    }) => Promise<void>;
    /**
     * Updates a document and figures out how to save to memory.
     * Calling with a new document will add that document.
     * @param params The params object.
     * @param params.document The document to be updated in the collection.
     * @param params.originalSlug The original slug identifying the document, or the slug if it has not changed.
     */
    update: ({ document, originalSlug }: {
        document: import('../../wiki.js').UttoriWikiDocument;
        originalSlug: string;
    }) => Promise<void>;
    /**
     * Removes a document from memory.
     * @param slug The slug identifying the document.
     */
    delete: (slug: string) => Promise<void>;
    /** Resets to the initial state. */
    reset(): void;
    /**
     * Updates History for a given slug, renaming the key and history key as needed.
     * @param params The params object.
     * @param params.slug The slug of the document to update history for.
     * @param params.content The revision of the document to be saved.
     * @param [params.originalSlug] The original slug identifying the document, or the slug if it has not changed.
     */
    updateHistory: ({ slug, content, originalSlug }: {
        slug: string;
        content: import('../../wiki.js').UttoriWikiDocument;
        originalSlug?: string;
    }) => Promise<void>;
}
export default StorageProvider;

export interface StorageProviderConfig {
    /** Should update times be marked at the time of edit. */
    updateTimestamps?: boolean;
    /** Should history entries be created. */
    useHistory?: boolean;
    /** The events to listen for. */
    events?: Record<string, string[]>;
}
```

</details>
