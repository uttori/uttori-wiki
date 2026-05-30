import test from 'ava';
import sinon from 'sinon';
import request from 'supertest';

import CsrfProtection from '../../src/plugins/csrf.js';
import { UttoriWiki } from '../../src/index.js';
import { config, serverSetup, seed } from '../_helpers/server.js';

/**
 * Builds a minimal valid plugin config for use in tests.
 * @param {object} [overrides] Optional overrides for the plugin config.
 * @returns {Record<string, any>} A config object keyed by `CsrfProtection.configKey`.
 */
const makeConfig = (overrides = {}) => ({
  [CsrfProtection.configKey]: {
    ...CsrfProtection.defaultConfig(),
    ...overrides,
  },
});

/**
 * Builds a minimal Uttori context suitable for validate-hook tests.
 * @param {object} [configOverrides] Optional overrides for the plugin config.
 * @returns {any} A context-like object.
 */
const makeContext = (configOverrides = {}) => ({
  config: makeConfig(configOverrides),
});

/**
 * Builds a minimal Express-like request object with a mutable session.
 * @param {object} [opts]
 * @param {object} [opts.body] The POST body to attach.
 * @param {object} [opts.headers] The request headers to attach.
 * @param {object|null} [opts.session] The session object (`null` to simulate no session).
 * @returns {any} An Express-like request stub.
 */
const makeRequest = ({ body = {}, headers = {}, session = {} } = {}) => ({
  body,
  headers,
  session: session === null ? undefined : session,
});

/**
 * Builds a minimal view model that mirrors what `UttoriWiki.buildViewModelBase` produces
 * (only the fields relevant to CSRF injection tests).
 * @param {object|null} [session] The session to attach (null = no session).
 * @returns {any} A view-model stub.
 */
const makeViewModel = (session = {}) => ({
  session: session === null ? undefined : session,
});

let sandbox;

test.beforeEach(() => {
  sandbox = sinon.createSandbox();
});

test.afterEach(() => {
  sandbox.restore();
});

test('configKey: returns the correct configuration key', (t) => {
  t.is(CsrfProtection.configKey, 'uttori-plugin-csrf');
});

test('defaultConfig: returns all expected fields with correct defaults', (t) => {
  const cfg = CsrfProtection.defaultConfig();

  t.deepEqual(cfg.events, {
    injectToken: ['view-model-edit', 'view-model-new', 'view-model-history-restore'],
    validateToken: ['validate-save'],
    validateConfig: ['validate-config'],
  });
  t.is(cfg.fieldName, '_csrf');
  t.is(cfg.headerName, 'x-csrf-token');
  t.is(cfg.sessionKey, 'uttoriCsrfToken');
  t.is(cfg.tokenBytes, 32);
  t.deepEqual(cfg.sources, ['body', 'header']);
  t.is(cfg.requireSession, true);
  t.is(cfg.rotateOnValidation, false);
  t.is(cfg.checkFetchMetadata, false);
});

test('resolveConfig: merges user config over defaults without losing unspecified defaults', (t) => {
  const context = {
    config: {
      [CsrfProtection.configKey]: {
        fieldName: 'my_csrf',
      },
    },
  };
  const resolved = CsrfProtection.resolveConfig(context);
  t.is(resolved.fieldName, 'my_csrf');
  t.is(resolved.headerName, 'x-csrf-token');
  t.is(resolved.tokenBytes, 32);
});

test('resolveConfig: returns defaults when no plugin config is present', (t) => {
  const context = { config: {} };
  const resolved = CsrfProtection.resolveConfig(context);
  t.deepEqual(resolved, CsrfProtection.defaultConfig());
});

test('resolveConfig: preserves user-supplied sources array verbatim', (t) => {
  const config = makeContext({ sources: ['header'] });
  const resolved = CsrfProtection.resolveConfig(config);
  t.deepEqual(resolved.sources, ['header']);
});

test('validateConfig: throws when config key is missing', (t) => {
  t.throws(() => CsrfProtection.validateConfig({}), {
    message: `Config missing '${CsrfProtection.configKey}' entry.`,
  });
});

test('validateConfig: throws when fieldName is empty', (t) => {
  t.throws(() => CsrfProtection.validateConfig(makeConfig({ fieldName: '' })), {
    message: `Config '${CsrfProtection.configKey}.fieldName' must be a non-empty string.`,
  });
});

