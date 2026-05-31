let debug = (..._) => {};
/* c8 ignore next 3 */
try { const { default: d } = await import('debug'); debug = d('Uttori.Plugin.ChatBot.OllamaEmbedder'); } catch {}

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

class OllamaEmbedder {
  /**
   * The base URL of the Ollama server.
   * @type {string}
   */
  baseUrl;
  /**
   * The model to use for the embeddings.
   * @type {string}
   */
  model;

  /**
   * @param {string} baseUrl The base URL of the Ollama server.
   * @param {string} model The model to use for the embeddings.
   */
  constructor(baseUrl, model) {
    this.baseUrl = baseUrl;
    this.model = model;
  }

  /**
   * Embed a text string with Ollama via the embeddings API.
   * @param {string} input The text to embed.
   * @param {string} [prompt] The prompt to embed.
   * @param {number} [numAttempts] The number of attempts to make. Defaults to 5.
   * @returns {Promise<number[]>} The embedding vector.
   * @see {@link https://github.com/ollama/ollama/blob/main/docs/api.md#generate-embeddings} Ollama API documentation.
   */
  async embed(input, prompt, numAttempts = 5) {
    debug('embed: input:', input.length);
    /** @type {Error | null} */
    let lastError = null;
    // Working copies so we can shrink the payload in-place when it overruns the model context.
    let workingInput = input;
    let workingPrompt = prompt;
    // Deterministic failures are bounded by `numAttempts`.
    // Transient failures where Ollama's `llama-server` subprocess crashes / restarts,
    // like "fetch failed", "EOF", "process no longer running",
    // get a separate, larger budget because reloading a model can take 10–30s,
    // and burning the small deterministic allowance on a restart leaves the chunk permanently empty.
    let attempts = 0;
    let transientRetries = 0;
    const maxTransientRetries = 10;
    const maxBackoffMs = 15000;
    /** Some versions expect "input", others "prompt". We'll send both. */
    while (attempts < numAttempts) {
      try {
        const response = await fetch(`${this.baseUrl.replace(/\/$/, '')}/api/embeddings`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ model: this.model, input: workingInput, prompt: workingPrompt ?? workingInput }),
        });
        if (!response.ok) {
          const msg = await response.text();
          debug(`embed: ❌ Ollama ${response.status}: ${msg}`);
          throw new Error(`Ollama ${response.status}: ${msg}`);
        }

        const data = /** @type {OllamaEmbeddingResponse} */ (await response.json());
        if (workingInput !== input) {
          debug('embed: ⚠️ embedded a truncated input that exceeded the model context window.');
        }
        // debug('Ollama embedding data:', data);
        // Common shapes: { embedding: number[] } or { data:[{embedding:[]}] }
        /** @type {number[]} */
        let vec = [];
        if (Array.isArray(data?.embedding)) {
          vec = data.embedding;
        } else if (Array.isArray(data?.embeddings)) {
          vec = data.embeddings;
        } else if (Array.isArray(data?.data?.[0]?.embedding)) {
          vec = data.data[0].embedding;
        } else {
          debug('Unexpected embedding response shape:', data);
          throw new Error('Unexpected embedding response shape');
        }

        // Validate embedding vector for invalid values
        if (!Array.isArray(vec) || vec.length === 0) {
          throw new Error('Empty or invalid embedding vector');
        }

        // Check for -Inf, +Inf, or NaN values
        const hasInvalidValues = vec.some((val) => val === Infinity || val === -Infinity || Number.isNaN(val));
        if (hasInvalidValues) {
          debug('Ollama embedding contains invalid values:', vec.filter((val) => val === Infinity || val === -Infinity || Number.isNaN(val)));
          throw new Error('Embedding vector contains invalid values (-Inf, +Inf, or NaN)');
        }

        debug('embed: ✅ success:', vec.length);
        return vec;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        // Check for unembedable content, needs to be debugged and no retry
        if (typeof error.message === 'string' && error.message.includes('unsupported value: -Inf')) {
          debug('embed: 💀 unsupported value: -Inf, skipping retry:', error.message);
          return [];
        }

        // If the payload exceeds the model's context window, retrying the same text can never
        // succeed, halve the input/prompt and retry immediately instead of backing off. Chunking
        // should keep inputs small, so this is a last-resort safety net for pathological content.
        if (/context (?:length|window)|exceeds|too (?:long|large)|maximum context/i.test(error.message)) {
          const halve = (value) => (typeof value === 'string' && value.length > 256
            ? value.slice(0, Math.floor(value.length / 2))
            : `${value}`);
          const nextInput = halve(workingInput);
          const nextPrompt = workingPrompt ? halve(workingPrompt) : workingPrompt;
          if (nextInput !== workingInput || nextPrompt !== workingPrompt) {
            debug(`embed: ✂️ input exceeds context, truncating (input ${workingInput?.length} ➜ ${nextInput?.length}) and retrying`);
            workingInput = nextInput;
            workingPrompt = nextPrompt;
            lastError = error;
            // Truncation gets its own runway, it does not consume the deterministic attempt budget.
            continue;
          }
        }

