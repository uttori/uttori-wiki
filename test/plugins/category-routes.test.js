import test from 'ava';
import sinon from 'sinon';
import { EventDispatcher } from '@uttori/event-dispatcher';
import CategoryRoutesPlugin from '../../src/plugins/category-routes.js';

/** @type {import('sinon').SinonSandbox} */
let sandbox;
test.beforeEach(() => {
  sandbox = sinon.createSandbox();
});

test.afterEach(() => {
  sandbox.restore();
});

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Returns a minimal valid plugin config block (the inner value).
 * @returns {import('../../src/plugins/category-routes.js').CategoryRoutesPluginConfig}
 */
const validPluginConfig = () => ({
  categoryIndexRoute: 'categories',
  categoryRoute: 'categories',
  apiRoute: 'category-api',
  title: 'Categories',
  categoryField: 'categories',
  separator: '/',
  limit: 1024,
  middleware: { categoryIndex: [], category: [], api: [] },
  categoryIndexRequestHandler: CategoryRoutesPlugin.categoryIndexRequestHandler,
  categoryRequestHandler: CategoryRoutesPlugin.categoryRequestHandler,
  apiRequestHandler: CategoryRoutesPlugin.categoryApiRequestHandler,
  events: {
    bindRoutes: ['bind-routes'],
    validateConfig: ['validate-config'],
  },
});

/**
 * Builds a minimal context object for testing.
 * @param {Partial<import('../../src/plugins/category-routes.js').CategoryRoutesPluginConfig>} [pluginOverrides]
 * @returns {any} context
 */
const makeContext = (pluginOverrides = {}) => {
  const fetchStub = sandbox.stub().resolves([[
    { slug: 'doc1', title: 'Alpha Doc', categories: ['tech', 'science'] },
    { slug: 'doc2', title: 'Beta Doc', categories: ['tech'] },
  ]]);
  const filterStub = sandbox.stub().callsFake((_event, data) => Promise.resolve(data));
  const buildMetadataStub = sandbox.stub().resolves({ canonical: 'https://example.com/categories' });

  return {
    config: {
      ignoreSlugs: ['home-page'],
      ignoreCategories: ['private'],
      useCache: true,
      cacheShort: 3600,
      [CategoryRoutesPlugin.configKey]: {
        ...validPluginConfig(),
        ...pluginOverrides,
      },
    },
    hooks: { fetch: fetchStub, filter: filterStub },
    buildMetadata: buildMetadataStub,
    _fetchStub: fetchStub,
    _filterStub: filterStub,
  };
};

/**
 * Builds a fake Express request object.
 * @param {object} [overrides]
 * @returns {object}
 */
const makeRequest = (overrides = {}) => ({
  session: { user: null },
  baseUrl: '',
  params: {},
  wikiFlash: sandbox.stub().returns([]),
  ...overrides,
});

/**
 * Builds a fake Express response object.
 * @returns {object}
 */
const makeResponse = () => ({
  set: sandbox.stub(),
  render: sandbox.stub(),
  json: sandbox.stub(),
  status: sandbox.stub().returnsThis(),
});

// ── configKey ─────────────────────────────────────────────────────────────────

test('CategoryRoutesPlugin.configKey: returns the correct config key', (t) => {
  t.is(CategoryRoutesPlugin.configKey, 'uttori-plugin-category-routes');
});

// ── allowedDocumentKeys ───────────────────────────────────────────────────────

test('CategoryRoutesPlugin.allowedDocumentKeys: returns array with categories', (t) => {
  const keys = CategoryRoutesPlugin.allowedDocumentKeys;
  t.true(Array.isArray(keys));
  t.true(keys.includes('categories'));
});

// ── defaultConfig ─────────────────────────────────────────────────────────────