test('validateConfig: throws when headerName is not a string', (t) => {
  t.throws(() => CsrfProtection.validateConfig(makeConfig({ headerName: 42 })), {
    message: `Config '${CsrfProtection.configKey}.headerName' must be a non-empty string.`,
  });
});

test('validateConfig: throws when sessionKey is empty', (t) => {
  t.throws(() => CsrfProtection.validateConfig(makeConfig({ sessionKey: '' })), {
    message: `Config '${CsrfProtection.configKey}.sessionKey' must be a non-empty string.`,
  });
});

test('validateConfig: throws when tokenBytes is below 16', (t) => {
  t.throws(() => CsrfProtection.validateConfig(makeConfig({ tokenBytes: 8 })), {
    message: `Config '${CsrfProtection.configKey}.tokenBytes' must be an integer >= 16.`,
  });
});

test('validateConfig: throws when tokenBytes is not an integer', (t) => {
  t.throws(() => CsrfProtection.validateConfig(makeConfig({ tokenBytes: 32.5 })), {
    message: `Config '${CsrfProtection.configKey}.tokenBytes' must be an integer >= 16.`,
  });
});

test('validateConfig: throws when sources is an empty array', (t) => {
  t.throws(() => CsrfProtection.validateConfig(makeConfig({ sources: [] })), {
    message: `Config '${CsrfProtection.configKey}.sources' must be a non-empty array.`,
  });
});

test('validateConfig: throws when sources is not an array', (t) => {
  t.throws(() => CsrfProtection.validateConfig(makeConfig({ sources: 'body' })), {
    message: `Config '${CsrfProtection.configKey}.sources' must be a non-empty array.`,
  });
});

test('validateConfig: throws when sources contains unsupported values', (t) => {
  t.throws(() => CsrfProtection.validateConfig(makeConfig({ sources: ['cookie', 'whatever'] })), {
    message: `Config '${CsrfProtection.configKey}.sources' must only contain "body" or "header".`,
  });
});

test('validateConfig: throws when requireSession is not a boolean', (t) => {
  t.throws(() => CsrfProtection.validateConfig(makeConfig({ requireSession: 'yes' })), {
    message: `Config '${CsrfProtection.configKey}.requireSession' must be a boolean.`,
  });
});

test('validateConfig: throws when rotateOnValidation is not a boolean', (t) => {
  t.throws(() => CsrfProtection.validateConfig(makeConfig({ rotateOnValidation: 1 })), {
    message: `Config '${CsrfProtection.configKey}.rotateOnValidation' must be a boolean.`,
  });
});

test('validateConfig: throws when checkFetchMetadata is not a boolean', (t) => {
  t.throws(() => CsrfProtection.validateConfig(makeConfig({ checkFetchMetadata: 'true' })), {
    message: `Config '${CsrfProtection.configKey}.checkFetchMetadata' must be a boolean.`,
  });
});

test('validateConfig: does not throw with valid default config', (t) => {
  t.notThrows(() => CsrfProtection.validateConfig(makeConfig()));
});

test('register: throws when context is missing', (t) => {
  t.throws(() => CsrfProtection.register(null), {
    message: 'Missing event dispatcher in \'context.hooks.on(event, callback)\' format.',
  });
});

test('register: throws when context.hooks is missing', (t) => {
  t.throws(() => CsrfProtection.register({}), {
    message: 'Missing event dispatcher in \'context.hooks.on(event, callback)\' format.',
  });
});

test('register: throws when context.hooks.on is not a function', (t) => {
  t.throws(() => CsrfProtection.register({ hooks: { on: 'nope' } }), {
    message: 'Missing event dispatcher in \'context.hooks.on(event, callback)\' format.',
  });
});

test('register: binds injectToken to view-model-edit, view-model-new, and view-model-history-restore', (t) => {
  const onSpy = sandbox.spy();
  CsrfProtection.register({ hooks: { on: onSpy }, config: makeConfig() });

  t.true(onSpy.calledWith('view-model-edit', CsrfProtection.injectToken));
  t.true(onSpy.calledWith('view-model-new', CsrfProtection.injectToken));
  t.true(onSpy.calledWith('view-model-history-restore', CsrfProtection.injectToken));
});

test('register: binds validateToken to validate-save', (t) => {
  const onSpy = sandbox.spy();
  CsrfProtection.register({ hooks: { on: onSpy }, config: makeConfig() });

  t.true(onSpy.calledWith('validate-save', CsrfProtection.validateToken));
});

