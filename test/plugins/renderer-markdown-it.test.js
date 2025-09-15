
import test from 'ava';
import MarkdownItRenderer from '../../src/plugins/renderer-markdown-it.js';

test('MarkdownItRenderer.register(context): can register', (t) => {
  t.notThrows(() => {
    MarkdownItRenderer.register({ hooks: { on: () => {} }, config: { [MarkdownItRenderer.configKey]: { events: { callback: [] } } } });
  });
});

test('MarkdownItRenderer.register(context): errors without event dispatcher', (t) => {
  t.throws(() => {
    MarkdownItRenderer.register({ hooks: {} });
  }, { message: 'Missing event dispatcher in \'context.hooks.on(event, callback)\' format.' });
});

test('MarkdownItRenderer.register(context): errors without events', (t) => {
  t.throws(() => {
    MarkdownItRenderer.register({ hooks: { on: () => {} }, config: { [MarkdownItRenderer.configKey]: {} } });
  }, { message: 'Missing events to listen to for in \'config.events\'.' });
});

test('Plugin.register(context): does not error with events corresponding to missing methods', (t) => {
  t.notThrows(() => {
    MarkdownItRenderer.register({
      hooks: {
        on: () => {},
      },
      config: {
        [MarkdownItRenderer.configKey]: {
          events: {
            test: ['test'],
            validateConfig: ['validate-config'],
          },
        },
      },
    });
  });
});

test('MarkdownItRenderer.defaultConfig(): can return a default config', (t) => {
  t.notThrows(MarkdownItRenderer.defaultConfig);
});

test('MarkdownItRenderer.extendConfig(config): can extend a config at all levels', (t) => {
  t.deepEqual(MarkdownItRenderer.extendConfig(), MarkdownItRenderer.defaultConfig());
  t.deepEqual(MarkdownItRenderer.extendConfig({ haystack: 'needle' }), {
    ...MarkdownItRenderer.defaultConfig(),
    haystack: 'needle',
  });
  t.deepEqual(MarkdownItRenderer.extendConfig({ markdownIt: { uttori: { haystack: 'needle' } } }), {
    ...MarkdownItRenderer.defaultConfig(),
    markdownIt: {
      ...MarkdownItRenderer.defaultConfig().markdownIt,
      uttori: {
        haystack: 'needle',
          ...MarkdownItRenderer.defaultConfig().markdownIt.uttori,
        },
      },
    });
  t.deepEqual(MarkdownItRenderer.extendConfig({ markdownIt: { uttori: { toc: { haystack: 'needle' } } } }), {
    ...MarkdownItRenderer.defaultConfig(),
    markdownIt: {
      ...MarkdownItRenderer.defaultConfig().markdownIt,
      uttori: {
        ...MarkdownItRenderer.defaultConfig().markdownIt.uttori,
        toc: {
          ...MarkdownItRenderer.defaultConfig().markdownIt.uttori.toc,
          haystack: 'needle',
        },
      },
    },
  });
  t.deepEqual(MarkdownItRenderer.extendConfig({ markdownIt: { uttori: { wikilinks: { haystack: 'needle' } } } }), {
    ...MarkdownItRenderer.defaultConfig(),
    markdownIt: {
      ...MarkdownItRenderer.defaultConfig().markdownIt,
      uttori: {
      ...MarkdownItRenderer.defaultConfig().markdownIt.uttori,
      wikilinks: {
        ...MarkdownItRenderer.defaultConfig().markdownIt.uttori.wikilinks,
          haystack: 'needle',
        },
      },
    },
  });
});

test('MarkdownItRenderer.validateConfig(config, _context): throws an error when config is missing', (t) => {
  t.throws(() => {
    MarkdownItRenderer.validateConfig();
  }, { message: 'MarkdownItRenderer Config Error: \'uttori-plugin-renderer-markdown-it\' configuration key is missing.' });
});

test('MarkdownItRenderer.validateConfig(config, _context): throws an error when uttori is missing', (t) => {
  t.throws(() => {
    MarkdownItRenderer.validateConfig({ [MarkdownItRenderer.configKey]: {} });
  }, { message: 'MarkdownItRenderer Config Error: \'markdownIt\' configuration key is missing.' });
});

