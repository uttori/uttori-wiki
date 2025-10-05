import test from 'ava';
import sinon from 'sinon';
import { EventDispatcher } from '@uttori/event-dispatcher';
import TagRoutesPlugin from '../../src/plugins/tag-routes.js';

let sandbox;
test.beforeEach(() => {
  sandbox = sinon.createSandbox();
});

test.afterEach(() => {
  sandbox.restore();
});

test('TagRoutesPlugin.configKey: returns the correct config key', (t) => {
  t.is(TagRoutesPlugin.configKey, 'uttori-plugin-tag-routes');
});

test('TagRoutesPlugin.defaultConfig(): returns a valid default configuration', (t) => {
  const config = TagRoutesPlugin.defaultConfig();

  t.is(config.title, 'Tags');
  t.is(config.limit, 1024);
  t.is(config.tagIndexRoute, 'tags');
  t.is(config.tagRoute, 'tags');
  t.is(config.apiRoute, 'tag-api');
  t.deepEqual(config.middleware, {
    tagIndex: [],
    tag: [],
    api: [],
  });
  t.deepEqual(config.events, {
    bindRoutes: ['bind-routes'],
    validateConfig: ['validate-config'],
  });
  t.is(config.tagIndexRequestHandler, TagRoutesPlugin.tagIndexRequestHandler);
  t.is(config.tagRequestHandler, TagRoutesPlugin.tagRequestHandler);
  t.is(config.apiRequestHandler, TagRoutesPlugin.tagRequestHandler);
});

test('TagRoutesPlugin.extendConfig(): extends default config with user config', (t) => {
  const middlewareSpy = sandbox.spy();
  const userConfig = {
    title: 'Categories',
    limit: 50,
    middleware: {
      tagIndex: [middlewareSpy],
    },
    events: {
      bindRoutes: ['custom-bind-routes'],
    },
  };

  const extended = TagRoutesPlugin.extendConfig(userConfig);

  t.is(extended.title, 'Categories');
  t.is(extended.limit, 50);
  t.is(extended.tagIndexRoute, 'tags'); // from default
  t.deepEqual(extended.middleware.tagIndex, [middlewareSpy]);
  t.deepEqual(extended.middleware.tag, []); // from default
  t.deepEqual(extended.events.bindRoutes, ['custom-bind-routes']);
  t.deepEqual(extended.events.validateConfig, ['validate-config']); // from default
});

test('TagRoutesPlugin.extendConfig(): handles undefined config', (t) => {
  const extended = TagRoutesPlugin.extendConfig();
  const defaultConfig = TagRoutesPlugin.defaultConfig();

  t.deepEqual(extended, defaultConfig);
});

test('TagRoutesPlugin.validateConfig(): throws when config key is missing', (t) => {
  t.throws(() => {
    TagRoutesPlugin.validateConfig({}, /** @type {any} */ ({}));
  }, { message: 'Config Error: \'uttori-plugin-tag-routes\' configuration key is missing.' });
});

test('TagRoutesPlugin.validateConfig(): throws when tagIndexRoute is missing', (t) => {
  t.throws(() => {
    TagRoutesPlugin.validateConfig({
      [TagRoutesPlugin.configKey]: {},
    }, /** @type {any} */ ({}));
  }, { message: 'Config Error: \'uttori-plugin-tag-routes.tagIndexRoute\' is missing or not a string.' });
});

test('TagRoutesPlugin.validateConfig(): throws when tagIndexRoute is not a string', (t) => {
  t.throws(() => {
    TagRoutesPlugin.validateConfig({
      [TagRoutesPlugin.configKey]: {
        tagIndexRoute: /** @type {any} */ (123),
      },
    }, /** @type {any} */ ({}));
  }, { message: 'Config Error: \'uttori-plugin-tag-routes.tagIndexRoute\' is missing or not a string.' });
});

test('TagRoutesPlugin.validateConfig(): throws when tagRoute is missing', (t) => {
  t.throws(() => {
    TagRoutesPlugin.validateConfig({
      [TagRoutesPlugin.configKey]: {
        tagIndexRoute: 'tags',
      },
    }, /** @type {any} */ ({}));
  }, { message: 'Config Error: \'uttori-plugin-tag-routes.tagRoute\' is missing or not a string.' });
});