test('CategoryRoutesPlugin.defaultConfig(): returns valid default configuration', (t) => {
  const config = CategoryRoutesPlugin.defaultConfig();

  t.is(config.title, 'Categories');
  t.is(config.limit, 1024);
  t.is(config.categoryIndexRoute, 'categories');
  t.is(config.categoryRoute, 'categories');
  t.is(config.apiRoute, 'category-api');
  t.is(config.categoryField, 'categories');
  t.is(config.separator, '/');
  t.deepEqual(config.middleware, { categoryIndex: [], category: [], api: [] });
  t.deepEqual(config.events, { bindRoutes: ['bind-routes'], validateConfig: ['validate-config'] });
  t.is(config.categoryIndexRequestHandler, CategoryRoutesPlugin.categoryIndexRequestHandler);
  t.is(config.categoryRequestHandler, CategoryRoutesPlugin.categoryRequestHandler);
  t.is(config.apiRequestHandler, CategoryRoutesPlugin.categoryApiRequestHandler);
});

// ── extendConfig ──────────────────────────────────────────────────────────────

test('CategoryRoutesPlugin.extendConfig(): merges user config with defaults', (t) => {
  const extended = CategoryRoutesPlugin.extendConfig({
    title: 'My Categories',
    limit: 50,
    middleware: { categoryIndex: [() => {}] },
    events: { bindRoutes: ['custom-bind'] },
  });

  t.is(extended.title, 'My Categories');
  t.is(extended.limit, 50);
  t.is(extended.categoryIndexRoute, 'categories'); // from default
  t.is(extended.middleware.categoryIndex.length, 1);
  t.deepEqual(extended.middleware.category, []); // from default
  t.deepEqual(extended.events.bindRoutes, ['custom-bind']);
  t.deepEqual(extended.events.validateConfig, ['validate-config']); // from default
});

test('CategoryRoutesPlugin.extendConfig(): handles undefined config (returns default)', (t) => {
  const extended = CategoryRoutesPlugin.extendConfig();
  const defaults = CategoryRoutesPlugin.defaultConfig();
  t.deepEqual(extended, defaults);
});

// ── validateConfig ────────────────────────────────────────────────────────────

test('CategoryRoutesPlugin.validateConfig(): throws when config key is missing', (t) => {
  t.throws(() => CategoryRoutesPlugin.validateConfig({}, /** @type {any} */ ({})), {
    message: `Config Error: '${CategoryRoutesPlugin.configKey}' configuration key is missing.`,
  });
});

test('CategoryRoutesPlugin.validateConfig(): throws when categoryIndexRoute is empty string', (t) => {
  // extendConfig merges defaults; pass empty string to override and trigger the throw
  t.throws(() => CategoryRoutesPlugin.validateConfig({
    [CategoryRoutesPlugin.configKey]: { categoryIndexRoute: '' },
  }, /** @type {any} */ ({})), {
    message: /categoryIndexRoute.*missing or not a string/,
  });
});

test('CategoryRoutesPlugin.validateConfig(): throws when categoryRoute is empty string', (t) => {
  t.throws(() => CategoryRoutesPlugin.validateConfig({
    [CategoryRoutesPlugin.configKey]: { categoryRoute: '' },
  }, /** @type {any} */ ({})), {
    message: /categoryRoute.*missing or not a string/,
  });
});

test('CategoryRoutesPlugin.validateConfig(): throws when apiRoute is empty string', (t) => {
  t.throws(() => CategoryRoutesPlugin.validateConfig({
    [CategoryRoutesPlugin.configKey]: { apiRoute: '' },
  }, /** @type {any} */ ({})), {
    message: /apiRoute.*missing or not a string/,
  });
});

test('CategoryRoutesPlugin.validateConfig(): throws when title is empty string', (t) => {
  t.throws(() => CategoryRoutesPlugin.validateConfig({
    [CategoryRoutesPlugin.configKey]: { title: '' },
  }, /** @type {any} */ ({})), {
    message: /title.*missing or not a string/,
  });
});