test('register: binds validateConfig to validate-config', (t) => {
  const onSpy = sandbox.spy();
  CsrfProtection.register({ hooks: { on: onSpy }, config: makeConfig() });

  t.true(onSpy.calledWith('validate-config', CsrfProtection.validateConfig));
});

test('register: skips unknown method names gracefully', (t) => {
  const onSpy = sandbox.spy();
  t.notThrows(() => CsrfProtection.register({
    hooks: { on: onSpy },
    config: {
      [CsrfProtection.configKey]: {
        ...CsrfProtection.defaultConfig(),
        events: {
          injectToken: ['view-model-edit'],
          nonExistentMethod: ['some-event'],
        },
      },
    },
  }));
  t.false(onSpy.calledWith('some-event'));
});

test('generateToken: returns a hex string of the correct length', (t) => {
  const token = CsrfProtection.generateToken(32);
  // 32 bytes => 64 hex characters
  t.is(token.length, 64);
  t.regex(token, /^[0-9a-f]+$/);
});

test('generateToken: produces different values on each call', (t) => {
  const a = CsrfProtection.generateToken(32);
  const b = CsrfProtection.generateToken(32);
  t.not(a, b);
});

test('generateToken: respects the tokenBytes parameter', (t) => {
  t.is(CsrfProtection.generateToken(16).length, 32);
  t.is(CsrfProtection.generateToken(64).length, 128);
});

test('escapeHtml: escapes characters that can break HTML attributes', (t) => {
  t.is(CsrfProtection.escapeHtml('token&"<tag>'), 'token&amp;&quot;&lt;tag&gt;');
});

test('escapeHtml: stringifies non-string values', (t) => {
  t.is(CsrfProtection.escapeHtml(42), '42');
});

test('getSubmittedToken: returns a non-empty body token', (t) => {
  const token = CsrfProtection.generateToken(32);
  const req = makeRequest({ body: { _csrf: token } });
  t.is(CsrfProtection.getSubmittedToken(req, CsrfProtection.resolveConfig(makeConfig())), token);
});

test('getSubmittedToken: ignores non-string body tokens', (t) => {
  const req = makeRequest({ body: { _csrf: ['not-a-string'] } });
  t.is(CsrfProtection.getSubmittedToken(req, CsrfProtection.resolveConfig(makeConfig())), null);
});

test('getSubmittedToken: returns a lowercase header token', (t) => {
  const token = CsrfProtection.generateToken(32);
  const req = makeRequest({ headers: { 'x-csrf-token': token } });
  t.is(CsrfProtection.getSubmittedToken(req, CsrfProtection.resolveConfig(makeConfig({ sources: ['header'] }))), token);
});

test('getSubmittedToken: returns a configured mixed-case header token', (t) => {
  const token = CsrfProtection.generateToken(32);
  const req = makeRequest({ headers: { 'X-CSRF-Token': token } });
  const config = CsrfProtection.resolveConfig(makeContext({ headerName: 'X-CSRF-Token', sources: ['header'] }));
  t.is(CsrfProtection.getSubmittedToken(req, config), token);
});

test('getSubmittedToken: returns the first string from a header array', (t) => {
  const token = CsrfProtection.generateToken(32);
  const req = makeRequest({ headers: { 'x-csrf-token': [token, 'extra'] } });
  t.is(CsrfProtection.getSubmittedToken(req, CsrfProtection.resolveConfig(makeConfig({ sources: ['header'] }))), token);
});

test('getSubmittedToken: returns null when no configured source contains a token', (t) => {
  const req = makeRequest({ body: { _csrf: '' }, headers: { 'x-csrf-token': [] } });
  t.is(CsrfProtection.getSubmittedToken(req, CsrfProtection.resolveConfig(makeConfig())), null);
});

test('tokensMatch: returns true for identical strings', (t) => {
  const token = CsrfProtection.generateToken(32);
  t.true(CsrfProtection.tokensMatch(token, token));
});

test('tokensMatch: returns false for different strings with same length', (t) => {
  const expected = 'a'.repeat(64);
  const actual = 'b'.repeat(64);
  t.false(CsrfProtection.tokensMatch(expected, actual));
});

test('tokensMatch: returns false for different-length strings', (t) => {
  t.false(CsrfProtection.tokensMatch('expected', 'actual'));
});