test('TagRoutesPlugin.validateConfig(): throws when tagRoute is not a string', (t) => {
  t.throws(() => {
    TagRoutesPlugin.validateConfig({
      [TagRoutesPlugin.configKey]: {
        tagIndexRoute: 'tags',
        tagRoute: /** @type {any} */ (123),
      },
    }, /** @type {any} */ ({}));
  }, { message: 'Config Error: \'uttori-plugin-tag-routes.tagRoute\' is missing or not a string.' });
});

test('TagRoutesPlugin.validateConfig(): throws when apiRoute is missing', (t) => {
  t.throws(() => {
    TagRoutesPlugin.validateConfig({
      [TagRoutesPlugin.configKey]: {
        tagIndexRoute: 'tags',
        tagRoute: 'tags',
      },
    }, /** @type {any} */ ({}));
  }, { message: 'Config Error: \'uttori-plugin-tag-routes.apiRoute\' is missing or not a string.' });
});

test('TagRoutesPlugin.validateConfig(): throws when apiRoute is not a string', (t) => {
  t.throws(() => {
    TagRoutesPlugin.validateConfig({
      [TagRoutesPlugin.configKey]: {
        tagIndexRoute: 'tags',
        tagRoute: 'tags',
        apiRoute: /** @type {any} */ (123),
      },
    }, /** @type {any} */ ({}));
  }, { message: 'Config Error: \'uttori-plugin-tag-routes.apiRoute\' is missing or not a string.' });
});

test('TagRoutesPlugin.validateConfig(): throws when title is missing', (t) => {
  t.throws(() => {
    TagRoutesPlugin.validateConfig({
      [TagRoutesPlugin.configKey]: {
        tagIndexRoute: 'tags',
        tagRoute: 'tags',
        apiRoute: 'tag-api',
      },
    }, /** @type {any} */ ({}));
  }, { message: 'Config Error: \'uttori-plugin-tag-routes.title\' is missing or not a string.' });
});

test('TagRoutesPlugin.validateConfig(): throws when title is not a string', (t) => {
  t.throws(() => {
    TagRoutesPlugin.validateConfig({
      [TagRoutesPlugin.configKey]: {
        tagIndexRoute: 'tags',
        tagRoute: 'tags',
        apiRoute: 'tag-api',
        title: /** @type {any} */ (123),
      },
    }, /** @type {any} */ ({}));
  }, { message: 'Config Error: \'uttori-plugin-tag-routes.title\' is missing or not a string.' });
});

test('TagRoutesPlugin.validateConfig(): validates successfully with valid config', (t) => {
  t.notThrows(() => {
    TagRoutesPlugin.validateConfig({
      [TagRoutesPlugin.configKey]: {
        tagIndexRoute: 'tags',
        tagRoute: 'tags',
        apiRoute: 'tag-api',
        title: 'Tags',
      },
    }, /** @type {any} */ ({}));
  });
});

test('TagRoutesPlugin.register(): throws when context is missing', (t) => {
  t.throws(() => {
    TagRoutesPlugin.register(/** @type {any} */ (undefined));
  }, { message: 'Missing event dispatcher in \'context.hooks.on(event, callback)\' format.' });
});

test('TagRoutesPlugin.register(): throws when hooks is missing', (t) => {
  t.throws(() => {
    TagRoutesPlugin.register(/** @type {any} */ ({}));
  }, { message: 'Missing event dispatcher in \'context.hooks.on(event, callback)\' format.' });
});

test('TagRoutesPlugin.register(): throws when hooks.on is not a function', (t) => {
  t.throws(() => {
    TagRoutesPlugin.register(/** @type {any} */ ({ hooks: {} }));
  }, { message: 'Missing event dispatcher in \'context.hooks.on(event, callback)\' format.' });
});

