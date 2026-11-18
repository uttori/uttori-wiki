import { randomUUID } from 'node:crypto';
import { isDeepStrictEqual } from 'node:util';
import { createDebug } from '../debug.js';
import { availableDocumentSlug, documentVersion, storeDocument, supportsVerifiedWrites, updateDocumentSearch, withDocumentWrite } from '../document-write.js';
import type { MCPProviderContext } from '../types/plugins/mcp-provider.js';
import type { UttoriWikiDocument } from '../wiki.js';
import type { RefactorRequest } from './utilities/document-refactor.js';

const debug = createDebug('Uttori.Plugin.MCPWrites');
const slugPattern = /^[a-z0-9][a-z0-9-]{0,127}$/;
const versionPattern = /^[a-f0-9]{64}$/;
const maxPages = 20;
const previewLifetimeMs = 30 * 60 * 1000;
const maxPreviews = 16;
const maxDraftBytes = 256 * 1024;
const editable = ['title', 'content', 'excerpt', 'tags'];
const storageFields = ['slug', 'html', 'createDate', 'updateDate', 'image', 'attachments', 'redirects', 'layout'];
const changeKeys = ['slug', 'expectedVersion', 'metadata', ...editable];

/** One reviewed patch, with the exact base version or null for a new page. */
interface Change {
  slug: string;
  expectedVersion: string | null;
  fields: Record<string, unknown>;
}

/** Per-page progress survives retries of the same preview in this process. */
interface PageWrite extends Change {
  /** Frozen after the save filter runs, so a retry compares against the exact attempted bytes. */
  prepared?: { document: UttoriWikiDocument; revision: string; version: string };
  /** Version confirmed by a storage acknowledgement or read-back. */
  savedVersion?: string;
  /** True once storage has acknowledged both the current page and its configured history. */
  stored?: boolean;
  /** True once indexing finishes, or when the reviewed patch was a no-op. */
  complete?: boolean;
}

/** An authenticated principal's expiring, immutable review and its mutable apply progress. */
interface Preview {
  principal: string;
  /** Epoch milliseconds. The same deadline applies to retries and completed receipts. */
  expiresAt: number;
  pages: PageWrite[];
  /** Refactors also guard pages without inbound links, since any of them could gain one before apply. */
  refactor?: {
    request: RefactorRequest;
    /** Pre-merge target, retained to re-plan after a partial apply without appending twice. */
    targetBefore?: UttoriWikiDocument;
    /** Already saved destination version when resuming a previous review. */
    destinationVersion?: string;
    versions: Record<string, string | null>;
    retirement: { slug: string; expectedVersion: string; revision: string; attempted?: boolean; done?: boolean; indexed?: boolean };
  };
}

const previews = new WeakMap<MCPProviderContext['hooks'], Map<string, Preview>>();

/** Tool descriptors advertised only to authenticated HTTP writers. */
export const writeTools = [
  {
    name: 'getDocumentForEdit',
    description: 'Read a document and its current version before drafting a change. A missing page has version null.',
    inputSchema: { type: 'object' as const, additionalProperties: false, required: ['slug'], properties: { slug: { type: 'string' } } },
  },
  {
    name: 'previewDocumentChanges',
    description: 'Review before and after values for a batch of creates or edits without saving. Use the version read before drafting.',
    inputSchema: {
      type: 'object' as const, additionalProperties: false, required: ['changes'],
      properties: {
        changes: {
          type: 'array', minItems: 1, maxItems: maxPages,
          items: {
            type: 'object', additionalProperties: false, required: ['slug', 'expectedVersion', 'content'],
            properties: {
              slug: { type: 'string' },
              expectedVersion: { type: ['string', 'null'], description: 'Base version from getDocumentForEdit, or null to create.' },
              title: { type: 'string', description: 'Required when creating a page.' },
              content: { type: 'string' },
              excerpt: { type: 'string' },
              tags: { type: 'array', items: { type: 'string' } },
              metadata: { type: 'object', description: 'Optional custom fields enabled by the operator.' },
            },
          },
        },
      },
    },
  },
  {
    name: 'applyDocumentChanges',
    description: 'Apply a previously reviewed preview. Retry an interrupted apply with the same preview ID.',
    inputSchema: { type: 'object' as const, additionalProperties: false, required: ['previewId'], properties: { previewId: { type: 'string' } } },
  },
];