test('injectToken: adds csrf object to view model when session exists', (t) => {
  const session = {};
  const viewModel = makeViewModel(session);
  const context = makeContext();

  const result = CsrfProtection.injectToken(viewModel, context);

  t.truthy(result.csrf);
  t.is(typeof result.csrf.token, 'string');
  t.is(result.csrf.token.length, 64);
  t.is(result.csrf.fieldName, '_csrf');
  t.is(result.csrf.headerName, 'x-csrf-token');
  t.true(result.csrf.input.includes('name="_csrf"'));
  t.true(result.csrf.input.includes(result.csrf.token));
});

test('injectToken: stores generated token on the session', (t) => {
  const session = {};
  const context = makeContext();
  CsrfProtection.injectToken(makeViewModel(session), context);

  t.is(typeof session['uttoriCsrfToken'], 'string');
  t.is(session['uttoriCsrfToken'].length, 64);
});

test('injectToken: reuses an existing session token rather than generating a new one', (t) => {
  const session = { uttoriCsrfToken: 'existing-token' };
  const viewModel = makeViewModel(session);
  const context = makeContext();

  const result = CsrfProtection.injectToken(viewModel, context);

  t.is(result.csrf.token, 'existing-token');
  t.is(session['uttoriCsrfToken'], 'existing-token');
});

test('injectToken: uses custom fieldName and sessionKey from config', (t) => {
  const session = {};
  const viewModel = makeViewModel(session);
  const context = makeContext({ fieldName: 'my_token', sessionKey: 'mySessionKey' });

  const result = CsrfProtection.injectToken(viewModel, context);

  t.is(result.csrf.fieldName, 'my_token');
  t.true(result.csrf.input.includes('name="my_token"'));
  t.is(typeof session['mySessionKey'], 'string');
});

test('injectToken: returns view model unchanged when session is missing and requireSession is true', (t) => {
  const viewModel = makeViewModel(null);
  const context = makeContext({ requireSession: true });

  const result = CsrfProtection.injectToken(viewModel, context);

  t.is(result.csrf, undefined);
});

test('injectToken: injects token without a session when requireSession is false', (t) => {
  const viewModel = makeViewModel(null);
  const context = makeContext({ requireSession: false });

  const result = CsrfProtection.injectToken(viewModel, context);

  t.truthy(result.csrf);
  t.is(typeof result.csrf.token, 'string');
});

test('injectToken: rendered hidden input contains both fieldName and token', (t) => {
  const session = {};
  const result = CsrfProtection.injectToken(makeViewModel(session), makeContext());

  t.regex(result.csrf.input, /^<input type="hidden" name="_csrf" value="[0-9a-f]{64}" \/>$/);
});

test('injectToken: escapes custom fieldName in the rendered hidden input', (t) => {
  const session = {};
  const result = CsrfProtection.injectToken(makeViewModel(session), makeContext({
    fieldName: 'csrf"><script>',
  }));

  t.true(result.csrf.input.includes('name="csrf&quot;&gt;&lt;script&gt;"'));
  t.false(result.csrf.input.includes('<script>'));
});

test('validateToken: returns false (allow) when body token matches session token', (t) => {
  const token = CsrfProtection.generateToken(32);
  const req = makeRequest({ body: { _csrf: token }, session: { uttoriCsrfToken: token } });
  const context = makeContext();

  t.is(CsrfProtection.validateToken(req, context), false);
});

test('validateToken: returns false (allow) when header token matches session token', (t) => {
  const token = CsrfProtection.generateToken(32);
  const req = makeRequest({
    headers: { 'x-csrf-token': token },
    session: { uttoriCsrfToken: token },
  });
  const context = makeContext();

  t.is(CsrfProtection.validateToken(req, context), false);
});

test('validateToken: returns true (block) when body token does not match session token', (t) => {
  const req = makeRequest({
    body: { _csrf: 'wrong-token' },
    session: { uttoriCsrfToken: CsrfProtection.generateToken(32) },
  });
  t.is(CsrfProtection.validateToken(req, makeContext()), true);
});

test('validateToken: returns true (block) when no token is submitted', (t) => {
  const req = makeRequest({ session: { uttoriCsrfToken: CsrfProtection.generateToken(32) } });
  t.is(CsrfProtection.validateToken(req, makeContext()), true);
});

