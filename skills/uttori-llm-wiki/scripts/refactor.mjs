import { createHash } from 'node:crypto';
import { cp, mkdir, mkdtemp, readFile, readdir, realpath, rename, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { text } from 'node:stream/consumers';
import StorageProvider from '../../../dist/plugins/storeage-provider-json/storage-provider-file.js';
import { planDocumentRefactor } from '../../../dist/plugins/utilities/document-refactor.js';

/** @typedef {import('../../../dist/plugins/utilities/document-refactor.js').RefactorOptions} RefactorOptions */
/**
 * The saved preview. Apply recomputes it from storage before trusting any replacement.
 * @typedef {{ root: string, request: import('../../../dist/plugins/utilities/document-refactor.js').RefactorRequest, options: RefactorOptions, version: string, changes: {after: import('../../../dist/wiki.js').UttoriWikiDocument}[] }} Review
 */

/**
 * Fingerprint exact bytes, including JSON formatting and any new page that could add a backlink.
 * @param {string} directory Content directory inside the checkout.
 * @returns {Promise<string>} A digest of the complete sidecar corpus.
 */
async function fingerprint(directory) {
  if (await realpath(directory) !== directory) throw new Error('The content directory must be inside the checkout.');
  const hash = createHash('sha256');
  const entries = (await readdir(directory, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name));
  for (const entry of entries) {
    if (!/\.(md|json)$/.test(entry.name)) continue;
    if (!entry.isFile()) throw new Error(`Sidecar must be a regular file: ${entry.name}`);
    const bytes = await readFile(path.join(directory, entry.name));
    hash.update(JSON.stringify([entry.name, createHash('sha256').update(bytes).digest('hex')]));
  }
  return hash.digest('hex');
}

/**
 * Compute the exact review document from the current checkout.
 * @param {string} root Real wiki root containing content/.
 * @param {import('../../../dist/plugins/utilities/document-refactor.js').RefactorRequest} request Slugs and refactor mode.
 * @param {import('../../../dist/plugins/utilities/document-refactor.js').RefactorOptions} options Actual site routing and Markdown settings.
 * @param {string} [expectedVersion] Reject edits to the approved corpus before recomputing the plan.
 * @returns {Promise<object>} Review document to pass unchanged to apply.
 */
async function preview(root, request, options, expectedVersion) {
  const directory = path.join(root, 'content');
  const version = await fingerprint(directory);
  if (expectedVersion !== undefined && version !== expectedVersion) throw new Error('The checkout changed. Create a new preview.');
  const provider = new StorageProvider({ contentDirectory: directory, sidecarContentExtension: 'md', useHistory: false });
  const plan = planDocumentRefactor(Object.values(await provider.all()), request, options);
  return { root, request, options, version, retired: plan.retired, changes: plan.changes };
}

/**
 * Build the full replacement directory before touching live sidecars. A lock excludes other CLI applies.
 * @param {string} root Real wiki root containing content/.
 * @param {Review} review The previously reviewed JSON.
 */
async function apply(root, review) {
  const lock = path.join(root, '.uttori-refactor-lock');
  await mkdir(lock);
  let stage;
  let preserveStage = false;
  try {
    if (review.root !== root) throw new Error('The review belongs to a different checkout. Create a new preview.');
    const current = await preview(root, review.request, review.options, review.version);
    if (JSON.stringify(review) !== JSON.stringify(current)) throw new Error('The checkout or review changed. Create a new preview.');
    const directory = path.join(root, 'content');
    stage = await mkdtemp(path.join(root, '.uttori-refactor-'));
    const next = path.join(stage, 'next');
    const backup = path.join(stage, 'previous');
    await cp(directory, next, { recursive: true, verbatimSymlinks: true, preserveTimestamps: true });
    for (const { after } of review.changes) {
      const { slug, content, ...metadata } = after;
      await writeFile(path.join(next, slug + '.md'), content);
      await writeFile(path.join(next, slug + '.json'), JSON.stringify({ slug, ...metadata }, null, 2) + '\n');
    }
    await rm(path.join(next, review.request.from + '.md'));
    await rm(path.join(next, review.request.from + '.json'));

    // Recheck after staging so a new backlink cannot slip in during the copy.
    if (await fingerprint(directory) !== review.version) throw new Error('The checkout changed during apply. Create a new preview.');
    await rename(directory, backup);
    try {
      await rename(next, directory);
    } catch (error) {
      try {
        await rename(backup, directory);
      } catch {
        preserveStage = true;
        throw new Error(`Could not restore content/. The original directory is at ${backup}.`, { cause: error });
      }
      throw error;
    }
  } finally {
    if (stage && !preserveStage) await rm(stage, { recursive: true, force: true });
    await rm(lock, { recursive: true, force: true });
  }
}

try {
  const [command, wikiRoot, mode, from, to, settings, extra] = process.argv.slice(2);
  if (!wikiRoot || extra) throw new Error('Usage: refactor.mjs preview <wiki-root> <rename|merge> <from> <to> [settings.json], or refactor.mjs apply <wiki-root> < review.json');
  const root = await realpath(wikiRoot);
  if (command === 'preview' && (mode === 'rename' || mode === 'merge') && from && to) {
    const options = settings ? /** @type {RefactorOptions} */ (JSON.parse(await readFile(settings, 'utf8'))) : {};
    console.log(JSON.stringify(await preview(root, { mode, from, to }, options), null, 2));
  } else if (command === 'apply' && !mode) {
    const review = /** @type {Review} */ (JSON.parse(await text(process.stdin)));
    await apply(root, review);
    console.log(JSON.stringify({ status: 'complete', destination: review.request.to, redirected: review.request.from }));
  } else {
    throw new Error('Expected preview with a mode and two slugs, or apply with review JSON on stdin.');
  }
} catch (error) {
  console.error(`Refactor failed: ${error.message}`);
  process.exitCode = 1;
}
