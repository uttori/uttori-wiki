import { createHash } from 'node:crypto';
import { once } from 'node:events';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import test from 'ava';
import express from 'express';
import { McpProvider, SearchProviderLunr, StorageProviderJsonFile, UttoriWiki } from '../../dist/index.js';

test('hosted query verifies a source revision over HTTP without exposing originals', async (t) => {
  const root = await mkdtemp(path.join(tmpdir(), 'uttori-mcp-citations-'));
  const archiveDirectory = path.join(root, 'raw');
  const contentDirectory = path.join(root, 'content');
  const historyDirectory = path.join(root, 'history');
  await Promise.all([mkdir(archiveDirectory), mkdir(contentDirectory), mkdir(historyDirectory)]);

  const quote = 'The Harbor gauge threshold is 12 kPa.';
  const original = `# Field report\n\n${quote}\nAdditional private context.\n`;
  const sha256 = createHash('sha256').update(original).digest('hex');
  const sourceSlug = `source-${sha256.slice(0, 16)}`;
  const note = {
    slug: sourceSlug, title: 'Field report', wikiKind: 'source',
    source: { path: 'field-report.md', sha256 }, content: `> ${quote}\n\nOriginal line 3.`,
  };
  const originalPath = path.join(archiveDirectory, note.source.path);
  const notePath = path.join(contentDirectory, `${sourceSlug}.json`);
  await Promise.all([
    writeFile(originalPath, original),
    writeFile(notePath, JSON.stringify(note)),
    writeFile(path.join(contentDirectory, 'harbor-gauge.json'), JSON.stringify({
      slug: 'harbor-gauge', title: 'Harbor gauge', content: `[Field report, line 3](${sourceSlug})`,
    })),
  ]);

  const app = express();
  app.use(express.json());
  const wiki = new UttoriWiki({
    plugins: [StorageProviderJsonFile, SearchProviderLunr, McpProvider],
    [StorageProviderJsonFile.configKey]: { contentDirectory, historyDirectory, useCache: false },
    [SearchProviderLunr.configKey]: {},
    [McpProvider.configKey]: {
      citationVerification: {
        archiveDirectory,
        authorize: request => request.get('Authorization') === 'Bearer citation-reader-test',
      },
    },
  }, app);
  await wiki.hooks.fetch('search-rebuild', undefined, wiki);
  const server = app.listen(0, '127.0.0.1');
  const clients = [];
  t.teardown(async () => {
    await Promise.all(clients.map(client => client.close()));
    await new Promise(resolve => server.close(resolve));
    await rm(root, { recursive: true, force: true });
  });
  await once(server, 'listening');

  /**
   * Start an MCP session with or without the archive permission.
   * @param {Record<string, string>} headers Headers sent on every request.
   * @returns {Promise<Client>} Connected client.
   */
  async function connect(headers) {
    const client = new Client({ name: 'citation-query-test', version: '1.0.0' });
    clients.push(client);
    const url = new URL(`http://127.0.0.1:${server.address().port}/mcp`);
    await client.connect(new StreamableHTTPClientTransport(url, { requestInit: { headers } }));
    return client;
  }

  const reader = await connect({ Authorization: 'Bearer citation-reader-test' });
  const guest = await connect({});
  t.true((await reader.listTools()).tools.some(tool => tool.name === 'verifyCitation'));
  t.false((await reader.listTools()).tools.some(tool => tool.name === 'applyDocumentChanges'));
  t.false((await guest.listTools()).tools.some(tool => tool.name === 'verifyCitation'));
  t.true((await guest.callTool({ name: 'verifyCitation', arguments: { sourceSlug, sha256, quote } })).isError);

  const search = await reader.callTool({ name: 'searchDocuments', arguments: { query: 'Harbor gauge' } });
  t.true(JSON.parse(search.content[0].text).some(page => page.slug === 'harbor-gauge'));
  const source = await reader.callTool({ name: 'getDocument', arguments: { slug: sourceSlug } });
  const { source: provenance } = JSON.parse(source.content[0].text);
  t.is(provenance.sha256, sha256);

  /**
   * Submit the quote from the published note with its pinned revision.
   * @param {Record<string, unknown>} overrides Alternative quote or locator.
   * @returns {Promise<Record<string, unknown>>} Decoded verdict, excluding original text.
   */
  async function verify(overrides = {}) {
    const result = await reader.callTool({
      name: 'verifyCitation', arguments: { sourceSlug, sha256: provenance.sha256, quote, ...overrides },
    });
    t.false(result.isError);
    return JSON.parse(result.content[0].text);
  }

  const matched = await verify();
  t.deepEqual(matched, { sourceSlug, sha256, status: 'verified', startLine: 3, endLine: 3 });
  t.is((await verify({ quote: 'The Harbor gauge threshold is 9 kPa.' })).status, 'mismatch');
  t.is((await verify({ startLine: 1, endLine: 1 })).status, 'mismatch');

  // The slug carries only a digest prefix. The full version from the query must also match the stored note.
  await writeFile(notePath, JSON.stringify({ ...note, source: { ...note.source, sha256: sha256.slice(0, 16) + '0'.repeat(48) } }));
  t.deepEqual(await verify(), { sourceSlug, sha256, status: 'unavailable', reason: 'revision_mismatch' });

  // Identical bytes outside the archive must never satisfy a forged source-note path.
  await writeFile(path.join(root, note.source.path), original);
  await writeFile(notePath, JSON.stringify({ ...note, source: { ...note.source, path: '../field-report.md' } }));
  t.deepEqual(await verify(), { sourceSlug, sha256, status: 'unavailable', reason: 'invalid_path' });

  await writeFile(notePath, JSON.stringify(note));
  await rm(originalPath);
  t.deepEqual(await verify(), { sourceSlug, sha256, status: 'unavailable', reason: 'source_unavailable' });
});