test('TagRoutesPlugin.register(): registers successfully with valid config', (t) => {
  const hooks = new EventDispatcher();
  const onSpy = sandbox.spy(hooks, 'on');

  t.notThrows(() => {
    TagRoutesPlugin.register(/** @type {any} */ ({
      hooks,
      config: {
        [TagRoutesPlugin.configKey]: {
          tagIndexRoute: 'tags',
          tagRoute: 'tags',
          apiRoute: 'tag-api',
          title: 'Tags',
          events: {
            bindRoutes: ['bind-routes'],
            validateConfig: ['validate-config'],
          },
        },
      },
    }));
  });

  t.is(onSpy.callCount, 2);
  t.true(onSpy.calledWith('bind-routes', TagRoutesPlugin.bindRoutes));
  t.true(onSpy.calledWith('validate-config', TagRoutesPlugin.validateConfig));
});

test('TagRoutesPlugin.register(): handles missing methods gracefully', (t) => {
  const hooks = new EventDispatcher();
  const onSpy = sandbox.spy(hooks, 'on');

  t.notThrows(() => {
    TagRoutesPlugin.register(/** @type {any} */ ({
      hooks,
      config: {
        [TagRoutesPlugin.configKey]: {
          tagIndexRoute: 'tags',
          tagRoute: 'tags',
          apiRoute: 'tag-api',
          title: 'Tags',
          events: {
            nonExistentMethod: ['some-event'],
            validateConfig: ['validate-config'],
            bindRoutes: ['bind-routes'],
          },
        },
      },
    }));
  });

  // Should only register the valid method
  t.is(onSpy.callCount, 2);
  t.true(onSpy.calledWith('bind-routes', TagRoutesPlugin.bindRoutes));
});

test('TagRoutesPlugin.bindRoutes(): binds routes correctly', (t) => {
  const server = /** @type {any} */ ({
    get: sandbox.spy(),
  });

  const middlewareSpy = sandbox.spy();

  const context = /** @type {any} */ ({
    config: {
      [TagRoutesPlugin.configKey]: {
        tagIndexRoute: 'categories',
        tagRoute: 'categories',
        apiRoute: 'category-api',
        middleware: {
          tagIndex: [middlewareSpy],
          tag: [middlewareSpy],
          api: [middlewareSpy],
        },
        tagIndexRequestHandler: sandbox.stub().returns(() => {}),
        tagRequestHandler: sandbox.stub().returns(() => {}),
        apiRequestHandler: sandbox.stub().returns(() => {}),
      },
    },
  });

  TagRoutesPlugin.bindRoutes(server, context);

  t.is(server.get.callCount, 3);
  t.true(server.get.calledWith('/categories', middlewareSpy, sinon.match.func));
  t.true(server.get.calledWith('/categories/:tag', middlewareSpy, sinon.match.func));
  t.true(server.get.calledWith('/category-api', middlewareSpy, sinon.match.func));
});

test('TagRoutesPlugin.getTaggedDocuments(): returns documents with matching tag', async (t) => {
  const mockHooks = {
    fetch: sandbox.stub().resolves([[
      { slug: 'doc1', title: 'Document 1', tags: ['cool'] },
      { slug: 'doc2', title: 'Document 2', tags: ['cool'] },
    ]]),
  };

  const context = /** @type {any} */ ({
    config: {
      ignoreSlugs: ['home-page'],
      [TagRoutesPlugin.configKey]: {
        limit: 10,
      },
    },
    hooks: mockHooks,
  });

  const documents = await TagRoutesPlugin.getTaggedDocuments(context, 'cool');

  t.is(documents.length, 2);
  t.is(documents[0].slug, 'doc1');
  t.is(documents[1].slug, 'doc2');

  t.true(mockHooks.fetch.calledWith(
    'storage-query',
    'SELECT * FROM documents WHERE slug NOT_IN ("home-page") AND tags INCLUDES "cool" ORDER BY title ASC LIMIT 10',
    context
  ));
});

test('TagRoutesPlugin.getTaggedDocuments(): handles storage errors gracefully', async (t) => {
  const mockHooks = {
    fetch: sandbox.stub().rejects(new Error('Storage error')),
  };

  const context = /** @type {any} */ ({
    config: {
      ignoreSlugs: ['home-page'],
      [TagRoutesPlugin.configKey]: {
        limit: 10,
      },
    },
    hooks: mockHooks,
  });

  const documents = await TagRoutesPlugin.getTaggedDocuments(context, 'cool');

  t.deepEqual(documents, []);
});