test('MarkdownItRenderer.validateConfig(config, _context): throws an error when allowedExternalDomains is missing', (t) => {
  t.throws(() => {
    MarkdownItRenderer.validateConfig({ [MarkdownItRenderer.configKey]: { markdownIt: { uttori: { } } } });
  }, { message: 'MarkdownItRenderer Config Error: \'markdownIt.uttori.allowedExternalDomains\' is missing or not an array.' });
});

test('MarkdownItRenderer.validateConfig(config, _context): throws an error when allowedExternalDomains is not an array', (t) => {
  t.throws(() => {
    MarkdownItRenderer.validateConfig({ [MarkdownItRenderer.configKey]: { markdownIt: { uttori: { allowedExternalDomains: {} } } } });
  }, { message: 'MarkdownItRenderer Config Error: \'markdownIt.uttori.allowedExternalDomains\' is missing or not an array.' });
});

test('MarkdownItRenderer.validateConfig(config, _context): can validate a config', (t) => {
  t.notThrows(() => {
    MarkdownItRenderer.validateConfig({ [MarkdownItRenderer.configKey]: { markdownIt: { uttori: { allowedExternalDomains: [] } } } });
  });
});

test('MarkdownItRenderer.renderContent(content, context): throws error without a config', (t) => {
  t.throws(() => {
    MarkdownItRenderer.renderContent('![test](/test.png)');
  }, { message: 'Missing configuration.' });
});

test('MarkdownItRenderer.renderContent(content, context): can accept a config', (t) => {
  t.is(MarkdownItRenderer.renderContent('![test](/test.png)', { config: { [MarkdownItRenderer.configKey]: { markdownIt: { xhtmlOut: true } } } }), '<p><img src="/test.png" alt="test" loading="lazy" /></p>');
});

test('MarkdownItRenderer.renderCollection(collection, context): throws error without a config', (t) => {
  t.throws(() => {
    MarkdownItRenderer.renderCollection([{ html: '![test](/test.png)' }]);
  }, { message: 'Missing configuration.' });
});

test('MarkdownItRenderer.renderCollection(collection, context): can accept a config', (t) => {
  t.deepEqual(
    MarkdownItRenderer.renderCollection([{ html: '![test](/test.png)' }], { config: { [MarkdownItRenderer.configKey]: { markdownIt: { xhtmlOut: true } } } }),
    [{ html: '<p><img src="/test.png" alt="test" loading="lazy" /></p>' }],
  );
});

test('MarkdownItRenderer.render(content, config): handles empty values', (t) => {
  t.is(MarkdownItRenderer.render(''), '');
  t.is(MarkdownItRenderer.render(' '), '');
  t.is(MarkdownItRenderer.render(null), '');
  t.is(MarkdownItRenderer.render(Number.NaN), '');
  t.is(MarkdownItRenderer.render(undefined), '');
  t.is(MarkdownItRenderer.render(false), '');
  t.is(MarkdownItRenderer.render(), '');
});

test('MarkdownItRenderer.render(content, config): replaces missing links with a slugified link', (t) => {
  t.is(MarkdownItRenderer.render('[Test]'), '<p>[Test]</p>');
  t.is(MarkdownItRenderer.render('[Test]()'), '<p><a href="/test">Test</a></p>');
  t.is(MarkdownItRenderer.render('[CrAzY CaSe SpAcEd]()'), '<p><a href="/crazy-case-spaced">CrAzY CaSe SpAcEd</a></p>');
});