test('CategoryRoutesPlugin.validateConfig(): throws when categoryField is empty string', (t) => {
  t.throws(() => CategoryRoutesPlugin.validateConfig({
    [CategoryRoutesPlugin.configKey]: { categoryField: '' },
  }, /** @type {any} */ ({})), {
    message: /categoryField.*missing or not a string/,
  });
});

test('CategoryRoutesPlugin.validateConfig(): throws when separator is empty string', (t) => {
  t.throws(() => CategoryRoutesPlugin.validateConfig({
    [CategoryRoutesPlugin.configKey]: { separator: '' },
  }, /** @type {any} */ ({})), {
    message: /separator.*missing or not a string/,
  });
});

test('CategoryRoutesPlugin.validateConfig(): throws when limit is not a number', (t) => {
  t.throws(() => CategoryRoutesPlugin.validateConfig({
    [CategoryRoutesPlugin.configKey]: { limit: /** @type {any} */ ('many') },
  }, /** @type {any} */ ({})), {
    message: /limit.*missing or not a number/,
  });
});

test('CategoryRoutesPlugin.validateConfig(): throws when middleware is not an object', (t) => {
  // extendConfig always spreads middleware into an object, so stub extendConfig to bypass that
  const extendConfigStub = sandbox.stub(CategoryRoutesPlugin, 'extendConfig').returns(/** @type {any} */ ({
    categoryIndexRoute: 'categories',
    categoryRoute: 'categories',
    apiRoute: 'category-api',
    title: 'Categories',
    categoryField: 'categories',
    separator: '/',
    limit: 10,
    middleware: 'not-an-object',
    categoryIndexRequestHandler: () => {},
    categoryRequestHandler: () => {},
    apiRequestHandler: () => {},
  }));

  t.throws(() => CategoryRoutesPlugin.validateConfig({
    [CategoryRoutesPlugin.configKey]: validPluginConfig(),
  }, /** @type {any} */ ({})), {
    message: /middleware.*missing or not an object/,
  });

  extendConfigStub.restore();
});

test('CategoryRoutesPlugin.validateConfig(): throws when categoryIndexRequestHandler is not a function', (t) => {
  t.throws(() => CategoryRoutesPlugin.validateConfig({
    [CategoryRoutesPlugin.configKey]: {
      categoryIndexRequestHandler: /** @type {any} */ ('not-a-function'),
    },
  }, /** @type {any} */ ({})), {
    message: /categoryIndexRequestHandler.*missing or not a function/,
  });
});

test('CategoryRoutesPlugin.validateConfig(): throws when categoryRequestHandler is not a function', (t) => {
  t.throws(() => CategoryRoutesPlugin.validateConfig({
    [CategoryRoutesPlugin.configKey]: {
      categoryRequestHandler: /** @type {any} */ ('not-a-function'),
    },
  }, /** @type {any} */ ({})), {
    message: /categoryRequestHandler.*missing or not a function/,
  });
});

test('CategoryRoutesPlugin.validateConfig(): throws when apiRequestHandler is not a function', (t) => {
  t.throws(() => CategoryRoutesPlugin.validateConfig({
    [CategoryRoutesPlugin.configKey]: {
      apiRequestHandler: /** @type {any} */ ('not-a-function'),
    },
  }, /** @type {any} */ ({})), {
    message: /apiRequestHandler.*missing or not a function/,
  });
});

test('CategoryRoutesPlugin.validateConfig(): validates successfully with valid config', (t) => {
  t.notThrows(() => CategoryRoutesPlugin.validateConfig({
    [CategoryRoutesPlugin.configKey]: validPluginConfig(),
  }, /** @type {any} */ ({})));
});

// ── register ──────────────────────────────────────────────────────────────────

test('CategoryRoutesPlugin.register(): throws when context is missing', (t) => {
  t.throws(() => CategoryRoutesPlugin.register(/** @type {any} */ (undefined)), {
    message: 'Missing event dispatcher in \'context.hooks.on(event, callback)\' format.',
  });
});

