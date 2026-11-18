import { createHash, randomUUID } from 'node:crypto';
import { mkdir, mkdtemp, readFile, readdir, rename, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { availableDocumentSlug, documentVersion, storeDocument, updateDocumentSearch, withDocumentWrite } from '../../document-write.js';
import type { UttoriContext } from '../../custom.js';
import { createDebug } from '../../debug.js';
import type { UttoriWikiDocument } from '../../wiki.js';
import ImportDocument from '../import-document.js';
import { readArchivedSource, type CapturedSource } from '../utilities/source-citations.js';
import { CaptureError, writeCheckpoint } from './files.js';
import { applySidecars, planSidecars, type SidecarReview } from './sidecars.js';

const debug = createDebug('Uttori.CaptureInbox');
export const captureId = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;
export const maxOriginalBytes = 10 * 1024 * 1024;
export const maxDraftBytes = 256 * 1024;
const pageSlug = /^[a-z0-9][a-z0-9-]{0,127}$/;

/** Editable page content. Review freezes it with the exact live version displayed to the maintainer. */
interface Draft {
  slug: string;
  title: string;
  content: string;
  review?: { expectedVersion: string | null; before: Pick<UttoriWikiDocument, 'title' | 'content'> | null };
}

/** Persisted before the first storage write, so a restart can reuse the exact bytes and revision. */
interface Publication {
  document: UttoriWikiDocument;
  expectedVersion: string | null;
  revision: string;
  stored?: boolean;
  indexed?: boolean;
  /** A different live version blocked this attempt before storage was acknowledged. */
  blocked?: boolean;
}

/** Private inbox record. Original bytes live beside this JSON and are never replaced. */
export interface Capture {
  id: string;
  createdAt: number;
  label: string;
  url?: string;
  /** Media kind of the saved original, used for downloads and citation provenance. */
  originalType?: 'pdf' | 'html';
  /** Pins the importer output before the derived draft can be edited. */
  evidence?: CapturedSource;
  draft?: Draft;
  publication?: Publication;
  sidecars?: SidecarReview;
  failure?: string;
}

/** Private filesystem queue shared by requests in one wiki process. */
export class CaptureQueue {
  /** @param directory Operator-owned root outside the wiki's public tree. */
  constructor(readonly directory: string) {}

  /**
   * Publish an inbox entry only after any uploaded original is present.
   * @param source Source label and, for remote captures, the checked URL.
   * @param pdf PDF bytes when a maintainer uploads an original.
   * @returns New queued capture.
   */
  async create(source: Pick<Capture, 'label' | 'url'>, pdf?: Buffer): Promise<Capture> {
    await mkdir(this.directory, { recursive: true, mode: 0o700 });
    const capture: Capture = { id: randomUUID(), createdAt: Date.now(), ...source };
    if (pdf) capture.originalType = 'pdf';
    const temporary = await mkdtemp(path.join(this.directory, '.new-'));
    try {
      if (pdf) await writeFile(path.join(temporary, 'original'), pdf, { mode: 0o600 });
      await writeFile(path.join(temporary, 'capture.json'), JSON.stringify(capture), { mode: 0o600 });
      await rename(temporary, path.join(this.directory, capture.id));
    } finally {
      await rm(temporary, { recursive: true, force: true });
    }
    return capture;
  }

  /** @param id Validated capture ID. @returns The durable record, or undefined if it does not exist. */
  async read(id: string): Promise<Capture | undefined> {
    if (!captureId.test(id)) return undefined;
    try {
      return JSON.parse(await readFile(path.join(this.directory, id, 'capture.json'), 'utf8')) as Capture;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return undefined;
      throw error;
    }
  }

  /** @returns Published queue records, newest first. */
  async list(): Promise<Capture[]> {
    await mkdir(this.directory, { recursive: true, mode: 0o700 });
    const entries = await readdir(this.directory, { withFileTypes: true });
    const captures = await Promise.all(entries.filter(entry => entry.isDirectory() && captureId.test(entry.name)).map(entry => this.read(entry.name)));
    return captures.filter(capture => capture !== undefined).sort((a, b) => b.createdAt - a.createdAt);
  }

  /** @param capture Record being checkpointed by the active item operation. */
  async save(capture: Capture): Promise<void> {
    await writeCheckpoint(path.join(this.directory, capture.id, 'capture.json'), JSON.stringify(capture));
  }

  /** @param capture Record whose original is requested. @returns Private path, whether or not the original has arrived. */
  original(capture: Capture): string {
    return path.join(this.directory, capture.id, 'original');
  }
}

/** @param capture Current inbox state. @returns Version bound to the browser's reviewed form. */
export function captureVersion(capture: Capture): string {
  return createHash('sha256').update(JSON.stringify(capture)).digest('hex');
}

/** @param bytes Uploaded or downloaded bytes. @returns Whether they have a PDF header. */
export function isPdf(bytes: Buffer): boolean {
  return bytes.subarray(0, 5).toString('ascii') === '%PDF-';
}

/** Extract and pin citation text before allowing a maintainer to edit the derived draft. */
async function extractEvidence(queue: CaptureQueue, capture: Capture, bytes: Buffer): Promise<string> {
  const original = queue.original(capture);
  const directory = path.dirname(original);
  const pdf = isPdf(bytes);
  const format = pdf ? 'pdf' : 'html';
  capture.originalType = format;
  const markdown = await ImportDocument.captureMarkdown(original, path.join(directory, 'extracted.md'), pdf ? bytes : undefined);
  if (Buffer.byteLength(markdown) > maxDraftBytes) throw new Error('The extracted draft exceeded the review size limit.');
  // HTML conversion opens the archive by path. Check it still names the bytes the receipt will pin.
  if (!pdf && !(await readFile(original)).equals(bytes)) throw new Error('The original changed during conversion.');
  await writeCheckpoint(path.join(directory, 'citation.txt'), markdown);
  capture.evidence = {
    path: `${capture.id}/original`, format,
    sha256: createHash('sha256').update(bytes).digest('hex'),
    textSha256: createHash('sha256').update(markdown).digest('hex'),
  };
  return markdown;
}

/**
 * Require an operator-trusted origin before making a server-side request.
 * @param value URL submitted by the maintainer or restored from the queue.
 * @param origins Exact origins the deployment allows the server to contact.
 * @returns Normalized URL with the fragment removed.
 */
export function captureUrl(value: unknown, origins: Set<string>): URL {
  let url: URL;
  try {
    if (typeof value !== 'string' || value.length > 2048) throw new Error('invalid URL');
    url = new URL(value);
  } catch {
    throw new CaptureError(400, 'Enter a valid capture URL.');
  }
  if ((url.protocol !== 'http:' && url.protocol !== 'https:') || !origins.has(url.origin) || url.username || url.password) {
    throw new CaptureError(400, 'This URL origin is outside the capture allowlist.');
  }
  url.hash = '';
  return url;
}

/**
 * Fetch exactly one bounded resource. Following redirects or subresources would bypass the origin allowlist.
 * @param url A URL already checked against the deployment's allowlist.
 * @returns Original PDF or HTML bytes.
 */
async function fetchOriginal(url: URL): Promise<Buffer> {
  const response = await fetch(url, { redirect: 'manual', signal: AbortSignal.timeout(30000) });
  if (!response.ok || !response.body || Number(response.headers.get('content-length')) > maxOriginalBytes) {
    await response.body?.cancel();
    throw new Error('Capture response was unsuccessful or oversized.');
  }
  const reader = (response.body as import('node:stream/web').ReadableStream<Uint8Array>).getReader();
  const chunks: Buffer[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxOriginalBytes) throw new Error('Capture response was oversized.');
      chunks.push(Buffer.from(value));
    }
  } finally {
    await reader.cancel();
  }
  const bytes = Buffer.concat(chunks, size);
  const type = response.headers.get('content-type')?.split(';')[0].trim().toLowerCase();
  if (!bytes.length || (!isPdf(bytes) && type !== 'text/html' && type !== 'application/xhtml+xml')) {
    throw new Error('Capture response was neither a PDF nor HTML.');
  }
  return bytes;
}

