export default OllamaEmbedder;
/**
 * Common English stopwords.
 * @type {string[]}
 */
export const stopwordsEnglish: string[];
/**
 * A single embedding entry in an OpenAI-style `data` array.
 */
export type OllamaEmbeddingDatum = {
    /**
     * The embedding vector.
     */
    embedding: number[];
};
/**
 * Builds a per-input embedding prompt. Passed to {@link OllamaEmbedder#embedBatch} so each input
 * can be given its own prompt instead of sharing one (e.g. the whole batch concatenated).
 */
export type EmbedPromptBuilder = (text: string, index: number) => string;
/**
 * The various response shapes returned by Ollama's embeddings endpoints across versions.
 */
export type OllamaEmbeddingResponse = {
    /**
     * A single embedding vector (legacy `/api/embeddings` shape).
     */
    embedding?: number[] | undefined;
    /**
     * A single embedding vector under the plural key (some versions).
     */
    embeddings?: number[] | undefined;
    /**
     * An OpenAI-style array of embedding entries.
     */
    data?: OllamaEmbeddingDatum[] | undefined;
};
/**
 * A single embedding entry in an OpenAI-style `data` array.
 * @typedef {object} OllamaEmbeddingDatum
 * @property {number[]} embedding The embedding vector.
 */
/**
 * Builds a per-input embedding prompt. Passed to {@link OllamaEmbedder#embedBatch} so each input
 * can be given its own prompt instead of sharing one (e.g. the whole batch concatenated).
 * @callback EmbedPromptBuilder
 * @param {string} text The text being embedded.
 * @param {number} index The index of the text within the batch.
 * @returns {string} The prompt to send to the embeddings API for this input.
 */
/**
 * The various response shapes returned by Ollama's embeddings endpoints across versions.
 * @typedef {object} OllamaEmbeddingResponse
 * @property {number[]} [embedding] A single embedding vector (legacy `/api/embeddings` shape).
 * @property {number[]} [embeddings] A single embedding vector under the plural key (some versions).
 * @property {OllamaEmbeddingDatum[]} [data] An OpenAI-style array of embedding entries.
 */
declare class OllamaEmbedder {
    /**
     * Approximate the number of tokens in a string.
     * A rough approximation of tokens is 3/4 the number of words for English text.
     * @param {string} text The text to approximate the number of tokens of.
     * @returns {number} The approximate token length of the text (rounded down).
     */
    static approxTokenLen(text: string): number;
    /**
     * Remove stop words from a text string.
     * @param {string} text The text to remove stop words from.
     * @param {string[]} [stopwords] The stopwords to remove. Defaults to English stopwords.
     * @returns {string[]} The text with the stopwords removed.
     */
    static removeStopWords(text: string, stopwords?: string[]): string[];
    /**
     * @param {string} baseUrl The base URL of the Ollama server.
     * @param {string} model The model to use for the embeddings.
     */
    constructor(baseUrl: string, model: string);
    /**
     * The base URL of the Ollama server.
     * @type {string}
     */
    baseUrl: string;
    /**
     * The model to use for the embeddings.
     * @type {string}
     */
    model: string;
    /**
     * Embed a text string with Ollama via the embeddings API.
     * @param {string} input The text to embed.
     * @param {string} [prompt] The prompt to embed.
     * @param {number} [numAttempts] The number of attempts to make. Defaults to 5.
     * @returns {Promise<number[]>} The embedding vector.
     * @see {@link https://github.com/ollama/ollama/blob/main/docs/api.md#generate-embeddings} Ollama API documentation.
     */
    embed(input: string, prompt?: string, numAttempts?: number): Promise<number[]>;
    /**
     * Embed a batch of text strings with Ollama via the embeddings API.
     * @param {string[]} texts The text strings to embed.
     * @param {string | EmbedPromptBuilder} [prompt] The prompt to embed.
     * Pass a builder function to compute a per-text prompt.
     * This avoids sending one large shared prompt (e.g. the whole batch concatenated) for every input,
     * which wastes bandwidth and can overrun the model's context window.
     * A plain string applies the same prompt to every input.
     * @param {number} [concurrency] The number of concurrent requests to make. Defaults to 8.
     * @returns {Promise<number[][]>} The embedding vectors.
     */
    embedBatch(texts: string[], prompt?: string | EmbedPromptBuilder, concurrency?: number): Promise<number[][]>;
    /**
     * Probe the dimension of the embedding vector.
     * @returns {Promise<number>} The dimension of the embedding vector.
     */
    probeDimension(): Promise<number>;
}
//# sourceMappingURL=ollama-embedder.d.ts.map