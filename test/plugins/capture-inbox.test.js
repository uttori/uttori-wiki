import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { once } from 'node:events';
import fs, { mkdir, mkdtemp, readFile, readdir, realpath, rm, writeFile } from 'node:fs/promises';
import { syncBuiltinESMExports } from 'node:module';
import { tmpdir } from 'node:os';
import path from 'node:path';
import express from 'express';
import session from 'express-session';
import sinon from 'sinon';
import request from 'supertest';
import test from 'ava';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { CaptureInbox, ImportDocument, McpProvider, SearchProviderLunr, StorageProviderJsonFile, UttoriWiki } from '../../dist/index.js';

import { pdfFixture } from '../_helpers/pdf.js';

/**
 * Extract the server-issued state and CSRF token from a review screen.
 * @param {string} html Browser response.
 * @returns {{ _csrf: string, version?: string }} Form inputs.
 */
function formState(html) {
  return { _csrf: html.match(/name="_csrf" value="([a-f0-9]+)"/)?.[1] ?? '', version: html.match(/name="version" value="([a-f0-9]+)"/)?.[1] };
}

test.serial('browser capture inbox resumes URL extraction and publication, then reviews a PDF safely', async t => {
  const root = await mkdtemp(path.join(tmpdir(), 'uttori-capture-'));
  const directory = path.join(root, 'inbox');
  const contentDirectory = path.join(root, 'content');
  const historyDirectory = path.join(root, 'history');
  await Promise.all([mkdir(contentDirectory), mkdir(historyDirectory)]);
  const upstream = express();
  const html = '<h1>Captured guide</h1><p>Recorded temperature 42.</p>';
  let downloads = 0;
  upstream.get('/guide', (_request, response) => {
    downloads++;
    response.type('html').send(html);
  });
  upstream.get('/redirect', (_request, response) => response.redirect('/guide'));
  const server = upstream.listen(0, '127.0.0.1');
  t.teardown(async () => {
    await new Promise(resolve => server.close(resolve));
    await rm(root, { recursive: true, force: true });
  });
  await once(server, 'listening');
  const origin = `http://127.0.0.1:${server.address().port}`;
  const auth = { Authorization: 'Bearer capture-maintainer' };
  const inbox = '/capture-inbox';

  // Force an interruption after the original reaches disk. Use Pandoc when installed,
  // with a converter fixture for contributors running the suite without the executable.
  const pandoc = spawnSync('pandoc', ['--version']).status === 0;
  const convert = ImportDocument.convertHtml;
  let attempts = 0;
  const stub = sinon.stub(ImportDocument, 'convertHtml').callsFake(async (input, output) => {
    if (++attempts === 1) throw new Error('conversion interrupted');
    if (pandoc) await convert(input, output);
    else {
      t.is(await readFile(input, 'utf8'), html);
      await writeFile(output, '# Captured guide\n\nRecorded temperature 42.\n');
    }
  });
  t.teardown(() => stub.restore());

  /**
   * Start a new app and browser session over the same private queue and wiki files.
   * @returns {{ wiki: UttoriWiki, browser: ReturnType<typeof request.agent> }} Disposable app state.
   */
  function open() {
    const app = express();
    app.use(session({ secret: 'capture-test-session', resave: false, saveUninitialized: false }));
    const wiki = new UttoriWiki({
      plugins: [StorageProviderJsonFile, SearchProviderLunr, CaptureInbox],
      [StorageProviderJsonFile.configKey]: { contentDirectory, historyDirectory },
      [SearchProviderLunr.configKey]: {},
      [CaptureInbox.configKey]: { directory, allowedOrigins: [origin], authorize: req => req.get('Authorization') === auth.Authorization },
    }, app);
    return { wiki, browser: request.agent(app) };
  }

  let { wiki, browser } = open();
  const get = url => browser.get(url).set(auth);
  const post = (url, fields) => browser.post(url).set(auth).type('form').send(fields);
  t.is((await browser.get(inbox)).status, 403);
  const home = await get(inbox);
  t.is(home.status, 200);
  t.is(home.headers['cache-control'], 'no-store');
  const homeFields = formState(home.text);
  t.truthy(homeFields._csrf);
  t.is((await post(inbox + '/url', { url: origin + '/guide' })).status, 403);
  t.is((await post(inbox + '/url', { ...homeFields, url: 'http://unapproved.invalid/' })).status, 400);

  const redirect = await post(inbox + '/url', { ...homeFields, url: origin + '/redirect' });
  t.is((await post(redirect.headers.location + '/prepare', formState((await get(redirect.headers.location)).text))).status, 503);
  t.is(downloads, 0);

  const captured = await post(inbox + '/url', { ...homeFields, url: origin + '/guide' });
  t.is(captured.status, 303);
  const urlItem = captured.headers.location;
  t.is(downloads, 0);
  const queued = await get(urlItem);
  t.regex(queued.text, /Prepare draft/);
  const interrupted = await post(urlItem + '/prepare', formState(queued.text));
  t.is(interrupted.status, 503);
  t.regex(interrupted.text, /Resume preparation/);
  t.is(downloads, 1);
  const original = path.join(directory, path.basename(urlItem), 'original');
  t.is(await readFile(original, 'utf8'), html);
  t.is((await browser.get(urlItem + '/original')).status, 403);

  ({ wiki, browser } = open());
  const resumedDraft = await post(urlItem + '/prepare', formState((await get(urlItem)).text));
  t.is(resumedDraft.status, 303);
  t.is(downloads, 1);
  const draft = await get(urlItem);
  t.regex(draft.text, /Recorded temperature 42/);
  const reviewed = await post(urlItem + '/review', {
    ...formState(draft.text), slug: 'captured-guide', title: 'Reviewed guide', content: '# Reviewed guide\n\nCaptured signalalpha and <script>unsafe</script>.',
  });
  t.is(reviewed.status, 303);
  const approval = await get(urlItem);
  t.regex(approval.text, /This will create a new page/);
  t.regex(approval.text, /&lt;script&gt;unsafe&lt;\/script&gt;/);
  t.false(approval.text.includes('<script>unsafe</script>'));
  t.deepEqual(await readdir(contentDirectory), []);

  // A page can reach disk before history is acknowledged. Later the search rebuild can fail independently.
  const blocked = path.join(historyDirectory, 'captured-guide');
  await writeFile(blocked, 'block history');
  const partial = await post(urlItem + '/publish', formState(approval.text));
  t.is(partial.status, 503);
  t.regex(partial.text, /Resume publication/);
  const savedBytes = await readFile(path.join(contentDirectory, 'captured-guide.json'), 'utf8');
  await rm(blocked);
  ({ wiki, browser } = open());
  const index = wiki.hooks.events['search-update'].callbacks[0];
  wiki.hooks.off('search-update', index);
  wiki.hooks.on('search-update', () => { throw new Error('index interrupted'); });
  const indexPending = await post(urlItem + '/publish', formState((await get(urlItem)).text));
  t.is(indexPending.status, 503);
  t.regex(indexPending.text, /indexing pending/);
  const revisions = await readdir(blocked);
  t.is(revisions.length, 1);

  ({ wiki, browser } = open());
  const saved = await post(urlItem + '/publish', formState((await get(urlItem)).text));
  t.is(saved.status, 303);
  t.regex((await get(urlItem)).text, /Published page/);
  t.deepEqual(await readdir(blocked), revisions);
  t.is(await readFile(path.join(contentDirectory, 'captured-guide.json'), 'utf8'), savedBytes);
  const [results] = await wiki.hooks.fetch('search-query', { query: 'signalalpha' }, wiki);
  t.deepEqual(results.map(document => document.slug), ['captured-guide']);

  const token = formState((await get(inbox)).text)._csrf;
  const upload = await browser.post(inbox + '/pdf').set(auth).field('_csrf', token).attach('pdf', pdfFixture(['PDF pressure calibration 17.']), {
    filename: 'calibration.pdf', contentType: 'application/pdf',
  });
  t.is(upload.status, 303);
  const pdfItem = upload.headers.location;
  t.regex((await get(pdfItem + '/original')).headers['content-disposition'], /^attachment/);
  t.is((await post(pdfItem + '/prepare', formState((await get(pdfItem)).text))).status, 303);
  const pdfDraft = await get(pdfItem);
  t.regex(pdfDraft.text, /\[Page 1\][\s\S]+PDF pressure calibration 17/);
  const pdfReview = { slug: 'captured-guide', title: 'PDF update', content: 'PDF pressure calibration 17.' };
  t.is((await post(pdfItem + '/review', { ...formState(pdfDraft.text), ...pdfReview })).status, 303);
  const staleApproval = await get(pdfItem);
  t.regex(staleApproval.text, /Reviewed guide/);

  const [current] = await wiki.hooks.fetch('storage-get', 'captured-guide', wiki);
  await wiki.hooks.fetch('storage-update', { document: { ...current, content: 'Intervening editor change.' } }, wiki);
  t.is((await post(pdfItem + '/publish', formState(staleApproval.text))).status, 409);
  const [unchanged] = await wiki.hooks.fetch('storage-get', 'captured-guide', wiki);
  t.is(unchanged.content, 'Intervening editor change.');
  t.is((await post(pdfItem + '/review', { ...formState((await get(pdfItem)).text), ...pdfReview })).status, 303);

  // If a pending storage attempt becomes stale, the draft can receive a fresh review.
  const write = wiki.hooks.events['storage-write-revision'].callbacks[0];
  const failWrite = () => { throw new Error('write interrupted before commit'); };
  wiki.hooks.off('storage-write-revision', write);
  wiki.hooks.on('storage-write-revision', failWrite);
  t.is((await post(pdfItem + '/publish', formState((await get(pdfItem)).text))).status, 503);
  wiki.hooks.off('storage-write-revision', failWrite);
  wiki.hooks.on('storage-write-revision', write);
  await wiki.hooks.fetch('storage-update', { document: { ...unchanged, content: 'Later editor change.' } }, wiki);
  const blockedPublication = await post(pdfItem + '/publish', formState((await get(pdfItem)).text));
  t.is(blockedPublication.status, 409);
  t.regex(blockedPublication.text, /Review needed/);
  t.is((await post(pdfItem + '/review', { ...formState(blockedPublication.text), ...pdfReview })).status, 303);
  t.regex((await get(pdfItem)).text, /Later editor change/);
  t.is((await post(pdfItem + '/publish', formState((await get(pdfItem)).text))).status, 303);
  t.regex((await get(pdfItem)).text, /Published page/);
  const [updated] = await wiki.hooks.fetch('storage-get', 'captured-guide', wiki);
  t.is(updated.content, pdfReview.content);
  t.deepEqual(updated.attachments ?? [], []);
});

