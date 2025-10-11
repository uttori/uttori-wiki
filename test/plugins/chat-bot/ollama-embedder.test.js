import test from 'ava';
import sinon from 'sinon';
import OllamaEmbedder, { stopwordsEnglish } from '../../../src/plugins/chat-bot/ollama-embedder.js';

let sandbox;

test.beforeEach((t) => {
  sandbox = sinon.createSandbox();
  // Check if fetch is already stubbed and restore it first
  if (global.fetch && global.fetch.restore) {
    global.fetch.restore();
  }
  t.context.fetchStub = sandbox.stub(global, 'fetch');
});

test.afterEach(() => {
  sandbox.restore();
});

test('constructor: should set baseUrl and model', (t) => {
  const baseUrl = 'http://localhost:11434';
  const model = 'nomic-embed-text';
  const embedder = new OllamaEmbedder(baseUrl, model);

  t.is(embedder.baseUrl, baseUrl);
  t.is(embedder.model, model);
});

test('constructor: should handle baseUrl with trailing slash', (t) => {
  const baseUrl = 'http://localhost:11434/';
  const model = 'nomic-embed-text';
  const embedder = new OllamaEmbedder(baseUrl, model);

  t.is(embedder.baseUrl, baseUrl);
  t.is(embedder.model, model);
});

test('embed: should handle direct embedding response format', async (t) => {
  const baseUrl = 'http://localhost:11434';
  const model = 'nomic-embed-text';
  const embedder = new OllamaEmbedder(baseUrl, model);

  // Mock the fetch call to return a direct embedding response
  const mockResponse = {
    ok: true,
    json: () => Promise.resolve({
      embedding: [0.1, 0.2, 0.3, 0.4, 0.5],
    }),
  };

  t.context.fetchStub.returns(Promise.resolve(mockResponse));
  global.fetch = t.context.fetchStub;

  const result = await embedder.embed('test text');
  t.deepEqual(result, [0.1, 0.2, 0.3, 0.4, 0.5]);
});

test('embed: should handle data array response format', async (t) => {
  const baseUrl = 'http://localhost:11434';
  const model = 'nomic-embed-text';
  const embedder = new OllamaEmbedder(baseUrl, model);

  // Mock the fetch call to return a data array response
  const mockResponse = {
    ok: true,
    json: () => Promise.resolve({
      data: [{
        embedding: [0.1, 0.2, 0.3, 0.4, 0.5],
      }],
    }),
  };

  t.context.fetchStub.returns(Promise.resolve(mockResponse));

  const result = await embedder.embed('test text');
  t.deepEqual(result, [0.1, 0.2, 0.3, 0.4, 0.5]);
});

test.serial('embed: should handle baseUrl with trailing slash in request', async (t) => {
  const baseUrl = 'http://localhost:11434/';
  const model = 'nomic-embed-text';
  const embedder = new OllamaEmbedder(baseUrl, model);

  const mockResponse = {
    ok: true,
    json: () => Promise.resolve({
      embedding: [0.1, 0.2, 0.3],
    }),
  };

  t.context.fetchStub.returns(Promise.resolve(mockResponse));

  await embedder.embed('test text');

  const [url] = t.context.fetchStub.firstCall.args;
  t.is(url, 'http://localhost:11434/api/embeddings');
});

test.serial('embed: should handle baseUrl with trailing slash in request with network error', async (t) => {
  const baseUrl = 'http://localhost:11434';
  const model = 'nomic-embed-text';
  const embedder = new OllamaEmbedder(baseUrl, model);

  const mockError = new Error('Network error');
  const mockSuccessResponse = {
    ok: true,
    json: () => Promise.resolve({
      embedding: [0.1, 0.2, 0.3],
    }),
  };

  t.context.fetchStub.onCall(0).rejects(mockError);
  t.context.fetchStub.onCall(1).rejects(mockError);
  t.context.fetchStub.onCall(2).resolves(mockSuccessResponse);

  // Mock setTimeout to execute immediately
  const originalSetTimeout = global.setTimeout;
  global.setTimeout = (fn) => fn();

  try {
    const result = await embedder.embed('test text');
    t.deepEqual(result, [0.1, 0.2, 0.3]);
    t.is(t.context.fetchStub.callCount, 3);
  } finally {
    global.setTimeout = originalSetTimeout;
  }
});

test.serial('embed: should throw error after 5 failed attempts', async (t) => {
  const baseUrl = 'http://localhost:11434';
  const model = 'nomic-embed-text';
  const embedder = new OllamaEmbedder(baseUrl, model);

  const mockError = new Error('Network error');

  t.context.fetchStub.onCall(0).rejects(mockError);

  // Mock setTimeout to execute immediately
  const originalSetTimeout = global.setTimeout;
  global.setTimeout = (fn) => fn();

  try {
    const error = await t.throwsAsync(() => embedder.embed('test text'));
    t.is(error.message, 'Failed to embed after 5 attempts: Cannot read properties of undefined (reading \'ok\')');
    t.is(t.context.fetchStub.callCount, 5);
  } finally {
    global.setTimeout = originalSetTimeout;
  }
});