test('CategoryRoutesPlugin.register(): throws when hooks is missing', (t) => {
  t.throws(() => CategoryRoutesPlugin.register(/** @type {any} */ ({})), {
    message: 'Missing event dispatcher in \'context.hooks.on(event, callback)\' format.',
  });
});

test('CategoryRoutesPlugin.register(): throws when hooks.on is not a function', (t) => {
  t.throws(() => CategoryRoutesPlugin.register(/** @type {any} */ ({ hooks: {} })), {
    message: 'Missing event dispatcher in \'context.hooks.on(event, callback)\' format.',
  });
});

test('CategoryRoutesPlugin.register(): registers events successfully', (t) => {
  const hooks = new EventDispatcher();
  const onSpy = sandbox.spy(hooks, 'on');

  t.notThrows(() => CategoryRoutesPlugin.register(/** @type {any} */ ({
    hooks,
    config: { [CategoryRoutesPlugin.configKey]: validPluginConfig() },
  })));

  t.is(onSpy.callCount, 2);
  t.true(onSpy.calledWith('bind-routes', CategoryRoutesPlugin.bindRoutes));
  t.true(onSpy.calledWith('validate-config', CategoryRoutesPlugin.validateConfig));
});

test('CategoryRoutesPlugin.register(): handles non-existent method gracefully', (t) => {
  const hooks = new EventDispatcher();
  const onSpy = sandbox.spy(hooks, 'on');

  t.notThrows(() => CategoryRoutesPlugin.register(/** @type {any} */ ({
    hooks,
    config: {
      [CategoryRoutesPlugin.configKey]: {
        ...validPluginConfig(),
        // Add a non-existent method; extendConfig merges default events so bindRoutes + validateConfig still run
        events: { nonExistentMethod: ['some-event'], validateConfig: ['validate-config'] },
      },
    },
  })));

  // nonExistentMethod is skipped; bindRoutes and validateConfig (from merged defaults) are registered
  t.is(onSpy.callCount, 2);
  t.false(onSpy.calledWith('some-event', sinon.match.any));
});

// ── bindRoutes ────────────────────────────────────────────────────────────────

test('CategoryRoutesPlugin.bindRoutes(): binds all three routes', (t) => {
  const server = /** @type {any} */ ({ get: sandbox.spy() });
  const middlewareSpy = sandbox.spy();

  const context = /** @type {any} */ ({
    config: {
      [CategoryRoutesPlugin.configKey]: {
        ...validPluginConfig(),
        middleware: {
          categoryIndex: [middlewareSpy],
          category: [middlewareSpy],
          api: [middlewareSpy],
        },
        categoryIndexRequestHandler: sandbox.stub().returns(() => {}),
        categoryRequestHandler: sandbox.stub().returns(() => {}),
        apiRequestHandler: sandbox.stub().returns(() => {}),
      },
    },
  });

  CategoryRoutesPlugin.bindRoutes(server, context);

  t.is(server.get.callCount, 3);
  t.true(server.get.calledWith('/categories', middlewareSpy, sinon.match.func));
  t.true(server.get.calledWith('/categories/*categoryPath', middlewareSpy, sinon.match.func));
  t.true(server.get.calledWith('/category-api', middlewareSpy, sinon.match.func));
});

// ── getCategorizedDocuments ───────────────────────────────────────────────────

test('CategoryRoutesPlugin.getCategorizedDocuments(): returns matching documents', async (t) => {
  const context = makeContext();
  context._fetchStub.resolves([[
    { slug: 'doc1', title: 'Alpha', categories: ['tech'] },
    { slug: 'doc2', title: 'Beta', categories: ['tech'] },
  ]]);

  const docs = await CategoryRoutesPlugin.getCategorizedDocuments(context, 'tech');

  t.is(docs.length, 2);
  t.is(docs[0].slug, 'doc1');
  t.true(context._fetchStub.calledWith(
    'storage-query',
    sinon.match(/INCLUDES "tech"/),
    context,
  ));
});

