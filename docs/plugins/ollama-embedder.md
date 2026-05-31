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

## Typedefs

<dl>
<dt><a href="#OllamaEmbeddingDatum">OllamaEmbeddingDatum</a> : <code>object</code></dt>
<dd><p>A single embedding entry in an OpenAI-style <code>data</code> array.</p>
</dd>
<dt><a href="#EmbedPromptBuilder">EmbedPromptBuilder</a> ⇒ <code>string</code></dt>
<dd><p>Builds a per-input embedding prompt. Passed to <a href="#OllamaEmbedder+embedBatch">embedBatch</a> so each input
can be given its own prompt instead of sharing one (e.g. the whole batch concatenated).</p>
</dd>
<dt><a href="#OllamaEmbeddingResponse">OllamaEmbeddingResponse</a> : <code>object</code></dt>
<dd><p>The various response shapes returned by Ollama&#39;s embeddings endpoints across versions.</p>
</dd>
</dl>

<a name="OllamaEmbedder"></a>

## OllamaEmbedder
**Kind**: global class  

* [OllamaEmbedder](#OllamaEmbedder)
    * [new OllamaEmbedder(baseUrl, model)](#new_OllamaEmbedder_new)
    * _instance_
        * [.baseUrl](#OllamaEmbedder+baseUrl) : <code>string</code>
        * [.model](#OllamaEmbedder+model) : <code>string</code>
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

### ollamaEmbedder.baseUrl : <code>string</code>
The base URL of the Ollama server.

**Kind**: instance property of [<code>OllamaEmbedder</code>](#OllamaEmbedder)  
<a name="OllamaEmbedder+model"></a>

### ollamaEmbedder.model : <code>string</code>
The model to use for the embeddings.

**Kind**: instance property of [<code>OllamaEmbedder</code>](#OllamaEmbedder)  
<a name="OllamaEmbedder+embed"></a>

### ollamaEmbedder.embed(input, [prompt], [numAttempts]) ⇒ <code>Promise.&lt;Array.&lt;number&gt;&gt;</code>
Embed a text string with Ollama via the embeddings API.

**Kind**: instance method of [<code>OllamaEmbedder</code>](#OllamaEmbedder)  
**Returns**: <code>Promise.&lt;Array.&lt;number&gt;&gt;</code> - The embedding vector.  
**See**: [https://github.com/ollama/ollama/blob/main/docs/api.md#generate-embeddings](https://github.com/ollama/ollama/blob/main/docs/api.md#generate-embeddings) Ollama API documentation.  

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
| [prompt] | <code>string</code> \| [<code>EmbedPromptBuilder</code>](#EmbedPromptBuilder) |  | The prompt to embed. Pass a builder function to compute a per-text prompt. This avoids sending one large shared prompt (e.g. the whole batch concatenated) for every input, which wastes bandwidth and can overrun the model's context window. A plain string applies the same prompt to every input. |
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
<a name="OllamaEmbeddingDatum"></a>

## OllamaEmbeddingDatum : <code>object</code>
A single embedding entry in an OpenAI-style `data` array.

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| embedding | <code>Array.&lt;number&gt;</code> | The embedding vector. |

<a name="EmbedPromptBuilder"></a>

## EmbedPromptBuilder ⇒ <code>string</code>
Builds a per-input embedding prompt. Passed to [embedBatch](#OllamaEmbedder+embedBatch) so each input
can be given its own prompt instead of sharing one (e.g. the whole batch concatenated).

**Kind**: global typedef  
**Returns**: <code>string</code> - The prompt to send to the embeddings API for this input.  

| Param | Type | Description |
| --- | --- | --- |
| text | <code>string</code> | The text being embedded. |
| index | <code>number</code> | The index of the text within the batch. |

<a name="OllamaEmbeddingResponse"></a>

## OllamaEmbeddingResponse : <code>object</code>
The various response shapes returned by Ollama's embeddings endpoints across versions.

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| [embedding] | <code>Array.&lt;number&gt;</code> | A single embedding vector (legacy `/api/embeddings` shape). |
| [embeddings] | <code>Array.&lt;number&gt;</code> | A single embedding vector under the plural key (some versions). |
| [data] | [<code>Array.&lt;OllamaEmbeddingDatum&gt;</code>](#OllamaEmbeddingDatum) | An OpenAI-style array of embedding entries. |

