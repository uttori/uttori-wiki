let debug = (..._) => {};
/* c8 ignore next 3 */
try { const { default: d } = await import('debug'); debug = d('Uttori.Plugin.ChatBot.OllamaEmbedder'); } catch {}

class OllamaEmbedder {
  /** The base URL of the Ollama server. */
  baseUrl;
  /** The model to use for the embeddings. */
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
   */
  async embed(input, prompt, numAttempts = 5) {
    debug('embed: input:', input);
    let lastError = null;
    /** Some versions expect "input", others "prompt". We'll send both. */
    for (let attempt = 0; attempt < numAttempts; attempt++) {
      try {
        const response = await fetch(`${this.baseUrl.replace(/\/$/, '')}/api/embeddings`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ model: this.model, input, prompt: prompt ?? input }),
        });
        if (!response.ok) {
          const msg = await response.text();
          debug(`embed: ❌ Ollama ${response.status}: ${msg}`);
          throw new Error(`Ollama ${response.status}: ${msg}`);
        }

        const data = await response.json();
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
        // Check for unembedable content, needs to be debugged and no retry
        if (err.message.includes('unsupported value: -Inf')) {
          debug('embed: 💀 unsupported value: -Inf, skipping retry:', err.message);
          return [];
        }

        // Retry other errors
        const backoff = 250 * Math.pow(2, attempt);
        debug(`embed: 🔄 attempt ${attempt + 1} failed, retrying in ${backoff}ms:`, err.message);

        // Sleep for the backoff time.
        await new Promise(resolve => setTimeout(resolve, backoff));
        lastError = err;
      }
    }
    debug('embed: 💀 failed to embed after', numAttempts, 'attempts:', lastError?.message);
    // throw new Error(`Failed to embed after ${numAttempts} attempts: ${lastError?.message}`);
    return [];
  }

  /**
   * Embed a batch of text strings with Ollama via the embeddings API.
   * @param {string[]} texts The text strings to embed.
   * @param {string} [prompt] The prompt to embed.
   * @param {number} [concurrency] The number of concurrent requests to make. Defaults to 8.
   * @returns {Promise<number[][]>} The embedding vectors.
   */
  async embedBatch(texts, prompt, concurrency = 8) {
    /** @type {number[][]} */
    const out = new Array(texts.length);
    let i = 0;
    const run = async () => {
      while (true) {
        const idx = i++;
        if (idx >= texts.length) {
          return;
        }
        try {
          out[idx] = await this.embed(texts[idx], prompt);
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