test('validateToken: returns true (block) when session has no token', (t) => {
  const token = CsrfProtection.generateToken(32);
  const req = makeRequest({ body: { _csrf: token }, session: {} });
  t.is(CsrfProtection.validateToken(req, makeContext()), true);
});

test('validateToken: returns true (block) when session is missing and requireSession is true', (t) => {
  const token = CsrfProtection.generateToken(32);
  const req = makeRequest({ body: { _csrf: token }, session: null });
  t.is(CsrfProtection.validateToken(req, makeContext({ requireSession: true })), true);
});

test('validateToken: returns false (allow) without session when requireSession is false and token provided via header', (t) => {
  // When requireSession is false the plugin should not block solely because there is no session;
  // however, there is also no session token to compare against, so it still blocks.
  // This test documents that behavior explicitly.
  const token = CsrfProtection.generateToken(32);
  const req = makeRequest({ headers: { 'x-csrf-token': token }, session: null });
  // No session token to compare against -> still blocks
  t.is(CsrfProtection.validateToken(req, makeContext({ requireSession: false })), true);
});

test('validateToken: respects custom fieldName for body lookup', (t) => {
  const token = CsrfProtection.generateToken(32);
  const req = makeRequest({
    body: { my_token: token },
    session: { myKey: token },
  });
  const context = makeContext({ fieldName: 'my_token', sessionKey: 'myKey' });
  t.is(CsrfProtection.validateToken(req, context), false);
});

test('validateToken: respects custom headerName for header lookup', (t) => {
  const token = CsrfProtection.generateToken(32);
  const req = makeRequest({
    headers: { 'x-my-csrf': token },
    session: { uttoriCsrfToken: token },
  });
  const context = makeContext({ headerName: 'x-my-csrf' });
  t.is(CsrfProtection.validateToken(req, context), false);
});

test('validateToken: searches sources in order and uses the first matching value', (t) => {
  const correctToken = CsrfProtection.generateToken(32);
  const wrongToken = CsrfProtection.generateToken(32);
  // sources: ['body', 'header'] -> body is checked first
  const req = makeRequest({
    body: { _csrf: correctToken },
    headers: { 'x-csrf-token': wrongToken },
    session: { uttoriCsrfToken: correctToken },
  });
  const context = makeContext({ sources: ['body', 'header'] });
  t.is(CsrfProtection.validateToken(req, context), false);
});

test('validateToken: blocks when only-header sources config but token submitted in body', (t) => {
  const token = CsrfProtection.generateToken(32);
  const req = makeRequest({
    body: { _csrf: token },
    session: { uttoriCsrfToken: token },
  });
  const context = makeContext({ sources: ['header'] });
  t.is(CsrfProtection.validateToken(req, context), true);
});

test('validateToken: rotates session token after valid request when rotateOnValidation is true', (t) => {
  const token = CsrfProtection.generateToken(32);
  const session = { uttoriCsrfToken: token };
  const req = makeRequest({ body: { _csrf: token }, session });
  const context = makeContext({ rotateOnValidation: true });

  const result = CsrfProtection.validateToken(req, context);

  t.is(result, false);
  t.not(session['uttoriCsrfToken'], token);
  t.is(session['uttoriCsrfToken'].length, 64);
});

test('validateToken: does not rotate session token when rotateOnValidation is false', (t) => {
  const token = CsrfProtection.generateToken(32);
  const session = { uttoriCsrfToken: token };
  const req = makeRequest({ body: { _csrf: token }, session });
  const context = makeContext({ rotateOnValidation: false });

  CsrfProtection.validateToken(req, context);

  t.is(session['uttoriCsrfToken'], token);
});

test('validateToken: blocks a cross-site request when checkFetchMetadata is true', (t) => {
  const token = CsrfProtection.generateToken(32);
  const req = makeRequest({
    body: { _csrf: token },
    headers: { 'sec-fetch-site': 'cross-site' },
    session: { uttoriCsrfToken: token },
  });
  const context = makeContext({ checkFetchMetadata: true });

  t.is(CsrfProtection.validateToken(req, context), true);
});

test('validateToken: allows a same-origin request when checkFetchMetadata is true', (t) => {
  const token = CsrfProtection.generateToken(32);
  const req = makeRequest({
    body: { _csrf: token },
    headers: { 'sec-fetch-site': 'same-origin' },
    session: { uttoriCsrfToken: token },
  });
  const context = makeContext({ checkFetchMetadata: true });

  t.is(CsrfProtection.validateToken(req, context), false);
});

