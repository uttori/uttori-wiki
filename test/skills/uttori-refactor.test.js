import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'ava';
import StorageProvider from '../../dist/plugins/storeage-provider-json/storage-provider-file.js';

const script = fileURLToPath(new URL('../../skills/uttori-llm-wiki/scripts/refactor.mjs', import.meta.url));
const linter = fileURLToPath(new URL('../../skills/uttori-llm-wiki/scripts/lint.mjs', import.meta.url));

test('local refactors guard the corpus and preserve link meaning through rename and merge', async t => {
  const root = await mkdtemp(path.join(tmpdir(), 'uttori-refactor-'));
  t.teardown(() => rm(root, { recursive: true, force: true }));
  const directory = path.join(root, 'content');
  const raw = path.join(root, 'raw');
  await Promise.all([mkdir(directory), mkdir(raw)]);
  const settings = path.join(root, 'settings.json');
  await writeFile(settings, JSON.stringify({ publicUrl: 'https://wiki.example/wiki', renderer: { markdownIt: { uttori: { toc: { stableIds: true } } } } }));

  /**
   * Write a live sidecar pair as it would be read by Uttori.
   * @param {string} slug Canonical filename and route.
   * @param {string} content Markdown body.
   * @param {Record<string, unknown>} metadata Extra page fields.
   */
  async function page(slug, content, metadata = {}) {
    await Promise.all([
      writeFile(path.join(directory, slug + '.md'), content),
      writeFile(path.join(directory, slug + '.json'), JSON.stringify({ slug, title: slug, ...metadata })),
    ]);
  }

  const body = [
    '[direct](old-topic#shared)', '[[Old Topic]]', '[[old-alias|Alias label]]',
    '[reference][r]', '', '[r]: /wiki/old-topic/?view=full#shared "Title"',
    '', '<https://wiki.example/wiki/old-topic>', '[outside](https://other.example/wiki/old-topic)',
    '', '`[code](old-topic)`', '', '```md', '[fenced](old-topic)', '```',
  ].join('\n') + '\n';
  const quoted = 'See [the original heading](old-topic#shared).';
  const sha256 = createHash('sha256').update(quoted).digest('hex');
  const sourceSlug = `source-${sha256.slice(0, 16)}`;
  await Promise.all([
    writeFile(path.join(raw, 'original.md'), quoted),
    page(sourceSlug, `> ${quoted}\n\n[Maintainer backlink](old-topic#shared)\n`, { wikiKind: 'source', source: { path: 'original.md', sha256 } }),
    page('old-topic', '## Shared\n\nOld body. [Self](#shared)\n', { redirects: ['old-alias'], tags: ['old'] }),
    page('survivor', `## Shared\n\nTarget body. [Evidence](${sourceSlug})\n`, { tags: ['target'], wikiKind: 'topic' }),
    page('wiki-index', `[Original](old-topic)\n\n[Survivor](survivor)\n\n[Source note](${sourceSlug})\n`),
    page('wiki-log', '# Wiki log\n'),
    page('backlinks', body),
  ]);

  const preview = (mode, from, to) => spawnSync(process.execPath, [script, 'preview', root, mode, from, to, settings], { encoding: 'utf8' });
  const apply = review => spawnSync(process.execPath, [script, 'apply', root], { encoding: 'utf8', input: review.stdout });
  const initial = preview('rename', 'old-topic', 'new-topic');
  t.is(initial.status, 0, initial.stderr);
  t.is(await readFile(path.join(directory, 'backlinks.md'), 'utf8'), body);

  // An added page was absent from the preview but can introduce another inbound link.
  await page('late-link', '[Late](old-topic)\n');
  t.regex(apply(initial).stderr, /changed.*new preview/i);
  const rename = preview('rename', 'old-topic', 'new-topic');
  const moved = apply(rename);
  t.is(moved.status, 0, moved.stderr);
  const renamed = await readFile(path.join(directory, 'backlinks.md'), 'utf8');
  t.true(renamed.includes('[direct](new-topic#shared)'));
  t.true(renamed.includes('[[new-topic|Old Topic]]'));
  t.true(renamed.includes('[[new-topic|Alias label]]'));
  t.true(renamed.includes('[r]: /wiki/new-topic/?view=full#shared "Title"'));
  t.true(renamed.includes('<https://wiki.example/wiki/new-topic>'));
  t.true(renamed.includes('[outside](https://other.example/wiki/old-topic)'));
  t.true(renamed.includes('`[code](old-topic)`'));
  t.true(renamed.includes('[fenced](old-topic)'));
  t.is(await readFile(path.join(directory, 'late-link.md'), 'utf8'), '[Late](new-topic)\n');

  const merge = preview('merge', 'new-topic', 'survivor');
  t.is(merge.status, 0, merge.stderr);
  const merged = apply(merge);
  t.is(merged.status, 0, merged.stderr);
  const provider = new StorageProvider({ contentDirectory: directory, sidecarContentExtension: 'md', useHistory: false });
  const survivor = await provider.get('survivor');
  t.deepEqual(survivor.redirects, ['new-topic', 'old-alias', 'old-topic']);
  t.deepEqual(survivor.tags, ['target', 'old']);
  t.true(survivor.content.includes('Target body.'));
  t.true(survivor.content.includes('Old body. [Self](#shared-2)'));
  t.true((await readFile(path.join(directory, 'backlinks.md'), 'utf8')).includes('[direct](survivor#shared-2)'));
  t.is((await provider.get(sourceSlug)).content, `> ${quoted}\n\n[Maintainer backlink](survivor#shared-2)\n`);
  t.is(await readFile(path.join(raw, 'original.md'), 'utf8'), quoted);
  t.false((await readdir(directory)).some(file => /^(old-topic|new-topic)\./.test(file)));
  const aliases = await provider.getQuery('SELECT * FROM documents WHERE redirects INCLUDES ("old-topic") ORDER BY slug ASC LIMIT -1');
  t.deepEqual(aliases.map(record => record.slug), ['survivor']);
  const lint = spawnSync(process.execPath, [linter, root], { encoding: 'utf8' });
  t.is(lint.status, 0, lint.stderr);

  // The second reference would inherit the first title even though both URLs are the same.
  await Promise.all([
    page('reference-source', '[Source][r]\n\n[r]: survivor "Source title"\n'),
    page('reference-target', '[Target][r]\n\n[r]: survivor "Target title"\n'),
  ]);
  t.regex(preview('merge', 'reference-source', 'reference-target').stderr, /shared reference definitions/);
});