/** Review a link-safe move without exposing a generic delete operation. */
export const refactorTool = {
  name: 'previewDocumentRefactor',
  description: 'Preview a rename or merge, rewriting inbound Markdown links and retaining the old slug as a redirect. Apply with applyDocumentChanges.',
  inputSchema: {
    type: 'object' as const, additionalProperties: false,
    required: ['mode', 'from', 'to', 'expectedSourceVersion', 'expectedTargetVersion'],
    properties: {
      mode: { type: 'string', enum: ['rename', 'merge'] },
      from: { type: 'string' }, to: { type: 'string' },
      expectedSourceVersion: { type: 'string' }, expectedTargetVersion: { type: ['string', 'null'] },
      resumePreviewId: { type: 'string', description: 'Optional earlier preview ID when its destination was saved but retirement is still pending.' },
    },
  },
};

/**
 * @param context The active wiki.
 * @returns Whether verified retirement is supported by its storage.
 */
export function supportsRefactors(context: MCPProviderContext): boolean {
  return context.hooks.events?.['storage-retire-revision']?.callbacks.length === 1;
}

export { supportsVerifiedWrites as supportsWrites };

/**
 * Validate an MCP slug before it reaches a storage lookup or the alias query.
 * @param value Untrusted slug from tool arguments.
 * @returns A safe canonical slug.
 */
function checkedSlug(value: unknown): string {
  if (typeof value !== 'string' || !slugPattern.test(value) || Object.hasOwn(Object.prototype, value)) {
    throw new Error('Expected a canonical lowercase document slug of up to 128 characters.');
  }
  return value;
}

/**
 * Parse the bounded patch format and reject fields outside the operator's allowlist.
 * @param input Tool-supplied changes.
 * @param allowedMetadata Extra document fields enabled by the wiki.
 * @returns Validated changes in the requested apply order.
 */
function checkedChanges(input: unknown, allowedMetadata: string[]): Change[] {
  if (!Array.isArray(input) || !input.length || input.length > maxPages || Buffer.byteLength(JSON.stringify(input)) > maxDraftBytes) {
    throw new Error(`Provide 1–${maxPages} changes within ${maxDraftBytes} bytes.`);
  }
  const seen = new Set<string>();
  return (input as unknown[]).map(item => {
    if (!item || typeof item !== 'object' || Array.isArray(item) || Object.keys(item).some(key => !changeKeys.includes(key))) {
      throw new Error('Invalid change fields.');
    }
    const { slug: inputSlug, expectedVersion, title, content, excerpt, tags, metadata } = item as Record<string, unknown>;
    const slug = checkedSlug(inputSlug);
    if (seen.has(slug)) throw new Error(`Duplicate change for ${slug}.`);
    seen.add(slug);

    if (expectedVersion !== null && (typeof expectedVersion !== 'string' || !versionPattern.test(expectedVersion))) {
      throw new Error(`Supply the expected version for ${slug}, or null to create it.`);
    }
    if (typeof content !== 'string' || !content.trim() || (expectedVersion === null && title === undefined)
      || (title !== undefined && (typeof title !== 'string' || !title.trim()))
      || (excerpt !== undefined && typeof excerpt !== 'string')
      || (tags !== undefined && (!Array.isArray(tags) || tags.some(tag => typeof tag !== 'string')))) {
      throw new Error(`Invalid title, content, excerpt, or tags for ${slug}.`);
    }

    // Metadata can augment a page, but it cannot take over identity or storage-managed fields.
    if (metadata !== undefined && (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)
      || Object.keys(metadata).some(key => !allowedMetadata.includes(key) || changeKeys.includes(key)
        || storageFields.includes(key) || key === '__proto__' || Object.hasOwn(Object.prototype, key)))) {
      throw new Error(`Disallowed document metadata for ${slug}.`);
    }
    const fields: Record<string, unknown> = { ...metadata, content };
    if (title !== undefined) fields.title = title;
    if (excerpt !== undefined) fields.excerpt = excerpt;
    if (tags !== undefined) fields.tags = tags;
    return { slug, expectedVersion, fields };
  });
}

