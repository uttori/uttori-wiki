## Classes

<dl>
<dt><a href="#StorageProviderJsonFile">StorageProviderJsonFile</a></dt>
<dd><p>Storage for Uttori documents using JSON files stored on the local file system.</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#StorageProviderJsonFileConfig">StorageProviderJsonFileConfig</a></dt>
<dd></dd>
</dl>

<a name="StorageProviderJsonFile"></a>

## StorageProviderJsonFile
Storage for Uttori documents using JSON files stored on the local file system.

**Kind**: global class  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| config | [<code>StorageProviderJsonFileConfig</code>](#StorageProviderJsonFileConfig) | The configuration object. |
| documents | <code>Record.&lt;string, UttoriWikiDocument&gt;</code> | The collection of documents where the slug is the key and the value is the document. |


* [StorageProviderJsonFile](#StorageProviderJsonFile)
    * [new StorageProviderJsonFile(config)](#new_StorageProviderJsonFile_new)
    * _instance_
        * [.documents](#StorageProviderJsonFile+documents) : <code>Record.&lt;string, UttoriWikiDocument&gt;</code>
        * [.all](#StorageProviderJsonFile+all) ⇒ <code>Promise.&lt;Record.&lt;string, UttoriWikiDocument&gt;&gt;</code>
        * [.getQuery](#StorageProviderJsonFile+getQuery) ⇒ <code>Promise.&lt;(Array.&lt;UttoriWikiDocument&gt;\|number)&gt;</code>
        * [.get](#StorageProviderJsonFile+get) ⇒ <code>Promise.&lt;(UttoriWikiDocument\|undefined)&gt;</code>
        * [.add](#StorageProviderJsonFile+add)
        * [.updateValid](#StorageProviderJsonFile+updateValid) ℗
        * [.update](#StorageProviderJsonFile+update)
        * [.delete](#StorageProviderJsonFile+delete)
        * [.getHistory](#StorageProviderJsonFile+getHistory) ⇒ <code>Promise.&lt;Array.&lt;string&gt;&gt;</code>
        * [.getRevision](#StorageProviderJsonFile+getRevision) ⇒ <code>Promise.&lt;(UttoriWikiDocument\|undefined)&gt;</code>
        * [.updateHistory](#StorageProviderJsonFile+updateHistory)
    * _static_
        * [.ensureDirectory(directory)](#StorageProviderJsonFile.ensureDirectory)

<a name="new_StorageProviderJsonFile_new"></a>

### new StorageProviderJsonFile(config)
Creates an instance of StorageProvider.


| Param | Type | Description |
| --- | --- | --- |
| config | [<code>StorageProviderJsonFileConfig</code>](#StorageProviderJsonFileConfig) | A configuration object. |

**Example** *(Init StorageProviderJsonFile)*  
```js
const storageProvider = new StorageProviderJsonFile({ contentDirectory: 'content', historyDirectory: 'history', spacesDocument: 2 });
```
<a name="StorageProviderJsonFile+documents"></a>

### storageProviderJsonFile.documents : <code>Record.&lt;string, UttoriWikiDocument&gt;</code>
The collection of documents where the slug is the key and the value is the document.

**Kind**: instance property of [<code>StorageProviderJsonFile</code>](#StorageProviderJsonFile)  
<a name="StorageProviderJsonFile+all"></a>

### storageProviderJsonFile.all ⇒ <code>Promise.&lt;Record.&lt;string, UttoriWikiDocument&gt;&gt;</code>
Returns all documents.

**Kind**: instance property of [<code>StorageProviderJsonFile</code>](#StorageProviderJsonFile)  
**Returns**: <code>Promise.&lt;Record.&lt;string, UttoriWikiDocument&gt;&gt;</code> - All documents.  
**Example**  
```js
storageProvider.all();
➜ { first-document: { slug: 'first-document', ... }, ...}
```
<a name="StorageProviderJsonFile+getQuery"></a>

### storageProviderJsonFile.getQuery ⇒ <code>Promise.&lt;(Array.&lt;UttoriWikiDocument&gt;\|number)&gt;</code>
Returns all documents matching a given query.

**Kind**: instance property of [<code>StorageProviderJsonFile</code>](#StorageProviderJsonFile)  
**Returns**: <code>Promise.&lt;(Array.&lt;UttoriWikiDocument&gt;\|number)&gt;</code> - Promise object represents all matching documents.  

| Param | Type | Description |
| --- | --- | --- |
| query | <code>string</code> | The conditions on which documents should be returned. |

<a name="StorageProviderJsonFile+get"></a>

### storageProviderJsonFile.get ⇒ <code>Promise.&lt;(UttoriWikiDocument\|undefined)&gt;</code>
Returns a document for a given slug.

**Kind**: instance property of [<code>StorageProviderJsonFile</code>](#StorageProviderJsonFile)  
**Returns**: <code>Promise.&lt;(UttoriWikiDocument\|undefined)&gt;</code> - Promise object represents the returned UttoriDocument.  

| Param | Type | Description |
| --- | --- | --- |
| slug | <code>string</code> | The slug of the document to be returned. |

<a name="StorageProviderJsonFile+add"></a>

### storageProviderJsonFile.add
Saves a document to the file system.

**Kind**: instance property of [<code>StorageProviderJsonFile</code>](#StorageProviderJsonFile)  

| Param | Type | Description |
| --- | --- | --- |
| document | <code>UttoriWikiDocument</code> | The document to be added to the collection. |

<a name="StorageProviderJsonFile+updateValid"></a>

### storageProviderJsonFile.updateValid ℗
Updates a document and saves to the file system.

**Kind**: instance property of [<code>StorageProviderJsonFile</code>](#StorageProviderJsonFile)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| document | <code>UttoriWikiDocument</code> | The document to be updated in the collection. |
| originalSlug | <code>string</code> | The original slug identifying the document, or the slug if it has not changed. |

<a name="StorageProviderJsonFile+update"></a>

### storageProviderJsonFile.update
Updates a document and figures out how to save to the file system.

**Kind**: instance property of [<code>StorageProviderJsonFile</code>](#StorageProviderJsonFile)  

| Param | Type | Description |
| --- | --- | --- |
| params | <code>object</code> | The params object. |
| params.document | <code>UttoriWikiDocument</code> | The document to be updated in the collection. |
| params.originalSlug | <code>string</code> | The original slug identifying the document, or the slug if it has not changed. |

<a name="StorageProviderJsonFile+delete"></a>

### storageProviderJsonFile.delete
Removes a document from the file system.

**Kind**: instance property of [<code>StorageProviderJsonFile</code>](#StorageProviderJsonFile)  

| Param | Type | Description |
| --- | --- | --- |
| slug | <code>string</code> | The slug identifying the document. |

<a name="StorageProviderJsonFile+getHistory"></a>

### storageProviderJsonFile.getHistory ⇒ <code>Promise.&lt;Array.&lt;string&gt;&gt;</code>
Returns the history of edits for a given slug.

**Kind**: instance property of [<code>StorageProviderJsonFile</code>](#StorageProviderJsonFile)  
**Returns**: <code>Promise.&lt;Array.&lt;string&gt;&gt;</code> - Promise object represents the returned history.  

| Param | Type | Description |
| --- | --- | --- |
| slug | <code>string</code> | The slug of the document to get history for. |

<a name="StorageProviderJsonFile+getRevision"></a>

### storageProviderJsonFile.getRevision ⇒ <code>Promise.&lt;(UttoriWikiDocument\|undefined)&gt;</code>
Returns a specifc revision from the history of edits for a given slug and revision timestamp.

**Kind**: instance property of [<code>StorageProviderJsonFile</code>](#StorageProviderJsonFile)  
**Returns**: <code>Promise.&lt;(UttoriWikiDocument\|undefined)&gt;</code> - Promise object represents the returned revision of the document.  

| Param | Type | Description |
| --- | --- | --- |
| params | <code>object</code> | The params object. |
| params.slug | <code>string</code> | The slug of the document to be returned. |
| params.revision | <code>string</code> \| <code>number</code> | The unix timestamp of the history to be returned. |

<a name="StorageProviderJsonFile+updateHistory"></a>

### storageProviderJsonFile.updateHistory
Updates History for a given slug, renaming the store file and history directory as needed.

**Kind**: instance property of [<code>StorageProviderJsonFile</code>](#StorageProviderJsonFile)  

| Param | Type | Description |
| --- | --- | --- |
| slug | <code>string</code> | The slug of the document to update history for. |
| content | <code>string</code> | The revision of the document to be saved. |
| [originalSlug] | <code>string</code> | The original slug identifying the document, or the slug if it has not changed. |

<a name="StorageProviderJsonFile.ensureDirectory"></a>

### StorageProviderJsonFile.ensureDirectory(directory)
Ensure a directory exists, and if not create it.

**Kind**: static method of [<code>StorageProviderJsonFile</code>](#StorageProviderJsonFile)  

| Param | Type | Description |
| --- | --- | --- |
| directory | <code>string</code> | The directory to ensure exists. |

<a name="StorageProviderJsonFileConfig"></a>

## StorageProviderJsonFileConfig
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| contentDirectory | <code>string</code> | The directory to store documents. |
| historyDirectory | <code>string</code> | The directory to store document histories. |
| [extension] | <code>string</code> | The file extension to use for file. |
| [updateTimestamps] | <code>boolean</code> | Should update times be marked at the time of edit. |
| [useHistory] | <code>boolean</code> | Should history entries be created. |
| [useCache] | <code>boolean</code> | Should we cache files in memory? |
| [spacesDocument] | <code>number</code> | The spaces parameter for JSON stringifying documents. |
| [spacesHistory] | <code>number</code> | The spaces parameter for JSON stringifying history. |
| [events] | <code>Record.&lt;string, Array.&lt;string&gt;&gt;</code> | The events to listen for. |

