// Chat smoke-test client for the AIChatBot SSE endpoint (wiki.superfamicom.org).
//
// Exercises the full agentic chat path end-to-end: POST /chat-api -> LLM (Ollama) -> tool calls
// (vectorSearch / search-retrieve against the SQLite vector index) -> streamed SSE answer.
//
// No dependencies (uses the built-in fetch + ReadableStream), so it can run from anywhere with
// any modern Node. Easy to re-run:
//   node chat-smoke-test.mjs
//   CHAT_QUERY="What is Mode 7?" node chat-smoke-test.mjs
//   BASE_URL=http://127.0.0.1:8000 CHAT_SLUGS="dma-and-hdma" node chat-smoke-test.mjs

const baseUrl = (process.env.BASE_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');
const route = process.env.CHAT_ROUTE || '/chat-api';
const url = `${baseUrl}${route}`;
const query = process.env.CHAT_QUERY || 'In one short paragraph, how does HDMA differ from regular DMA on the SNES?';
const slugs = (process.env.CHAT_SLUGS || '').split(',').map(s => s.trim()).filter(Boolean);
const sessionId = process.env.CHAT_SESSION || `chat-smoke-${Date.now()}`;
// First request cold-loads the chat model into VRAM, so default the timeout high.
const timeoutMs = Number(process.env.CHAT_TIMEOUT_MS || 180000);

/**
 * Parse a Server-Sent Events stream into discrete `data:` JSON payloads, invoking a callback per event.
 * @param {ReadableStream<Uint8Array>} stream The response body stream.
 * @param {(payload: Record<string, unknown>) => void} onEvent Called with each parsed JSON payload.
 * @returns {Promise<void>} Resolves when the stream ends.
 */
async function readSse(stream, onEvent) {
  const decoder = new TextDecoder();
  let buffer = '';
  for await (const chunk of stream) {
    buffer += decoder.decode(chunk, { stream: true });
    // SSE frames are separated by a blank line.
    let index;
    while ((index = buffer.indexOf('\n\n')) !== -1) {
      const frame = buffer.slice(0, index);
      buffer = buffer.slice(index + 2);
      for (const line of frame.split('\n')) {
        if (!line.startsWith('data:')) {
          continue;
        }
        const data = line.slice(5).trim();
        if (!data) {
          continue;
        }
        try {
          onEvent(JSON.parse(data));
        } catch {
          onEvent({ token: data });
        }
      }
    }
  }
}

/**
 * Run the chat smoke test: send one query and collect the streamed answer.
 * @returns {Promise<void>}
 */
async function main() {
  console.log('POST', url);
  console.log('query:', JSON.stringify(query));
  if (slugs.length) {
    console.log('slugs:', slugs.join(', '));
  }

  const started = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
      body: JSON.stringify({ query, slugs, sessionId }),
      signal: controller.signal,
    });
  } catch (error) {
    clearTimeout(timer);
    console.error('REQUEST FAILED:', error instanceof Error ? error.message : error);
    process.exit(1);
  }

  if (!response.ok || !response.body) {
    clearTimeout(timer);
    console.error(`HTTP ${response.status}:`, await response.text().catch(() => ''));
    process.exit(1);
  }

  let answer = '';
  let thinking = '';
  let tokens = 0;
  let done = false;
  /** @type {unknown} */
  let streamError;

  await readSse(response.body, (event) => {
    if (typeof event.token === 'string') {
      answer += event.token;
      tokens += 1;
    } else if (typeof event.thinking === 'string') {
      thinking += event.thinking;
    } else if (event.done) {
      done = true;
    } else if ('error' in event) {
      streamError = event.error;
    }
  });
  clearTimeout(timer);

  const elapsed = ((Date.now() - started) / 1000).toFixed(1);

  if (thinking.trim()) {
    console.log(`\n--- thinking (${thinking.length} chars, truncated) ---`);
    console.log(thinking.trim().slice(0, 400));
  }

  console.log('\n--- answer ---');
  console.log(answer.trim() || '(empty)');

  console.log(`\n--- summary ---`);
  console.log(`tokens: ${tokens} | done: ${done} | elapsed: ${elapsed}s`);

  if (streamError) {
    console.error('STREAM ERROR:', streamError);
    process.exit(1);
  }
  if (!done || !answer.trim()) {
    console.error('FAILED: stream did not finish with a non-empty answer.');
    process.exit(1);
  }
  console.log('\nDONE');
}

await main();
