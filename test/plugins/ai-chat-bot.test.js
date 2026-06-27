import test from 'ava';
import { EventEmitter } from 'node:events';
import sinon from 'sinon';
import { WebSocketServer } from 'ws';
import { EventDispatcher } from '@uttori/event-dispatcher';

import AIChatBot from '../../src/plugins/ai-chat-bot.js';

test('AIChatBot.defaultConfig(): wires chat route and chat-query events only', (t) => {
  const config = AIChatBot.defaultConfig();

  t.deepEqual(config.events.bindRoutes, ['bind-routes']);
  t.deepEqual(config.events.bindWebSocket, ['server-listening']);
  t.deepEqual(config.events.chatQuery, ['chat-query']);
  // Indexing is no longer the chat bot's responsibility.
  t.is(config.events.onSearchUpdate, undefined);
  t.is(config.events.onSearchDelete, undefined);
});

test('AIChatBot.validateConfig(): requires the config key', (t) => {
  t.throws(() => AIChatBot.validateConfig({}), { message: /configuration key is missing/ });
});

test('AIChatBot.validateConfig(): requires an interfaceRequestHandler function', (t) => {
  t.throws(() => AIChatBot.validateConfig({ [AIChatBot.configKey]: {} }), { message: /`interfaceRequestHandler` should be a function/ });
});

test('AIChatBot.validateConfig(): accepts a valid config', (t) => {
  t.notThrows(() => AIChatBot.validateConfig({
    [AIChatBot.configKey]: {
      interfaceRequestHandler: () => (_request, _response) => {},
    },
  }));
});

test('AIChatBot.register(): binds route, websocket, and chat-query events', async (t) => {
  const hooks = new EventDispatcher();
  const context = {
    hooks,
    config: {
      [AIChatBot.configKey]: {
        interfaceRequestHandler: () => (_request, _response) => {},
      },
    },
  };

  await t.notThrowsAsync(AIChatBot.register(/** @type {any} */ (context)));
  t.true(hooks.events['bind-routes'].callbacks.includes(AIChatBot.bindRoutes));
  t.true(hooks.events['server-listening'].callbacks.includes(AIChatBot.bindWebSocket));
  t.true(hooks.events['chat-query'].callbacks.includes(AIChatBot.chatQuery));
});

test('AIChatBot.register(): errors without an event dispatcher', async (t) => {
  await t.throwsAsync(AIChatBot.register(/** @type {any} */ ({ hooks: {} })), { message: /Missing event dispatcher/ });
});

test('AIChatBot.bindRoutes(): binds documents, chat API, and public routes', (t) => {
  /** @type {Array<{method: string, route: string, handlers: Function[]}>} */
  const routes = [];
  const server = {
    get(route, ...handlers) {
      routes.push({ method: 'get', route, handlers });
    },
    post(route, ...handlers) {
      routes.push({ method: 'post', route, handlers });
    },
  };
  const context = {
    config: {
      [AIChatBot.configKey]: {
        interfaceRequestHandler: () => (_request, _response) => {},
      },
    },
  };

  AIChatBot.bindRoutes(/** @type {any} */ (server), /** @type {any} */ (context));

  const documentsRoute = routes.find(route => route.method === 'get' && route.route === '/chat-documents');
  const chatRoute = routes.find(route => route.method === 'post' && route.route === '/chat-api');
  const publicRoute = routes.find(route => route.method === 'get' && route.route === '/chat');

  t.truthy(documentsRoute);
  t.truthy(chatRoute);
  t.truthy(publicRoute);
  t.is(typeof chatRoute?.handlers[0], 'function');
});

test('AIChatBot.documentsHandler(): responds with the search-documents hook result', async (t) => {
  const documents = [{ id: 'a', slug: 'a', title: 'A', update_date: 1 }];
  const context = {
    hooks: {
      fetch: async (label) => (label === 'search-documents' ? [documents] : []),
    },
    config: { [AIChatBot.configKey]: {} },
  };

  let body;
  const response = { json(payload) { body = payload; } };
  await AIChatBot.documentsHandler(/** @type {any} */ (context))(/** @type {any} */ ({}), /** @type {any} */ (response));
  t.deepEqual(body, documents);
});