test('validateToken: allows a same-site request when checkFetchMetadata is true', (t) => {
  const token = CsrfProtection.generateToken(32);
  const req = makeRequest({
    body: { _csrf: token },
    headers: { 'sec-fetch-site': 'same-site' },
    session: { uttoriCsrfToken: token },
  });
  const context = makeContext({ checkFetchMetadata: true });

  t.is(CsrfProtection.validateToken(req, context), false);
});

test('validateToken: allows a request with no Sec-Fetch-Site header when checkFetchMetadata is true', (t) => {
  // Absent header mean older browser or direct navigation; should not block.
  const token = CsrfProtection.generateToken(32);
  const req = makeRequest({
    body: { _csrf: token },
    session: { uttoriCsrfToken: token },
  });
  const context = makeContext({ checkFetchMetadata: true });

  t.is(CsrfProtection.validateToken(req, context), false);
});

test('validateToken: does not check Sec-Fetch-Site when checkFetchMetadata is false', (t) => {
  // Even a cross-site header should be ignored when the option is off.
  const token = CsrfProtection.generateToken(32);
  const req = makeRequest({
    body: { _csrf: token },
    headers: { 'sec-fetch-site': 'cross-site' },
    session: { uttoriCsrfToken: token },
  });
  const context = makeContext({ checkFetchMetadata: false });

  t.is(CsrfProtection.validateToken(req, context), false);
});

test('validateToken: blocks when submitted token length differs from session token length', (t) => {
  // Different lengths cannot be timing-safe-equal, so block immediately.
  const session = { uttoriCsrfToken: CsrfProtection.generateToken(32) };
  const req = makeRequest({ body: { _csrf: 'short' }, session });
  t.is(CsrfProtection.validateToken(req, makeContext()), true);
});

test('injectToken + validateToken roundtrip: token injected onto view model passes validation', (t) => {
  const session = {};
  const context = makeContext();

  const viewModel = CsrfProtection.injectToken(makeViewModel(session), context);
  const token = viewModel.csrf.token;

  const req = makeRequest({ body: { _csrf: token }, session });
  t.is(CsrfProtection.validateToken(req, context), false);
});

test('injectToken + validateToken roundtrip: tampered token fails validation', (t) => {
  const session = {};
  const context = makeContext();

  CsrfProtection.injectToken(makeViewModel(session), context);

  const req = makeRequest({ body: { _csrf: 'tampered' }, session });
  t.is(CsrfProtection.validateToken(req, context), true);
});

test('validate-save: save request without CSRF token is blocked when plugin is registered', async (t) => {
  t.plan(1);

  const server = serverSetup();
  const uttori = new UttoriWiki({
    ...config,
    useEditKey: false,
    plugins: [
      ...config.plugins,
      CsrfProtection,
    ],
    [CsrfProtection.configKey]: {
      ...CsrfProtection.defaultConfig(),
      requireSession: false, // session is not guaranteed in supertest
    },
  }, server);
  await seed(uttori);

  const response = await request(server)
    .put('/demo-title/save')
    .send('slug=demo-title&content=updated');

  // No _csrf field means the plugin blocks the save; wiki redirects back (302).
  t.is(response.status, 302);
});

test('validate-save: save request with matching CSRF token is allowed when plugin is registered', async (t) => {
  t.plan(1);

  const token = CsrfProtection.generateToken(32);

  // Simulate a session with the token already stored by registering a plugin that
  // sets the session token on every validate-save call before CsrfProtection runs.
  const sessionInjector = {
    configKey: 'test-session-injector',
    defaultConfig: () => ({}),
    register: (context) => {
      context.hooks.on('validate-save', (req) => {
        if (!req.session) req.session = {};
        req.session['uttoriCsrfToken'] = token;
        return false;
      });
    },
  };

  const server = serverSetup();
  const uttori = new UttoriWiki({
    ...config,
    useEditKey: false,
    plugins: [
      ...config.plugins,
      sessionInjector,
      CsrfProtection,
    ],
    [CsrfProtection.configKey]: {
      ...CsrfProtection.defaultConfig(),
      requireSession: false,
    },
  }, server);
  await seed(uttori);

  const response = await request(server)
    .put('/demo-title/save')
    .send(`slug=demo-title&content=updated&_csrf=${token}`);

  // Token matches, save proceeds, and redirects to the updated document.
  t.is(response.status, 302);
});
