import test from 'ava';

import {
  vectorSearchTool,
  BUILT_IN_TOOLS,
  buildChatTools,
  formatRetrievalResult,
  executeChatTool,
} from '../../../src/plugins/chat-bot/tools.js';

test('vectorSearchTool: type is "function"', (t) => {
  t.is(vectorSearchTool.type, 'function');
});

test('vectorSearchTool: name is "vectorSearch"', (t) => {
  t.is(vectorSearchTool.function.name, 'vectorSearch');
});

test('vectorSearchTool: has a string description', (t) => {
  t.is(typeof vectorSearchTool.function.description, 'string');
  t.true(vectorSearchTool.function.description.length > 0);
});

test('vectorSearchTool: parameters require "query"', (t) => {
  t.deepEqual(vectorSearchTool.function.parameters.required, ['query']);
});

test('vectorSearchTool: parameters include "slugs" as an array property', (t) => {
  t.is(vectorSearchTool.function.parameters.properties.slugs.type, 'array');
});

test('BUILT_IN_TOOLS: contains vectorSearch', (t) => {
  t.true(BUILT_IN_TOOLS.has('vectorSearch'));
  t.is(BUILT_IN_TOOLS.get('vectorSearch'), vectorSearchTool);
});

/** @param {any} tools */
const makeConfig = (tools) => ({ tools });

test('buildChatTools: empty array returns built-in tools', (t) => {
  const result = buildChatTools(makeConfig([]));
  t.true(Array.isArray(result));
  t.true(result.some(t => t.function?.name === 'vectorSearch'));
});

test('buildChatTools: non-empty array returns the caller-supplied tools unchanged', (t) => {
  const custom = [{ type: 'function', function: { name: 'myTool', description: 'custom', parameters: {} } }];
  const result = buildChatTools(makeConfig(custom));
  t.deepEqual(result, custom);
});

test('buildChatTools: null disables tools (returns empty array)', (t) => {
  t.deepEqual(buildChatTools(makeConfig(null)), []);
});

test('buildChatTools: undefined disables tools (returns empty array)', (t) => {
  t.deepEqual(buildChatTools(makeConfig(undefined)), []);
});

/** @returns {import('../../../src/plugins/ai-chat-bot.js').RetrieveResponse} */
function makeRetrieveResponse(overrides = {}) {
  return {
    query: 'test',
    chunks: [
      {
        rowid: 1,
        source_id: 'doc-1',
        idx: 0,
        text: 'Some content here.',
        token_count: 5,
        sectionPath: ['Intro'],
        source: { id: 'doc-1', title: 'Doc One', slug: 'doc-one' },
        score: 0.9,
      },
    ],
    citations: [],
    ...overrides,
  };
}

test('formatRetrievalResult: single chunk produces SOURCE/SLUG/--- block', (t) => {
  const result = formatRetrievalResult(makeRetrieveResponse());
  t.true(result.includes('SOURCE: Doc One'));
  t.true(result.includes('SLUG: doc-one'));
  t.true(result.includes('---'));
  t.true(result.includes('Some content here.'));
});

test('formatRetrievalResult: section path is appended to SOURCE line', (t) => {
  const result = formatRetrievalResult(makeRetrieveResponse());
  t.true(result.includes('Doc One - Intro'));
});

test('formatRetrievalResult: empty sectionPath omits the section suffix', (t) => {
  const response = makeRetrieveResponse();
  response.chunks[0].sectionPath = [];
  const result = formatRetrievalResult(response);
  t.false(result.includes(' - '));
});

test('formatRetrievalResult: chunks longer than 1500 chars are truncated with ellipsis', (t) => {
  const response = makeRetrieveResponse();
  response.chunks[0].text = 'x'.repeat(2000);
  const result = formatRetrievalResult(response);
  t.true(result.includes('…'));
  // The output block must not contain more than 1500 raw chunk characters
  const textPart = result.split('---\n')[1];
  t.true(textPart.length <= 1500);
});

test('formatRetrievalResult: multiple chunks separated by ====', (t) => {
  const response = makeRetrieveResponse();
  response.chunks.push({
    rowid: 2,
    source_id: 'doc-2',
    idx: 0,
    text: 'Second chunk.',
    token_count: 3,
    sectionPath: [],
    source: { id: 'doc-2', title: 'Doc Two', slug: 'doc-two' },
    score: 0.8,
  });
  const result = formatRetrievalResult(response);
  t.true(result.includes('===='));
  t.true(result.includes('Doc Two'));
});

test('formatRetrievalResult: empty chunks returns empty string', (t) => {
  const response = makeRetrieveResponse({ chunks: [] });
  t.is(formatRetrievalResult(response), '');
});

test('formatRetrievalResult: missing source title falls back to source.id', (t) => {
  const response = makeRetrieveResponse();
  response.chunks[0].source.title = undefined;
  const result = formatRetrievalResult(response);
  t.true(result.includes('SOURCE: doc-1'));
});

test('formatRetrievalResult: missing slug renders as empty string', (t) => {
  const response = makeRetrieveResponse();
  response.chunks[0].source.slug = undefined;
  const result = formatRetrievalResult(response);
  t.true(result.includes('SLUG: \n'));
});


test('executeChatTool: vectorSearch calls retrieve and returns formatted string', async (t) => {
  let capturedQuery = '', capturedConfig = (null), capturedSlugs = ([]);
  const fakeFetch = /** @param {string} query @param {any} cfg @param {string[]} slugs */ async (query, cfg, slugs) => {
    capturedQuery = query;
    capturedConfig = cfg;
    capturedSlugs = slugs;
    return makeRetrieveResponse();
  };

  const config = ({});
  const result = await executeChatTool('vectorSearch', { query: 'test query', slugs: ['my-slug'] }, config, (fakeFetch));
  t.true(typeof result === 'string');
  t.true(/** @type {string} */ (result).includes('SOURCE:'));
  t.is(capturedQuery, 'test query');
  t.is(capturedConfig, config);
  t.deepEqual(capturedSlugs, ['my-slug']);
});

test('executeChatTool: vectorSearch defaults slugs to empty array when absent', async (t) => {
  let capturedSlugs;
  const fakeFetch = /** @param {string} _query @param {any} _cfg @param {string[]} slugs */ async (_query, _cfg, slugs) => {
    capturedSlugs = slugs;
    return makeRetrieveResponse({ chunks: [] });
  };

  await executeChatTool('vectorSearch', { query: 'q' }, ({}), (fakeFetch));
  t.deepEqual(capturedSlugs, []);
});

test('executeChatTool: unknown tool name returns error object', async (t) => {
  const result = await executeChatTool('doesNotExist', {}, ({}));
  t.true(typeof result === 'object');
  t.is((result).error, 'Unknown Tool: doesNotExist');
});