test('MarkdownItRenderer.render(content, config): works with and without link validation', (t) => {
  t.is(MarkdownItRenderer.render('![](data:image/gif;base64,R0lGODlhAQABAAAAACw=)'), '<p><img src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" alt="" loading="lazy"></p>');
  t.is(MarkdownItRenderer.render("![](data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E)"), '<p>![](data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\'/%3E)</p>');
  t.is(MarkdownItRenderer.render("![](data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnLz4=)"), '<p>![](data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnLz4=)</p>');

  t.is(MarkdownItRenderer.render('![](data:image/gif;base64,R0lGODlhAQABAAAAACw=)', { markdownIt: { uttori: { disableValidation: true } } }), '<p><img src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" alt=""></p>');
  t.is(MarkdownItRenderer.render("![](data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E)", { markdownIt: { uttori: { disableValidation: true } } }), '<p>![](data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\'/%3E)</p>');
  t.is(MarkdownItRenderer.render("![](data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnLz4=)", { markdownIt: { uttori: { disableValidation: true } } }), '<p><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnLz4=" alt=""></p>');
});

test('MarkdownItRenderer.parse(content, config): handles empty values', (t) => {
  t.deepEqual(MarkdownItRenderer.parse(''), []);
  t.deepEqual(MarkdownItRenderer.parse(' '), []);
  t.deepEqual(MarkdownItRenderer.parse(null), []);
  t.deepEqual(MarkdownItRenderer.parse(Number.NaN), []);
  t.deepEqual(MarkdownItRenderer.parse(undefined), []);
  t.deepEqual(MarkdownItRenderer.parse(false), []);
  t.deepEqual(MarkdownItRenderer.parse(), []);
});