test('CategoryRoutesPlugin.getCategorizedDocuments(): filters out falsy results', async (t) => {
  const context = makeContext();
  context._fetchStub.resolves([[
    { slug: 'doc1', title: 'Alpha', categories: ['tech'] },
    null,
    undefined,
  ]]);

  const docs = await CategoryRoutesPlugin.getCategorizedDocuments(context, 'tech');

  t.is(docs.length, 1);
  t.is(docs[0].slug, 'doc1');
});

// ── buildCategoryTree ─────────────────────────────────────────────────────────

test('CategoryRoutesPlugin.buildCategoryTree(): builds flat categories', (t) => {
  const tree = CategoryRoutesPlugin.buildCategoryTree(['tech', 'science']);

  t.truthy(tree.tech);
  t.truthy(tree.science);
  t.is(tree.tech.name, 'tech');
  t.is(tree.tech.fullPath, 'tech');
  t.deepEqual(Object.keys(tree.tech.children), []);
});

test('CategoryRoutesPlugin.buildCategoryTree(): builds hierarchical categories', (t) => {
  const tree = CategoryRoutesPlugin.buildCategoryTree(['tech/javascript', 'tech/python', 'science']);

  t.truthy(tree.tech);
  t.truthy(tree.tech.children.javascript);
  t.truthy(tree.tech.children.python);
  t.is(tree.tech.children.javascript.fullPath, 'tech/javascript');
  t.truthy(tree.science);
});

test('CategoryRoutesPlugin.buildCategoryTree(): handles empty categories array', (t) => {
  const tree = CategoryRoutesPlugin.buildCategoryTree([]);
  t.deepEqual(tree, {});
});

test('CategoryRoutesPlugin.buildCategoryTree(): uses custom separator', (t) => {
  const tree = CategoryRoutesPlugin.buildCategoryTree(['tech:js', 'tech:python'], ':');

  t.truthy(tree.tech);
  t.truthy(tree.tech.children.js);
  t.is(tree.tech.children.js.fullPath, 'tech:js');
});

// ── flattenCategoryTree ───────────────────────────────────────────────────────

test('CategoryRoutesPlugin.flattenCategoryTree(): flattens and sorts tree', (t) => {
  const tree = CategoryRoutesPlugin.buildCategoryTree(['tech', 'art', 'science']);
  const flat = CategoryRoutesPlugin.flattenCategoryTree(tree);

  t.is(flat.length, 3);
  t.is(flat[0].fullPath, 'art');
  t.is(flat[1].fullPath, 'science');
  t.is(flat[2].fullPath, 'tech');
});

test('CategoryRoutesPlugin.flattenCategoryTree(): includes children with correct levels', (t) => {
  const tree = CategoryRoutesPlugin.buildCategoryTree(['tech/js', 'tech/python']);
  const flat = CategoryRoutesPlugin.flattenCategoryTree(tree);

  // tech (level 0), tech/js (level 1), tech/python (level 1)
  t.is(flat.length, 3);
  const techEntry = flat.find((c) => c.fullPath === 'tech');
  const jsEntry = flat.find((c) => c.fullPath === 'tech/js');
  t.is(techEntry?.level, 0);
  t.is(jsEntry?.level, 1);
});

test('CategoryRoutesPlugin.flattenCategoryTree(): returns empty array for empty tree', (t) => {
  t.deepEqual(CategoryRoutesPlugin.flattenCategoryTree({}), []);
});

// ── categoryIndexRequestHandler ───────────────────────────────────────────────

test('CategoryRoutesPlugin.categoryIndexRequestHandler(): returns a function', (t) => {
  const context = makeContext();
  const handler = CategoryRoutesPlugin.categoryIndexRequestHandler(context);
  t.is(typeof handler, 'function');
});

test('CategoryRoutesPlugin.categoryIndexRequestHandler(): renders categories view', async (t) => {
  const context = makeContext();
  const handler = CategoryRoutesPlugin.categoryIndexRequestHandler(context);

  const request = makeRequest();
  const response = makeResponse();

  await handler(request, response, null);

  t.true(response.render.calledWith('categories'));
  t.true(response.set.calledWith('Cache-control', sinon.match.string));
});

