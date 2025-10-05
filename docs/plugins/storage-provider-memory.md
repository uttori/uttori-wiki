## Classes

<dl>
<dt><a href="#StorageProvider">StorageProvider</a></dt>
<dd><p>Storage for Uttori documents using JSON objects in memory.</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#StorageProviderConfig">StorageProviderConfig</a></dt>
<dd></dd>
</dl>

<a name="StorageProvider"></a>

## StorageProvider
Storage for Uttori documents using JSON objects in memory.

**Kind**: global class  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| documents | <code>Array.&lt;UttoriWikiDocument&gt;</code> | The collection of documents. |
| history | <code>object</code> | The collection of document histories indexes. |
| histories | <code>object</code> | The collection of document revisions by index. |


* [StorageProvider](#StorageProvider)
    * [new StorageProvider([config])](#new_StorageProvider_new)
    * [.documents](#StorageProvider+documents) : <code>Record.&lt;string, UttoriWikiDocument&gt;</code>
    * [.history](#StorageProvider+history) : <code>Record.&lt;string, Array.&lt;string&gt;&gt;</code>
    * [.histories](#StorageProvider+histories) : <code>Record.&lt;string, UttoriWikiDocument&gt;</code>
    * [.all](#StorageProvider+all) ⇒ <code>Promise.&lt;Record.&lt;string, UttoriWikiDocument&gt;&gt;</code>
    * [.getQuery](#StorageProvider+getQuery) ⇒ <code>Promise.&lt;(number\|Array.&lt;UttoriWikiDocument&gt;)&gt;</code>
    * [.get](#StorageProvider+get) ⇒ <code>Promise.&lt;(UttoriWikiDocument\|undefined)&gt;</code>
    * [.getHistory](#StorageProvider+getHistory) ⇒ <code>Promise.&lt;Array.&lt;string&gt;&gt;</code>
    * [.getRevision](#StorageProvider+getRevision) ⇒ <code>Promise.&lt;(UttoriWikiDocument\|undefined)&gt;</code>
    * [.add](#StorageProvider+add)
    * [.updateValid](#StorageProvider+updateValid) ℗
    * [.update](#StorageProvider+update)
    * [.delete](#StorageProvider+delete)
    * [.updateHistory](#StorageProvider+updateHistory)
    * [.reset()](#StorageProvider+reset)

<a name="new_StorageProvider_new"></a>

### new StorageProvider([config])
Creates an instance of StorageProvider.


| Param | Type | Description |
| --- | --- | --- |
| [config] | [<code>StorageProviderConfig</code>](#StorageProviderConfig) | A configuration object. |

**Example** *(Init StorageProvider)*  
```js
const storageProvider = new StorageProvider();
```
<a name="StorageProvider+documents"></a>

### storageProvider.documents : <code>Record.&lt;string, UttoriWikiDocument&gt;</code>
The collection of documents where the slug is the key and the value is the document.

**Kind**: instance property of [<code>StorageProvider</code>](#StorageProvider)  
<a name="StorageProvider+history"></a>

### storageProvider.history : <code>Record.&lt;string, Array.&lt;string&gt;&gt;</code>
The collection of document histories indexes.

**Kind**: instance property of [<code>StorageProvider</code>](#StorageProvider)  
<a name="StorageProvider+histories"></a>

### storageProvider.histories : <code>Record.&lt;string, UttoriWikiDocument&gt;</code>
The collection of document revisions by timestamp.

**Kind**: instance property of [<code>StorageProvider</code>](#StorageProvider)  
<a name="StorageProvider+all"></a>

### storageProvider.all ⇒ <code>Promise.&lt;Record.&lt;string, UttoriWikiDocument&gt;&gt;</code>
Returns all documents.

**Kind**: instance property of [<code>StorageProvider</code>](#StorageProvider)  
**Returns**: <code>Promise.&lt;Record.&lt;string, UttoriWikiDocument&gt;&gt;</code> - All documents.  
**Example**  
```js
storageProvider.all();
➜ { 'first-document': { slug: 'first-document', ... }, ... }
```
<a name="StorageProvider+getQuery"></a>

### storageProvider.getQuery ⇒ <code>Promise.&lt;(number\|Array.&lt;UttoriWikiDocument&gt;)&gt;</code>
Returns all documents matching a given query.

**Kind**: instance property of [<code>StorageProvider</code>](#StorageProvider)  
**Returns**: <code>Promise.&lt;(number\|Array.&lt;UttoriWikiDocument&gt;)&gt;</code> - The items matching the supplied query.  

| Param | Type | Description |
| --- | --- | --- |
| query | <code>string</code> | The conditions on which documents should be returned. |

<a name="StorageProvider+get"></a>

### storageProvider.get ⇒ <code>Promise.&lt;(UttoriWikiDocument\|undefined)&gt;</code>
Returns a document for a given slug.

**Kind**: instance property of [<code>StorageProvider</code>](#StorageProvider)  
**Returns**: <code>Promise.&lt;(UttoriWikiDocument\|undefined)&gt;</code> - The returned UttoriDocument.  

| Param | Type | Description |
| --- | --- | --- |
| slug | <code>string</code> | The slug of the document to be returned. |

<a name="StorageProvider+getHistory"></a>

### storageProvider.getHistory ⇒ <code>Promise.&lt;Array.&lt;string&gt;&gt;</code>
Returns the history of edits for a given slug.

**Kind**: instance property of [<code>StorageProvider</code>](#StorageProvider)  
**Returns**: <code>Promise.&lt;Array.&lt;string&gt;&gt;</code> - The returned history object.  

| Param | Type | Description |
| --- | --- | --- |
| slug | <code>string</code> | The slug of the document to get history for. |

<a name="StorageProvider+getRevision"></a>

### storageProvider.getRevision ⇒ <code>Promise.&lt;(UttoriWikiDocument\|undefined)&gt;</code>
Returns a specifc revision from the history of edits for a given slug and revision timestamp.

**Kind**: instance property of [<code>StorageProvider</code>](#StorageProvider)  
**Returns**: <code>Promise.&lt;(UttoriWikiDocument\|undefined)&gt;</code> - The returned revision of the document.  

| Param | Type | Description |
| --- | --- | --- |
| params | <code>object</code> | The params object. |
| params.slug | <code>string</code> | The slug of the document to be returned. |
| params.revision | <code>string</code> \| <code>number</code> | The unix timestamp of the history to be returned. |

<a name="StorageProvider+add"></a>

### storageProvider.add
Saves a document to internal array.

**Kind**: instance property of [<code>StorageProvider</code>](#StorageProvider)  

| Param | Type | Description |
| --- | --- | --- |
| document | <code>UttoriWikiDocument</code> | The document to be added to the collection. |

<a name="StorageProvider+updateValid"></a>

### storageProvider.updateValid ℗
Updates a document and saves to memory.

**Kind**: instance property of [<code>StorageProvider</code>](#StorageProvider)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| params | <code>object</code> | The params object. |
| params.document | <code>UttoriWikiDocument</code> | The document to be updated in the collection. |
| params.originalSlug | <code>string</code> | The original slug identifying the document, or the slug if it has not changed. |

<a name="StorageProvider+update"></a>

### storageProvider.update
Updates a document and figures out how to save to memory.
Calling with a new document will add that document.

**Kind**: instance property of [<code>StorageProvider</code>](#StorageProvider)  

| Param | Type | Description |
| --- | --- | --- |
| params | <code>object</code> | The params object. |
| params.document | <code>UttoriWikiDocument</code> | The document to be updated in the collection. |
| params.originalSlug | <code>string</code> | The original slug identifying the document, or the slug if it has not changed. |

<a name="StorageProvider+delete"></a>

### storageProvider.delete
Removes a document from memory.

**Kind**: instance property of [<code>StorageProvider</code>](#StorageProvider)  

| Param | Type | Description |
| --- | --- | --- |
| slug | <code>string</code> | The slug identifying the document. |

<a name="StorageProvider+updateHistory"></a>

### storageProvider.updateHistory
Updates History for a given slug, renaming the key and history key as needed.

**Kind**: instance property of [<code>StorageProvider</code>](#StorageProvider)  

| Param | Type | Description |
| --- | --- | --- |
| params | <code>object</code> | The params object. |
| params.slug | <code>string</code> | The slug of the document to update history for. |
| params.content | <code>UttoriWikiDocument</code> | The revision of the document to be saved. |
| [params.originalSlug] | <code>string</code> | The original slug identifying the document, or the slug if it has not changed. |

<a name="StorageProvider+reset"></a>

### storageProvider.reset()
Resets to the initial state.

**Kind**: instance method of [<code>StorageProvider</code>](#StorageProvider)  
<a name="StorageProviderConfig"></a>

## StorageProviderConfig
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| [updateTimestamps] | <code>boolean</code> | Should update times be marked at the time of edit. |
| [useHistory] | <code>boolean</code> | Should history entries be created. |
| [events] | <code>Record.&lt;string, Array.&lt;string&gt;&gt;</code> | The events to listen for. |

