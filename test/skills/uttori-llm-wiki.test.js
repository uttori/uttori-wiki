import { execFile, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import test from 'ava';

const run = promisify(execFile);
const checker = fileURLToPath(new URL('../../skills/uttori-llm-wiki/scripts/lint.mjs', import.meta.url));
const verifier = fileURLToPath(new URL('../../skills/uttori-llm-wiki/scripts/verify-citation.mjs', import.meta.url));

test('skill lint checks served links, catalog membership, and archived evidence', async (t) => {
  const root = await mkdtemp(path.join(tmpdir(), 'uttori-skill-'));
  t.teardown(() => rm(root, { recursive: true, force: true }));
  const raw = path.join(root, 'raw');
  const content = path.join(root, 'content');
  await Promise.all([mkdir(raw), mkdir(content)]);

  const original = '# Field report\n\nThe sensor threshold is 12.\n';
  const digest = createHash('sha256').update(original).digest('hex');
  const sourceSlug = `source-${digest.slice(0, 16)}`;
  const sourceFile = path.join(raw, 'field-report.md');
  await writeFile(sourceFile, original);

  /**
   * Write a fixture in the same two-file format the serving provider reads.
   * @param {string} slug Filename stem and page ID.
   * @param {string} markdown Page body.
   * @param {Record<string, unknown>} metadata Additional page fields.
   * @returns {Promise<void>} Resolves when both files have been written.
   */
  async function writePair(slug, markdown, metadata = {}) {
    await Promise.all([
      writeFile(path.join(content, `${slug}.md`), markdown),
      writeFile(path.join(content, `${slug}.json`), JSON.stringify({ slug, title: slug, ...metadata })),
    ]);
  }

  await Promise.all([
    writePair('wiki-index', `- [[Sensor threshold]]\n- [Field report](${sourceSlug})\n`),
    writePair('wiki-log', '# Operation log\n'),
    writePair(sourceSlug, 'Informed [[Sensor threshold]].\n', {
      wikiKind: 'source', source: { path: 'field-report.md', sha256: digest },
    }),
    writePair('sensor-threshold', `The threshold is 12. [Field report, line 3](${sourceSlug}#field-report)\n\n\`[example](fake-target)\`\n`, { wikiKind: 'topic' }),
  ]);
  const passed = await run(process.execPath, [checker, root]);
  t.regex(passed.stdout, /structural lint passed/);

  await Promise.all([
    writeFile(sourceFile, `${original}\nChanged.`),
    writeFile(path.join(content, 'wiki-index.md'), `- [Field report](${sourceSlug})\n`),
    writeFile(path.join(content, 'sensor-threshold.md'), 'See [[Missing page]].\n'),
  ]);
  const invalid = await t.throwsAsync(run(process.execPath, [checker, root]), { code: 1 });
  t.regex(invalid.stderr, /SHA-256 mismatch: field-report.md/);
  t.regex(invalid.stderr, /sensor-threshold: broken page link to missing-page/);
  t.regex(invalid.stderr, /sensor-threshold: missing from wiki-index/);
  t.regex(invalid.stderr, /sensor-threshold: missing a source-note citation/);
  t.true(invalid.stderr.includes(`${sourceSlug}: orphan page`));

  // A source locator must stay in the private archive even when the target's bytes match.
  await writeFile(path.join(root, 'outside.md'), original);
  await writePair(sourceSlug, 'Informed [[Sensor threshold]].\n', {
    wikiKind: 'source', source: { path: '../outside.md', sha256: digest },
  });
  const escaped = await t.throwsAsync(run(process.execPath, [checker, root]), { code: 1 });
  t.regex(escaped.stderr, /source path must name a Markdown file relative to raw\//);

  await rm(path.join(content, 'wiki-log.md'));
  const missing = await t.throwsAsync(run(process.execPath, [checker, root]), { code: 1 });
  t.regex(missing.stderr, /Missing or unreadable content.*wiki-log\.md/);
});

test('local citation CLI checks literal wording, line bounds, and the exact original revision', async (t) => {
  const root = await mkdtemp(path.join(tmpdir(), 'uttori-citation-'));
  t.teardown(() => rm(root, { recursive: true, force: true }));
  const raw = path.join(root, 'raw');
  const content = path.join(root, 'content');
  await Promise.all([mkdir(raw), mkdir(content)]);

  const quote = 'Approved wording.\r\nNo caveat on this line.';
  const original = `# Trial\r\n\r\n${quote}\r\n`;
  const sha256 = createHash('sha256').update(original).digest('hex');
  const sourceSlug = `source-${sha256.slice(0, 16)}`;
  const sourcePath = path.join(raw, 'trial.md');
  await Promise.all([
    writeFile(sourcePath, original),
    writeFile(path.join(content, `${sourceSlug}.md`), 'A summary containing a fabricated quotation.'),
    writeFile(path.join(content, `${sourceSlug}.json`), JSON.stringify({
      slug: sourceSlug, title: 'Trial', wikiKind: 'source', source: { path: 'trial.md', sha256 },
    })),
  ]);

  /**
   * Exercise the installed skill command through its JSON stdin and exit status.
   * @param {Record<string, unknown>} overrides Candidate quote or range overrides.
   * @returns {{ code: number | null, receipt: Record<string, unknown> }} Parsed CLI result.
   */
  function verify(overrides = {}) {
    const result = spawnSync(process.execPath, [verifier, root], {
      input: JSON.stringify({ sourceSlug, sha256, quote, startLine: 3, endLine: 4, ...overrides }),
      encoding: 'utf8',
    });
    return { code: result.status, receipt: JSON.parse(result.stdout) };
  }

  t.deepEqual(verify(), {
    code: 0, receipt: { sourceSlug, sha256, status: 'verified', startLine: 3, endLine: 4 },
  });
  t.is(verify({ quote: quote.replace('\r\n', '\n') }).receipt.status, 'mismatch');
  t.is(verify({ quote: 'fabricated quotation' }).receipt.status, 'mismatch');
  t.is(verify({ startLine: 2, endLine: 3 }).receipt.status, 'mismatch');
  await writeFile(sourcePath, original + 'A new edition retains the old words.');
  t.deepEqual(verify(), { code: 1, receipt: { sourceSlug, sha256, status: 'unavailable', reason: 'revision_mismatch' } });
  await rm(sourcePath);
  t.deepEqual(verify(), { code: 1, receipt: { sourceSlug, sha256, status: 'unavailable', reason: 'source_unavailable' } });
});