test('categoryIndexRequestHandler: passes correct viewModel shape to render', async (t) => {
  const context = makeContext();
  context._fetchStub.resolves([[
    { slug: 'doc1', title: 'Alpha', categories: ['tech'] },
  ]]);

  const handler = CategoryRoutesPlugin.categoryIndexRequestHandler(context);
  const request = makeRequest();
  const response = makeResponse();

  await handler(request, response, null);

  t.true(response.render.calledOnce);
  const [template, viewModel] = response.render.firstCall.args;
  t.is(template, 'categories');
  t.truthy(viewModel.categorizedDocuments);
  t.truthy(viewModel.categoryTree);
  t.truthy(viewModel.flattenedCategories);
  t.truthy(viewModel.meta);
  t.is(viewModel.title, 'Categories');
});

test('categoryIndexRequestHandler: skips cache header when useCache is false', async (t) => {
  const context = makeContext();
  context.config.useCache = false;

  const handler = CategoryRoutesPlugin.categoryIndexRequestHandler(context);
  const request = makeRequest();
  const response = makeResponse();

  await handler(request, response, null);

  t.false(response.set.called);
  t.true(response.render.calledWith('categories'));
});

// ── categoryRequestHandler ────────────────────────────────────────────────────

test('CategoryRoutesPlugin.categoryRequestHandler(): returns a function', (t) => {
  const context = makeContext();
  const handler = CategoryRoutesPlugin.categoryRequestHandler(context);
  t.is(typeof handler, 'function');
});

test('categoryRequestHandler: calls next() when categoryPath is empty', async (t) => {
  const context = makeContext();
  const handler = CategoryRoutesPlugin.categoryRequestHandler(context);

  const request = makeRequest({ params: { categoryPath: '' } });
  const response = makeResponse();
  const next = sandbox.spy();

  await handler(request, response, next);

  t.true(next.calledOnce);
  t.false(response.render.called);
});

test('categoryRequestHandler: calls next() when no documents found for category', async (t) => {
  const context = makeContext();
  context._fetchStub.resolves([[]]); // no documents

  const handler = CategoryRoutesPlugin.categoryRequestHandler(context);

  const request = makeRequest({ params: { categoryPath: 'tech' } });
  const response = makeResponse();
  const next = sandbox.spy();

  await handler(request, response, next);

  t.true(next.calledOnce);
  t.false(response.render.called);
});

test('categoryRequestHandler: renders category view with documents', async (t) => {
  const context = makeContext();
  context._fetchStub.resolves([[
    { slug: 'doc1', title: 'Alpha Doc', categories: ['tech'] },
  ]]);

  const handler = CategoryRoutesPlugin.categoryRequestHandler(context);
  const request = makeRequest({ params: { categoryPath: 'tech' } });
  const response = makeResponse();
  const next = sandbox.spy();

  await handler(request, response, next);

  t.false(next.called);
  t.true(response.render.calledWith('category'));
  const [, viewModel] = response.render.firstCall.args;
  t.is(viewModel.categoryPath, 'tech');
  t.truthy(viewModel.breadcrumbs);
  t.is(viewModel.breadcrumbs.length, 1);
  t.is(viewModel.breadcrumbs[0].name, 'tech');
  t.true(viewModel.breadcrumbs[0].isLast);
});

test('categoryRequestHandler: builds multi-level breadcrumbs for nested categories', async (t) => {
  const context = makeContext();
  context._fetchStub.resolves([[
    { slug: 'doc1', title: 'Alpha', categories: ['tech/javascript'] },
  ]]);

  const handler = CategoryRoutesPlugin.categoryRequestHandler(context);
  const request = makeRequest({ params: { categoryPath: 'tech/javascript' } });
  const response = makeResponse();
  const next = sandbox.spy();

  await handler(request, response, next);

  t.false(next.called);
  const [, viewModel] = response.render.firstCall.args;
  t.is(viewModel.breadcrumbs.length, 2);
  t.is(viewModel.breadcrumbs[0].name, 'tech');
  t.false(viewModel.breadcrumbs[0].isLast);
  t.is(viewModel.breadcrumbs[1].name, 'javascript');
  t.true(viewModel.breadcrumbs[1].isLast);
});