test.serial('approved PDF and URL captures write Git sidecars and verify private citations locally and over MCP', async t => {
  const root = await realpath(await mkdtemp(path.join(tmpdir(), 'uttori-capture-sidecars-')));
  const wikiRoot = path.join(root, 'wiki');
  const directory = path.join(root, 'private-inbox');
  const contentDirectory = path.join(wikiRoot, 'content');
  const raw = path.join(wikiRoot, 'raw');
  await Promise.all([mkdir(directory), mkdir(contentDirectory, { recursive: true }), mkdir(raw, { recursive: true })]);
  const index = path.join(contentDirectory, 'wiki-index.md');
  const log = path.join(contentDirectory, 'wiki-log.md');
  for (const slug of ['wiki-index', 'wiki-log']) {
    await writeFile(path.join(contentDirectory, `${slug}.json`), JSON.stringify({ slug, title: slug }) + '\n');
    await writeFile(path.join(contentDirectory, `${slug}.md`), `# ${slug}\n`);
  }
  t.is(spawnSync('git', ['init', '-q'], { cwd: wikiRoot }).status, 0);
  t.is(spawnSync('git', ['add', 'content'], { cwd: wikiRoot }).status, 0);

  const htmlQuote = 'Captured HTML sensor drift is 3 mm.';
  const pdfQuote = 'PDF pressure calibration 17% (tolerance %20).';
  const html = Buffer.from(`<h1>Sensor report</h1><p>${htmlQuote}</p><p>Private capture context.</p>`);
  const pdf = pdfFixture(['Cover sheet', '', pdfQuote]);
  const upstream = express();
  upstream.get('/report', (_req, response) => response.type('html').send(html));
  const upstreamServer = upstream.listen(0, '127.0.0.1');
  t.teardown(async () => {
    await new Promise(resolve => upstreamServer.close(resolve));
    await rm(root, { recursive: true, force: true });
  });
  await once(upstreamServer, 'listening');
  const origin = `http://127.0.0.1:${upstreamServer.address().port}`;
  const auth = { Authorization: 'Bearer capture-maintainer' };
  const inbox = '/capture-inbox';
  if (spawnSync('pandoc', ['--version']).status !== 0) {
    // Keep the fixture runnable without Pandoc while exercising its real conversion when installed.
    const converter = sinon.stub(ImportDocument, 'convertHtml').callsFake(async (input, output) => {
      t.deepEqual(await readFile(input), html);
      await writeFile(output, `# Sensor report\n\n${htmlQuote}\n\nPrivate capture context.\n`);
    });
    t.teardown(() => converter.restore());
  }

  /** @returns {{ app: ReturnType<typeof express>, wiki: UttoriWiki, browser: ReturnType<typeof request.agent> }} Fresh server and session over the same checkout and inbox. */
  function open() {
    const app = express();
    app.set('views', path.resolve('test/site/theme/templates'));
    app.engine('html', (_file, options, done) => done(null, options.document?.content ?? ''));
    app.set('view engine', 'html');
    app.use(express.json(), session({ secret: 'sidecar-capture-test-session', resave: false, saveUninitialized: false }));
    const wiki = new UttoriWiki({
      allowCRUDRoutes: false, publicHistory: false,
      plugins: [StorageProviderJsonFile, SearchProviderLunr, McpProvider, CaptureInbox],
      [StorageProviderJsonFile.configKey]: { contentDirectory, sidecarContentExtension: 'md', useCache: false, useHistory: false },
      [SearchProviderLunr.configKey]: {},
      [CaptureInbox.configKey]: { directory, sidecarIngest: true, allowedOrigins: [origin], authorize: req => req.get('Authorization') === auth.Authorization },
      [McpProvider.configKey]: { citationVerification: { archiveDirectory: raw, captureDirectory: directory, authorize: req => req.get('Authorization') === auth.Authorization } },
    }, app);
    return { app, wiki, browser: request.agent(app) };
  }

  let { app, wiki, browser } = open();
  const get = url => browser.get(url).set(auth);
  const post = (url, fields) => browser.post(url).set(auth).type('form').send(fields);
  const fields = async url => formState((await get(url)).text);
  const homeFields = await fields(inbox);
  const queued = await post(inbox + '/url', { ...homeFields, url: `${origin}/report?private-token=abc123` });
  t.is(queued.status, 303);
  const urlItem = queued.headers.location;
  const pdfUpload = await browser.post(inbox + '/pdf').set(auth).field('_csrf', homeFields._csrf).attach('pdf', pdf, {
    filename: 'private-lab-name.pdf', contentType: 'application/pdf',
  });
  t.is(pdfUpload.status, 303);
  const pdfItem = pdfUpload.headers.location;

  const citations = [];
  for (const { item, bytes, quote, slug, format } of [
    { item: urlItem, bytes: html, quote: htmlQuote, slug: 'sensor-report', format: 'html' },
    { item: pdfItem, bytes: pdf, quote: pdfQuote, slug: 'lab-calibration', format: 'pdf' },
  ]) {
    const sha256 = createHash('sha256').update(bytes).digest('hex');
    const sourceSlug = `source-${sha256.slice(0, 16)}`;
    const topic = { slug, title: slug, content: `Reviewed ${format} findings are summarized here.` };
    t.is((await post(item + '/prepare', await fields(item))).status, 303);
    t.regex((await get(item)).text, /id="title"[^>]*value="Captured source"/);
    t.is((await post(item + '/publish', await fields(item))).status, 409);
    t.is((await post(item + '/review', { ...await fields(item), ...topic })).status, 303);
    const preview = await get(item);
    for (const file of [`${slug}.md`, `${sourceSlug}.json`, 'wiki-index.md', 'wiki-log.md']) t.true(preview.text.includes(file));
    t.false((await readdir(contentDirectory)).includes(`${sourceSlug}.md`));
    if (format === 'html') {
      await fs.appendFile(index, '\nMaintainer edit during review.\n');
      t.is((await post(item + '/publish', formState(preview.text))).status, 409);
      t.false((await readdir(contentDirectory)).includes(`${sourceSlug}.md`));
      t.is((await post(item + '/review', { ...await fields(item), ...topic })).status, 303);

      // Leave exactly the on-disk state of a hard stop between moving the old tree and promoting the new one.
      const oldIndex = await readFile(index, 'utf8');
      const rename = fs.rename;
      const interruption = sinon.stub(fs, 'rename').callsFake((from, to) => {
        if (to === contentDirectory) throw new Error('publisher stopped before directory promotion');
        return rename(from, to);
      });
      syncBuiltinESMExports();
      try {
        t.is((await post(item + '/publish', await fields(item))).status, 503);
      } finally {
        interruption.restore();
        syncBuiltinESMExports();
      }
      const readSlugs = async () => {
        const [pages] = await wiki.hooks.fetch('storage-query', 'SELECT * FROM documents WHERE slug NOT_IN ("") ORDER BY slug ASC LIMIT -1', wiki);
        return pages.map(page => page.slug);
      };
      t.deepEqual(await readSlugs(), ['wiki-index', 'wiki-log']);
      ({ app, wiki, browser } = open());
      t.deepEqual(await readSlugs(), ['wiki-index', 'wiki-log']);
      t.is((await get('/wiki-index')).text, oldIndex);
      t.is((await get(`/${sourceSlug}`)).status, 404);
      t.regex((await get(item)).text, /Resume publication/);
    }

    if (format === 'pdf') {
      // Lose the receipt after the commit point. Restoring the process must not replay the approved bytes.
      const remove = fs.rm;
      const interruption = sinon.stub(fs, 'rm').callsFake((file, options) => {
        if (file === `${contentDirectory}.uttori-previous`) throw new Error('publisher stopped after promotion');
        return remove(file, options);
      });
      syncBuiltinESMExports();
      try {
        t.is((await post(item + '/publish', await fields(item))).status, 503);
      } finally {
        interruption.restore();
        syncBuiltinESMExports();
      }
      ({ app, wiki, browser } = open());
      t.true((await get(`/${slug}`)).text.includes(topic.content));
      await fs.appendFile(index, '\nMaintainer edit after promotion.\n');
    }
    const approval = await fields(item);
    t.is((await post(item + '/publish', approval)).status, 303);
    t.is((await post(item + '/publish', approval)).status, 303);
    t.regex((await get(item)).text, /Published page/);
    t.true((await get(`/${slug}`)).text.includes(topic.content));
    const note = JSON.parse(await readFile(path.join(contentDirectory, `${sourceSlug}.json`), 'utf8'));
    t.is(note.wikiKind, 'source');
    t.is(note.source.sha256, sha256);
    t.is(note.source.format, format);
    const original = path.join(directory, note.source.path);
    t.deepEqual(await readFile(original), bytes);
    t.is((await browser.get(item + '/original')).status, 403);
    t.true((await readFile(path.join(contentDirectory, `${slug}.md`), 'utf8')).includes(`](${sourceSlug})`));
    t.true((await readFile(path.join(contentDirectory, `${sourceSlug}.md`), 'utf8')).includes(`](${slug})`));
    t.is((await readFile(log, 'utf8')).split(`ingest | ${sourceSlug}`).length, 2);
    const [results] = await wiki.hooks.fetch('search-query', { query: `${format} findings` }, wiki);
    t.true(results.some(page => page.slug === slug));
    citations.push({ original, draft: topic.content, input: { sourceSlug, sha256, quote } });
  }

  const duplicate = await post(inbox + '/url', { ...await fields(inbox), url: origin + '/report' });
  t.is(duplicate.status, 303);
  const duplicateItem = duplicate.headers.location;
  t.is((await post(duplicateItem + '/prepare', await fields(duplicateItem))).status, 303);
  t.is((await post(duplicateItem + '/review', {
    ...await fields(duplicateItem), slug: 'sensor-summary', title: 'Sensor summary', content: 'Another approved topic.',
  })).status, 303);
  t.is((await post(duplicateItem + '/publish', await fields(duplicateItem))).status, 303);
  const reused = JSON.parse(await readFile(path.join(contentDirectory, `${citations[0].input.sourceSlug}.json`), 'utf8'));
  t.is(path.join(directory, reused.source.path), citations[0].original);
  t.is((await readdir(contentDirectory)).filter(name => /^source-.*\.json$/.test(name)).length, 2);

  const publishedIndex = await readFile(index, 'utf8');
  t.true(publishedIndex.includes('Maintainer edit during review.'));
  t.true(publishedIndex.includes('Maintainer edit after promotion.'));
  t.deepEqual(await readdir(raw), []);
  const status = spawnSync('git', ['status', '--porcelain', '--untracked-files=all'], { cwd: wikiRoot, encoding: 'utf8' });
  t.is(status.status, 0);
  t.true(status.stdout.trim().split('\n').every(line => / content\/[^/]+\.(json|md)$/.test(line)));
  for (const name of await readdir(contentDirectory)) {
    t.notRegex(await readFile(path.join(contentDirectory, name), 'utf8'), /private-token|private-lab-name|Private capture context|Captured HTML sensor drift|PDF pressure calibration/);
  }
  const lint = spawnSync(process.execPath, ['skills/uttori-llm-wiki/scripts/lint.mjs', wikiRoot, directory], { encoding: 'utf8' });
  t.is(lint.status, 0, lint.stderr);

  const server = app.listen(0, '127.0.0.1');
  const reader = new Client({ name: 'capture-citations-test', version: '1.0.0' });
  const guest = new Client({ name: 'capture-citations-guest', version: '1.0.0' });
  t.teardown(async () => {
    await Promise.all([reader.close(), guest.close()]);
    await new Promise(resolve => server.close(resolve));
  });
  await once(server, 'listening');
  const url = new URL(`http://127.0.0.1:${server.address().port}/mcp`);
  await reader.connect(new StreamableHTTPClientTransport(url, { requestInit: { headers: auth } }));
  await guest.connect(new StreamableHTTPClientTransport(url));
  t.false((await guest.listTools()).tools.some(tool => tool.name === 'verifyCitation'));
  t.true((await guest.callTool({ name: 'verifyCitation', arguments: citations[0].input })).isError);

  const local = (input, archive = [directory]) => spawnSync(process.execPath,
    ['skills/uttori-llm-wiki/scripts/verify-citation.mjs', wikiRoot, ...archive], { input: JSON.stringify(input), encoding: 'utf8' });
  const hosted = async input => {
    const result = await reader.callTool({ name: 'verifyCitation', arguments: input });
    t.false(result.isError);
    return JSON.parse(result.content[0].text);
  };
  for (const { original, draft, input } of citations) {
    const { sourceSlug, sha256 } = input;
    const source = await reader.callTool({ name: 'getDocument', arguments: { slug: sourceSlug } });
    t.is(JSON.parse(source.content[0].text).source.sha256, sha256);
    const verdict = local(input);
    t.is(verdict.status, 0, verdict.stderr);
    const textPath = path.join(path.dirname(original), 'citation.txt');
    const originalText = await readFile(textPath);
    const line = originalText.toString().split(/\r\n|[\r\n]/).findIndex(text => text === input.quote) + 1;
    t.true(line > 0);
    const receipt = JSON.parse(verdict.stdout);
    t.deepEqual(receipt, { sourceSlug, sha256, status: 'verified', startLine: line, endLine: line });
    t.deepEqual(await hosted(input), receipt);
    t.is((await hosted({ ...input, quote: draft })).status, 'mismatch');
    t.is(JSON.parse(local(input, []).stdout).reason, 'source_unavailable');

    await fs.appendFile(textPath, '\nchanged citation text');
    t.is((await hosted(input)).reason, 'revision_mismatch');
    await rm(textPath);
    t.is((await hosted(input)).reason, 'source_unavailable');
    await writeFile(textPath, originalText);
    await fs.appendFile(original, '\nchanged original bytes');
    t.is(JSON.parse(local(input).stdout).reason, 'revision_mismatch');
    t.is((await hosted(input)).reason, 'revision_mismatch');
    await rm(original);
    const unavailable = { sourceSlug, sha256, status: 'unavailable', reason: 'source_unavailable' };
    t.deepEqual(JSON.parse(local(input).stdout), unavailable);
    t.deepEqual(await hosted(input), unavailable);
  }
});
