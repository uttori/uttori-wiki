import test from 'ava';
import ReplacerRenderer from '../../src/plugins/renderer-replacer.js';

const context = {
  config: {
    [ReplacerRenderer.configKey]: {
      rules: [
        {
          test: /cow[\s-]?boy/gm,
          output: '🤠',
        },
        {
          test: 'shamrock',
          output: '☘️',
        },
        {
          test: [],
          output: '💀',
        },
      ],
    },
  },
};

test('ReplacerRenderer.register(context): can register', (t) => {
  t.notThrows(() => {
    ReplacerRenderer.register({ hooks: { on: () => {} }, config: { [ReplacerRenderer.configKey]: { events: { callback: [] } } } });
  });
});

test('ReplacerRenderer.register(context): errors without event dispatcher', (t) => {
  t.throws(() => {
    ReplacerRenderer.register({ hooks: {} });
  }, { message: 'Missing event dispatcher in \'context.hooks.on(event, callback)\' format.' });
});

test('ReplacerRenderer.register(context): errors without events', (t) => {
  t.throws(() => {
    ReplacerRenderer.register({ hooks: { on: () => {} }, config: { [ReplacerRenderer.configKey]: {} } });
  }, { message: 'Missing events to listen to for in \'config.events\'.' });
});

test('Plugin.register(context): does not error with events corresponding to missing methods', (t) => {
  t.notThrows(() => {
    ReplacerRenderer.register({
      hooks: {
        on: () => {},
      },
      config: {
        [ReplacerRenderer.configKey]: {
          events: {
            test: ['test'],
            validateConfig: ['validate-config'],
          },
        },
      },
    });
  });
});

test('ReplacerRenderer.defaultConfig(): can return a default config', (t) => {
  t.notThrows(ReplacerRenderer.defaultConfig);
});

test('ReplacerRenderer.validateConfig(config, _context): throws an error when config is missing', (t) => {
  t.throws(() => {
    ReplacerRenderer.validateConfig();
  }, { message: 'ReplacerRenderer Config Warning: \'uttori-plugin-renderer-replacer\' configuration key is missing.' });
});

test('ReplacerRenderer.validateConfig(config, _context): throws an error when rules is missing', (t) => {
  t.throws(() => {
    ReplacerRenderer.validateConfig({ [ReplacerRenderer.configKey]: {} });
  }, { message: 'ReplacerRenderer Config Warning: \'rules\' configuration key is missing or not an array.' });
});

test('ReplacerRenderer.validateConfig(config, _context): throws an error when rules is not an array', (t) => {
  t.throws(() => {
    ReplacerRenderer.validateConfig({ [ReplacerRenderer.configKey]: { rules: {} } });
  }, { message: 'ReplacerRenderer Config Warning: \'rules\' configuration key is missing or not an array.' });
});

test('ReplacerRenderer.validateConfig(config, _context): can validate a config', (t) => {
  t.notThrows(() => {
    ReplacerRenderer.validateConfig({ [ReplacerRenderer.configKey]: { rules: [] } });
  });
});

test('ReplacerRenderer.renderContent(content, context): throws error without a config', (t) => {
  t.throws(() => {
    ReplacerRenderer.renderContent('cowboy');
  }, { message: 'Missing configuration.' });
});

test('ReplacerRenderer.renderContent(content, context): can accept a config', (t) => {
  t.is(ReplacerRenderer.renderContent('cowboy', context), '🤠');
});

test('ReplacerRenderer.renderCollection(collection, context): throws error without a config', (t) => {
  t.throws(() => {
    ReplacerRenderer.renderCollection([{ html: 'cowboy' }]);
  }, { message: 'Missing configuration.' });
});

test('ReplacerRenderer.renderCollection(collection, context): can accept a config', (t) => {
  t.deepEqual(ReplacerRenderer.renderCollection([{ html: 'cowboy' }, { html: 'shamrock' }], context), [{ html: '🤠' }, { html: '☘️' }]);
});

test('ReplacerRenderer.render(content, config): handles empty values', (t) => {
  const config = context.config[ReplacerRenderer.configKey];
  t.is(ReplacerRenderer.render('', config), '');
  t.is(ReplacerRenderer.render(' ', config), ' ');
  t.is(ReplacerRenderer.render(null, config), '');
  t.is(ReplacerRenderer.render(Number.NaN, config), '');
  t.is(ReplacerRenderer.render(undefined, config), '');
  t.is(ReplacerRenderer.render(false, config), '');
});
