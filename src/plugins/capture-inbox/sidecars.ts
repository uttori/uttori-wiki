import { chmod, cp, lstat, mkdtemp, readFile, readdir, realpath, rename, rm } from 'node:fs/promises';
import path from 'node:path';
import type { UttoriContext } from '../../custom.js';
import { availableDocumentSlug } from '../../document-write.js';
import type { UttoriWikiDocument } from '../../wiki.js';
import MarkdownItRenderer from '../renderer-markdown-it.js';
import { readArchivedSource, type CapturedSource } from '../utilities/source-citations.js';
import { previousSidecars, directoryIdentity } from '../storeage-provider-json/sidecar-generation.js';
import { CaptureError, writeCheckpoint } from './files.js';

const indexSlug = 'wiki-index';
const logSlug = 'wiki-log';

/** The exact checkout changes shown in the browser. Null denotes a new file. */
interface SidecarFile {
  name: string;
  before: string | null;
  after: string;
}

/** Approval and completion are checkpointed separately from the individual file replacements. */
export interface SidecarReview {
  directory: string;
  sourceSlug: string;
  /** The archive pinned by the source note, which may predate this capture of the same bytes. */
  source: CapturedSource;
  files: SidecarFile[];
  /** Pages whose slugs must still be free of routes and aliases at the first write. */
  newSlugs: string[];
  /** Directory identities distinguish a committed swap from one that still needs promotion after a restart. */
  swap?: { stage: string; previous: string; next: string; legacyPartial?: boolean };
  approved?: boolean;
  stored?: boolean;
  indexed?: boolean;
}

/** Keep exact file bytes for comparison even though the browser shows decoded text. */
async function readSidecar(file: string): Promise<string | null> {
  try {
    if (!(await lstat(file)).isFile()) throw new CaptureError(409, 'A reviewed sidecar is not a regular file.');
    return new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(await readFile(file));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null;
    throw error;
  }
}

/** Read both partners for a review and refuse an incomplete checkout. */
async function readPair(directory: string, slug: string) {
  const markdown = await readSidecar(path.join(directory, `${slug}.md`));
  const json = await readSidecar(path.join(directory, `${slug}.json`));
  if ((markdown === null) !== (json === null)) throw new CaptureError(409, `The ${slug} sidecar pair is incomplete.`);
  const document = json === null ? undefined : { ...JSON.parse(json), content: markdown } as UttoriWikiDocument;
  return { slug, markdown, json, document };
}

/** Preserve unchanged metadata bytes, including the checkout's formatting. */
function changePair(before: Awaited<ReturnType<typeof readPair>>, after: UttoriWikiDocument): SidecarFile[] {
  const { content, ...metadata } = after;
  const next = JSON.stringify(metadata, null, 2);
  let json = `${next}\n`;
  if (before.json !== null && JSON.stringify(JSON.parse(before.json), null, 2) === next) json = before.json;
  return [
    { name: `${before.slug}.md`, before: before.markdown, after: content },
    { name: `${before.slug}.json`, before: before.json, after: json },
  ];
}

/** Preserve existing text and append only the separator needed for a new block. */
function appendBlock(content: string, block: string): string {
  if (!content) return `${block}\n`;
  const eol = content.includes('\r\n') ? '\r\n' : '\n';
  let separator = '';
  if (!content.endsWith(eol + eol)) separator = content.endsWith(eol) ? eol : eol + eol;
  return content + separator + block.replaceAll('\n', eol) + eol;
}

/** Append a citation only if the renderer does not already recognize a link to the same slug. */
function linkPage(content: string, label: string, slug: string): string {
  const links = MarkdownItRenderer.parse(content).flatMap(token => token.children ?? []);
  if (links.some(token => {
    const href = token.attrGet('href');
    return token.type === 'link_open' && typeof href === 'string' && href.split('#')[0] === slug;
  })) return content;
  return appendBlock(content, `- [${label}](${slug})`);
}

/**
 * Build the source, topic, catalog and log edits that approval will apply as a single reviewed set.
 * @param context Wiki with the sidecar checkout mounted as read-only storage.
 * @param directory Canonical content directory validated at registration.
 * @param captureDirectory Private archive used to verify both captured and reused evidence.
 * @param draft Maintainer's proposed topic content.
 * @param source Provenance from the original importer output.
 * @returns Exact before/after bytes and source identity, ready to show in the browser.
 */
