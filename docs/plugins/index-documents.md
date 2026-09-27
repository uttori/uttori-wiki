## Functions

<dl>
<dt><a href="#buildBlocks">buildBlocks(document, config)</a> ⇒</dt>
<dd><p>Build blocks from a document.</p>
</dd>
<dt><a href="#ensureChatIndexSchema">ensureChatIndexSchema(db, config, [options])</a> ⇒</dt>
<dd><p>Ensure the chat index tables exist.</p>
</dd>
<dt><a href="#removeIndexedDocumentFromDatabase">removeIndexedDocumentFromDatabase(db, slug)</a></dt>
<dd><p>Remove a document and all of its chunks from the chat index.</p>
</dd>
<dt><a href="#indexDocumentInDatabase">indexDocumentInDatabase(db, config, embedder, document)</a> ⇒</dt>
<dd><p>Index one document using an already-open database.</p>
</dd>
</dl>

<a name="buildBlocks"></a>

## buildBlocks(document, config) ⇒
Build blocks from a document.

**Kind**: global function\
**Returns**: The blocks.\

| Param | Description |
| --- | --- |
| document | The document to build blocks from. |
| config | The options. |

<a name="ensureChatIndexSchema"></a>

## ensureChatIndexSchema(db, config, [options]) ⇒
Ensure the chat index tables exist.

**Kind**: global function\
**Returns**: The embedder and vector dimension.\

| Param | Description |
| --- | --- |
| db | The database. |
| config | The options. |
| [options] | Schema options. |

<a name="removeIndexedDocumentFromDatabase"></a>

## removeIndexedDocumentFromDatabase(db, slug)
Remove a document and all of its chunks from the chat index.

**Kind**: global function\

| Param | Description |
| --- | --- |
| db | The database. |
| slug | The source slug to remove. |

<a name="indexDocumentInDatabase"></a>

## indexDocumentInDatabase(db, config, embedder, document) ⇒
Index one document using an already-open database.

**Kind**: global function\
**Returns**: Indexing stats.\

| Param | Description |
| --- | --- |
| db | The database. |
| config | The options. |
| embedder | The embedder. |
| document | The document to index. |

## TypeScript declarations

<details>
<summary>View documented types and signatures</summary>

```typescript
import OllamaEmbedder from './ollama-embedder.js';
import type { ChatIndexSchemaOptions } from '../../types/plugins/chat-bot/index-documents.js';
export type { ChatIndexSchemaOptions } from '../../types/plugins/chat-bot/index-documents.js';
/**
 * Build blocks from a document.
 * @param document The document to build blocks from.
 * @param config The options.
 * @returns The blocks.
 */
export declare function buildBlocks(document: import('../../wiki.js').UttoriWikiDocument, config: import('../search-provider-sqlite.js').ResolvedSearchSQLiteConfig): Promise<import('../search-provider-sqlite.js').IndexedBlock[]>;
/**
 * Ensure the chat index tables exist.
 * @param db The database.
 * @param config The options.
 * @param [options] Schema options.
 * @returns The embedder and vector dimension.
 */
export declare function ensureChatIndexSchema(db: import('better-sqlite3').Database, config: import('../search-provider-sqlite.js').ResolvedSearchSQLiteConfig, options?: ChatIndexSchemaOptions): Promise<{
    embedder: OllamaEmbedder;
    dim: number;
}>;
/**
 * Remove a document and all of its chunks from the chat index.
 * @param db The database.
 * @param slug The source slug to remove.
 */
export declare function removeIndexedDocumentFromDatabase(db: import('better-sqlite3').Database, slug: string): void;
/**
 * Index one document using an already-open database.
 * @param db The database.
 * @param config The options.
 * @param embedder The embedder.
 * @param document The document to index.
 * @returns Indexing stats.
 */
export declare function indexDocumentInDatabase(db: import('better-sqlite3').Database, config: import('../search-provider-sqlite.js').ResolvedSearchSQLiteConfig, embedder: OllamaEmbedder, document: import('../../wiki.js').UttoriWikiDocument): Promise<{
    chunks: number;
    skipped: boolean;
    errored: number;
}>;

export interface ChatIndexSchemaOptions {
    /** Whether to rebuild index tables. */
    rebuild?: boolean;
}
```

</details>
