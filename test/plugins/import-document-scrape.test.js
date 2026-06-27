import test from 'ava';
import sinon from 'sinon';
import fs from 'fs';
import child_process from 'node:child_process';
import { EventEmitter } from 'node:events';

import ImportDocument from '../../src/plugins/import-document.js';

/** @type {sinon.SinonSandbox} */
let sandbox;

/** @param {{ wgetError?: boolean, failPandocForHtml?: string[] }} [options] */
function stubScrapeCmd(sandbox, options = {}) {
  const { wgetError = false, failPandocForHtml = [] } = options;
  return sandbox.stub(child_process, 'execFile').callsFake((file, args) => {
    if (file === 'wget') {
      if (wgetError) {
        const proc = new EventEmitter();
        proc.stdout = new EventEmitter();
        proc.stderr = new EventEmitter();
        proc.kill = sandbox.stub();
        setImmediate(() => proc.emit('error', new Error('wget failed')));
        return proc;
      }
      return /** @type {any} */ ('TEST');
    }
    if (file === 'pandoc') {
      const htmlPath = args?.[args.length - 1] ?? '';
      if (failPandocForHtml.some((name) => htmlPath.endsWith(name))) {
        const proc = new EventEmitter();
        proc.stdout = new EventEmitter();
        proc.stderr = new EventEmitter();
        proc.kill = sandbox.stub();
        setImmediate(() => proc.emit('exit', 1));
        return proc;
      }
      return /** @type {any} */ ('TEST');
    }
    return /** @type {any} */ ('TEST');
  });
}

/** @param {() => Promise<unknown>} run */
async function withoutScrapeDelay(run) {
  const original = global.setTimeout;
  global.setTimeout = ((fn) => {
    fn();
    return 0;
  });
  try {
    return await run();
  } finally {
    global.setTimeout = original;
  }
}

test.beforeEach(() => {
  sandbox = sinon.createSandbox();
});

test.afterEach(() => {
  sandbox.restore();
});

test.serial('processPage: scrape continues when wget fails', async (t) => {
  stubScrapeCmd(sandbox, { wgetError: true });
  sandbox.stub(fs.promises, 'readdir').resolves(['index.html']);
  sandbox.stub(fs.promises, 'readFile').resolves('Recovered markdown');

  const result = await withoutScrapeDelay(() => ImportDocument.processPage({
    uploadDirectory: '/tmp',
    uploadPath: 'uploads',
    downloadFile: () => {},
  }, 'test-document', {
    url: 'https://example.com',
    name: 'index.html',
    type: 'scrape',
  }));

  t.true(result.content.includes('Recovered markdown'));
});

test.serial('processPage: scrape skips non-html and favicon files', async (t) => {
  stubScrapeCmd(sandbox);
  sandbox.stub(fs.promises, 'readdir').resolves(['style.css', 'favicon.html', 'index.html', 'page.htm']);
  const readFile = sandbox.stub(fs.promises, 'readFile').callsFake(async (filePath) => {
    if (String(filePath).endsWith('index.md')) return 'Index markdown';
    if (String(filePath).endsWith('page.md')) return 'Page markdown';
    throw new Error(`unexpected read: ${filePath}`);
  });

  const result = await withoutScrapeDelay(() => ImportDocument.processPage({
    uploadDirectory: '/tmp',
    uploadPath: 'uploads',
    downloadFile: () => {},
  }, 'test-document', {
    url: 'https://example.com',
    name: 'index.html',
    type: 'scrape',
  }));

  t.true(result.content.includes('Index markdown'));
  t.true(result.content.includes('Page markdown'));
  t.false(result.content.includes('favicon'));
  t.is(readFile.callCount, 2);
});

test.serial('processPage: scrape continues when pandoc fails for one file', async (t) => {
  stubScrapeCmd(sandbox, { failPandocForHtml: ['bad.html'] });
  sandbox.stub(fs.promises, 'readdir').resolves(['bad.html', 'good.html']);
  sandbox.stub(fs.promises, 'readFile').callsFake(async (filePath) => {
    if (String(filePath).endsWith('good.md')) return 'Good markdown';
    throw new Error(`unexpected read: ${filePath}`);
  });

  const result = await withoutScrapeDelay(() => ImportDocument.processPage({
    uploadDirectory: '/tmp',
    uploadPath: 'uploads',
    downloadFile: () => {},
  }, 'test-document', {
    url: 'https://example.com',
    name: 'index.html',
    type: 'scrape',
  }));

  t.true(result.content.includes('Good markdown'));
  t.false(result.content.includes('bad'));
});

test.serial('processPage: scrape skips content when markdown read fails', async (t) => {
  stubScrapeCmd(sandbox);
  sandbox.stub(fs.promises, 'readdir').resolves(['fail.html', 'ok.html']);
  sandbox.stub(fs.promises, 'readFile').callsFake(async (filePath) => {
    if (String(filePath).endsWith('fail.md')) throw new Error('read failed');
    if (String(filePath).endsWith('ok.md')) return 'OK markdown';
    throw new Error(`unexpected read: ${filePath}`);
  });

  const result = await withoutScrapeDelay(() => ImportDocument.processPage({
    uploadDirectory: '/tmp',
    uploadPath: 'uploads',
    downloadFile: () => {},
  }, 'test-document', {
    url: 'https://example.com',
    name: 'index.html',
    type: 'scrape',
  }));

  t.true(result.content.includes('OK markdown'));
  t.false(result.content.includes('fail'));
});

test.serial('processPage: scrape converts html files with cmd', async (t) => {
  stubScrapeCmd(sandbox);
  sandbox.stub(fs.promises, 'readdir').resolves(['index.html']);
  sandbox.stub(fs.promises, 'readFile').resolves('Converted markdown content');

  const result = await withoutScrapeDelay(() => ImportDocument.processPage({
    uploadDirectory: '/tmp',
    uploadPath: 'uploads',
    downloadFile: () => {},
  }, 'test-document', {
    url: 'https://example.com',
    name: 'index.html',
    type: 'scrape',
  }));

  t.true(result.content.includes('Converted markdown content'));
  t.true(child_process.execFile.called);
});
