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
