<a name="extractAttachmentText"></a>

## extractAttachmentText(config, attachment) ⇒ <code>Promise.&lt;string&gt;</code>
Extract text from an attachment.For PDFs, this now preserves page boundaries to help with chunking.

**Kind**: global function  
**Returns**: <code>Promise.&lt;string&gt;</code> - The text of the attachment.  

| Param | Type | Description |
| --- | --- | --- |
| config | <code>AIChatBotConfig</code> | The configuration. |
| attachment | <code>UttoriWikiDocumentAttachment</code> | The attachment. |

<a name="extractAttachmentText..text"></a>

### extractAttachmentText~text : <code>string</code>
**Kind**: inner constant of [<code>extractAttachmentText</code>](#extractAttachmentText)  
