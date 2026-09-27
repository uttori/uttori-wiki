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
//# sourceMappingURL=ollama-embedder.d.ts.map