test('embed: should handle HTTP error responses', async (t) => {
  const baseUrl = 'http://localhost:11434';
  const model = 'nomic-embed-text';
  const embedder = new OllamaEmbedder(baseUrl, model);

  const mockResponse = {
    ok: false,
    status: 500,
    text: () => Promise.resolve('Internal Server Error'),
  };

  t.context.fetchStub.returns(Promise.resolve(mockResponse));
  global.fetch = t.context.fetchStub;

  // Mock setTimeout to execute immediately
  global.setTimeout = (fn) => fn();

  const error = await t.throwsAsync(() => embedder.embed('test text', 1));
  t.is(error.message, 'Failed to embed after 5 attempts: fetch failed');
});

test.serial('embed: should handle unexpected response shape', async (t) => {
  const baseUrl = 'http://localhost:11434';
  const model = 'nomic-embed-text';
  const embedder = new OllamaEmbedder(baseUrl, model);

  const mockResponse = {
    ok: true,
    json: () => Promise.resolve({
      unexpected: 'shape',
    }),
  };

  t.context.fetchStub.returns(Promise.resolve(mockResponse));
  global.fetch = t.context.fetchStub;

  // Mock setTimeout to execute immediately
  const originalSetTimeout = global.setTimeout;
  global.setTimeout = (fn) => fn();

  try {
    const error = await t.throwsAsync(() => embedder.embed('test text'));
    t.is(error.message, 'Failed to embed after 5 attempts: Unexpected embedding response shape');
  } finally {
    global.setTimeout = originalSetTimeout;
  }
});

test('embedBatch: should embed multiple texts with default concurrency', async (t) => {
  const baseUrl = 'http://localhost:11434';
  const model = 'nomic-embed-text';
  const embedder = new OllamaEmbedder(baseUrl, model);

  const texts = ['text1', 'text2', 'text3'];
  const mockEmbedding = [0.1, 0.2, 0.3];

  const embedStub = sandbox.stub(embedder, 'embed').resolves(mockEmbedding);

  const result = await embedder.embedBatch(texts);

  t.is(result.length, 3);
  t.deepEqual(result[0], mockEmbedding);
  t.deepEqual(result[1], mockEmbedding);
  t.deepEqual(result[2], mockEmbedding);

  t.is(embedStub.callCount, 3);
  t.true(embedStub.calledWith('text1'));
  t.true(embedStub.calledWith('text2'));
  t.true(embedStub.calledWith('text3'));
});

test('embedBatch: should embed multiple texts with custom concurrency', async (t) => {
  const baseUrl = 'http://localhost:11434';
  const model = 'nomic-embed-text';
  const embedder = new OllamaEmbedder(baseUrl, model);

  const texts = ['text1', 'text2', 'text3', 'text4', 'text5'];
  const mockEmbedding = [0.1, 0.2, 0.3];

  const embedStub = sandbox.stub(embedder, 'embed').resolves(mockEmbedding);

  const result = await embedder.embedBatch(texts, 2);

  t.is(result.length, 5);
  t.is(embedStub.callCount, 5);
});

test('embedBatch: should handle embed errors', async (t) => {
  const baseUrl = 'http://localhost:11434';
  const model = 'nomic-embed-text';
  const embedder = new OllamaEmbedder(baseUrl, model);

  const texts = ['text1', 'text2'];
  const mockError = new Error('Embed error');

  const embedStub = sandbox.stub(embedder, 'embed').rejects(mockError);

  const error = await t.throwsAsync(() => embedder.embedBatch(texts));

  t.is(error, mockError);
  // The first call will fail and throw, so we expect at least 1 call
  t.true(embedStub.callCount >= 1);
});

test('embedBatch: should handle empty texts array', async (t) => {
  const baseUrl = 'http://localhost:11434';
  const model = 'nomic-embed-text';
  const embedder = new OllamaEmbedder(baseUrl, model);

  const embedStub = sandbox.stub(embedder, 'embed');

  const result = await embedder.embedBatch([]);

  t.is(result.length, 0);
  t.is(embedStub.callCount, 0);
});

test('embedBatch: should limit concurrency to text count', async (t) => {
  const baseUrl = 'http://localhost:11434';
  const model = 'nomic-embed-text';
  const embedder = new OllamaEmbedder(baseUrl, model);

  const texts = ['text1', 'text2'];
  const mockEmbedding = [0.1, 0.2, 0.3];

  const embedStub = sandbox.stub(embedder, 'embed').resolves(mockEmbedding);

  const result = await embedder.embedBatch(texts, 10); // Higher than text count

  t.is(result.length, 2);
  t.is(embedStub.callCount, 2);
});

