import test from 'ava';

import {
  WIKI_TOOLS,
  WIKI_TOOLS_BY_NAME,
  getWikiTool,
  toOllamaTool,
  toMcpTool,
  executeWikiTool,
} from '../../../src/plugins/chat-bot/tool-registry.js';

/**
 * Build a fake Uttori hooks dispatcher that records the most recent fetch call.
 * @param {Record<string, any>} responses A map of hook label to the single value returned.
 * @returns {{ hooks: { fetch: Function }, calls: Array<{label: string, data: any}> }} The fake hooks and the recorded calls.
 */
function makeHooks(responses = {}) {
  const calls = [];
  const hooks = {
    /**
     * @param {string} label The hook label.
     * @param {any} data The data.
     * @returns {Promise<any[]>} The single-element results array (or empty when unregistered).
     */
    fetch: async (label, data) => {
      calls.push({ label, data });
      if (!(label in responses)) {
        return [];
      }
      return [responses[label]];
    },
  };
  return { hooks, calls };
}

test('WIKI_TOOLS: includes the expected tool names', (t) => {
  const names = WIKI_TOOLS.map(tool => tool.name).sort();
  t.deepEqual(names, [
    'getDocument',
    'getDocumentHistory',
    'getDocumentRevision',
    'listDocuments',
    'popularSearchTerms',
    'searchDocuments',
    'vectorSearch',
  ]);
});

test('WIKI_TOOLS_BY_NAME / getWikiTool: resolve by name', (t) => {
  t.is(getWikiTool('vectorSearch'), WIKI_TOOLS_BY_NAME.get('vectorSearch'));
  t.is(getWikiTool('nope'), undefined);
});

test('toOllamaTool: maps to the Ollama function schema', (t) => {
  const tool = toOllamaTool(getWikiTool('vectorSearch'));
  t.is(tool.type, 'function');
  t.is(tool.function.name, 'vectorSearch');
  t.deepEqual(tool.function.parameters.required, ['query']);
});

test('toMcpTool: maps to the MCP tool schema', (t) => {
  const tool = toMcpTool(getWikiTool('listDocuments'));
  t.is(tool.name, 'listDocuments');
  t.is(typeof tool.description, 'string');
  t.is(tool.inputSchema.type, 'object');
});

test('executeWikiTool: vectorSearch routes to search-retrieve', async (t) => {
  const response = { query: 'q', chunks: [], citations: [] };
  const { hooks, calls } = makeHooks({ 'search-retrieve': response });
  const result = await executeWikiTool('vectorSearch', { query: 'hello', slugs: ['a'] }, { hooks });
  t.is(result, response);
  t.is(calls[0].label, 'search-retrieve');
  t.deepEqual(calls[0].data, { query: 'hello', slugs: ['a'], limit: undefined });
});

test('executeWikiTool: searchDocuments routes to search-query', async (t) => {
  const docs = [{ slug: 'a' }];
  const { hooks, calls } = makeHooks({ 'search-query': docs });
  const result = await executeWikiTool('searchDocuments', { query: 'x', limit: 5 }, { hooks });
  t.deepEqual(result, docs);
  t.is(calls[0].label, 'search-query');
  t.deepEqual(calls[0].data, { query: 'x', limit: 5, slugs: [] });
});

test('executeWikiTool: listDocuments routes to search-documents', async (t) => {
  const docs = [{ id: 'a', slug: 'a', title: 'A', update_date: 1 }];
  const { hooks, calls } = makeHooks({ 'search-documents': docs });
  const result = await executeWikiTool('listDocuments', {}, { hooks });
  t.deepEqual(result, docs);
  t.is(calls[0].label, 'search-documents');
});

test('executeWikiTool: getDocument routes to storage-get with the slug', async (t) => {
  const doc = { slug: 'a', content: 'hi' };
  const { hooks, calls } = makeHooks({ 'storage-get': doc });
  const result = await executeWikiTool('getDocument', { slug: 'a' }, { hooks });
  t.deepEqual(result, doc);
  t.is(calls[0].label, 'storage-get');
  t.is(calls[0].data, 'a');
});

test('executeWikiTool: getDocumentRevision routes to storage-get-revision', async (t) => {
  const doc = { slug: 'a' };
  const { hooks, calls } = makeHooks({ 'storage-get-revision': doc });
  const result = await executeWikiTool('getDocumentRevision', { slug: 'a', revision: '123' }, { hooks });
  t.deepEqual(result, doc);
  t.deepEqual(calls[0].data, { slug: 'a', revision: '123' });
});

test('executeWikiTool: getDocumentHistory routes to storage-get-history', async (t) => {
  const revisions = ['1700000000', '1700000001'];
  const { hooks, calls } = makeHooks({ 'storage-get-history': revisions });
  const result = await executeWikiTool('getDocumentHistory', { slug: 'a' }, { hooks });
  t.deepEqual(result, revisions);
  t.is(calls[0].label, 'storage-get-history');
  t.is(calls[0].data, 'a');
});

test('executeWikiTool: popularSearchTerms defaults the limit to 10', async (t) => {
  const { hooks, calls } = makeHooks({ 'search-popular-terms': ['a', 'b'] });
  const result = await executeWikiTool('popularSearchTerms', {}, { hooks });
  t.deepEqual(result, ['a', 'b']);
  t.deepEqual(calls[0].data, { limit: 10 });
});

test('executeWikiTool: unknown tool returns an error object', async (t) => {
  const { hooks } = makeHooks();
  const result = await executeWikiTool('nope', {}, { hooks });
  t.deepEqual(result, { error: 'Unknown Tool: nope' });
});

test('executeWikiTool: missing hook handler returns a descriptive error', async (t) => {
  const { hooks } = makeHooks();
  const result = await executeWikiTool('listDocuments', {}, { hooks });
  t.true(typeof result === 'object' && 'error' in result);
  t.regex(result.error, /No 'search-documents' handler registered/);
});

test('executeWikiTool: missing dispatcher returns an error', async (t) => {
  const result = await executeWikiTool('listDocuments', {}, {});
  t.true(typeof result === 'object' && 'error' in result);
  t.regex(result.error, /No event dispatcher/);
});