test('categoryRequestHandler: calls next() when path is sanitized away (all dots)', async (t) => {
  const context = makeContext();
  const handler = CategoryRoutesPlugin.categoryRequestHandler(context);

  // '...' gets sanitized to '' by sanitizeCategoryPath → next() is called
  const request = makeRequest({ params: { categoryPath: '...' } });
  const response = makeResponse();
  const next = sandbox.spy();

  await handler(request, response, next);

  t.true(next.calledOnce);
  t.false(response.render.called);
});

test('categoryRequestHandler: skips cache header when useCache is false', async (t) => {
  const context = makeContext();
  context.config.useCache = false;
  context._fetchStub.resolves([[{ slug: 'doc1', title: 'Alpha', categories: ['tech'] }]]);

  const handler = CategoryRoutesPlugin.categoryRequestHandler(context);
  const request = makeRequest({ params: { categoryPath: 'tech' } });
  const response = makeResponse();

  await handler(request, response, sandbox.spy());

  t.false(response.set.called);
  t.true(response.render.calledWith('category'));
});

// ── getAllCategories ───────────────────────────────────────────────────────────

test('CategoryRoutesPlugin.getAllCategories(): returns deduplicated sorted categories', async (t) => {
  const context = makeContext();
  context._fetchStub.resolves([[
    { categories: ['tech', 'science'] },
    { categories: ['tech', 'art'] },
  ]]);

  const categories = await CategoryRoutesPlugin.getAllCategories(context);

  t.deepEqual(categories, ['art', 'science', 'tech']);
});

test('CategoryRoutesPlugin.getAllCategories(): returns empty array when no documents', async (t) => {
  const context = makeContext();
  context._fetchStub.resolves([[]]);

  const categories = await CategoryRoutesPlugin.getAllCategories(context);

  t.deepEqual(categories, []);
});

test('CategoryRoutesPlugin.getAllCategories(): filters out empty/null categories', async (t) => {
  const context = makeContext();
  context._fetchStub.resolves([[
    { categories: ['tech', '', null, undefined] },
  ]]);

  const categories = await CategoryRoutesPlugin.getAllCategories(context);

  t.deepEqual(categories, ['tech']);
});

// ── categoryApiRequestHandler ─────────────────────────────────────────────────

test('CategoryRoutesPlugin.categoryApiRequestHandler(): returns a function', (t) => {
  const context = makeContext();
  const handler = CategoryRoutesPlugin.categoryApiRequestHandler(context);
  t.is(typeof handler, 'function');
});

test('categoryApiRequestHandler: responds with JSON array of categories', async (t) => {
  const context = makeContext();
  context._fetchStub.resolves([[
    { categories: ['tech', 'science'] },
  ]]);

  const handler = CategoryRoutesPlugin.categoryApiRequestHandler(context);
  const request = makeRequest();
  const response = makeResponse();

  await handler(request, response, null);

  t.true(response.json.calledOnce);
  const [categories] = response.json.firstCall.args;
  t.deepEqual(categories, ['science', 'tech']);
});

test('categoryApiRequestHandler: responds with 500 when getAllCategories throws', async (t) => {
  const context = makeContext();
  sandbox.stub(CategoryRoutesPlugin, 'getAllCategories').rejects(new Error('Storage down'));

  const handler = CategoryRoutesPlugin.categoryApiRequestHandler(context);
  const request = makeRequest();
  const response = makeResponse();

  await handler(request, response, null);

  t.true(response.status.calledWith(500));
  t.true(response.json.calledWith({ error: 'Failed to fetch categories' }));
});