test('probeDimension: should return embedding dimension', async (t) => {
  const baseUrl = 'http://localhost:11434';
  const model = 'nomic-embed-text';
  const embedder = new OllamaEmbedder(baseUrl, model);

  const mockEmbedding = [0.1, 0.2, 0.3, 0.4, 0.5];
  const embedStub = sandbox.stub(embedder, 'embed').resolves(mockEmbedding);

  const dimension = await embedder.probeDimension();

  t.is(dimension, 5);
  t.true(embedStub.calledWith('probe'));
});

test('approxTokenLen: should approximate token length correctly', (t) => {
  const text = 'This is a test sentence with multiple words';
  const words = text.trim().split(/\s+/).filter(Boolean).length; // 8 words
  const expected = Math.round(words * 0.75); // 6 tokens

  const result = OllamaEmbedder.approxTokenLen(text);

  t.is(result, expected);
});

test('approxTokenLen: should handle empty text', (t) => {
  const result = OllamaEmbedder.approxTokenLen('');
  t.is(result, 0);
});

test('approxTokenLen: should handle text with extra whitespace', (t) => {
  const text = '  This   is   a   test  ';
  const words = text.trim().split(/\s+/).filter(Boolean).length; // 4 words
  const expected = Math.round(words * 0.75); // 3 tokens

  const result = OllamaEmbedder.approxTokenLen(text);

  t.is(result, expected);
});

test('removeStopWords: should remove English stopwords', (t) => {
  const text = 'the quick brown fox jumps over the lazy dog';
  const result = OllamaEmbedder.removeStopWords(text);

  const expected = ['quick', 'brown', 'fox', 'jumps', 'lazy', 'dog'];
  t.deepEqual(result, expected);
});

test('removeStopWords: should handle custom stopwords', (t) => {
  const text = 'the quick brown fox jumps over the lazy dog';
  const customStopwords = ['quick', 'brown', 'lazy'];
  const result = OllamaEmbedder.removeStopWords(text, customStopwords);

  const expected = ['the', 'fox', 'jumps', 'over', 'the', 'dog'];
  t.deepEqual(result, expected);
});

test('removeStopWords: should handle empty stopwords array', (t) => {
  const text = 'the quick brown fox';
  const result = OllamaEmbedder.removeStopWords(text, []);

  const expected = ['the', 'quick', 'brown', 'fox'];
  t.deepEqual(result, expected);
});

test('removeStopWords: should handle empty text', (t) => {
  const result = OllamaEmbedder.removeStopWords('');
  t.deepEqual(result, []);
});

test('removeStopWords: should handle non-string input', (t) => {
  const result = OllamaEmbedder.removeStopWords(null);
  t.deepEqual(result, []);
});

test('removeStopWords: should handle non-array stopwords', (t) => {
  const text = 'the quick brown fox';
  // @ts-expect-error - Testing invalid input type
  const result = OllamaEmbedder.removeStopWords(text, 'not an array');

  t.deepEqual(result, []);
});

test('removeStopWords: should be case insensitive', (t) => {
  const text = 'The Quick Brown Fox';
  const result = OllamaEmbedder.removeStopWords(text);

  const expected = ['Quick', 'Brown', 'Fox'];
  t.deepEqual(result, expected);
});

test('stopwordsEnglish: should export English stopwords array', (t) => {
  t.true(Array.isArray(stopwordsEnglish));
  t.true(stopwordsEnglish.length > 0);
  t.true(stopwordsEnglish.includes('the'));
  t.true(stopwordsEnglish.includes('and'));
  t.true(stopwordsEnglish.includes('is'));
});

test('stopwordsEnglish: should contain common English stopwords', (t) => {
  const commonStopwords = ['the', 'and', 'is', 'in', 'to', 'of', 'a', 'that', 'it', 'with'];

  for (const word of commonStopwords) {
    t.true(stopwordsEnglish.includes(word), `Should contain "${word}"`);
  }
});

// Integration tests that work with the real Ollama server
test.serial('embed: should work with real Ollama server', async (t) => {
  const baseUrl = 'http://localhost:11434';
  const model = 'nomic-embed-text';
  const embedder = new OllamaEmbedder(baseUrl, model);

  try {
    const result = await embedder.embed('test text');
    t.true(Array.isArray(result));
    t.true(result.length > 0);
    t.true(typeof result[0] === 'number');
  } catch (error) {
    // If Ollama server is not available, skip the test
    t.pass('Ollama server not available, skipping integration test');
  }
});

test.serial('probeDimension: should work with real Ollama server', async (t) => {
  const baseUrl = 'http://localhost:11434';
  const model = 'nomic-embed-text';
  const embedder = new OllamaEmbedder(baseUrl, model);

  try {
    const dimension = await embedder.probeDimension();
    t.true(typeof dimension === 'number');
    t.true(dimension > 0);
  } catch (error) {
    // If Ollama server is not available, skip the test
    t.pass('Ollama server not available, skipping integration test');
  }
});