        // Transient server/connection failures: the llama-server crashed or is reloading, or the
        // socket dropped. These are worth waiting out rather than giving up after a few hundred ms.
        const transient = /fetch failed|EOF|ECONNREFUSED|ECONNRESET|socket hang up|process no longer running|connection (?:refused|reset)|network|timed?\s?out/i.test(error.message);
        const useTransientBudget = transient && transientRetries < maxTransientRetries;

        // Transient errors back off harder (the model may still be reloading) on a separate budget.
        const exponent = useTransientBudget ? transientRetries : attempts;
        const backoff = Math.min((useTransientBudget ? 1000 : 250) * Math.pow(2, exponent), maxBackoffMs);
        if (useTransientBudget) {
          transientRetries++;
        } else {
          attempts++;
        }

        debug(`embed: 🔄 retry (attempts ${attempts}/${numAttempts}, transient ${transientRetries}/${maxTransientRetries}) in ${backoff}ms:`, error.message);
        await new Promise(resolve => setTimeout(resolve, backoff));
        lastError = error;
      }
    }
    debug(`embed: 💀 failed to embed after ${attempts} attempts (${transientRetries} transient):`, lastError?.message);
    // throw new Error(`Failed to embed after ${numAttempts} attempts: ${lastError?.message}`);
    return [];
  }

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
  async embedBatch(texts, prompt, concurrency = 8) {
    /** @type {number[][]} */
    const out = new Array(texts.length);
    // Resolve the prompt per-input: a function is invoked with each text, a string is shared.
    const resolvePrompt = (/** @type {string} */ text, /** @type {number} */ index) =>
      (typeof prompt === 'function' ? prompt(text, index) : prompt);
    let i = 0;
    const run = async () => {
      while (true) {
        const idx = i++;
        if (idx >= texts.length) {
          return;
        }
        try {
          out[idx] = await this.embed(texts[idx], resolvePrompt(texts[idx], idx));
        } catch (error) {
          debug('embedBatch error:', error);
          throw error;
        }
      }
    };
    const workers = Math.max(1, Math.min(concurrency, texts.length));
    await Promise.all(Array.from({ length: workers }, run));
    return out;
  }

  /**
   * Probe the dimension of the embedding vector.
   * @returns {Promise<number>} The dimension of the embedding vector.
   */
  async probeDimension() {
    debug('probeDimension');
    const v = await this.embed('probe');
    debug('probeDimension: got', v.length);
    return v.length;
  }

  /**
   * Approximate the number of tokens in a string.
   * A rough approximation of tokens is 3/4 the number of words for English text.
   * @param {string} text The text to approximate the number of tokens of.
   * @returns {number} The approximate token length of the text (rounded down).
   */
  static approxTokenLen(text) {
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    return Math.round(words * 0.75);
  }

  /**
   * Remove stop words from a text string.
   * @param {string} text The text to remove stop words from.
   * @param {string[]} [stopwords] The stopwords to remove. Defaults to English stopwords.
   * @returns {string[]} The text with the stopwords removed.
   */
  static removeStopWords(text, stopwords = stopwordsEnglish) {
    if (typeof text !== 'string' || !text.length) {
      debug('removeStopWords: missing text to remove stop words from');
      return [];
    } else if (!Array.isArray(stopwords)) {
      debug('removeStopWords: expected stopwords to be an array of strings to remove');
      return [];
    } else if (!stopwords.length) {
      debug('removeStopWords: no stopwords to remove');
      return text.split(/\s+/).filter(Boolean);
    }
    return text.split(/\s+/).filter(Boolean).filter(word => !stopwords.includes(word.toLowerCase()));
  }
}

export default OllamaEmbedder;

/**
 * Common English stopwords.
 * @type {string[]}
 */
export const stopwordsEnglish = [
  'a',
  'about',
  'after',
  'all',
  'also',
  'am',
  'an',
  'and',
  'another',
  'any',
  'are',
  'as',
  'at',
  'be',
  'because',
  'been',
  'before',
  'being',
  'between',
  'both',
  'but',
  'by',
  'came',
  'can',
  'come',
  'could',
  'did',
  'do',
  'each',
  'for',
  'from',
  'get',
  'got',
  'had',
  'has',
  'have',
  'he',
  'her',
  'here',
  'him',
  'himself',
  'his',
  'how',
  'i',
  'if',
  'in',
  'into',
  'is',
  'it',
  'like',
  'make',
  'many',
  'me',
  'might',
  'more',
  'most',
  'much',
  'must',
  'my',
  'never',
  'now',
  'of',
  'on',
  'only',
  'or',
  'other',
  'our',
  'out',
  'over',
  'said',
  'same',
  'should',
  'since',
  'some',
  'still',
  'such',
  'take',
  'than',
  'that',
  'the',
  'their',
  'them',
  'then',
  'there',
  'these',
  'they',
  'this',
  'those',
  'through',
  'to',
  'too',
  'under',
  'up',
  'very',
  'was',
  'way',
  'we',
  'well',
  'were',
  'what',
  'where',
  'which',
  'while',
  'who',
  'with',
  'would',
  'yet',
  'you',
  'you\'d',
  'you\'ll',
  'you\'re',
  'you\'ve',
  'your',
  'youre',
  'yours',
  'yourself',
  'yourselves',
  'youve',
];
