import test from 'ava';
import sinon from 'sinon';

import AddQueryOutputToViewModel from '../../src/plugins/query-output.js';

let sandbox;
test.beforeEach(() => {
    sandbox = sinon.createSandbox();
});

test.afterEach(() => {
  sandbox.restore();
});

test('configKey: should return correct key', (t) => {
  t.is(AddQueryOutputToViewModel.configKey, 'custom-plugin-add-query-output-to-view-model');
});

test('defaultConfig: should return correct default configuration', (t) => {
  const defaultConfig = AddQueryOutputToViewModel.defaultConfig();
  t.deepEqual(defaultConfig, { queries: {} });
});

test('validateConfig: should throw error if configKey is missing', (t) => {
  t.throws(() => AddQueryOutputToViewModel.validateConfig({}));
});

test('validateConfig: should throw error if queries is not an object', (t) => {
  const config = {
    [AddQueryOutputToViewModel.configKey]: {
      queries: 'not an object',
    },
  };
  t.throws(() => AddQueryOutputToViewModel.validateConfig(config));
});

test('validateConfig: should throw error if events is not an object', (t) => {
  const config = {
    [AddQueryOutputToViewModel.configKey]: {
      queries: {},
      events: 'not an object',
    },
  };
  t.throws(() => AddQueryOutputToViewModel.validateConfig(config));
});

test('validateConfig: should be able to validate a config', (t) => {
  const config = {
    [AddQueryOutputToViewModel.configKey]: {
      queries: {},
      events: {},
    },
  };
  t.notThrows(() => AddQueryOutputToViewModel.validateConfig(config));
});

test('register: should throw error if context or hooks are missing', (t) => {
  t.throws(() => AddQueryOutputToViewModel.register({}));
});

test('register: should throw error if events are missing', (t) => {
  t.throws(() => AddQueryOutputToViewModel.register({
    hooks: {
      on: () => {},
    },
    config: {
      [AddQueryOutputToViewModel.configKey]: {
        queries: {},
      },
    },
  }), { message: 'Missing events to listen to for in \'config.events\'.' });
});

test('register: should call hooks.on for each event', (t) => {
  const onSpy = sandbox.spy();
  const context = {
    hooks: {
      on: onSpy,
    },
    config: {
      [AddQueryOutputToViewModel.configKey]: {
        events: {
          callback: ['event1', 'event2'],
        },
        queries: {},
      },
    },
  };
  AddQueryOutputToViewModel.register(context);
  t.is(onSpy.callCount, 2);
});

test('register: can handle events with missing methods', (t) => {
  const onSpy = sandbox.spy();
  const context = {
    hooks: {
      on: onSpy,
    },
    config: {
      [AddQueryOutputToViewModel.configKey]: {
        events: {
          callback: ['event1', 'event2'],
          missingMethod: ['event3'],
        },
      },
    },
  };
  AddQueryOutputToViewModel.register(context);
  t.is(onSpy.callCount, 2);
});

test('callbackCurry: does nothing with an invalid viewModel', async (t) => {
  const fetchSpy = sandbox.spy();
  const eventLabel = 'view-model-home';
  const context = {
    config: {
      [AddQueryOutputToViewModel.configKey]: {
        events: {
          callback: [eventLabel],
        },
        queries: {
          [eventLabel]: [
            {
              key: 'query1',
              query: 'SELECT * FROM table WHERE id = 1',
              format: (data) => data,
              fallback: [],
            }, {
              key: 'query2',
              fallback: [],
            },
          ],
        },
      },
    },
    hooks: {
      fetch: fetchSpy,
    },
  };
  const viewModel = undefined;
  await AddQueryOutputToViewModel.callbackCurry(eventLabel, viewModel, context);
  t.is(fetchSpy.callCount, 0);
});

test('callbackCurry: does nothing with no queries', async (t) => {
  const fetchSpy = sandbox.spy();
  const eventLabel = 'view-model-home';
  const context = {
    config: {
      [AddQueryOutputToViewModel.configKey]: {
        events: {
          callback: [eventLabel],
        },
        queries: {},
      },
    },
    hooks: {
      fetch: fetchSpy,
    },
  };
  const viewModel = {};
  await AddQueryOutputToViewModel.callbackCurry(eventLabel, viewModel, context);
  t.is(fetchSpy.callCount, 0);
});

test('callbackCurry: can handle errors', async (t) => {
  const queryFunction = sandbox.stub().rejects([['result']]);
  const eventLabel = 'view-model-home';
  const context = {
    config: {
      [AddQueryOutputToViewModel.configKey]: {
        events: {
          callback: [eventLabel],
        },
        queries: {
          [eventLabel]: [
            {
              key: 'query1',
              queryFunction,
              fallback: [],
            },
          ],
        },
      },
    },
  };
  const viewModel = {};
  await AddQueryOutputToViewModel.callbackCurry(eventLabel, viewModel, context);
  t.is(queryFunction.callCount, 1);
});

test('callbackCurry: should call hooks.fetch for each query', async (t) => {
  const fetchSpy = sandbox.stub().resolves([['result']]);
  const eventLabel = 'view-model-home';
  const context = {
    config: {
      [AddQueryOutputToViewModel.configKey]: {
        events: {
          callback: [eventLabel],
        },
        queries: {
          [eventLabel]: [
            {
              key: 'query1',
              query: 'SELECT * FROM table WHERE id = 1',
              format: (data) => data,
              fallback: [],
            }, {
              key: 'query2',
              fallback: [],
            },
          ],
        },
      },
    },
    hooks: {
      fetch: fetchSpy,
    },
  };
  const viewModel = {};
  await AddQueryOutputToViewModel.callbackCurry(eventLabel, viewModel, context);
  t.is(fetchSpy.callCount, 2);
});

test('callbackCurry: should call queryFunction when set', async (t) => {
  const queryFunction = sandbox.stub().resolves([['result']]);
  const eventLabel = 'view-model-home';
  const context = {
    config: {
      [AddQueryOutputToViewModel.configKey]: {
        events: {
          callback: [eventLabel],
        },
        queries: {
          [eventLabel]: [
            {
              key: 'query1',
              queryFunction,
              fallback: [],
            },
          ],
        },
      },
    },
  };
  const viewModel = {};
  await AddQueryOutputToViewModel.callbackCurry(eventLabel, viewModel, context);
  t.is(queryFunction.callCount, 1);
});
