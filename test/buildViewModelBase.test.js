import test from 'ava';
import { UttoriWiki } from '../src/index.js';
import { config, serverSetup } from './_helpers/server.js';

test('buildViewModelBase(): uses provided options and wikiFlash', (t) => {
  const server = serverSetup();
  const uttori = new UttoriWiki(config, server);
  const meta = { canonical: 'https://example.com/base' };

  const request = {
    session: { user: 'test-user' },
    baseUrl: '/base',
    params: { slug: 'param-slug' },
    wikiFlash: () => ({ success: 'ok' }),
  };

  const viewModel = uttori.buildViewModelBase(request, {
    title: 'Base Title',
    meta,
    slug: 'override-slug',
  });

  t.deepEqual(viewModel, {
    title: 'Base Title',
    config: uttori.config,
    session: request.session,
    meta,
    basePath: '/base',
    flash: { success: 'ok' },
    slug: 'override-slug',
  });
});

test('buildViewModelBase(): falls back to params slug and empty flash', (t) => {
  const server = serverSetup();
  const uttori = new UttoriWiki(config, server);

  const request = {
    session: {},
    baseUrl: '',
    params: { slug: 'param-slug' },
  };

  const viewModel = uttori.buildViewModelBase(request);

  t.deepEqual(viewModel, {
    title: '',
    config: uttori.config,
    session: request.session,
    meta: undefined,
    basePath: '',
    flash: {},
    slug: 'param-slug',
  });
});
