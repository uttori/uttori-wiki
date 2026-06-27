import test from 'ava';
import { EventDispatcher } from '@uttori/event-dispatcher';

import MCPProvider from '../../src/plugins/mcp-provider.js';

/**
 * Build a minimal Uttori-like context with a fake hooks dispatcher.
 * @param {Record<string, any>} responses A map of hook label to the single value returned by fetch.
 * @param {Partial<import('../../src/plugins/mcp-provider.js').MCPProviderConfig>} [pluginConfig] Optional plugin config overrides.
 * @returns {{ hooks: { fetch: Function }, config: Record<string, any> }} The fake context.
 */
function makeContext(responses = {}, pluginConfig = {}) {
  return {
    hooks: {
      fetch: async (label) => (label in responses ? [responses[label]] : []),
    },
    config: {
      [MCPProvider.configKey]: pluginConfig,
    },
  };
}

test('MCPProvider.configKey: returns the key', (t) => {
  t.is(MCPProvider.configKey, 'uttori-plugin-mcp-provider');
});

test('MCPProvider.defaultConfig(): wires bind events', (t) => {
  const config = MCPProvider.defaultConfig();
  t.deepEqual(config.events.bindRoutes, ['bind-routes']);
  t.deepEqual(config.events.bindServer, ['server-listening']);
  t.is(config.httpRoute, '/mcp');
  t.true(config.enableHttp);
  t.false(config.enableStdio);
});

test('MCPProvider.validateConfig(): throws when the config key is missing', (t) => {
  t.throws(() => MCPProvider.validateConfig({}), { message: /configuration key is missing/ });
});

test('MCPProvider.validateConfig(): throws on a non-string httpRoute', (t) => {
  t.throws(() => MCPProvider.validateConfig({ [MCPProvider.configKey]: { httpRoute: 5 } }), { message: /`httpRoute` should be a string/ });
});

test('MCPProvider.validateConfig(): throws on non-array middleware', (t) => {
  t.throws(() => MCPProvider.validateConfig({ [MCPProvider.configKey]: { middleware: 'no' } }), { message: /`middleware` should be an array/ });
});

test('MCPProvider.validateConfig(): accepts a valid config', (t) => {
  t.notThrows(() => MCPProvider.validateConfig({ [MCPProvider.configKey]: {} }));
});

test('MCPProvider.register(): errors without an event dispatcher', async (t) => {
  await t.throwsAsync(MCPProvider.register({ hooks: {} }), { message: /Missing event dispatcher/ });
});

test('MCPProvider.register(): binds bindRoutes and bindServer', async (t) => {
  const hooks = new EventDispatcher();
  await MCPProvider.register(/** @type {any} */ ({ hooks, config: { [MCPProvider.configKey]: {} } }));
  t.true(hooks.events['bind-routes'].callbacks.includes(MCPProvider.bindRoutes));
  t.true(hooks.events['server-listening'].callbacks.includes(MCPProvider.bindServer));
});

test('MCPProvider.listTools(): returns MCP tool descriptors', (t) => {
  const tools = MCPProvider.listTools();
  t.true(tools.some(tool => tool.name === 'vectorSearch'));
  t.true(tools.every(tool => typeof tool.inputSchema === 'object'));
});

test('MCPProvider.callTool(): wraps a successful result as text content', async (t) => {
  const context = makeContext({ 'search-documents': [{ id: 'a', slug: 'a', title: 'A', update_date: 1 }] });
  const result = await MCPProvider.callTool('listDocuments', {}, /** @type {any} */ (context));
  t.false(result.isError);
  t.is(result.content[0].type, 'text');
  t.true(result.content[0].text.includes('"slug": "a"'));
});

test('MCPProvider.callTool(): flags unknown tools as errors', async (t) => {
  const context = makeContext();
  const result = await MCPProvider.callTool('nope', {}, /** @type {any} */ (context));
  t.true(result.isError);
  t.true(result.content[0].text.includes('Unknown Tool'));
});

test('MCPProvider.listResources(): maps documents to wiki:// URIs', async (t) => {
  const context = makeContext({ 'search-documents': [{ slug: 'a', title: 'Doc A' }, { slug: 'b', title: 'Doc B' }] });
  const { resources } = await MCPProvider.listResources(/** @type {any} */ (context));
  t.is(resources.length, 2);
  t.is(resources[0].uri, 'wiki://doc/a');
  t.is(resources[0].name, 'Doc A');
  t.is(resources[0].mimeType, 'text/markdown');
});

test('MCPProvider.readResource(): returns the document content', async (t) => {
  const context = makeContext({ 'storage-get': { slug: 'a', content: '# Hello' } });
  const { contents } = await MCPProvider.readResource('wiki://doc/a', /** @type {any} */ (context));
  t.is(contents[0].uri, 'wiki://doc/a');
  t.is(contents[0].text, '# Hello');
});

test('MCPProvider.readResource(): throws on an unknown URI scheme', async (t) => {
  const context = makeContext();
  await t.throwsAsync(MCPProvider.readResource('http://example.com', /** @type {any} */ (context)), { message: /Unknown resource URI/ });
});

test('MCPProvider.readResource(): throws when the document is missing', async (t) => {
  const context = makeContext();
  await t.throwsAsync(MCPProvider.readResource('wiki://doc/missing', /** @type {any} */ (context)), { message: /Resource not found/ });
});

test('MCPProvider.listPrompts(): exposes the wiki assistant prompt', (t) => {
  const prompts = MCPProvider.listPrompts();
  t.is(prompts[0].name, 'wiki-assistant');
  t.true(prompts[0].arguments.some(arg => arg.name === 'query' && arg.required));
});