/**
 * Prepare a draft. A retry reads the saved original before attempting another download.
 * @param queue Private capture queue.
 * @param capture Queued item.
 * @param origins Currently permitted remote origins.
 * @param [sidecarIngest] Use a public-safe starter title for the Git-managed topic.
 */
export async function prepareCapture(queue: CaptureQueue, capture: Capture, origins: Set<string>, sidecarIngest = false): Promise<void> {
  if (capture.draft) throw new CaptureError(409, 'This capture already has a draft.');
  try {
    const original = queue.original(capture);
    let bytes: Buffer;
    try {
      bytes = await readFile(original);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT' || !capture.url) throw error;
      bytes = await fetchOriginal(captureUrl(capture.url, origins));
      // Capture the evidence before calling a converter that can fail or be interrupted.
      await writeCheckpoint(original, bytes);
    }
    const markdown = await extractEvidence(queue, capture, bytes);
    const title = sidecarIngest ? 'Captured source' : capture.label;
    capture.draft = { slug: `capture-${capture.id.slice(0, 8)}`, title, content: markdown };
    delete capture.failure;
    await queue.save(capture);
  } catch (error) {
    debug('Capture preparation failed:', error);
    capture.failure = 'Preparation could not finish. Check the source and converter, then resume.';
    await queue.save(capture);
    throw new CaptureError(503, capture.failure);
  }
}

