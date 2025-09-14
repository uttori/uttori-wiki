import fs from 'node:fs/promises';
import test from 'ava';
import AnalyticsProvider from '../../../src/plugins/utilities/analytics-provider.js';

test.beforeEach(async () => {
  await fs.mkdir('test/site/data', { recursive: true });
  await fs.writeFile('test/site/data/visits.json', '{"test":1,"zero":0,"two":2}');
});

const config = {
  directory: 'test/site/data',
};

test('constructor(config): does not error', (t) => {
  t.notThrows(() => new AnalyticsProvider(config));
});

test('constructor(config): throws an error when missing config', (t) => {
  t.throws(() => new AnalyticsProvider(), { message: 'No config provided.' });
});

test('constructor(config): throws an error when missing config directory', (t) => {
  t.throws(() => new AnalyticsProvider({}), { message: 'No directory provided.' });
});

test('update(slug): handles empty slug', (t) => {
  const ap = new AnalyticsProvider(config);
  t.notThrows(() => ap.update());
});

test('update(slug): properly stores new view count', (t) => {
  const ap = new AnalyticsProvider(config);
  ap.update('new', 0);
  ap.update('new');
  const out = ap.get('new');
  t.is(out, 1);
});

test('update(slug): properly updates existing view count', (t) => {
  const ap = new AnalyticsProvider(config);
  ap.update('new', 0);
  ap.update('new');
  ap.update('new');
  const out = ap.get('new');
  t.is(out, 2);
});

test('get(slug): returns correct view count', (t) => {
  const ap = new AnalyticsProvider(config);
  ap.update('test', 0);
  let out = ap.get('test');
  t.is(out, 0);

  ap.update('test');
  ap.update('test');
  out = ap.get('test');
  t.is(out, 2);

  ap.update('test');
  ap.update('test');
  out = ap.get('test');
  t.is(out, 4);
});

test('get(slug): returns 0 when requesting view count of missing document', (t) => {
  const ap = new AnalyticsProvider(config);
  const out = ap.get('missing');
  t.is(out, 0);
});

test('getPopularDocuments(limit): returns the requested number of popular documents', (t) => {
  const pageVisits = {
    '65816-reference': 7722,
    '65c816-code-snippets': 707,
    aaendi: 114,
    'aretha-2': 361,
    'asm-hacking-for-dummies': 677,
    'asm-tutorial-part-1': 1934,
    'asm-tutorial-part-2': 752,
    backgrounds: 1510,
    'basic-ca65-usage-for-snes-programming': 669,
  };

  const ap = new AnalyticsProvider(config);
  ap.pageVisits = { ...pageVisits };
  const out = ap.getPopularDocuments(1);
  t.deepEqual(out, [{ slug: '65816-reference', count: 7722 }]);
});

test('getPopularDocuments(limit): throws an error with invalid limit', (t) => {
  t.plan(1);
  const ap = new AnalyticsProvider(config);
  t.throws(() => ap.getPopularDocuments('1'), { message: 'Missing or invalid limit.' });
});

test('getPopularDocuments(limit): throws an error with missing limit', (t) => {
  t.plan(1);
  const ap = new AnalyticsProvider(config);
  t.throws(() => ap.getPopularDocuments(), { message: 'Missing or invalid limit.' });
});