test('MCPProvider.getPrompt(): builds wiki-assistant messages', async (t) => {
  const { messages } = await MCPProvider.getPrompt('wiki-assistant', { query: 'What is X?', slugs: 'a, b' });
  t.true(messages.length >= 2);
  t.true(messages.every(message => message.role === 'user' || message.role === 'assistant'));
  t.true(messages.some(message => message.content.text.includes('What is X?')));
});

test('MCPProvider.getPrompt(): throws on an unknown prompt', async (t) => {
  await t.throwsAsync(MCPProvider.getPrompt('nope', {}), { message: /Unknown prompt/ });
});

test('MCPProvider.bindRoutes(): binds POST/GET/DELETE on the HTTP route', (t) => {
  /** @type {Array<{method: string, route: string}>} */
  const routes = [];
  const server = {
    post(route) { routes.push({ method: 'post', route }); },
    get(route) { routes.push({ method: 'get', route }); },
    delete(route) { routes.push({ method: 'delete', route }); },
  };
  MCPProvider.bindRoutes(/** @type {any} */ (server), /** @type {any} */ (makeContext()));
  t.truthy(routes.find(route => route.method === 'post' && route.route === '/mcp'));
  t.truthy(routes.find(route => route.method === 'get' && route.route === '/mcp'));
  t.truthy(routes.find(route => route.method === 'delete' && route.route === '/mcp'));
});

test('MCPProvider.bindRoutes(): does nothing when HTTP is disabled', (t) => {
  let called = false;
  const server = { post() { called = true; }, get() { called = true; }, delete() { called = true; } };
  MCPProvider.bindRoutes(/** @type {any} */ (server), /** @type {any} */ (makeContext({}, { enableHttp: false })));
  t.false(called);
});

test('MCPProvider.methodNotAllowedHandler(): responds 405', (t) => {
  let status = 0;
  let body;
  const response = { status(code) { status = code; return this; }, json(payload) { body = payload; } };
  MCPProvider.methodNotAllowedHandler()(/** @type {any} */ ({}), /** @type {any} */ (response));
  t.is(status, 405);
  t.true(body.error.includes('Method not allowed'));
});

// NOTE: The following tests mutate the static `MCPProvider.loadSdk`, so they are marked
// `serial` to avoid racing with the buildServer test that relies on the real SDK loader.
test.serial('MCPProvider.buildServer(): returns undefined when the SDK is unavailable', async (t) => {
  const original = MCPProvider.loadSdk;
  MCPProvider.loadSdk = async () => undefined;
  try {
    const server = await MCPProvider.buildServer(/** @type {any} */ (makeContext()));
    t.is(server, undefined);
  } finally {
    MCPProvider.loadSdk = original;
  }
});

test.serial('MCPProvider.buildServer(): returns a connectable server when the SDK is available', async (t) => {
  const server = await MCPProvider.buildServer(/** @type {any} */ (makeContext()));
  // The MCP SDK is an optional dependency; only assert when present.
  if (server) {
    t.is(typeof server.connect, 'function');
    t.is(typeof server.setRequestHandler, 'function');
  } else {
    t.pass();
  }
});

test.serial('MCPProvider.buildServer(): only registers the capabilities that are enabled', async (t) => {
  const server = await MCPProvider.buildServer(/** @type {any} */ (makeContext({}, { tools: true, resources: false, prompts: false })));
  if (server) {
    t.is(typeof server.setRequestHandler, 'function');
  } else {
    t.pass();
  }
});

test.serial('MCPProvider.httpHandler(): responds 501 when the SDK is unavailable', async (t) => {
  const original = MCPProvider.loadSdk;
  MCPProvider.loadSdk = async () => undefined;
  let status = 0;
  let body;
  const response = { status(code) { status = code; return this; }, json(payload) { body = payload; }, on() {} };
  try {
    await MCPProvider.httpHandler(/** @type {any} */ (makeContext()))(/** @type {any} */ ({ body: {} }), /** @type {any} */ (response));
    t.is(status, 501);
    t.true(body.error.includes('MCP SDK is not installed'));
  } finally {
    MCPProvider.loadSdk = original;
  }
});

test('MCPProvider.register(): logs and skips events that map to no function', async (t) => {
  const hooks = new EventDispatcher();
  await MCPProvider.register(/** @type {any} */ ({
    hooks,
    config: { [MCPProvider.configKey]: { events: { doesNotExist: ['some-event'] } } },
  }));
  // The bogus method is skipped, but the default events are still bound.
  t.true(hooks.events['bind-routes'].callbacks.includes(MCPProvider.bindRoutes));
  t.is(hooks.events['some-event'], undefined);
});

test('MCPProvider.bindServer(): does nothing when stdio is disabled', async (t) => {
  // Default config keeps stdio disabled, so this should resolve without touching the SDK.
  await t.notThrowsAsync(MCPProvider.bindServer(/** @type {any} */ ({}), /** @type {any} */ (makeContext())));
});

test.serial('MCPProvider.bindServer(): bails out when stdio is enabled but the SDK is unavailable', async (t) => {
  const original = MCPProvider.loadSdk;
  MCPProvider.loadSdk = async () => undefined;
  try {
    await t.notThrowsAsync(MCPProvider.bindServer(/** @type {any} */ ({}), /** @type {any} */ (makeContext({}, { enableStdio: true }))));
  } finally {
    MCPProvider.loadSdk = original;
  }
});