/**
 * Read the same live record used by the wiki's storage pipeline.
 * @param context The active wiki.
 * @param slug The validated page slug.
 * @returns Current record, if present.
 */
async function getDocument(context: UttoriContext, slug: string): Promise<UttoriWikiDocument | undefined> {
  const [document] = await context.hooks.fetch<UttoriWikiDocument | undefined>('storage-get', slug, context);
  return document;
}

/**
 * Store a fresh comparison for the exact draft submitted by the maintainer.
 * @param context Active wiki.
 * @param queue Private capture queue.
 * @param capture Capture being reviewed.
 * @param input Untrusted form fields.
 */
export async function reviewCapture(context: UttoriContext, queue: CaptureQueue, capture: Capture, input: Record<string, unknown>): Promise<void> {
  const { slug, title, content } = input;
  const previous = capture.publication;
  if (!capture.draft || capture.sidecars?.approved || (previous && (!previous.blocked || previous.stored))) {
    throw new CaptureError(409, 'This capture cannot be edited in its current state.');
  }
  if (typeof slug !== 'string' || !pageSlug.test(slug) || slug === 'capture-inbox' || Object.hasOwn(Object.prototype, slug)
    || typeof title !== 'string' || !title.trim() || title.length > 240
    || typeof content !== 'string' || !content.trim() || Buffer.byteLength(content) > maxDraftBytes) {
    throw new CaptureError(400, 'Enter a canonical slug, a title, and a nonempty Markdown draft within the size limit.');
  }

  await withDocumentWrite(context, async () => {
    if (context.config['uttori-plugin-capture-inbox']?.sidecarIngest) {
      if (previous) throw new CaptureError(409, 'Finish the earlier publication before changing storage modes.');
      if (!capture.evidence) {
        // A queued draft from before sidecar support needs evidence from the original, never its edited text.
        try {
          await extractEvidence(queue, capture, await readFile(queue.original(capture)));
        } catch (error) {
          debug('Capture evidence unavailable:', error);
          throw new CaptureError(409, 'The original could not be converted for citation review.');
        }
      }
      const draft = { slug, title: title.trim(), content };
      const directory = context.config['uttori-plugin-storage-provider-json-file']?.contentDirectory;
      if (!directory || !capture.evidence) throw new CaptureError(409, 'The sidecar checkout or its evidence is unavailable.');
      capture.sidecars = await planSidecars(context, path.resolve(directory), queue.directory, draft, capture.evidence);
      capture.draft = draft;
      delete capture.failure;
      await queue.save(capture);
      return;
    }
    if (capture.sidecars) throw new CaptureError(409, 'Restore the sidecar inbox configuration to continue this review.');
    if (previous) {
      const live = documentVersion(await getDocument(context, previous.document.slug));
      // Keep a resumable checkpoint if the live page was restored or the approved bytes reached disk.
      if (live === previous.expectedVersion || live === documentVersion(previous.document)) {
        throw new CaptureError(409, 'The earlier publication can resume. Use its resume button.');
      }
      delete capture.publication;
    }
    const before = await getDocument(context, slug);
    if (!before && !(await availableDocumentSlug(context, slug))) throw new CaptureError(409, 'This slug belongs to a route or redirect.');
    capture.draft = {
      slug, title: title.trim(), content,
      review: { expectedVersion: documentVersion(before), before: before ? { title: before.title, content: before.content } : null },
    };
    delete capture.failure;
    await queue.save(capture);
  });
}

/** Resume the Git working-tree write before rebuilding search from the live sidecars. */
async function publishSidecarCapture(context: UttoriContext, queue: CaptureQueue, capture: Capture): Promise<void> {
  const review = capture.sidecars;
  if (!review) throw new CaptureError(409, 'Review the sidecar changes before publishing.');
  if (review.indexed) return;
  const configuredDirectory = context.config['uttori-plugin-storage-provider-json-file']?.contentDirectory;
  const { directory } = review;
  if (!context.config['uttori-plugin-capture-inbox']?.sidecarIngest || !configuredDirectory || path.resolve(configuredDirectory) !== directory || !capture.draft) {
    throw new CaptureError(409, 'Restore the reviewed sidecar checkout configuration to resume.');
  }
  await withDocumentWrite(context, async () => {
    const raw = path.join(directory, '..', 'raw');
    if (!capture.evidence || 'reason' in await readArchivedSource({ slug: review.sourceSlug, source: capture.evidence }, raw, undefined, queue.directory)
      || 'reason' in await readArchivedSource({ slug: review.sourceSlug, source: review.source }, raw, undefined, queue.directory)) {
      throw new CaptureError(409, 'The original or its importer text is unavailable. Restore the archived revision to continue.');
    }
    try {
      if (!review.stored) {
        // An interrupted set still owns the shared catalog and log until its file writes finish.
        const pending = (await queue.list()).some(item => item.id !== capture.id && item.sidecars?.approved && !item.sidecars.stored);
        if (pending) throw new CaptureError(409, 'Resume the other approved capture before publishing this one.');
        await applySidecars(context, review, async () => {
          review.approved = true;
          await queue.save(capture);
        });
        review.stored = true;
        await queue.save(capture);
      }
      const slugs = review.files.filter(file => file.name.endsWith('.md')).map(file => `"${file.name.slice(0, -3)}"`);
      const query = `SELECT * FROM documents WHERE slug IN (${slugs.join(',')}) ORDER BY slug ASC LIMIT -1`;
      const [documents] = await context.hooks.fetch<UttoriWikiDocument[]>('storage-query', query, context);
      if (documents?.length !== slugs.length) throw new CaptureError(409, 'A reviewed page was removed before indexing could resume.');
      await updateDocumentSearch(context, documents, { verified: true });
      review.indexed = true;
      delete capture.failure;
      await queue.save(capture);
    } catch (error) {
      if (error instanceof CaptureError) throw error;
      debug('Capture sidecar publication incomplete:', error);
      throw new CaptureError(503, 'Publishing stopped. Resume to finish saving the sidecars and updating search.');
    }
  });
}