test('AIChatBot.documentsHandler(): responds 500 when the hook throws', async (t) => {
  const context = {
    hooks: { fetch: async () => { throw new Error('boom'); } },
    config: { [AIChatBot.configKey]: {} },
  };

  let status = 0;
  let body;
  const response = { status(code) { status = code; return this; }, json(payload) { body = payload; } };
  await AIChatBot.documentsHandler(/** @type {any} */ (context))(/** @type {any} */ ({}), /** @type {any} */ (response));
  t.is(status, 500);
  t.truthy(body.error);
});

test('AIChatBot.chatQuery(): returns an empty string for an empty query without calling the LLM', async (t) => {
  const context = { hooks: new EventDispatcher(), config: { [AIChatBot.configKey]: {} } };
  const result = await AIChatBot.chatQuery(/** @type {any} */ ({ query: '   ' }), /** @type {any} */ (context));
  t.is(result, '');
});

test('AIChatBot.validateConfig(): requires a string websocketRoute', (t) => {
  t.throws(() => AIChatBot.validateConfig({ [AIChatBot.configKey]: { websocketRoute: 5 } }), { message: /`websocketRoute` should be a string/ });
});

test('AIChatBot.validateConfig(): requires a string publicRoute', (t) => {
  t.throws(() => AIChatBot.validateConfig({ [AIChatBot.configKey]: { publicRoute: 5 } }), { message: /`publicRoute` should be a string/ });
});

test('AIChatBot.validateConfig(): requires an array of public route middleware', (t) => {
  t.throws(() => AIChatBot.validateConfig({ [AIChatBot.configKey]: { middlewarePublicRoute: 'no' } }), { message: /`middlewarePublicRoute` should be an array/ });
});

test('AIChatBot.register(): logs and skips events that map to no function', async (t) => {
  const hooks = new EventDispatcher();
  await AIChatBot.register(/** @type {any} */ ({
    hooks,
    config: { [AIChatBot.configKey]: { events: { doesNotExist: ['some-event'] } } },
  }));
  // The default events are still wired, while the unknown method is ignored.
  t.true(hooks.events['bind-routes'].callbacks.includes(AIChatBot.bindRoutes));
  t.is(hooks.events['some-event'], undefined);
});

test('AIChatBot.bindRoutes(): skips the public route when no interfaceRequestHandler is set', (t) => {
  /** @type {Array<{method: string, route: string}>} */
  const routes = [];
  const server = {
    get(route) { routes.push({ method: 'get', route }); },
    post(route) { routes.push({ method: 'post', route }); },
  };
  const context = { config: { [AIChatBot.configKey]: { interfaceRequestHandler: undefined } } };
  AIChatBot.bindRoutes(/** @type {any} */ (server), /** @type {any} */ (context));
  // Documents + chat API routes are still bound, but the public interface route is not.
  t.truthy(routes.find(route => route.method === 'get' && route.route === '/chat-documents'));
  t.falsy(routes.find(route => route.route === '/chat'));
});

const originalFetch = globalThis.fetch;
const encoder = new TextEncoder();

/**
 * Build a fake `fetch` Response that streams the provided objects as NDJSON.
 * @param {Array<object|string>} objects The objects (or raw strings) to stream, one per line.
 * @param {{ ok?: boolean, status?: number }} [options] Response status overrides.
 * @returns {object} A minimal Response-like object exposing `body.getReader()`.
 */
function ndjsonResponse(objects, { ok = true, status = 200 } = {}) {
  const chunks = objects.map(object => encoder.encode(`${typeof object === 'string' ? object : JSON.stringify(object)}\n`));
  let index = 0;
  return {
    ok,
    status,
    body: ok
      ? {
        getReader() {
          return {
            read() {
              return index < chunks.length
                ? Promise.resolve({ value: chunks[index++], done: false })
                : Promise.resolve({ value: undefined, done: true });
            },
          };
        },
      }
      : null,
  };
}