export async function planSidecars(
  context: UttoriContext, directory: string, captureDirectory: string,
  draft: Pick<UttoriWikiDocument, 'slug' | 'title' | 'content'>, source: CapturedSource,
): Promise<SidecarReview> {
  const sourceSlug = `source-${source.sha256.slice(0, 16)}`;
  if (draft.slug === indexSlug || draft.slug === logSlug || draft.slug.startsWith('source-')) {
    throw new CaptureError(400, 'Choose a topic slug outside the reserved source, catalog, and log names.');
  }
  if (await realpath(directory) !== directory) throw new CaptureError(409, 'The sidecar directory changed.');
  const [topic, note, index, log] = await Promise.all([draft.slug, sourceSlug, indexSlug, logSlug].map(slug => readPair(directory, slug)));
  if (!index.document || !log.document || index.document.wikiKind !== undefined || log.document.wikiKind !== undefined) {
    throw new CaptureError(409, 'Initialize the wiki-index and wiki-log sidecar pairs before publishing captures.');
  }
  if (topic.document?.wikiKind !== undefined && topic.document.wikiKind !== 'topic') {
    throw new CaptureError(409, 'The destination is already a managed page of another kind.');
  }
  const newSlugs = [topic, note].filter(pair => !pair.document).map(pair => pair.slug);
  for (const slug of newSlugs) {
    if (!(await availableDocumentSlug(context, slug))) throw new CaptureError(409, `The slug ${slug} belongs to a route or redirect.`);
  }

  const raw = path.join(directory, '..', 'raw');
  const expectedSource = { slug: sourceSlug, source };
  if ('reason' in await readArchivedSource(expectedSource, raw, undefined, captureDirectory)) {
    throw new CaptureError(409, 'The original or its importer text is unavailable for review.');
  }
  // Same original bytes reuse the existing source identity and its pinned quotation representation.
  if (note.document && (note.document.wikiKind !== 'source' || (note.document.source as CapturedSource | undefined)?.sha256 !== source.sha256
    || 'reason' in await readArchivedSource(note.document, raw, undefined, captureDirectory))) {
    throw new CaptureError(409, 'The existing source note conflicts with this capture or its archive is unavailable.');
  }

  const time = Date.now();
  const date = new Date(time).toISOString().slice(0, 10);
  const kind = source.format === 'pdf' ? 'PDF' : 'HTML';
  const defaults = { tags: [], createDate: time, updateDate: time };
  const nextTopic = {
    ...defaults, ...topic.document, ...draft, wikiKind: 'topic', updateDate: time,
    content: linkPage(draft.content, `Captured ${kind} source`, sourceSlug),
  };
  const filteredTopic = await context.hooks.filter<UttoriWikiDocument>('document-save', structuredClone(nextTopic), context);
  if (filteredTopic?.slug !== nextTopic.slug || filteredTopic.title !== nextTopic.title
    || filteredTopic.content !== nextTopic.content || filteredTopic.wikiKind !== 'topic') {
    throw new CaptureError(409, 'The wiki save filter changed the proposed topic, its slug, or its citation.');
  }
  // Rendered HTML belongs to the serving instance and is forbidden in sidecar metadata.
  delete filteredTopic.html;
  const nextNote = {
    ...defaults, slug: sourceSlug, title: `Captured ${kind} source`, wikiKind: 'source', source, ...note.document,
    content: linkPage(note.markdown ?? `This ${kind} original is held in the private Capture Inbox. Citation lines refer to the pinned importer text.\n`, 'Reviewed topic', draft.slug),
  };
  const nextIndex = {
    ...index.document,
    content: linkPage(linkPage(index.document.content, `${draft.slug} · topic`, draft.slug), `${sourceSlug} · source`, sourceSlug),
  };
  const nextLog = {
    ...log.document,
    content: appendBlock(log.document.content, `## ${date} ingest | ${sourceSlug}\n\nApproved a capture for [${draft.slug}](${draft.slug}) with [source provenance](${sourceSlug}).`),
  };
  return {
    directory, sourceSlug, source: nextNote.source, newSlugs,
    files: [...changePair(note, nextNote), ...changePair(topic, filteredTopic), ...changePair(index, nextIndex), ...changePair(log, nextLog)],
  };
}

