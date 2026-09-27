<a name="extractAttachmentText"></a>

## extractAttachmentText(config, attachment) ⇒
Extract text from an attachment.
For PDFs, this now preserves page boundaries to help with chunking.

**Kind**: global function\
**Returns**: The text of the attachment.\

| Param | Description |
| --- | --- |
| config | The configuration. |
| attachment | The attachment. |

## TypeScript declarations

<details>
<summary>View documented types and signatures</summary>

```typescript
/**
 * Extract text from an attachment.
 * For PDFs, this now preserves page boundaries to help with chunking.
 * @param config The configuration.
 * @param attachment The attachment.
 * @returns The text of the attachment.
 */
export declare function extractAttachmentText(config: import('../search-provider-sqlite.js').SearchSQLiteConfig, attachment: import('../../wiki.js').UttoriWikiDocumentAttachment): Promise<string>;
```

</details>
