export default OllamaEmbedder;
/**
 * Common English stopwords.
 * @type {string[]}
 */
export const stopwordsEnglish: string[];
declare class OllamaEmbedder {
    /**
     * Sleep for a given number of milliseconds.
     * @param {number} ms The number of milliseconds to sleep.
     * @returns {Promise<void>} A promise that resolves after the sleep.
     */
    static sleep(ms: number): Promise<void>;
    /**
     * Approximate the number of tokens in a string.
     * A rough approximation of tokens is 3/4 the number of words for English text.
     * @param {string} text The text to approximate the number of tokens of.
     * @returns {number} The approximate token length of the text (rounded down).
     */
    static approxTokenLen(text: string): number;
    static removeStopWords(text: any, stopwords?: string[]): string[];
    /**
     * @param {string} baseUrl The base URL of the Ollama server.
     * @param {string} model The model to use for the embeddings.
     */
    constructor(baseUrl: string, model: string);
    /** The base URL of the Ollama server. */
    baseUrl: string;
    /** The model to use for the embeddings. */
    model: string;
    /**
     * Embed a text string with Ollama via the embeddings API.
     * @param {string} text The text to embed.
     * @returns {Promise<number[]>} The embedding vector.
     */
    embed(text: string): Promise<number[]>;
    /**
     * Embed a batch of text strings with Ollama via the embeddings API.
     * @param {string[]} texts The text strings to embed.
     * @param {number} [concurrency] The number of concurrent requests to make.
     * @returns {Promise<number[][]>} The embedding vectors.
     */
    embedBatch(texts: string[], concurrency?: number): Promise<number[][]>;
    /**
     * Probe the dimension of the embedding vector.
     * @returns {Promise<number>} The dimension of the embedding vector.
     */
    probeDimension(): Promise<number>;
}
//# sourceMappingURL=ollama-embedder.d.ts.map