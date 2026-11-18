import { once } from 'node:events';
import { createHash } from 'node:crypto';
import { mkdir, mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import test from 'ava';
import express from 'express';
import { McpProvider, SearchProviderLunr, StorageProviderJsonFile, UttoriWiki } from '../../dist/index.js';

test('hosted ingest reviews authenticated changes, resumes storage and indexing, and rejects stale drafts', async (t) => {
  const root = await mkdtemp(path.join(tmpdir(), 'uttori-mcp-writes-'));
  const contentDirectory = path.join(root, 'content');
  const historyDirectory = path.join(root, 'history');
  await Promise.all([mkdir(contentDirectory), mkdir(historyDirectory)]);
  const app = express();
  app.use(express.json());
  const wiki = new UttoriWiki({
    plugins: [StorageProviderJsonFile, SearchProviderLunr, McpProvider],
    allowedDocumentKeys: ['wikiKind', 'source'],
    [StorageProviderJsonFile.configKey]: { contentDirectory, historyDirectory },
    [SearchProviderLunr.configKey]: {},
    [McpProvider.configKey]: {
      authorizeWrite: request => {
        if (request.get('Authorization') === 'Bearer alice-test') return 'alice';
        if (request.get('Authorization') === 'Bearer bob-test') return 'bob';
        return undefined;
      },
    },
  }, app);
  const server = app.listen(0, '127.0.0.1');
  const clients = [];
  t.teardown(async () => {
    await Promise.all(clients.map(client => client.close()));
    await new Promise(resolve => server.close(resolve));
    await rm(root, { recursive: true, force: true });
  });
  await once(server, 'listening');

  /**
   * Connect a fresh MCP client to the real stateless HTTP endpoint.
   * @param {string} [token] Test credential used on every HTTP request.
   * @returns {Promise<Client>} Connected client, closed by teardown.
   */
  async function connect(token) {
    const client = new Client({ name: 'hosted-ingest-test', version: '1.0.0' });
    clients.push(client);
    const url = new URL(`http://127.0.0.1:${server.address().port}/mcp`);
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    await client.connect(new StreamableHTTPClientTransport(url, { requestInit: { headers } }));
    return client;
  }

  /**
   * Decode the text payload used by both read and write tools.
   * @param {Client} client The caller's authenticated or anonymous connection.
   * @param {string} name Tool name.
   * @param {Record<string, unknown>} args Tool arguments.
   * @returns {Promise<any>} The decoded tool payload.
   */
  async function call(client, name, args) {
    const result = await client.callTool({ name, arguments: args });
    return JSON.parse(result.content[0].text);
  }

  const [alice, bob, reader] = await Promise.all([connect('alice-test'), connect('bob-test'), connect()]);
  t.true((await alice.listTools()).tools.some(tool => tool.name === 'applyDocumentChanges'));
  t.false((await reader.listTools()).tools.some(tool => tool.name === 'applyDocumentChanges'));

  const getForEdit = slug => call(alice, 'getDocumentForEdit', { slug });
  const preview = changes => call(alice, 'previewDocumentChanges', { changes });
  const apply = previewId => call(alice, 'applyDocumentChanges', { previewId });
  const sourceContent = '# Field report\n\nThe calibration team recommends 12 kPa.\n';
  const sourceDigest = createHash('sha256').update(sourceContent).digest('hex');
  const sourceSlug = `source-${sourceDigest.slice(0, 16)}`;
  const topicSlug = 'sensor-threshold';
  const changes = [
    { slug: sourceSlug, expectedVersion: null, title: 'Field report', content: `The threshold is 12 kPa. [Sensor threshold](${topicSlug})`, metadata: { wikiKind: 'source', source: { path: 'field-report.md', sha256: sourceDigest } } },
    { slug: topicSlug, expectedVersion: null, title: 'Sensor threshold', content: `Calibration recommends 12 kPa. [Field report, line 3](${sourceSlug})`, metadata: { wikiKind: 'topic' } },
    { slug: 'wiki-index', expectedVersion: null, title: 'Wiki index', content: `[Sensor threshold](${topicSlug})\n[Field report](${sourceSlug})` },
    { slug: 'wiki-log', expectedVersion: null, title: 'Wiki log', content: `## 2026-11-09 ingest | ${sourceSlug}` },
  ];
  t.deepEqual(await getForEdit(topicSlug), { document: null, version: null });

  // A preview is side-effect free and only the principal who requested it can apply it.
  let filtered = 0;
  wiki.hooks.on('document-save', document => {
    filtered++;
    return { ...document, excerpt: 'Normalized by the normal save filter' };
  });
  const review = await preview(changes);
  t.truthy(review.previewId);
  t.is(review.changes[1].before, null);
  t.is(review.changes[1].after.content, changes[1].content);
  t.is(filtered, 0);
  t.deepEqual(await readdir(contentDirectory), []);
  const anonymous = await reader.callTool({ name: 'applyDocumentChanges', arguments: { previewId: review.previewId } });
  t.true(anonymous.isError);
  t.regex((await call(bob, 'applyDocumentChanges', { previewId: review.previewId })).error, /Preview unavailable/);
  t.deepEqual(await readdir(contentDirectory), []);

  // Fail after storing the first page. A retry must repair its history and continue with later pages.
  await writeFile(path.join(historyDirectory, sourceSlug), 'history path blocked');
  const pendingHistory = await apply(review.previewId);
  t.is(pendingHistory.status, 'pending');
  t.is(pendingHistory.pages[0].pending, 'history');
  t.truthy(pendingHistory.pages[0].version);
  t.is((await getForEdit('wiki-log')).version, null);
  await rm(path.join(historyDirectory, sourceSlug));

  const event = wiki.hooks.events['storage-query'];
  const query = event.callbacks[0];
  let rebuilds = 0;
  wiki.hooks.off('storage-query', query);
  wiki.hooks.on('storage-query', (statement, context) => {
    if (statement.startsWith('SELECT \'slug\'') && ++rebuilds === 1) throw new Error('temporary index failure');
    return query(statement, context);
  });

  const pendingIndex = await apply(review.previewId);
  t.is(pendingIndex.status, 'pending');
  t.true(pendingIndex.pages.every(page => page.pending === 'index' && page.revision));
  t.is(pendingIndex.pages[0].version, pendingHistory.pages[0].version);
  t.is(filtered, changes.length);

  const [saved, retried] = await Promise.all([apply(review.previewId), apply(review.previewId)]);
  t.is(saved.status, 'complete');
  t.deepEqual(saved, retried);
  t.deepEqual(saved.pages.map(page => page.revision), pendingIndex.pages.map(page => page.revision));
  t.is(rebuilds, 2);
  t.is(filtered, changes.length);
  for (const page of saved.pages) {
    t.deepEqual(await readdir(path.join(historyDirectory, page.slug)), [`${page.revision}.json`]);
  }
  const topic = await call(reader, 'getDocument', { slug: topicSlug });
  t.is(topic.excerpt, 'Normalized by the normal save filter');
  t.is(topic.content, changes[1].content);
  t.is((await call(reader, 'getDocument', { slug: sourceSlug })).source.sha256, sourceDigest);
  t.is((await call(reader, 'getDocumentRevision', { slug: topicSlug, revision: saved.pages[1].revision })).content, topic.content);
  t.true((await call(reader, 'searchDocuments', { query: 'Calibration' })).some(document => document.slug === topicSlug));

  const { version } = await getForEdit(topicSlug);
  const stale = await preview([
    { slug: 'unrelated-draft', expectedVersion: null, title: 'Unrelated draft', content: 'Save only if the whole review is current.' },
    { slug: topicSlug, expectedVersion: version, content: 'Stale revision.' },
  ]);
  const newer = await preview([{ slug: topicSlug, expectedVersion: version, content: `Newer revision with [source](${sourceSlug}).` }]);
  t.is((await apply(newer.previewId)).status, 'complete');
  const rejected = await apply(stale.previewId);
  t.deepEqual(rejected.conflicts, [topicSlug]);
  t.is((await getForEdit('unrelated-draft')).version, null);
  t.regex((await readFile(path.join(contentDirectory, `${topicSlug}.json`), 'utf8')), /Newer revision/);
  t.is((await getForEdit(topicSlug)).document.wikiKind, 'topic');
  t.deepEqual((await preview([{ slug: topicSlug, expectedVersion: version, content: 'Another stale draft.' }])).conflicts, [topicSlug]);

  // A stale later page must not strand history for an unchanged page already written by this preview.
  const partialSlug = 'second-source';
  const current = await getForEdit(topicSlug);
  const partial = await preview([
    { slug: partialSlug, expectedVersion: null, title: 'Second source', content: 'A second source.' },
    { slug: topicSlug, expectedVersion: current.version, content: 'Superseded draft.' },
  ]);
  await writeFile(path.join(historyDirectory, partialSlug), 'history path blocked again');
  t.is((await apply(partial.previewId)).pages[0].pending, 'history');
  const maintainer = await preview([{ slug: topicSlug, expectedVersion: current.version, content: 'Intervening edit.' }]);
  t.is((await apply(maintainer.previewId)).status, 'complete');
  await rm(path.join(historyDirectory, partialSlug));
  const reconciled = await apply(partial.previewId);
  t.deepEqual(reconciled.conflicts, [topicSlug]);
  t.is(reconciled.pages[0].status, 'complete');
  t.deepEqual(await readdir(path.join(historyDirectory, partialSlug)), [`${reconciled.pages[0].revision}.json`]);
  t.is((await getForEdit(topicSlug)).document.content, 'Intervening edit.');
});