/**
 * Read through the regular storage hook, shared with the read-only MCP tools.
 * @param context The wiki providing storage.
 * @param slug Validated document slug.
 * @returns The current stored record, if present.
 */
async function getDocument(context: MCPProviderContext, slug: string): Promise<UttoriWikiDocument | undefined> {
  const [document] = await context.hooks.fetch<UttoriWikiDocument | undefined>('storage-get', slug, context);
  return document;
}

/**
 * Read every live page rather than the search index, which may omit inbound links.
 * @param context The wiki providing storage.
 * @returns Complete, slug-sorted storage records.
 */
async function refactorDocuments(context: MCPProviderContext): Promise<UttoriWikiDocument[]> {
  const [documents] = await context.hooks.fetch<UttoriWikiDocument[]>('storage-query', 'SELECT * FROM documents WHERE slug NOT_IN ("") ORDER BY slug ASC LIMIT -1', context);
  if (!Array.isArray(documents)) throw new Error('Cannot review a refactor without the complete wiki corpus.');
  return documents;
}

/**
 * Project each reviewed page's progress into a receipt without returning draft content again.
 * @param plan The preview and its write state.
 * @returns Saved revisions and explicit pending work.
 */
function receipt(plan: Preview) {
  const pages = plan.pages.map(page => {
    let pending = 'save';
    if (page.stored) pending = 'index';
    else if (page.savedVersion) pending = 'history';
    return {
      slug: page.slug,
      status: page.complete ? 'complete' : 'pending',
      revision: page.stored ? page.prepared?.revision : undefined,
      version: page.savedVersion,
      ...(page.complete ? {} : { pending }),
    };
  });
  const retirement = plan.refactor?.retirement;
  if (!retirement) return { pages };
  const pending = retirement.done ? 'index' : 'retire';
  return { pages, retirement: {
    slug: retirement.slug,
    revision: retirement.done ? retirement.revision : undefined,
    status: retirement.indexed ? 'complete' : 'pending',
    pending: retirement.indexed ? undefined : pending,
  } };
}

/**
 * Execute an authenticated write tool. The caller authenticates on every HTTP request.
 * @param name One of the write tool names.
 * @param args Untrusted MCP arguments.
 * @param context The wiki providing storage and search.
 * @param principal Verified caller identity, used to bind previews.
 * @returns Preview, edit snapshot, or apply receipt.
 */