/**
 * Publish an approved draft or resume its stored checkpoint without repeating the revision.
 * @param context Active wiki.
 * @param queue Private capture queue.
 * @param capture Reviewed capture.
 */
export async function publishCapture(context: UttoriContext, queue: CaptureQueue, capture: Capture): Promise<void> {
  if (capture.sidecars || context.config['uttori-plugin-capture-inbox']?.sidecarIngest) {
    return publishSidecarCapture(context, queue, capture);
  }
  const draft = capture.draft;
  const review = draft?.review;
  if (!draft || !review) throw new CaptureError(409, 'Review the draft before publishing.');
  if (capture.publication?.indexed) return;

  await withDocumentWrite(context, async () => {
    let current = await getDocument(context, draft.slug);
    if (!capture.publication) {
      if (documentVersion(current) !== review.expectedVersion || (!current && !(await availableDocumentSlug(context, draft.slug)))) {
        throw new CaptureError(409, 'The wiki page changed after review. Review the draft against the current page.');
      }
      const updateDate = Math.max(Date.now(), (current?.updateDate ?? 0) + 1);
      const candidate: UttoriWikiDocument = {
        ...current, slug: draft.slug, title: draft.title, content: draft.content, html: undefined,
        tags: current?.tags ?? [], createDate: current?.createDate || updateDate, updateDate,
      };
      const filtered = await context.hooks.filter<UttoriWikiDocument>('document-save', structuredClone(candidate), context);
      if (filtered?.slug !== draft.slug || filtered.title !== draft.title || filtered.content !== draft.content) {
        throw new CaptureError(409, 'The wiki save filter changed the reviewed slug, title, or content.');
      }
      const document = JSON.parse(JSON.stringify({ ...filtered, updateDate })) as UttoriWikiDocument;
      capture.publication = { document, expectedVersion: review.expectedVersion, revision: `${updateDate}-${randomUUID()}` };
      // Persist the exact attempted write before touching wiki storage.
      await queue.save(capture);
    }

    const publication = capture.publication;
    if (!publication.stored) {
      const version = documentVersion(current);
      if (version !== publication.expectedVersion && version !== documentVersion(publication.document)) {
        publication.blocked = true;
        capture.failure = 'The page changed during publication. Review the draft against the current page.';
        await queue.save(capture);
        throw new CaptureError(409, capture.failure);
      }
      if (!current && !(await availableDocumentSlug(context, draft.slug))) {
        throw new CaptureError(409, 'The destination is now a route or redirect. Reconcile the saved draft before proceeding.');
      }
      try {
        await storeDocument(context, publication.document, publication);
      } catch (error) {
        debug('Capture storage incomplete:', error);
        capture.failure = 'Publishing stopped before storage and history were confirmed. Resume the same publication.';
        await queue.save(capture);
        throw new CaptureError(503, capture.failure);
      }
      publication.stored = true;
      delete publication.blocked;
      await queue.save(capture);
      current = publication.document;
    }

    if (!current) throw new CaptureError(409, 'The published page was removed before indexing could resume.');
    try {
      // Rebuild from the live wiki. An intervening edit after storage must not be overwritten.
      await updateDocumentSearch(context, current, { verified: true });
    } catch (error) {
      debug('Capture index incomplete:', error);
      capture.failure = 'The page was saved. Resume publication to finish updating search.';
      await queue.save(capture);
      throw new CaptureError(503, capture.failure);
    }
    publication.indexed = true;
    delete capture.failure;
    await queue.save(capture);
  });
}