test('MarkdownItRenderer.parse(content, config): returns the parsed tokens from Markdown', (t) => {
  const markdown = `# Title
## Subtitle 1

Content 1

### Subsection

Content 2

## Subtitle 2

Content 3

\`\`\`js
console.log("Code");
\`\`\`
`;
  const tokens = [
    {
      attrs: null,
      block: true,
      children: null,
      content: '',
      hidden: false,
      info: '',
      level: 0,
      map: [
        0,
        1,
      ],
      markup: '#',
      meta: null,
      nesting: 1,
      tag: 'h1',
      type: 'heading_open',
    },
    {
      attrs: null,
      block: true,
      children: [
        {
          attrs: null,
          block: false,
          children: null,
          content: 'Title',
          hidden: false,
          info: '',
          level: 0,
          map: null,
          markup: '',
          meta: null,
          nesting: 0,
          tag: '',
          type: 'text',
        },
      ],
      content: 'Title',
      hidden: false,
      info: '',
      level: 1,
      map: [
        0,
        1,
      ],
      markup: '',
      meta: null,
      nesting: 0,
      tag: '',
      type: 'inline',
    },
    {
      attrs: null,
      block: true,
      children: null,
      content: '',
      hidden: false,
      info: '',
      level: 0,
      map: null,
      markup: '#',
      meta: null,
      nesting: -1,
      tag: 'h1',
      type: 'heading_close',
    },
    {
      attrs: null,
      block: true,
      children: null,
      content: '',
      hidden: false,
      info: '',
      level: 0,
      map: [
        1,
        2,
      ],
      markup: '##',
      meta: null,
      nesting: 1,
      tag: 'h2',
      type: 'heading_open',
    },
    {
      attrs: null,
      block: true,
      children: [
        {
          attrs: null,
          block: false,
          children: null,
          content: 'Subtitle 1',
          hidden: false,
          info: '',
          level: 0,
          map: null,
          markup: '',
          meta: null,
          nesting: 0,
          tag: '',
          type: 'text',
        },
      ],
      content: 'Subtitle 1',
      hidden: false,
      info: '',
      level: 1,
      map: [
        1,
        2,
      ],
      markup: '',
      meta: null,
      nesting: 0,
      tag: '',
      type: 'inline',
    },
    {
      attrs: null,
      block: true,
      children: null,
      content: '',
      hidden: false,
      info: '',
      level: 0,
      map: null,
      markup: '##',
      meta: null,
      nesting: -1,
      tag: 'h2',
      type: 'heading_close',
    },
    {
      attrs: null,
      block: true,
      children: null,
      content: '',
      hidden: false,
      info: '',
      level: 0,
      map: [
        3,
        4,
      ],
      markup: '',
      meta: null,
      nesting: 1,
      tag: 'p',
      type: 'paragraph_open',
    },
    {
      attrs: null,
      block: true,
      children: [
        {
          attrs: null,
          block: false,
          children: null,
          content: 'Content 1',
          hidden: false,
          info: '',
          level: 0,
          map: null,
          markup: '',
          meta: null,
          nesting: 0,
          tag: '',
          type: 'text',
        },
      ],
      content: 'Content 1',
      hidden: false,
      info: '',
      level: 1,
      map: [
        3,
        4,
      ],
      markup: '',
      meta: null,
      nesting: 0,
      tag: '',
      type: 'inline',
    },
    {
      attrs: null,
      block: true,
      children: null,
      content: '',
      hidden: false,
      info: '',
      level: 0,
      map: null,
      markup: '',
      meta: null,
      nesting: -1,
      tag: 'p',
      type: 'paragraph_close',
    },
    {
      attrs: null,
      block: true,
      children: null,
      content: '',
      hidden: false,
      info: '',
      level: 0,
      map: [
        5,
        6,
      ],
      markup: '###',
      meta: null,
      nesting: 1,
      tag: 'h3',
      type: 'heading_open',
    },
    {
      attrs: null,
      block: true,
      children: [
        {
          attrs: null,
          block: false,
          children: null,
          content: 'Subsection',
          hidden: false,
          info: '',
          level: 0,
          map: null,
          markup: '',
          meta: null,
          nesting: 0,
          tag: '',
          type: 'text',
        },
      ],
      content: 'Subsection',
      hidden: false,
      info: '',
      level: 1,
      map: [
        5,
        6,
      ],
      markup: '',
      meta: null,
      nesting: 0,
      tag: '',
      type: 'inline',
    },
    {
      attrs: null,
      block: true,
      children: null,
      content: '',
      hidden: false,
      info: '',
      level: 0,
      map: null,
      markup: '###',
      meta: null,
      nesting: -1,
      tag: 'h3',
      type: 'heading_close',
    },
    {
      attrs: null,
      block: true,
      children: null,
      content: '',
      hidden: false,
      info: '',
      level: 0,
      map: [
        7,
        8,
      ],
      markup: '',
      meta: null,
      nesting: 1,
      tag: 'p',
      type: 'paragraph_open',
    },
    {
      attrs: null,
      block: true,
      children: [
        {
          attrs: null,
          block: false,
          children: null,
          content: 'Content 2',
          hidden: false,
          info: '',
          level: 0,
          map: null,
          markup: '',
          meta: null,
          nesting: 0,
          tag: '',
          type: 'text',
        },
      ],
      content: 'Content 2',
      hidden: false,
      info: '',
      level: 1,
      map: [
        7,
        8,
      ],
      markup: '',
      meta: null,
      nesting: 0,
      tag: '',
      type: 'inline',
    },
    {
      attrs: null,
      block: true,
      children: null,
      content: '',
      hidden: false,
      info: '',
      level: 0,
      map: null,
      markup: '',
      meta: null,
      nesting: -1,
      tag: 'p',
      type: 'paragraph_close',
    },
    {
      attrs: null,
      block: true,
      children: null,
      content: '',
      hidden: false,
      info: '',
      level: 0,
      map: [
        9,
        10,
      ],
      markup: '##',
      meta: null,
      nesting: 1,
      tag: 'h2',
      type: 'heading_open',
    },
    {
      attrs: null,
      block: true,
      children: [
        {
          attrs: null,
          block: false,
          children: null,
          content: 'Subtitle 2',
          hidden: false,
          info: '',
          level: 0,
          map: null,
          markup: '',
          meta: null,
          nesting: 0,
          tag: '',
          type: 'text',
        },
      ],
      content: 'Subtitle 2',
      hidden: false,
      info: '',
      level: 1,
      map: [
        9,
        10,
      ],
      markup: '',
      meta: null,
      nesting: 0,
      tag: '',
      type: 'inline',
    },
    {
      attrs: null,
      block: true,
      children: null,
      content: '',
      hidden: false,
      info: '',
      level: 0,
      map: null,
      markup: '##',
      meta: null,
      nesting: -1,
      tag: 'h2',
      type: 'heading_close',
    },
    {
      attrs: null,
      block: true,
      children: null,
      content: '',
      hidden: false,
      info: '',
      level: 0,
      map: [
        11,
        12,
      ],
      markup: '',
      meta: null,
      nesting: 1,
      tag: 'p',
      type: 'paragraph_open',
    },
    {
      attrs: null,
      block: true,
      children: [
        {
          attrs: null,
          block: false,
          children: null,
          content: 'Content 3',
          hidden: false,
          info: '',
          level: 0,
          map: null,
          markup: '',
          meta: null,
          nesting: 0,
          tag: '',
          type: 'text',
        },
      ],
      content: 'Content 3',
      hidden: false,
      info: '',
      level: 1,
      map: [
        11,
        12,
      ],
      markup: '',
      meta: null,
      nesting: 0,
      tag: '',
      type: 'inline',
    },
    {
      attrs: null,
      block: true,
      children: null,
      content: '',
      hidden: false,
      info: '',
      level: 0,
      map: null,
      markup: '',
      meta: null,
      nesting: -1,
      tag: 'p',
      type: 'paragraph_close',
    },
    {
      attrs: null,
      block: true,
      children: null,
      content: 'console.log("Code");\n',
      hidden: false,
      info: 'js',
      level: 0,
      map: [
        13,
        16,
      ],
      markup: '```',
      meta: null,
      nesting: 0,
      tag: 'code',
      type: 'fence',
    },
  ];

  // The tokens aren't actually objects, so parse that out with JSON utilities.
  const parsed = JSON.parse(JSON.stringify(MarkdownItRenderer.parse(markdown, MarkdownItRenderer.defaultConfig())));
  t.deepEqual(parsed, tokens);
});