/**
 * Build a fake Express response that records SSE writes and status codes.
 * @returns {{ statusCode: number, headers: Record<string, string>, chunks: string[], ended: boolean, jsonBody: any, status: Function, json: Function, setHeader: Function, flushHeaders: Function, write: Function, end: Function }} The fake response.
 */
function makeSSEResponse() {
  return {
    statusCode: 0,
    headers: {},
    chunks: [],
    ended: false,
    jsonBody: undefined,
    status(code) { this.statusCode = code; return this; },
    json(payload) { this.jsonBody = payload; return this; },
    setHeader(key, value) { this.headers[key] = value; },
    flushHeaders() {},
    write(chunk) { this.chunks.push(chunk); },
    end() { this.ended = true; },
  };
}

/** @returns {AIChatBotConfig} */
function chatConfig(overrides = {}) {
  return /** @type {any} */ ({ ...AIChatBot.defaultConfig(), ollamaBaseUrl: 'http://localhost:11434', ...overrides });
}

test.serial('AIChatBot.runChatPass(): forwards thinking and tokens then finalizes the assistant turn', async (t) => {
  globalThis.fetch = async () => /** @type {any} */ (ndjsonResponse([
    { message: { thinking: 'pondering' } },
    { message: { content: 'Hello ' } },
    { message: { content: 'world' } },
    { done: true },
  ]));
  /** @type {string[]} */
  const sent = [];
  const ws = { send: (message) => sent.push(message) };
  const context = { hooks: new EventDispatcher(), config: { [AIChatBot.configKey]: {} } };
  try {
    const { messages, finished } = await AIChatBot.runChatPass(/** @type {any} */ (ws), [{ role: 'user', content: 'hi' }], chatConfig(), /** @type {any} */ (context));
    t.true(finished);
    t.is(messages[messages.length - 1].content, 'Hello world');
    t.true(sent.some(message => message.includes('"thinking"')));
    t.true(sent.some(message => message.includes('"token"')));
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test.serial('AIChatBot.runChatPass(): executes tool calls and returns unfinished for another pass', async (t) => {
  globalThis.fetch = async () => /** @type {any} */ (ndjsonResponse([
    { message: { tool_calls: [{ function: { name: 'vectorSearch', arguments: { query: 'cats' } } }] } },
    { done: true },
  ]));
  const hooks = new EventDispatcher();
  hooks.on('search-retrieve', async () => ({ query: 'cats', chunks: [], citations: [] }));
  /** @type {string[]} */
  const sent = [];
  const ws = { send: (message) => sent.push(message) };
  const context = { hooks, config: { [AIChatBot.configKey]: {} } };
  try {
    const { messages, finished } = await AIChatBot.runChatPass(/** @type {any} */ (ws), [{ role: 'user', content: 'cats?' }], chatConfig(), /** @type {any} */ (context));
    t.false(finished);
    t.is(messages[messages.length - 1].role, 'tool');
    t.true(sent.some(message => message.includes('"tool_call"')));
    t.true(sent.some(message => message.includes('"tool_result"')));
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test.serial('AIChatBot.runChatPass(): throws when Ollama responds with an error status', async (t) => {
  globalThis.fetch = async () => /** @type {any} */ (ndjsonResponse([], { ok: false, status: 500 }));
  const context = { hooks: new EventDispatcher(), config: { [AIChatBot.configKey]: {} } };
  try {
    await t.throwsAsync(
      AIChatBot.runChatPass(/** @type {any} */ ({ send() {} }), [{ role: 'user', content: 'hi' }], chatConfig(), /** @type {any} */ (context)),
      { message: /Ollama HTTP 500/ },
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test.serial('AIChatBot.chatQuery(): runs a full turn and returns the final assistant content', async (t) => {
  globalThis.fetch = async () => /** @type {any} */ (ndjsonResponse([
    { message: { content: 'Answer.' } },
    { done: true },
  ]));
  const context = { hooks: new EventDispatcher(), config: { [AIChatBot.configKey]: {} } };
  try {
    const result = await AIChatBot.chatQuery(/** @type {any} */ ({ query: 'What?', slugs: ['a'] }), /** @type {any} */ (context));
    t.is(result, 'Answer.');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test.serial('AIChatBot.apiRequestHandler(): responds 400 for a missing query', async (t) => {
  const handler = AIChatBot.apiRequestHandler(/** @type {any} */ ({ config: { [AIChatBot.configKey]: {} } }));
  const response = makeSSEResponse();
  await handler(/** @type {any} */ ({ body: {} }), /** @type {any} */ (response));
  t.is(response.statusCode, 400);
  t.is(response.jsonBody.error, 'Missing query.');
});

test.serial('AIChatBot.apiRequestHandler(): streams SSE frames and ends the response', async (t) => {
  globalThis.fetch = async () => /** @type {any} */ (ndjsonResponse([
    { message: { content: 'Hi there' } },
    { done: true },
  ]));
  const context = { hooks: new EventDispatcher(), config: { [AIChatBot.configKey]: {} } };
  const response = makeSSEResponse();
  try {
    await AIChatBot.apiRequestHandler(/** @type {any} */ (context))(/** @type {any} */ ({ body: { query: 'hello' }, ip: 'test-ip' }), /** @type {any} */ (response));
    t.is(response.headers['Content-Type'], 'text/event-stream; charset=utf-8');
    t.true(response.chunks.some(chunk => chunk.includes('"token"')));
    t.true(response.chunks.some(chunk => chunk.includes('"done"')));
    t.true(response.ended);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test.serial('AIChatBot.apiRequestHandler(): emits an error frame when the LLM call fails', async (t) => {
  globalThis.fetch = async () => /** @type {any} */ (ndjsonResponse([], { ok: false, status: 502 }));
  const context = { hooks: new EventDispatcher(), config: { [AIChatBot.configKey]: {} } };
  const response = makeSSEResponse();
  try {
    await AIChatBot.apiRequestHandler(/** @type {any} */ (context))(/** @type {any} */ ({ body: { query: 'boom' }, ip: 'test-ip' }), /** @type {any} */ (response));
    t.true(response.chunks.some(chunk => chunk.includes('"error"')));
    t.true(response.ended);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test.serial('AIChatBot.apiRequestHandler(): maintains rolling summary memory when enabled', async (t) => {
  // First /api/chat call streams the answer; the second (summarize) returns JSON.
  let call = 0;
  globalThis.fetch = async () => {
    call += 1;
    if (call === 1) {
      return /** @type {any} */ (ndjsonResponse([{ message: { content: 'Done.' } }, { done: true }]));
    }
    return /** @type {any} */ ({ ok: true, status: 200, json: async () => ({ message: { content: '<think>noise</think>Short summary.' } }) });
  };
  const context = { hooks: new EventDispatcher(), config: { [AIChatBot.configKey]: { summary: { enabled: true, baseUrl: 'http://localhost:11434', model: 'x' } } } };
  const response = makeSSEResponse();
  try {
    await AIChatBot.apiRequestHandler(/** @type {any} */ (context))(/** @type {any} */ ({ body: { query: 'remember this', sessionId: 'session-1' }, ip: 'ip' }), /** @type {any} */ (response));
    t.true(response.ended);
    t.true(call >= 2);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test.serial('AIChatBot.summarizeTurn(): strips think tags from the model output', async (t) => {
  globalThis.fetch = async () => /** @type {any} */ ({ ok: true, status: 200, json: async () => ({ message: { content: '<think>reasoning</think>The summary.' } }) });
  try {
    const summary = await AIChatBot.summarizeTurn('http://localhost:11434/', 'model', 'old', [{ user: 'u', assistant: 'a' }], 'new user', 'new assistant');
    t.is(summary, 'The summary.');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test.serial('AIChatBot.summarizeTurn(): throws when the summary request fails', async (t) => {
  globalThis.fetch = async () => /** @type {any} */ ({ ok: false, status: 500, text: async () => 'nope' });
  try {
    await t.throwsAsync(AIChatBot.summarizeTurn('http://localhost:11434', 'model', '', [], 'u', 'a'), { message: /nope/ });
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test.serial('AIChatBot.summarizeTurn(): returns empty string when response JSON is invalid', async (t) => {
  globalThis.fetch = async () => /** @type {any} */ ({
    ok: true,
    status: 200,
    json: async () => { throw new Error('invalid json'); },
  });
  try {
    t.is(await AIChatBot.summarizeTurn('http://localhost:11434', 'model', 'old', [], 'u', 'a'), '');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test.serial('AIChatBot.runChatPass(): skips malformed NDJSON lines', async (t) => {
  globalThis.fetch = async () => /** @type {any} */ ({
    ok: true,
    status: 200,
    body: {
      getReader: () => {
        let sent = false;
        return {
          read: async () => {
            if (sent) return { done: true, value: undefined };
            sent = true;
            return { done: false, value: new TextEncoder().encode('NOT JSON\n{"message":{"content":"Hello"},"done":true}\n') };
          },
        };
      },
    },
  });
  const ws = { send: () => {} };
  try {
    const { messages, finished } = await AIChatBot.runChatPass(
      /** @type {any} */ (ws),
      [{ role: 'user', content: 'hi' }],
      chatConfig(),
      /** @type {any} */ ({ hooks: new EventDispatcher(), config: { [AIChatBot.configKey]: {} } }),
    );
    t.true(finished);
    t.is(messages[messages.length - 1].content, 'Hello');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('AIChatBot.bindWebSocket(): registers an upgrade handler that rejects non-matching paths', (t) => {
  const server = new EventEmitter();
  AIChatBot.bindWebSocket(/** @type {any} */ (server), /** @type {any} */ ({ config: { [AIChatBot.configKey]: {} } }));
  t.is(server.listenerCount('upgrade'), 1);

  let destroyed = false;
  const socket = { destroy() { destroyed = true; } };
  server.emit('upgrade', { url: '/not-the-socket-route', headers: { host: 'localhost' } }, socket, Buffer.alloc(0));
  t.true(destroyed);
});

/**
 * @param {sinon.SinonSandbox} sandbox
 * @param {object} [contextOverrides]
 * @returns {{ server: EventEmitter, ws: EventEmitter & { send: sinon.SinonSpy, uniqueId?: string }, wss: WebSocketServer }}
 */
function bindMockWebSocket(sandbox, contextOverrides = {}) {
  /** @type {EventEmitter & { send: sinon.SinonSpy, uniqueId?: string } | undefined} */
  let ws;
  /** @type {WebSocketServer | undefined} */
  let boundWss;

  sandbox.stub(WebSocketServer.prototype, 'handleUpgrade').callsFake(function (_request, _socket, _head, cb) {
    boundWss = this;
    ws = new EventEmitter();
    ws.send = sandbox.spy();
    cb(ws);
  });

  const server = new EventEmitter();
  const context = {
    hooks: new EventDispatcher(),
    config: {
      [AIChatBot.configKey]: {
        summary: { enabled: false },
        ...contextOverrides,
      },
    },
  };
  AIChatBot.bindWebSocket(/** @type {any} */ (server), /** @type {any} */ (context));
  server.emit(
    'upgrade',
    { url: '/chat-api?uniqueId=session-1', headers: { host: 'localhost' } },
    {},
    Buffer.alloc(0),
  );

  if (!ws || !boundWss) {
    throw new Error('WebSocket upgrade did not produce a connection');
  }
  return { server, ws, wss: boundWss };
}

test.serial('AIChatBot.bindWebSocket(): completes a chat turn and sends done', async (t) => {
  const sandbox = sinon.createSandbox();
  try {
    sandbox.stub(AIChatBot, 'runChatPass').resolves({
      messages: [{ role: 'assistant', content: 'Hello' }],
      finished: true,
    });
    const { ws } = bindMockWebSocket(sandbox);

    ws.emit('message', JSON.stringify({ messages: [{ role: 'user', content: 'hi', slugs: [] }] }));
    await new Promise((resolve) => setImmediate(resolve));

    t.true(ws.send.calledWith(JSON.stringify({ type: 'done' })));
  } finally {
    sandbox.restore();
  }
});

test.serial('AIChatBot.bindWebSocket(): ignores invalid JSON messages', async (t) => {
  const sandbox = sinon.createSandbox();
  try {
    const runChatPass = sandbox.stub(AIChatBot, 'runChatPass');
    const { ws } = bindMockWebSocket(sandbox);

    ws.emit('message', 'not-json');
    await new Promise((resolve) => setImmediate(resolve));

    t.false(runChatPass.called);
    t.false(ws.send.called);
  } finally {
    sandbox.restore();
  }
});

test.serial('AIChatBot.bindWebSocket(): sends error when chat pass fails', async (t) => {
  const sandbox = sinon.createSandbox();
  try {
    sandbox.stub(AIChatBot, 'runChatPass').rejects(new Error('chat failed'));
    const { ws } = bindMockWebSocket(sandbox);

    ws.emit('message', JSON.stringify({ messages: [{ role: 'user', content: 'hi', slugs: [] }] }));
    await new Promise((resolve) => setImmediate(resolve));

    t.true(ws.send.calledWith(JSON.stringify({ type: 'error', error: 'Error: chat failed' })));
  } finally {
    sandbox.restore();
  }
});

test.serial('AIChatBot.bindWebSocket(): updates memory when summary is enabled', async (t) => {
  const sandbox = sinon.createSandbox();
  try {
    sandbox.stub(AIChatBot, 'runChatPass').resolves({
      messages: [{ role: 'assistant', content: 'Answer' }],
      finished: true,
    });
    const summarizeTurn = sandbox.stub(AIChatBot, 'summarizeTurn').resolves('Updated summary');
    const { ws } = bindMockWebSocket(sandbox, {
      summary: { enabled: true, baseUrl: 'http://localhost:11434', model: 'x' },
    });

    ws.emit('message', JSON.stringify({ messages: [{ role: 'user', content: 'Question', slugs: [] }] }));
    await new Promise((resolve) => setImmediate(resolve));

    t.true(summarizeTurn.called);
    t.true(ws.send.calledWith(JSON.stringify({ type: 'done' })));
  } finally {
    sandbox.restore();
  }
});

test.serial('AIChatBot.bindWebSocket(): appends memory note on follow-up messages', async (t) => {
  const sandbox = sinon.createSandbox();
  try {
    const runChatPass = sandbox.stub(AIChatBot, 'runChatPass').resolves({
      messages: [{ role: 'assistant', content: 'Answer' }],
      finished: true,
    });
    sandbox.stub(AIChatBot, 'summarizeTurn').resolves('Stored summary');
    const { ws } = bindMockWebSocket(sandbox, {
      summary: { enabled: true, baseUrl: 'http://localhost:11434', model: 'x' },
    });

    ws.emit('message', JSON.stringify({ messages: [{ role: 'user', content: 'First', slugs: [] }] }));
    await new Promise((resolve) => setImmediate(resolve));
    runChatPass.resetHistory();

    ws.emit('message', JSON.stringify({
      messages: [{ role: 'user', content: 'Follow up' }],
    }));
    await new Promise((resolve) => setImmediate(resolve));

    t.true(runChatPass.called);
    const passedMessages = runChatPass.firstCall.args[1];
    t.true(passedMessages[0].content.includes('Stored summary'));
  } finally {
    sandbox.restore();
  }
});

test.serial('AIChatBot.bindWebSocket(): handles client close events', async (t) => {
  const sandbox = sinon.createSandbox();
  try {
    const { ws } = bindMockWebSocket(sandbox);
    t.notThrows(() => ws.emit('close'));
  } finally {
    sandbox.restore();
  }
});

test.serial('AIChatBot.bindWebSocket(): handles wss error and close events', (t) => {
  const sandbox = sinon.createSandbox();
  try {
    const { wss } = bindMockWebSocket(sandbox);
    t.notThrows(() => {
      wss.emit('error', new Error('socket error'));
      wss.emit('close');
    });
  } finally {
    sandbox.restore();
  }
});

/**
 * @typedef {import('../../src/plugins/ai-chat-bot.js').AIChatBotConfig} AIChatBotConfig
 */