/** Detect edits to unrelated files as well as reviewed ones while staging a complete checkout. */
async function checkoutVersion(directory: string): Promise<string> {
  const entries = await readdir(directory, { recursive: true, withFileTypes: true });
  const names = entries.map(entry => path.relative(directory, path.join(entry.parentPath, entry.name))).sort();
  return JSON.stringify(await Promise.all(names.map(async name => {
    const info = await lstat(path.join(directory, name), { bigint: true });
    return [name, `${info.dev}/${info.ino}/${info.ctimeNs}`];
  })));
}

/**
 * Stage a complete checkout and publish it with a single reader-visible commit point.
 * @param context Active wiki, used to recheck aliases before the first file replacement.
 * @param review Exact sidecar file changes displayed for approval.
 * @param confirm Persist the approval before touching any sidecar.
 */
export async function applySidecars(context: UttoriContext, review: SidecarReview, confirm: () => Promise<void>): Promise<void> {
  const { directory, files, newSlugs } = review;
  const backup = previousSidecars(directory);
  const backupId = await directoryIdentity(backup);
  const activeId = await directoryIdentity(directory);
  const swap = review.swap;
  if (backupId && backupId !== swap?.previous) throw new CaptureError(409, 'Another checkout occupies the publication backup path.');
  if (swap) {
    // Promotion may have succeeded just before the process lost its acknowledgement.
    if (activeId === swap.next) {
      if (backupId) await rm(backup, { recursive: true });
      return;
    }
    if (!activeId && backupId === swap.previous) await rename(backup, directory);
    else if (activeId !== swap.previous || backupId) throw new CaptureError(409, 'The reviewed checkout directory changed.');
    const stageId = await directoryIdentity(swap.stage);
    if (stageId && stageId !== swap.next) throw new CaptureError(409, 'The staging directory changed.');
    if (stageId) await rm(swap.stage, { recursive: true });
  }
  if (await realpath(directory) !== directory) throw new CaptureError(409, 'The sidecar directory changed.');
  const version = await checkoutVersion(directory);
  const current = await Promise.all(files.map(file => readSidecar(path.join(directory, file.name))));
  // Older checkpoints could have written a subset of the reviewed files in place.
  const legacyPartial = swap?.legacyPartial ?? (!swap && review.approved === true
    && files.some((file, index) => file.before !== file.after && current[index] === file.after));
  const conflict = files.find((file, index) => current[index] !== file.before && (!legacyPartial || current[index] !== file.after));
  if (conflict) {
    if (review.approved) throw new CaptureError(409, `The sidecar ${conflict.name} changed during publication. Reconcile the checkout before resuming.`);
    throw new CaptureError(409, `The sidecar ${conflict.name} changed after review. Review the draft again.`);
  }
  if (!legacyPartial) {
    for (const slug of newSlugs) {
      if (!(await availableDocumentSlug(context, slug))) {
        const next = review.approved ? 'Reconcile the checkout before resuming.' : 'Review the draft again.';
        throw new CaptureError(409, `The slug ${slug} now belongs to a route or redirect. ${next}`);
      }
    }
  }
  const previous = await directoryIdentity(directory);
  if (!previous) throw new CaptureError(409, 'The reviewed checkout directory disappeared.');
  const stage = await mkdtemp(path.join(path.dirname(directory), '.uttori-capture-'));
  const next = await directoryIdentity(stage);
  if (!next) throw new CaptureError(409, 'The staging directory disappeared.');
  review.swap = { stage, previous, next, legacyPartial };
  try {
    await confirm();
  } catch (error) {
    await rm(stage, { recursive: true });
    throw error;
  }
  await cp(directory, stage, { recursive: true, verbatimSymlinks: true, preserveTimestamps: true });
  for (const [index, file] of files.entries()) {
    if (current[index] !== file.after) await writeCheckpoint(path.join(stage, file.name), file.after);
  }
  await chmod(stage, (await lstat(directory)).mode);
  if (await directoryIdentity(directory) !== previous) {
    throw new CaptureError(409, 'The checkout changed while staging. Resume after reconciling any reviewed changes.');
  }
  await rename(directory, backup);
  try {
    // Check the displaced tree so an external edit during staging cannot be discarded at promotion.
    if (await checkoutVersion(backup) !== version) throw new CaptureError(409, 'The checkout changed while staging. Reconcile the edit before resuming.');
    // This rename is the commit point. Readers can open the previous tree until the new one is live.
    await rename(stage, directory);
  } catch (error) {
    await rename(backup, directory);
    throw error;
  }
  await rm(backup, { recursive: true });
}