export async function callWriteTool(name: string, args: Record<string, unknown>, context: MCPProviderContext, principal: string) {
  if (name === 'getDocumentForEdit') {
    const document = await getDocument(context, checkedSlug(args.slug));
    return { document: document ?? null, version: documentVersion(document) };
  }

  return withDocumentWrite(context, async () => {
    let active = previews.get(context.hooks);
    if (!active) {
      active = new Map();
      previews.set(context.hooks, active);
    }
    const now = Date.now();
    for (const [id, plan] of active) {
      if (plan.expiresAt <= now) active.delete(id);
    }

    if (name === 'previewDocumentChanges' || name === refactorTool.name) {
      let changes: Change[];
      let refactor: Preview['refactor'];
      if (name === refactorTool.name) {
        const from = checkedSlug(args.from);
        const to = checkedSlug(args.to);
        const { mode, expectedSourceVersion, expectedTargetVersion } = args;
        const previous = typeof args.resumePreviewId === 'string' ? active.get(args.resumePreviewId) : undefined;
        const resumed = previous?.refactor;
        if (args.resumePreviewId !== undefined && (!resumed || previous?.principal !== principal || resumed.retirement.done
          || resumed.request.from !== from || resumed.request.to !== to || resumed.request.mode !== mode)) {
          throw new Error('The partial refactor preview is unavailable for this operation. Reconcile the saved pages before proceeding.');
        }
        const createsDestination = mode === 'rename' && !resumed;
        if ((mode !== 'rename' && mode !== 'merge') || typeof expectedSourceVersion !== 'string' || !versionPattern.test(expectedSourceVersion)
          || (createsDestination && expectedTargetVersion !== null)
          || (!createsDestination && (typeof expectedTargetVersion !== 'string' || !versionPattern.test(expectedTargetVersion)))) {
          throw new Error('Supply the versions read before drafting. A new rename destination has version null.');
        }
        const documents = await refactorDocuments(context);
        const conflicts = [[from, expectedSourceVersion], [to, expectedTargetVersion]].flatMap(([slug, version]) => (
          documentVersion(documents.find(page => page.slug === slug)) === version ? [] : [slug]
        ));
        if (conflicts.length) return { error: 'Document version or slug conflict.', conflicts };
        let planningDocuments = documents;
        if (resumed) {
          const saved = resumed.destinationVersion ?? previous?.pages.find(page => page.slug === to)?.prepared?.version;
          if (!saved || expectedTargetVersion !== saved || expectedSourceVersion !== resumed.retirement.expectedVersion) {
            throw new Error('The saved destination or retiring source changed. Reconcile both pages before proceeding.');
          }
          // Reconstruct the original merge inputs, then scan the current inbound pages for late links.
          planningDocuments = documents.filter(page => page.slug !== to);
          if (resumed.targetBefore) planningDocuments.push(resumed.targetBefore);
        }
        // Read-only installations can use MCP without the optional Markdown renderer.
        const { planDocumentRefactor } = await import('./utilities/document-refactor.js');
        const request: RefactorRequest = { from, to, mode };
        const planned = planDocumentRefactor(planningDocuments, request, {
          publicUrl: context.config.publicUrl,
          pathPrefix: context.config.canonicalPathPrefix,
          renderer: context.config['uttori-plugin-renderer-markdown-it'],
          reserved: [context.config.homePage, ...Object.values(context.config.routes), ...context.config.ignoreSlugs,
            ...(context.config.redirects ?? []).map(redirect => redirect.route.replace(/^\/|\/$/g, ''))].filter(slug => typeof slug === 'string'),
        });
        const destination = planned.changes[0];
        if (resumed) {
          const saved = documents.find(page => page.slug === to);
          if (saved?.content !== destination.after.content || !isDeepStrictEqual(saved.redirects, destination.after.redirects)) {
            throw new Error('The saved destination differs from the refactor plan. Reconcile it before retiring the source.');
          }
        }
        changes = planned.changes.filter(({ after }) => !resumed || after.slug !== to)
          .map(({ before, after }) => ({ slug: after.slug, expectedVersion: documentVersion(before), fields: { ...after, html: undefined } }));
        if (changes.length > maxPages || Buffer.byteLength(JSON.stringify(changes)) > maxDraftBytes) {
          throw new Error(`The complete refactor exceeds the review limit of ${maxPages} pages or ${maxDraftBytes} bytes.`);
        }
        refactor = {
          request,
          targetBefore: destination.before,
          destinationVersion: resumed && typeof expectedTargetVersion === 'string' ? expectedTargetVersion : undefined,
          versions: resumed ? Object.fromEntries(documents.map(page => [page.slug, documentVersion(page)])) : planned.versions,
          retirement: resumed ? { ...resumed.retirement } : { slug: from, expectedVersion: expectedSourceVersion, revision: `${now}-${randomUUID()}` },
        };
      } else {
        changes = checkedChanges(args.changes, context.config.allowedDocumentKeys);
      }
      const review = [];
      const conflicts = [];
      for (const change of changes) {
        const { slug, expectedVersion, fields } = change;
        const before = await getDocument(context, slug);
        if (documentVersion(before) !== expectedVersion || (!refactor && !before && !(await availableDocumentSlug(context, slug)))) {
          conflicts.push(slug);
          continue;
        }
        review.push({ slug, expectedVersion, before: before ? Object.fromEntries(Object.keys(fields).map(key => [key, before[key] ?? null])) : null, after: fields });
      }
      if (conflicts.length) return { error: 'Document version or slug conflict.', conflicts };
      if (active.size >= maxPreviews) {
        // Keep pending work resumable. Evict a completed receipt before refusing a new review.
        const completed = [...active].find(([, plan]) => plan.pages.every(page => page.complete) && (!plan.refactor || plan.refactor.retirement.indexed));
        if (!completed) throw new Error('Too many active previews. Apply an existing preview or wait for it to expire.');
        active.delete(completed[0]);
      }
      const previewId = randomUUID();
      const expiresAt = now + previewLifetimeMs;
      active.set(previewId, { principal, expiresAt, pages: changes, refactor });
      if (refactor) return { previewId, expiresAt, changes: review, retire: { slug: args.from, redirectTo: args.to, expectedVersion: refactor.retirement.expectedVersion } };
      return { previewId, expiresAt, changes: review };
    }

    const previewId = args.previewId;
    const plan = typeof previewId === 'string' ? active.get(previewId) : undefined;
    if (!plan || plan.principal !== principal) throw new Error('Preview unavailable. Read the current pages and request a new preview.');
    const retirement = plan.refactor?.retirement;
    if (plan.pages.every(page => page.complete) && (!retirement || retirement.indexed)) return { status: 'complete', ...receipt(plan) };

    // Preflight the whole batch, including earlier partial writes, before making any new changes.
    const current = new Map<string, UttoriWikiDocument | undefined>();
    const conflicts = new Set<string>();
    if (plan.refactor && retirement) {
      const documents = new Map((await refactorDocuments(context)).map(page => [page.slug, documentVersion(page)]));
      const expected = new Map(Object.entries(plan.refactor.versions));
      // Accept this preview's own durable writes, including a prior partial attempt.
      for (const page of plan.pages) {
        if (page.prepared && documents.get(page.slug) === page.prepared.version) expected.set(page.slug, page.prepared.version);
      }
      if (retirement.done || (retirement.attempted && !documents.has(retirement.slug))) expected.delete(retirement.slug);
      for (const slug of new Set([...expected.keys(), ...documents.keys()])) {
        if (documents.get(slug) !== expected.get(slug)) conflicts.add(slug);
      }
    }
    for (const page of plan.pages) {
      const document = await getDocument(context, page.slug);
      const version = documentVersion(document);
      current.set(page.slug, document);
      // A failed storage acknowledgement may still have replaced the current page.
      if (page.prepared && version === page.prepared.version) continue;
      if (version !== (page.savedVersion ?? page.expectedVersion) || (!plan.refactor && !document && !(await availableDocumentSlug(context, page.slug)))) {
        conflicts.add(page.slug);
      }
    }
    const conflictDetails = conflicts.size ? { conflicts: [...conflicts] } : {};

    for (const page of plan.pages) {
      if (page.complete || page.stored) continue;
      const document = current.get(page.slug);
      // A stale batch may finish history for its exact saved bytes, but cannot save any new page.
      if (conflicts.size && (!page.prepared || documentVersion(document) !== page.prepared.version)) continue;
      try {
        if (!page.prepared) {
          if (document && Object.entries(page.fields).every(([key, value]) => isDeepStrictEqual(document[key], value))) {
            page.savedVersion = documentVersion(document) ?? undefined;
            page.complete = true;
            continue;
          }

          const updateDate = Math.max(Date.now(), (document?.updateDate ?? 0) + 1);
          const draft = { ...document, ...page.fields, slug: page.slug, createDate: document?.createDate || page.fields.createDate || updateDate, updateDate, tags: page.fields.tags ?? document?.tags ?? [] } as UttoriWikiDocument;
          const prepared = await context.hooks.filter<UttoriWikiDocument>('document-save', structuredClone(draft), context);
          if (prepared?.slug !== page.slug || prepared.content !== draft.content || prepared.title !== draft.title
            || typeof prepared.title !== 'string' || !prepared.title.trim()
            || (plan.refactor && !isDeepStrictEqual(prepared.redirects, draft.redirects))) {
            throw new Error('The save filter changed the reviewed slug, title, content, or redirects.');
          }
          // Round-trip the filtered record before comparing it with storage's JSON representation.
          const normalized = JSON.parse(JSON.stringify({ ...prepared, updateDate })) as UttoriWikiDocument;
          const version = documentVersion(normalized);
          if (!version) throw new Error('The filtered document could not be serialized.');
          page.prepared = { document: normalized, revision: `${updateDate}-${randomUUID()}`, version };
        }

        await storeDocument(context, page.prepared.document, { revision: page.prepared.revision, expectedVersion: page.expectedVersion });
        page.savedVersion = page.prepared.version;
        page.stored = true;
      } catch (error) {
        debug('Hosted save incomplete for %s:', page.slug, error);
        // Preserve known durable progress even when a history write or its acknowledgement failed.
        const stored = await getDocument(context, page.slug).catch(() => undefined);
        if (page.prepared && documentVersion(stored) === page.prepared.version) page.savedVersion = page.prepared.version;
        return { error: `Could not finish ${page.slug}. Retry with the same preview ID.`, status: 'pending', ...receipt(plan), ...conflictDetails };
      }
    }

    if (retirement && !retirement.done) {
      if (conflicts.size) return { error: 'The wiki changed after review.', ...conflictDetails, ...receipt(plan) };
      try {
        // Publish the destination and every inbound edit first. Keep the old source live on earlier failures.
        retirement.attempted = true;
        const [revision] = await context.hooks.fetch('storage-retire-revision', retirement, context);
        if (revision !== retirement.revision) throw new Error('Storage did not acknowledge retirement.');
        retirement.done = true;
      } catch (error) {
        debug('Hosted retirement incomplete:', error);
        return { error: 'Could not retire the source page. Retry with the same preview ID.', status: 'pending', ...receipt(plan) };
      }
    }

    // Lunr rebuilds the whole index. Await one update after the batch, and retry it independently of storage.
    const pending = plan.pages.flatMap(page => !conflicts.has(page.slug) && !page.complete && page.stored && page.prepared ? [{ page, document: page.prepared.document }] : []);
    if (pending.length || (retirement?.done && !retirement.indexed)) {
      try {
        const documents = pending.map(entry => entry.document);
        if (!documents.length && plan.refactor) {
          // Retirement still needs a verified rebuild when the resumed review only removes the source.
          const destination = await getDocument(context, plan.refactor.request.to);
          if (!destination) throw new Error('The refactor destination is missing.');
          documents.push(destination);
        }
        await updateDocumentSearch(context, documents, { verified: true });
        for (const { page } of pending) page.complete = true;
        if (retirement?.done) retirement.indexed = true;
      } catch (error) {
        debug('Hosted index update incomplete:', error);
        return { error: 'Could not update search. Retry with the same preview ID.', status: 'pending', ...receipt(plan), ...conflictDetails };
      }
    }
    if (conflicts.size) return { error: 'Document version or slug conflict.', ...conflictDetails, ...receipt(plan) };
    return { status: 'complete', ...receipt(plan) };
  });
}
