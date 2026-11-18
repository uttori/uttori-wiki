import type { UttoriContext } from './custom.js';
import type { UttoriWikiDocument } from './wiki.js';
import { createDebug } from './debug.js';
import { createHash } from 'node:crypto';

const debug = createDebug('Uttori.DocumentWrite');
const writes = new WeakMap<UttoriContext['hooks'], Promise<unknown>>();

/**
 * Ensure the wiki has one provider that acknowledges saves and history, and at most one index updater.
 * @param context Wiki storage and search configuration.
 * @returns Whether the reviewed write pipeline can be used.
 */
export function supportsVerifiedWrites(context: Pick<UttoriContext, 'config' | 'hooks'>): boolean {
  const { events } = context.hooks;
  return events?.['storage-write-revision']?.callbacks.length === 1
    && events['storage-get']?.callbacks.length === 1
    && events['storage-query']?.callbacks.length === 1
    && (events['search-update']?.callbacks.length ?? 0) <= 1
    && context.config['uttori-plugin-storage-provider-json-file']?.useHistory !== false
    && !context.config['uttori-plugin-search-provider-sqlite'];
}

/**
 * Check that a new page will not shadow a route or a stored redirect.
 * @param context Wiki routing and storage hooks.
 * @param slug Canonical slug already validated by the caller.
 * @returns Whether the slug can be created.
 */
export async function availableDocumentSlug(context: Pick<UttoriContext, 'config' | 'hooks'>, slug: string): Promise<boolean> {
  if ([context.config.homePage, '404', 'new', 'preview', ...Object.values(context.config.routes)].includes(slug)
    || (slug === 'capture-inbox' && context.config['uttori-plugin-capture-inbox']?.authorize)) return false;
  const query = `SELECT COUNT(*) FROM documents WHERE slug = "${slug}" OR redirects INCLUDES ("${slug}") ORDER BY slug ASC LIMIT -1`;
  const [count] = await context.hooks.fetch<number | number[]>('storage-query', query, context);
  return (Array.isArray(count) ? count[0] : count) === 0;
}

/**
 * @param context Wiki configuration.
 * @returns Whether a reviewed writer shares the ordinary save queue.
 */
function hasReviewedWriter(context: Pick<UttoriContext, 'config'>): boolean {
  return Boolean(context.config['uttori-plugin-mcp-provider']?.authorizeWrite || context.config['uttori-plugin-capture-inbox']?.authorize);
}

/**
 * Fingerprint the full stored JSON record, including fields outside the editable patch.
 * @param document The stored record, if it exists.
 * @returns The optimistic-lock token, or null for a missing document.
 */
export function documentVersion(document?: UttoriWikiDocument): string | null {
  return document ? createHash('sha256').update(JSON.stringify(document)).digest('hex') : null;
}

/**
 * Serialize built-in writers on one wiki process so a revision check and its write cannot interleave.
 * @param context The wiki whose storage is being changed.
 * @param write Work to run while holding the write slot. Do not acquire the slot again inside it.
 * @returns The result of the write.
 */
export async function withDocumentWrite<T>(context: Pick<UttoriContext, 'config' | 'hooks'>, write: () => Promise<T>): Promise<T> {
  if (!hasReviewedWriter(context)) return write();
  const previous = writes.get(context.hooks) ?? Promise.resolve();
  // A failed writer must release the slot without poisoning later writes.
  const pending = previous.then(write, write);
  writes.set(context.hooks, pending);
  try {
    return await pending;
  } finally {
    if (writes.get(context.hooks) === pending) writes.delete(context.hooks);
  }
}

/**
 * Persist an already filtered document. A supplied revision requires explicit storage acknowledgement.
 * @param context The wiki providing storage hooks.
 * @param document The normalized document after `document-save` filters.
 * @param options A prior slug for ordinary saves or a stable revision ID for verified writes.
 */
export async function storeDocument(context: Pick<UttoriContext, 'hooks'>, document: UttoriWikiDocument, options: { originalSlug?: string } | { revision: string; expectedVersion: string | null } = {}): Promise<void> {
  if ('revision' in options) {
    const [revision] = await context.hooks.fetch('storage-write-revision', { document, revision: options.revision, expectedVersion: options.expectedVersion }, context);
    if (revision !== options.revision) throw new Error('Storage did not acknowledge the requested revision.');
    return;
  }
  await context.hooks.fetch('storage-update', { document, originalSlug: options.originalSlug }, context);
}

/**
 * Use the normal search update hook. Hosted writes wait for a result so an index failure can be retried.
 * @param context The wiki providing search hooks.
 * @param documents The stored document or batch of stored documents.
 * @param options A previous slug or a request to propagate indexing failure to the caller.
 */
export async function updateDocumentSearch(context: Pick<UttoriContext, 'config' | 'hooks'>, documents: UttoriWikiDocument | UttoriWikiDocument[], options: { originalSlug?: string; verified?: boolean } = {}): Promise<void> {
  const updates = (Array.isArray(documents) ? documents : [documents]).map(document => ({ document, originalSlug: options.originalSlug }));
  if (options.verified) {
    await context.hooks.fetch('search-update', updates.map(update => ({ ...update, verified: true })), context);
  } else if (hasReviewedWriter(context)) {
    // Finish the ordinary update before a hosted writer can start a newer search rebuild.
    try {
      await context.hooks.fetch('search-update', updates, context);
    } catch (error) {
      debug('search-update failed after saving:', error);
    }
  } else {
    context.hooks.dispatch('search-update', updates, context);
  }
}