test('TagRoutesPlugin.getTaggedDocuments(): filters out null/undefined results', async (t) => {
  const mockHooks = {
    fetch: sandbox.stub().resolves([[
      { slug: 'doc1', title: 'Document 1', tags: ['cool'] },
      null,
      undefined,
      { slug: 'doc2', title: 'Document 2', tags: ['cool'] },
    ]]),
  };

  const context = /** @type {any} */ ({
    config: {
      ignoreSlugs: ['home-page'],
      [TagRoutesPlugin.configKey]: {
        limit: 10,
      },
    },
    hooks: mockHooks,
  });

  const documents = await TagRoutesPlugin.getTaggedDocuments(context, 'cool');

  t.is(documents.length, 2);
  t.is(documents[0].slug, 'doc1');
  t.is(documents[1].slug, 'doc2');
});

test('TagRoutesPlugin.tagIndexRequestHandler(): returns a function', (t) => {
  const mockHooks = {
    fetch: sandbox.stub().resolves([[]]),
    filter: sandbox.stub().callsArg(1),
  };

  const context = /** @type {any} */ ({
    config: {
      ignoreSlugs: ['home-page'],
      ignoreTags: ['private'],
      useCache: true,
      cacheShort: 3600,
      [TagRoutesPlugin.configKey]: {
        title: 'Tags',
        tagIndexRoute: 'tags',
      },
    },
    hooks: mockHooks,
    buildMetadata: sandbox.stub().resolves({}),
  });

  const handler = TagRoutesPlugin.tagIndexRequestHandler(context);

  t.is(typeof handler, 'function');
});

test('TagRoutesPlugin.tagRequestHandler(): returns a function', (t) => {
  const mockHooks = {
    fetch: sandbox.stub().resolves([[]]),
    filter: sandbox.stub().callsArg(1),
  };

  const context = /** @type {any} */ ({
    config: {
      ignoreSlugs: ['home-page'],
      useCache: true,
      cacheShort: 3600,
      [TagRoutesPlugin.configKey]: {
        tagRoute: 'tags',
      },
    },
    hooks: mockHooks,
    buildMetadata: sandbox.stub().resolves({}),
  });

  const handler = TagRoutesPlugin.tagRequestHandler(context);

  t.is(typeof handler, 'function');
});

test.serial('TagRoutesPlugin: E2E integration test', async (t) => {
  const hooks = new EventDispatcher();
  const server = /** @type {any} */ ({
    get: sandbox.spy(),
  });

  const context = /** @type {any} */ ({
    hooks,
    config: {
      ignoreSlugs: ['home-page'],
      ignoreTags: ['private'],
      useCache: true,
      cacheShort: 3600,
      [TagRoutesPlugin.configKey]: {
        tagIndexRoute: 'tags',
        tagRoute: 'tags',
        apiRoute: 'tag-api',
        title: 'Tags',
        limit: 10,
        events: {
          bindRoutes: ['bind-routes'],
          validateConfig: ['validate-config'],
        },
      },
    },
    buildMetadata: sandbox.stub().resolves({
      canonical: 'https://example.com/tags',
      title: 'Tags',
    }),
  });

  // Register the plugin
  TagRoutesPlugin.register(context);

  // Simulate bind-routes event
  await hooks.dispatch('bind-routes', server, context);

  // Verify routes were bound
  t.is(server.get.callCount, 3);
  // t.true(server.get.calledWith('/tags', sinon.match.any, [sinon.match.any], sinon.match.func));
  // t.true(server.get.calledWith('/tags/:tag', sinon.match.any, sinon.match.any, sinon.match.func));
  // t.true(server.get.calledWith('/tag-api', sinon.match.any, sinon.match.any, sinon.match.func));

  // Test getTaggedDocuments
  hooks.on('storage-query', async (query, _ctx) => {
    if (query.includes('tags INCLUDES "cool"')) {
      return [
        { slug: 'doc1', title: 'Document 1', tags: ['cool'] },
        { slug: 'doc2', title: 'Document 2', tags: ['cool'] },
      ];
    }
    return [];
  });

  const documents = await TagRoutesPlugin.getTaggedDocuments(context, 'cool');
  t.is(documents.length, 2);
  t.is(documents[0].slug, 'doc1');
  t.is(documents[1].slug, 'doc2');
});
