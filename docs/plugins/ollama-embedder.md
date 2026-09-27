## Classes

<dl>
<dt><a href="#OllamaEmbedder">OllamaEmbedder</a></dt>
<dd></dd>
</dl>

## Constants

<dl>
<dt><a href="#stopwordsEnglish">stopwordsEnglish</a></dt>
<dd><p>Common English stopwords.</p>
</dd>
</dl>

<a name="OllamaEmbedder"></a>

## OllamaEmbedder
**Kind**: global class\

* [OllamaEmbedder](#OllamaEmbedder)
    * [new OllamaEmbedder(baseUrl, model)](#new_OllamaEmbedder_new)
    * _instance_
        * [.baseUrl](#OllamaEmbedder+baseUrl)
        * [.model](#OllamaEmbedder+model)
        * [.embed(input, [prompt], [numAttempts])](#OllamaEmbedder+embed) ⇒
        * [.embedBatch(texts, [prompt], [concurrency])](#OllamaEmbedder+embedBatch) ⇒
        * [.probeDimension()](#OllamaEmbedder+probeDimension) ⇒
    * _static_
        * [.approxTokenLen(text)](#OllamaEmbedder.approxTokenLen) ⇒
        * [.removeStopWords(text, [stopwords])](#OllamaEmbedder.removeStopWords) ⇒

<a name="new_OllamaEmbedder_new"></a>

### new OllamaEmbedder(baseUrl, model)

| Param | Description |
| --- | --- |
| baseUrl | The base URL of the Ollama server. |
| model | The model to use for the embeddings. |

<a name="OllamaEmbedder+baseUrl"></a>

### ollamaEmbedder.baseUrl
The base URL of the Ollama server.

**Kind**: instance property of [<code>OllamaEmbedder</code>](#OllamaEmbedder)\
<a name="OllamaEmbedder+model"></a>

### ollamaEmbedder.model
The model to use for the embeddings.

**Kind**: instance property of [<code>OllamaEmbedder</code>](#OllamaEmbedder)\
<a name="OllamaEmbedder+embed"></a>

### ollamaEmbedder.embed(input, [prompt], [numAttempts]) ⇒
Embed a text string with Ollama via the embeddings API.

**Kind**: instance method of [<code>OllamaEmbedder</code>](#OllamaEmbedder)\
**Returns**: The embedding vector.\
**See**: [https://github.com/ollama/ollama/blob/main/docs/api.md#generate-embeddings](https://github.com/ollama/ollama/blob/main/docs/api.md#generate-embeddings) Ollama API documentation.\

| Param | Default | Description |
| --- | --- | --- |
| input |  | The text to embed. |
| [prompt] |  | The prompt to embed. |
| [numAttempts] | <code>5</code> | The number of attempts to make. Defaults to 5. |

<a name="OllamaEmbedder+embedBatch"></a>

### ollamaEmbedder.embedBatch(texts, [prompt], [concurrency]) ⇒
Embed a batch of text strings with Ollama via the embeddings API.

**Kind**: instance method of [<code>OllamaEmbedder</code>](#OllamaEmbedder)\
**Returns**: The embedding vectors.\

| Param | Default | Description |
| --- | --- | --- |
| texts |  | The text strings to embed. |
| [prompt] |  | The prompt to embed. Pass a builder function to compute a per-text prompt. This avoids sending one large shared prompt (e.g. the whole batch concatenated) for every input, which wastes bandwidth and can overrun the model's context window. A plain string applies the same prompt to every input. |
| [concurrency] | <code>8</code> | The number of concurrent requests to make. Defaults to 8. |

<a name="OllamaEmbedder+probeDimension"></a>

### ollamaEmbedder.probeDimension() ⇒
Probe the dimension of the embedding vector.

**Kind**: instance method of [<code>OllamaEmbedder</code>](#OllamaEmbedder)\
**Returns**: The dimension of the embedding vector.\
<a name="OllamaEmbedder.approxTokenLen"></a>

### OllamaEmbedder.approxTokenLen(text) ⇒
Approximate the number of tokens in a string.
A rough approximation of tokens is 3/4 the number of words for English text.

**Kind**: static method of [<code>OllamaEmbedder</code>](#OllamaEmbedder)\
**Returns**: The approximate token length of the text (rounded down).\

| Param | Description |
| --- | --- |
| text | The text to approximate the number of tokens of. |

<a name="OllamaEmbedder.removeStopWords"></a>

### OllamaEmbedder.removeStopWords(text, [stopwords]) ⇒
Remove stop words from a text string.

**Kind**: static method of [<code>OllamaEmbedder</code>](#OllamaEmbedder)\
**Returns**: The text with the stopwords removed.\

| Param | Description |
| --- | --- |
| text | The text to remove stop words from. |
| [stopwords] | The stopwords to remove. Defaults to English stopwords. |

<a name="stopwordsEnglish"></a>

## stopwordsEnglish
Common English stopwords.

**Kind**: global constant\

## TypeScript declarations

<details>
<summary>View documented types and signatures</summary>

```typescript
import type { EmbedPromptBuilder } from '../../types/plugins/chat-bot/ollama-embedder.js';
export type { OllamaEmbeddingDatum, EmbedPromptBuilder, OllamaEmbeddingResponse, } from '../../types/plugins/chat-bot/ollama-embedder.js';
declare class OllamaEmbedder {
    /**
     * The base URL of the Ollama server.
     *
     */
    baseUrl: string;
    /**
     * The model to use for the embeddings.
     *
     */
    model: string;
    /**
     * @param baseUrl The base URL of the Ollama server.
     * @param model The model to use for the embeddings.
     */
    constructor(baseUrl: string, model: string);
    /**
     * Embed a text string with Ollama via the embeddings API.
     * @param input The text to embed.
     * @param [prompt] The prompt to embed.
     * @param [numAttempts] The number of attempts to make. Defaults to 5.
     * @returns The embedding vector.
     * @see {@link https://github.com/ollama/ollama/blob/main/docs/api.md#generate-embeddings} Ollama API documentation.
     */
    embed(input: string, prompt?: string, numAttempts?: number): Promise<number[]>;
    /**
     * Embed a batch of text strings with Ollama via the embeddings API.
     * @param texts The text strings to embed.
     * @param [prompt] The prompt to embed.
     * Pass a builder function to compute a per-text prompt.
     * This avoids sending one large shared prompt (e.g. the whole batch concatenated) for every input,
     * which wastes bandwidth and can overrun the model's context window.
     * A plain string applies the same prompt to every input.
     * @param [concurrency] The number of concurrent requests to make. Defaults to 8.
     * @returns The embedding vectors.
     */
    embedBatch(texts: string[], prompt?: string | EmbedPromptBuilder, concurrency?: number): Promise<number[][]>;
    /**
     * Probe the dimension of the embedding vector.
     * @returns The dimension of the embedding vector.
     */
    probeDimension(): Promise<number>;
    /**
     * Approximate the number of tokens in a string.
     * A rough approximation of tokens is 3/4 the number of words for English text.
     * @param text The text to approximate the number of tokens of.
     * @returns The approximate token length of the text (rounded down).
     */
    static approxTokenLen(text: string): number;
    /**
     * Remove stop words from a text string.
     * @param text The text to remove stop words from.
     * @param [stopwords] The stopwords to remove. Defaults to English stopwords.
     * @returns The text with the stopwords removed.
     */
    static removeStopWords(text: string, stopwords?: string[]): string[];
}
export default OllamaEmbedder;
/**
 * Common English stopwords.
 *
 */
export declare const stopwordsEnglish: string[];

/** A single embedding entry in an OpenAI-style `data` array. */
export interface OllamaEmbeddingDatum {
    /** The embedding vector. */
    embedding: number[];
}
/** Builds a per-input embedding prompt. Passed to so each input
can be given its own prompt instead of sharing one (e.g. the whole batch concatenated). */
export type EmbedPromptBuilder = (text: string, index: number) => string;
/** The various response shapes returned by Ollama's embeddings endpoints across versions. */
export interface OllamaEmbeddingResponse {
    /** A single embedding vector (legacy `/api/embeddings` shape). */
    embedding?: number[];
    /** A single embedding vector under the plural key (some versions). */
    embeddings?: number[];
    /** An OpenAI-style array of embedding entries. */
    data?: OllamaEmbeddingDatum[];
}
```

</details>
