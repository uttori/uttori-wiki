import test from 'ava';

import { parsePath, prepareTarget, buildPath } from '../src/redirect.js';

test('parsePath: works with no path', (t) => {
  const output = parsePath('');
  t.deepEqual(output, []);
});

test('parsePath: works with with no variables', (t) => {
  const output = parsePath('/year/slug/file.ext');
  t.deepEqual(output, [
    '/year/slug/file.ext',
  ]);
});

test('parsePath: works with all optional variables', (t) => {
  const output = parsePath('/:year/:month?/:slug');
  t.deepEqual(output, [
    '/',
    {
      def: undefined,
      name: 'year',
      optional: false,
    },
    '/',
    {
      def: undefined,
      name: 'month',
      optional: true,
    },
    '/',
    {
      def: undefined,
      name: 'slug',
      optional: false,
    },
  ]);
});

test('parsePath: works with all default variables', (t) => {
  const output = parsePath('/:year/:month(feb)/:slug');
  t.deepEqual(output, [
    '/',
    {
      def: undefined,
      name: 'year',
      optional: false,
    },
    '/',
    {
      def: 'feb',
      name: 'month',
      optional: false,
    },
    '/',
    {
      def: undefined,
      name: 'slug',
      optional: false,
    },
  ]);
});

test('prepareTarget: works with no variables', (t) => {
  const route = '/year/slug/file.ext';
  const target = '/year/slug/file.ext';
  const output = prepareTarget(route, target);
  t.deepEqual(output, [
    '/year/slug/file.ext',
  ]);
});

test('prepareTarget: works with optional variables going from inline to slashes', (t) => {
  const route = '/:year-:month?-:slug';
  const target = '/:year/:month/:slug';
  const output = prepareTarget(route, target);
  t.deepEqual(output, [
    '/',
    {
      def: undefined,
      name: 'year',
      optional: false,
    },
    '/',
    {
      def: undefined,
      name: 'month',
      optional: false,
    },
    '/',
    {
      def: undefined,
      name: 'slug',
      optional: false,
    },
  ]);
});

test('prepareTarget: works with optional variables going from slashes to inline', (t) => {
  const route = '/:year/:month/:slug';
  const target = '/:year-:month?-:slug';
  const output = prepareTarget(route, target);
  t.deepEqual(output, [
    '/',
    {
      def: undefined,
      name: 'year',
      optional: false,
    },
    '-',
    {
      def: undefined,
      name: 'month',
      optional: true,
    },
    '-',
    {
      def: undefined,
      name: 'slug',
      optional: false,
    },
  ]);
});

test('prepareTarget: works with default variables going from inline to slashes', (t) => {
  const route = '/:year(1990)-:month(feb)-:slug';
  const target = '/:year/:month/:slug';
  const output = prepareTarget(route, target);
  t.deepEqual(output, [
    '/',
    {
      def: undefined,
      name: 'year',
      optional: false,
    },
    '/',
    {
      def: undefined,
      name: 'month',
      optional: false,
    },
    '/',
    {
      def: undefined,
      name: 'slug',
      optional: false,
    },
  ]);
});

test('prepareTarget: works with default variables going from slashes to inline', (t) => {
  const route = '/:year/:month/:slug';
  const target = '/:year(1990)-:month(feb)-:slug';
  const output = prepareTarget(route, target);
  t.deepEqual(output, [
    '/',
    {
      def: '1990',
      name: 'year',
      optional: false,
    },
    '-',
    {
      def: 'feb',
      name: 'month',
      optional: false,
    },
    '-',
    {
      def: undefined,
      name: 'slug',
      optional: false,
    },
  ]);
});

test('prepareTarget: throws error when key is not optional and has no default', (t) => {
  const route = '/:year/:month/:slug';
  const target = '/:year/:day/:slug';
  t.throws(() => {
    prepareTarget(route, target);
  }, { message: '\'day\' isn\'t defined in your route. Make it optional or provide a default.' });
});

test('prepareTarget: prepareTargets to a single key', (t) => {
  const route = '/:year/:month/:slug';
  const target = '/:slug';
  const output = prepareTarget(route, target);
  t.deepEqual(output, [
    '/',
    {
      def: undefined,
      name: 'slug',
      optional: false,
    },
  ]);
});

test('buildPath: works with no variables', (t) => {
  const params = {};
  const route = '/year/slug/file.ext';
  const target = '/year/slug/file.ext';
  const output = buildPath(params, route, target);
  t.is(output, '/year/slug/file.ext');
});

test('buildPath: works with all optional variables', (t) => {
  const params = { year: '2022', month: 'jan', slug: 'file' };
  const route = '/:year/:month?/:slug';
  const target = '/:year/:month?/:slug';
  const output = buildPath(params, route, target);
  t.is(output, '/2022/jan/file');
});

test('buildPath: works with all default variables', (t) => {
  const params = { year: '2022', slug: 'file' };
  const route = '/:year/:month(feb)/:slug';
  const target = '/:year/:month(feb)/:slug';
  const output = buildPath(params, route, target);
  t.is(output, '/2022/feb/file');
});

test('buildPath: works with a key is not present in the route with a default', (t) => {
  const params = { year: '2022', day: '31', slug: 'file' };
  const route = '/:year/:day/:slug';
  const target = '/:year/:month(jan)/:day/:slug';
  const output = buildPath(params, route, target);
  t.is(output, '/2022/jan/31/file');
});

test('buildPath: works with a key is not present in the route without a default but optional', (t) => {
  const params = { year: '2022', day: '31', slug: 'file' };
  const route = '/:year/:day/:slug';
  const target = '/:year/:month?/:day/:slug';
  const output = buildPath(params, route, target);
  t.is(output, '/2022//31/file');
});

test('buildPath: throws error when key is not optional and has no default', (t) => {
  const params = { year: '2022', slug: 'file' };
  const route = '/:year/:month/:slug';
  const target = '/:year/:day/:slug';
  t.throws(() => {
    buildPath(params, route, target);
  }, { message: '\'day\' isn\'t defined in your route. Make it optional or provide a default.' });
});

test('buildPath: works when key has a default', (t) => {
  const params = { year: '2022', slug: 'file' };
  const route = '/:year/:month/:slug';
  const target = '/:year/:month(jan)/:slug';
  const output = buildPath(params, route, target);
  t.is(output, '/2022/jan/file');
});

test('buildPath: works when key is optional', (t) => {
  const params = { year: '2022', slug: 'file' };
  const route = '/:year/:month/:slug';
  const target = '/:slug';
  const output = buildPath(params, route, target);
  t.is(output, '/file');
});

test('buildPath: throws when missing required field', (t) => {
  const params = { year: '2022', month: 'feb' };
  const route = '/:year/:month/:slug';
  const target = '/:slug';
  t.throws(() => {
    buildPath(params, route, target);
  }, { message: 'Missing required key \'slug\'.' });
});