test('MarkdownItRenderer.parse(content, config): works with and without link validation', (t) => {
  let tokens = [
    {
      attrs: null,
      block: true,
      children: null,
      content: '',
      hidden: false,
      info: '',
      level: 0,
      map: [
        0,
        1,
      ],
      markup: '',
      meta: null,
      nesting: 1,
      tag: 'p',
      type: 'paragraph_open',
    },
    {
      attrs: null,
      block: true,
      children: [
        {
          attrs: null,
          block: false,
          children: null,
          content: '![](data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnLz4=)',
          hidden: false,
          info: '',
          level: 0,
          map: null,
          markup: '',
          meta: null,
          nesting: 0,
          tag: '',
          type: 'text',
        },
      ],
      content: '![](data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnLz4=)',
      hidden: false,
      info: '',
      level: 1,
      map: [
        0,
        1,
      ],
      markup: '',
      meta: null,
      nesting: 0,
      tag: '',
      type: 'inline',
    },
    {
      attrs: null,
      block: true,
      children: null,
      content: '',
      hidden: false,
      info: '',
      level: 0,
      map: null,
      markup: '',
      meta: null,
      nesting: -1,
      tag: 'p',
      type: 'paragraph_close',
    },
  ];
  let parsed = JSON.parse(JSON.stringify(MarkdownItRenderer.parse("![](data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnLz4=)", MarkdownItRenderer.defaultConfig())));
  t.deepEqual(parsed, tokens);

  tokens = [
    {
      attrs: null,
      block: true,
      children: null,
      content: '',
      hidden: false,
      info: '',
      level: 0,
      map: [
        0,
        1,
      ],
      markup: '',
      meta: null,
      nesting: 1,
      tag: 'p',
      type: 'paragraph_open',
    },
    {
      attrs: null,
      block: true,
      children: [
        {
          attrs: [
            ['src','data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnLz4='],
            ['alt', ''],
          ],
          block: false,
          children: [],
          content: '',
          hidden: false,
          info: '',
          level: 0,
          map: null,
          markup: '',
          meta: null,
          nesting: 0,
          tag: 'img',
          type: 'image',
        },
      ],
      content: '![](data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnLz4=)',
      hidden: false,
      info: '',
      level: 1,
      map: [
        0,
        1,
      ],
      markup: '',
      meta: null,
      nesting: 0,
      tag: '',
      type: 'inline',
    },
    {
      attrs: null,
      block: true,
      children: null,
      content: '',
      hidden: false,
      info: '',
      level: 0,
      map: null,
      markup: '',
      meta: null,
      nesting: -1,
      tag: 'p',
      type: 'paragraph_close',
    },
  ];
  parsed = JSON.parse(JSON.stringify(MarkdownItRenderer.parse("![](data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnLz4=)", { markdownIt: { uttori: { disableValidation: true } } })));
  t.deepEqual(parsed, tokens);
});

