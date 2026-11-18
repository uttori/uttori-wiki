import { once } from 'node:events';
import { mkdir, mkdtemp, rename as moveFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import express from 'express';
import test from 'ava';
import { MarkdownItRenderer, McpProvider, SearchProviderLunr, StorageProviderJsonFile, UttoriWiki } from '../../dist/index.js';

test('hosted refactors review all inbound links, retry retirement, and serve old slugs as redirects', async t => {
  const root = await mkdtemp(path.join(tmpdir(), 'uttori-mcp-refactor-'));
  const contentDirectory = path.join(root, 'content');
  const historyDirectory = path.join(root, 'history');
  await Promise.all([mkdir(contentDirectory), mkdir(historyDirectory)]);
  const documents = [
    { slug: 'old-topic', title: 'Old topic', content: '## Shared\n\nOld body with signalalpha.\n', redirects: ['old-alias'], tags: ['original'] },
    { slug: 'survivor', title: 'Survivor', content: '## Shared\n\nDestination body.\n', tags: ['retained'] },
    { slug: 'referrer', title: 'Referrer', content: '[Original](old-topic#shared) and [[old-alias|Alias]].' },
  ];
  await Promise.all(documents.map(document => writeFile(path.join(contentDirectory, document.slug + '.json'), JSON.stringify(document))));

  const app = express();
  app.use(express.json());
  new UttoriWiki({
    plugins: [StorageProviderJsonFile, SearchProviderLunr, McpProvider],
    [StorageProviderJsonFile.configKey]: { contentDirectory, historyDirectory },
    [SearchProviderLunr.configKey]: {},
    [MarkdownItRenderer.configKey]: { markdownIt: { uttori: { toc: { stableIds: true } } } },
    [McpProvider.configKey]: { authorizeWrite: request => request.get('Authorization') === 'Bearer refactor-writer' ? 'writer' : undefined },
  }, app);
  const server = app.listen(0, '127.0.0.1');
  const client = new Client({ name: 'refactor-test', version: '1.0.0' });
  t.teardown(async () => {
    await client.close();
    await new Promise(resolve => server.close(resolve));
    await rm(root, { recursive: true, force: true });
  });
  await once(server, 'listening');
  const origin = `http://127.0.0.1:${server.address().port}`;
  await client.connect(new StreamableHTTPClientTransport(new URL(origin + '/mcp'), {
    requestInit: { headers: { Authorization: 'Bearer refactor-writer' } },
  }));
  t.true((await client.listTools()).tools.some(tool => tool.name === 'previewDocumentRefactor'));

  /**
   * Invoke the actual HTTP tool and decode its review or receipt.
   * @param {string} name Tool name.
   * @param {Record<string, unknown>} args Tool arguments.
   * @returns {Promise<any>} Decoded text payload.
   */
  async function call(name, args) {
    const result = await client.callTool({ name, arguments: args });
    return JSON.parse(result.content[0].text);
  }

  const read = slug => call('getDocumentForEdit', { slug });
  const apply = previewId => call('applyDocumentChanges', { previewId });
  /**
   * Read both current versions before generating a refactor preview.
   * @param {string} mode Rename or merge.
   * @param {string} from Old slug.
   * @param {string} to Destination slug.
   * @param {string} [resumePreviewId] A partially applied refactor that saved the destination.
   * @returns {Promise<any>} A preview and its ID.
   */
  async function preview(mode, from, to, resumePreviewId) {
    const [source, destination] = await Promise.all([read(from), read(to)]);
    return call('previewDocumentRefactor', { mode, from, to, expectedSourceVersion: source.version, expectedTargetVersion: destination.version, resumePreviewId });
  }

  const stale = await preview('rename', 'old-topic', 'renamed-topic');
  t.truthy(stale.previewId, stale.error);
  t.is(stale.retire.redirectTo, 'renamed-topic');
  t.is((await read('renamed-topic')).version, null);
  const unrelated = await call('previewDocumentChanges', { changes: [{
    slug: 'late-page', expectedVersion: null, title: 'Late page', content: '[Added backlink](old-topic)',
  }] });
  t.is((await apply(unrelated.previewId)).status, 'complete');
  t.deepEqual((await apply(stale.previewId)).conflicts, ['late-page']);
  t.is((await read('renamed-topic')).version, null);

  const rename = await preview('rename', 'old-topic', 'renamed-topic');
  t.truthy(rename.previewId, rename.error);
  t.deepEqual(rename.changes.map(change => change.slug), ['renamed-topic', 'late-page', 'referrer']);
  const blocked = path.join(historyDirectory, 'old-topic');
  await writeFile(blocked, 'blocked');
  const partial = await apply(rename.previewId);
  t.is(partial.retirement.pending, 'retire');
  t.truthy((await read('old-topic')).document);
  t.is((await read('late-page')).document.content, '[Added backlink](renamed-topic)');
  await rm(blocked);

  const saved = await apply(rename.previewId);
  t.is(saved.status, 'complete', saved.error);
  t.deepEqual(await apply(rename.previewId), saved);
  t.is((await read('old-topic')).version, null);
  const snapshot = await call('getDocumentRevision', { slug: 'old-topic', revision: saved.retirement.revision });
  t.is(snapshot.content, documents[0].content);
  const prior = await fetch(origin + '/old-topic?view=full', { redirect: 'manual' });
  t.is(prior.status, 301);
  t.is(prior.headers.get('location'), '/renamed-topic?view=full');

  const merge = await preview('merge', 'renamed-topic', 'survivor');
  t.truthy(merge.previewId, merge.error);
  // When a late backlink makes a partially applied merge stale, review only the remaining work.
  const mergeHistory = path.join(historyDirectory, 'renamed-topic');
  await moveFile(mergeHistory, mergeHistory + '.backup');
  await writeFile(mergeHistory, 'blocked');
  t.is((await apply(merge.previewId)).retirement.pending, 'retire');
  const late = await call('previewDocumentChanges', { changes: [{ slug: 'late-merge', expectedVersion: null, title: 'Late merge backlink', content: '[New backlink](renamed-topic#shared)' }] });
  t.is((await apply(late.previewId)).status, 'complete');
  await rm(mergeHistory);
  await moveFile(mergeHistory + '.backup', mergeHistory);
  t.deepEqual((await apply(merge.previewId)).conflicts, ['late-merge']);
  const resumed = await preview('merge', 'renamed-topic', 'survivor', merge.previewId);
  t.truthy(resumed.previewId, resumed.error);
  t.deepEqual(resumed.changes.map(change => change.slug), ['late-merge']);
  t.is((await apply(resumed.previewId)).status, 'complete');
  const survivor = (await read('survivor')).document;
  t.deepEqual(survivor.redirects, ['old-alias', 'old-topic', 'renamed-topic']);
  t.deepEqual(survivor.tags, ['retained', 'original']);
  t.true(survivor.content.includes('Old body with signalalpha.'));
  t.is(survivor.content.split('signalalpha').length, 2);
  t.is((await read('late-merge')).document.content, '[New backlink](survivor#shared-2)');
  t.is((await read('referrer')).document.content, '[Original](survivor#shared-2) and [[survivor|Alias]].');
  for (const slug of survivor.redirects) {
    const response = await fetch(origin + '/' + slug, { redirect: 'manual' });
    t.is(response.status, 301);
    t.is(response.headers.get('location'), '/survivor');
  }
  const results = await call('searchDocuments', { query: 'signalalpha' });
  t.deepEqual(results.map(page => page.slug), ['survivor']);
});
