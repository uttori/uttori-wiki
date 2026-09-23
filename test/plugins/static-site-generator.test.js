import test from 'ava';
import express from 'express';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import StaticSiteGenerator from '../../src/plugins/static-site-generator.js';

test('export validates links and retains the previous complete build', async (t) => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'uttori-static-'));
  const outputDirectory = path.join(directory, 'dist');
  const app = express();
  let broken = false;
  app.get('/', (_request, response) => response.type('html').send('<a href="/guide/#section">Guide</a>'));
  app.get('/guide/', (_request, response) => response.type('html').send(broken ? '<h2 id="different">Guide</h2>' : '<h2 id="section">Guide</h2>'));
  const routes = [{ url: '/' }, { url: '/guide/' }];
  try {
    await StaticSiteGenerator.build({ app, routes, outputDirectory, canonicalOrigin: 'https://example.org' });
    t.is(await fs.readFile(path.join(outputDirectory, 'guide', 'index.html'), 'utf8'), '<h2 id="section">Guide</h2>');
    t.is((await fs.readFile(path.join(outputDirectory, 'sitemap.xml'), 'utf8')).match(/<loc>/g)?.length, 2);
    broken = true;
    await t.throwsAsync(StaticSiteGenerator.build({ app, routes, outputDirectory }), { message: /Missing fragment/ });
    t.is(await fs.readFile(path.join(outputDirectory, 'guide', 'index.html'), 'utf8'), '<h2 id="section">Guide</h2>');
    broken = false;
    await StaticSiteGenerator.build({ app, routes, outputDirectory, canonicalOrigin: 'https://example.org' });
    t.is(await fs.readFile(path.join(`${outputDirectory}.previous`, 'guide', 'index.html'), 'utf8'), '<h2 id="section">Guide</h2>');
    t.is((await fs.readFile(path.join(outputDirectory, 'sitemap.xml'), 'utf8')).match(/<loc>/g)?.length, 2);
  } finally {
    await fs.rm(directory, { recursive: true, force: true });
  }
});

test('route output rejects traversal and collisions', (t) => {
  t.throws(() => StaticSiteGenerator.outputPath({ url: '/guide/../' }), { message: /Unsafe|Duplicate/ });
  t.throws(() => StaticSiteGenerator.outputPath({ url: '/guide', output: '../guide.html' }), { message: /Unsafe/ });
  t.is(StaticSiteGenerator.outputPath({ url: '/guide/' }), 'guide/index.html');
});

test('export rejects asset and generated-file collisions before promotion', async (t) => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'uttori-static-collision-'));
  try {
    const options = { app: express(), routes: [{ url: '/guide/' }], outputDirectory: path.join(directory, 'dist') };
    await t.throwsAsync(StaticSiteGenerator.build({ ...options, assets: [{ source: directory, target: 'guide' }] }), { message: /Asset overlaps/ });
    await t.throwsAsync(StaticSiteGenerator.build({ ...options, assets: [{ source: directory, target: 'search-index.json' }], searchDocuments: [{}] }), { message: /Asset overlaps/ });
  } finally {
    await fs.rm(directory, { recursive: true, force: true });
  }
});

test('export rejects executable URLs from rendered pages', async (t) => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'uttori-static-link-'));
  const app = express();
  app.get('/', (_request, response) => response.type('html').send('<a href="javascript:alert(1)">bad</a>'));
  try {
    await t.throwsAsync(StaticSiteGenerator.build({ app, routes: [{ url: '/' }], outputDirectory: path.join(directory, 'dist') }), { message: /Unsafe local link/ });
  } finally {
    await fs.rm(directory, { recursive: true, force: true });
  }
});
