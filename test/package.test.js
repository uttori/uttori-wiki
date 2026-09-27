import fs from 'node:fs/promises';
import test from 'ava';

const root = new URL('../', import.meta.url);
const manifest = JSON.parse(await fs.readFile(new URL('package.json', root), 'utf8'));

test('public package entry points resolve to emitted JavaScript and declarations', async (t) => {
  t.is(manifest.main, 'dist/index.js');
  t.is(manifest.module, manifest.main);
  for (const [subpath, entry] of Object.entries(manifest.exports)) {
    const specifier = subpath === '.' ? manifest.name : `${manifest.name}${subpath.slice(1)}`;
    t.regex(entry.import, /^\.\/dist\/.+\.js$/);
    t.regex(entry.types, /^\.\/dist\/.+\.d\.ts$/);
    // TypeScript must encounter the declaration condition before the runtime condition.
    t.is(Object.keys(entry)[0], 'types');
    t.is(import.meta.resolve(specifier), new URL(entry.import, root).href);
    await fs.access(new URL(entry.types, root));
    await t.notThrowsAsync(import(specifier), specifier);
  }
});

test('published declarations retain JSDoc and map to shipped TypeScript sources', async (t) => {
  const config = await fs.readFile(new URL('dist/config.d.ts', root), 'utf8');
  const configTypes = await fs.readFile(new URL('dist/types/config.d.ts', root), 'utf8');
  const wiki = await fs.readFile(new URL('dist/wiki.d.ts', root), 'utf8');
  t.regex(config, /export type.*UttoriWikiConfig.*types\/config\.js/);
  t.regex(configTypes, /\/\*\* Slug of the root `\/` page document\. \*\/\s*homePage\?: string;/);
  t.regex(wiki, /@param config A configuration object\./);
  t.regex(wiki, /@example/);
  const map = JSON.parse(await fs.readFile(new URL('dist/wiki.d.ts.map', root), 'utf8'));
  t.deepEqual(map.sources, ['../src/wiki.ts']);
  const typeMap = JSON.parse(await fs.readFile(new URL('dist/types/config.d.ts.map', root), 'utf8'));
  t.deepEqual(typeMap.sources, ['../../src/types/config.ts']);
  t.true(manifest.files.includes('src'));
  await fs.access(new URL('src/wiki.ts', root));
  await fs.access(new URL('src/types/config.ts', root));
});
