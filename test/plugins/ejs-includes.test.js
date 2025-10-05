import test from 'ava';
import sinon from 'sinon';

import EJSRenderer from '../../src/plugins/ejs-includes.js';


let sandbox;
test.beforeEach(() => {
  sandbox = sinon.createSandbox();
});

test.afterEach(() => {
  sandbox.restore();
});

test('configKey: should return the correct configuration key', (t) => {
  t.is(EJSRenderer.configKey, 'uttori-plugin-renderer-ejs');
});

test('defaultConfig: should return the default configuration', (t) => {
  const config = EJSRenderer.defaultConfig();
  t.deepEqual(config, { ejs: {} });
});

test('validateConfig: should throw an error if the configuration key is missing', (t) => {
  t.throws(() => EJSRenderer.validateConfig({}), { message: `EJSRenderer Config Warning: '${EJSRenderer.configKey}' configuration key is missing.` });
});

test('validateConfig: should be able to validate the config', (t) => {
  t.notThrows(() => EJSRenderer.validateConfig({ [EJSRenderer.configKey]: {} }));
});

test('register: should throw an error if context is missing', (t) => {
  t.throws(() => EJSRenderer.register(), { message: 'Missing event dispatcher in \'context.hooks.on(event, callback)\' format.' });
});

test('register: should throw an error if events are missing in config', (t) => {
  const context = {
    hooks: {
      on: () => {},
    },
    config: {
      [EJSRenderer.configKey]: EJSRenderer.defaultConfig(),
    },
  };
  t.throws(() => EJSRenderer.register(context), { message: 'Missing events to listen to for in \'config.events\'.' });
});

test('register: should register events if they are present in config', (t) => {
  const on = sandbox.spy();
  const context = {
    hooks: {
      on,
    },
    config: {
      [EJSRenderer.configKey]: {
        ...EJSRenderer.defaultConfig(),
        events: {
          renderContent: ['render-content', 'render-meta-description'],
          renderCollection: ['render-search-results'],
          validateConfig: ['validate-config'],
          missing: ['missing'],
        },
      },
    },
  };
  EJSRenderer.register(context);
  t.true(context.hooks.on.calledWith('render-content', EJSRenderer.renderContent));
  t.true(context.hooks.on.calledWith('render-meta-description', EJSRenderer.renderContent));
  t.true(context.hooks.on.calledWith('render-search-results', EJSRenderer.renderCollection));
  t.true(context.hooks.on.calledWith('validate-config', EJSRenderer.validateConfig));
});

test('renderContent: should throw an error if configuration is missing', (t) => {
  t.throws(() => EJSRenderer.renderContent('content', {}), { message: 'Missing configuration.' });
});

test('renderContent: should return the content', (t) => {
  const context = {
    config: {
      [EJSRenderer.configKey]: EJSRenderer.defaultConfig(),
    },
  };
  const content = 'content';
  t.deepEqual(EJSRenderer.renderContent(content, context), content);
});

test('renderCollection: should throw an error if configuration is missing', (t) => {
  t.throws(() => EJSRenderer.renderCollection([], {}), { message: 'Missing configuration.' });
});

test('renderCollection: should return the collection with rendered html', (t) => {
  const context = {
    config: {
      [EJSRenderer.configKey]: EJSRenderer.defaultConfig(),
    },
  };
  const collection = [{ html: 'html' }];
  const expected = [{ html: 'html' }];
  t.deepEqual(EJSRenderer.renderCollection(collection, context), expected);
});

test('render: should return a blank string if nothing is provided', (t) => {
  const context = {
    config: {
      [EJSRenderer.configKey]: EJSRenderer.defaultConfig(),
    },
  };
  const content = '';
  t.deepEqual(EJSRenderer.render(undefined, context), content);
});
