## Classes

<dl>
<dt><a href="#OllamaEmbedder">OllamaEmbedder</a></dt>
<dd></dd>
</dl>

## Constants

<dl>
<dt><a href="#stopwordsEnglish">stopwordsEnglish</a> : <code>Array.&lt;string&gt;</code></dt>
<dd><p>Common English stopwords.</p>
</dd>
</dl>

<a name="OllamaEmbedder"></a>

## OllamaEmbedder
**Kind**: global class  

* [OllamaEmbedder](#OllamaEmbedder)
    * [new OllamaEmbedder(baseUrl, model)](#new_OllamaEmbedder_new)
    * _instance_
        * [.baseUrl](#OllamaEmbedder+baseUrl)
        * [.model](#OllamaEmbedder+model)
        * [.embed(input, [prompt], [numAttempts])](#OllamaEmbedder+embed) ⇒ <code>Promise.&lt;Array.&lt;number&gt;&gt;</code>
        * [.embedBatch(texts, [prompt], [concurrency])](#OllamaEmbedder+embedBatch) ⇒ <code>Promise.&lt;Array.&lt;Array.&lt;number&gt;&gt;&gt;</code>
        * [.probeDimension()](#OllamaEmbedder+probeDimension) ⇒ <code>Promise.&lt;number&gt;</code>
    * _static_
        * [.approxTokenLen(text)](#OllamaEmbedder.approxTokenLen) ⇒ <code>number</code>
        * [.removeStopWords(text, [stopwords])](#OllamaEmbedder.removeStopWords) ⇒ <code>Array.&lt;string&gt;</code>

<a name="new_OllamaEmbedder_new"></a>

### new OllamaEmbedder(baseUrl, model)

| Param | Type | Description |
| --- | --- | --- |
| baseUrl | <code>string</code> | The base URL of the Ollama server. |
| model | <code>string</code> | The model to use for the embeddings. |

<a name="OllamaEmbedder+baseUrl"></a>

### ollamaEmbedder.baseUrl
The base URL of the Ollama server.

**Kind**: instance property of [<code>OllamaEmbedder</code>](#OllamaEmbedder)  
<a name="OllamaEmbedder+model"></a>

### ollamaEmbedder.model
The model to use for the embeddings.

**Kind**: instance property of [<code>OllamaEmbedder</code>](#OllamaEmbedder)  
<a name="OllamaEmbedder+embed"></a>

### ollamaEmbedder.embed(input, [prompt], [numAttempts]) ⇒ <code>Promise.&lt;Array.&lt;number&gt;&gt;</code>
Embed a text string with Ollama via the embeddings API.

**Kind**: instance method of [<code>OllamaEmbedder</code>](#OllamaEmbedder)  
**Returns**: <code>Promise.&lt;Array.&lt;number&gt;&gt;</code> - The embedding vector.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| input | <code>string</code> |  | The text to embed. |
| [prompt] | <code>string</code> |  | The prompt to embed. |
| [numAttempts] | <code>number</code> | <code>5</code> | The number of attempts to make. Defaults to 5. |

<a name="OllamaEmbedder+embedBatch"></a>

### ollamaEmbedder.embedBatch(texts, [prompt], [concurrency]) ⇒ <code>Promise.&lt;Array.&lt;Array.&lt;number&gt;&gt;&gt;</code>
Embed a batch of text strings with Ollama via the embeddings API.

**Kind**: instance method of [<code>OllamaEmbedder</code>](#OllamaEmbedder)  
**Returns**: <code>Promise.&lt;Array.&lt;Array.&lt;number&gt;&gt;&gt;</code> - The embedding vectors.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| texts | <code>Array.&lt;string&gt;</code> |  | The text strings to embed. |
| [prompt] | <code>string</code> |  | The prompt to embed. |
| [concurrency] | <code>number</code> | <code>8</code> | The number of concurrent requests to make. Defaults to 8. |

<a name="OllamaEmbedder+probeDimension"></a>

### ollamaEmbedder.probeDimension() ⇒ <code>Promise.&lt;number&gt;</code>
Probe the dimension of the embedding vector.

**Kind**: instance method of [<code>OllamaEmbedder</code>](#OllamaEmbedder)  
**Returns**: <code>Promise.&lt;number&gt;</code> - The dimension of the embedding vector.  
<a name="OllamaEmbedder.approxTokenLen"></a>

### OllamaEmbedder.approxTokenLen(text) ⇒ <code>number</code>
Approximate the number of tokens in a string.
A rough approximation of tokens is 3/4 the number of words for English text.

**Kind**: static method of [<code>OllamaEmbedder</code>](#OllamaEmbedder)  
**Returns**: <code>number</code> - The approximate token length of the text (rounded down).  

| Param | Type | Description |
| --- | --- | --- |
| text | <code>string</code> | The text to approximate the number of tokens of. |

<a name="OllamaEmbedder.removeStopWords"></a>

### OllamaEmbedder.removeStopWords(text, [stopwords]) ⇒ <code>Array.&lt;string&gt;</code>
Remove stop words from a text string.

**Kind**: static method of [<code>OllamaEmbedder</code>](#OllamaEmbedder)  
**Returns**: <code>Array.&lt;string&gt;</code> - The text with the stopwords removed.  

| Param | Type | Description |
| --- | --- | --- |
| text | <code>string</code> | The text to remove stop words from. |
| [stopwords] | <code>Array.&lt;string&gt;</code> | The stopwords to remove. Defaults to English stopwords. |

<a name="stopwordsEnglish"></a>

## stopwordsEnglish : <code>Array.&lt;string&gt;</code>
Common English stopwords.

**Kind**: global constant  