test('MarkdownItRenderer.viewModelDetail(viewModel, context): throws error without a config in the context', (t) => {
  t.throws(() => {
    MarkdownItRenderer.viewModelDetail({});
  }, { message: 'Missing configuration.' });
  t.throws(() => {
    MarkdownItRenderer.viewModelDetail({ config: { } });
  }, { message: 'Missing configuration.' });
  t.throws(() => {
    MarkdownItRenderer.viewModelDetail({ config: { [MarkdownItRenderer.configKey]: { } } });
  }, { message: 'Missing configuration.' });
});

test('MarkdownItRenderer.viewModelDetail(viewModel, context): handles empty values', (t) => {
  const context = {
    config: {
      [MarkdownItRenderer.configKey]: {
        markdownIt: {
          uttori: {
            toc: {
              extract: true,
            },
          },
        },
      },
    },
  };
  t.is(MarkdownItRenderer.viewModelDetail('', context), '');
  t.is(MarkdownItRenderer.viewModelDetail(' ', context), ' ');
  t.is(MarkdownItRenderer.viewModelDetail(null, context), null);
  t.is(MarkdownItRenderer.viewModelDetail(Number.NaN, context), Number.NaN);
  t.is(MarkdownItRenderer.viewModelDetail(undefined, context), undefined);
  t.is(MarkdownItRenderer.viewModelDetail(false, context), false);
});

test('MarkdownItRenderer.viewModelDetail(viewModel, context): handles no html in view model document', (t) => {
  const context = {
    config: {
      [MarkdownItRenderer.configKey]: {
        markdownIt: {
          uttori: {
            toc: {
              extract: true,
            },
          },
        },
      },
    },
  };
  t.deepEqual(MarkdownItRenderer.viewModelDetail({}, context), {});
  t.deepEqual(MarkdownItRenderer.viewModelDetail({ document: {} }, context), { document: {} });
  t.deepEqual(MarkdownItRenderer.viewModelDetail({ document: { html: '' } }, context), { document: { html: '' } });
  t.deepEqual(MarkdownItRenderer.viewModelDetail({ document: { html: 'Test' } }, context), { document: { html: 'Test' } });
});

test('MarkdownItRenderer.viewModelDetail(viewModel, context): handles when the config is set to not extract table of contents', (t) => {
  const context = {
    config: {
      [MarkdownItRenderer.configKey]: {
        markdownIt: {
          uttori: {
            toc: {
              extract: false,
            },
          },
        },
      },
    },
  };
  t.deepEqual(MarkdownItRenderer.viewModelDetail({ document: { html: 'Test' } }, context), { document: { html: 'Test' } });
});

test('MarkdownItRenderer.viewModelDetail(viewModel, context): extracts table of contenst out of document.html and adds it to the toc key', (t) => {
  const context = {
    config: {
      [MarkdownItRenderer.configKey]: {
        markdownIt: {
          uttori: {
            toc: {
              extract: true,
            },
          },
        },
      },
    },
  };
  const config = MarkdownItRenderer.extendConfig(context.config[MarkdownItRenderer.configKey]);
  const viewModel = {
    document: {
      html: `Pre${config.markdownIt.uttori.toc.openingTag}🤠${config.markdownIt.uttori.toc.closingTag}Post`,
    },
  };
  t.deepEqual(MarkdownItRenderer.viewModelDetail(viewModel, context), {
    document: {
      html: 'PrePost',
    },
    toc: `${config.markdownIt.uttori.toc.openingTag}🤠${config.markdownIt.uttori.toc.closingTag}`,
  });
});
