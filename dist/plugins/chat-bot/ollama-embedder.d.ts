export default OllamaEmbedder;
/**
 * Common English stopwords.
 * @type {string[]}
 */
export const stopwordsEnglish: string[];
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
    /** The base URL of the Ollama server. */
    baseUrl: string;
    /** The model to use for the embeddings. */
    model: string;
    /**
     * Embed a text string with Ollama via the embeddings API.
     * @param {string} input The text to embed.
     * @param {string} [prompt] The prompt to embed.
     * @param {number} [numAttempts] The number of attempts to make. Defaults to 5.
     * @returns {Promise<number[]>} The embedding vector.
     */
    embed(input: string, prompt?: string, numAttempts?: number): Promise<number[]>;
    /**
     * Embed a batch of text strings with Ollama via the embeddings API.
     * @param {string[]} texts The text strings to embed.
     * @param {string} [prompt] The prompt to embed.
     * @param {number} [concurrency] The number of concurrent requests to make. Defaults to 8.
     * @returns {Promise<number[][]>} The embedding vectors.
     */
    embedBatch(texts: string[], prompt?: string, concurrency?: number): Promise<number[][]>;
    /**
     * Probe the dimension of the embedding vector.
     * @returns {Promise<number>} The dimension of the embedding vector.
     */
    probeDimension(): Promise<number>;
}
//# sourceMappingURL=ollama-embedder.d.ts.map