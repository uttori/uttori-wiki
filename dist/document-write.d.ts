import type { UttoriContext } from './custom.js';
import type { UttoriWikiDocument } from './wiki.js';
/**
 * Ensure the wiki has one provider that acknowledges saves and history, and at most one index updater.
 * @param context Wiki storage and search configuration.
 * @returns Whether the reviewed write pipeline can be used.
 */
export declare function supportsVerifiedWrites(context: Pick<UttoriContext, 'config' | 'hooks'>): boolean;
/**
 * Check that a new page will not shadow a route or a stored redirect.
 * @param context Wiki routing and storage hooks.
 * @param slug Canonical slug already validated by the caller.
 * @returns Whether the slug can be created.
 */
export declare function availableDocumentSlug(context: Pick<UttoriContext, 'config' | 'hooks'>, slug: string): Promise<boolean>;
/**
 * Fingerprint the full stored JSON record, including fields outside the editable patch.
 * @param document The stored record, if it exists.
 * @returns The optimistic-lock token, or null for a missing document.
 */
export declare function documentVersion(document?: UttoriWikiDocument): string | null;
/**
 * Serialize built-in writers on one wiki process so a revision check and its write cannot interleave.
 * @param context The wiki whose storage is being changed.
 * @param write Work to run while holding the write slot. Do not acquire the slot again inside it.
 * @returns The result of the write.
 */
export declare function withDocumentWrite<T>(context: Pick<UttoriContext, 'config' | 'hooks'>, write: () => Promise<T>): Promise<T>;
/**
 * Persist an already filtered document. A supplied revision requires explicit storage acknowledgement.
 * @param context The wiki providing storage hooks.
 * @param document The normalized document after `document-save` filters.
 * @param options A prior slug for ordinary saves or a stable revision ID for verified writes.
 */
export declare function storeDocument(context: Pick<UttoriContext, 'hooks'>, document: UttoriWikiDocument, options?: {
    originalSlug?: string;
} | {
    revision: string;
    expectedVersion: string | null;
}): Promise<void>;
/**
 * Use the normal search update hook. Hosted writes wait for a result so an index failure can be retried.
 * @param context The wiki providing search hooks.
 * @param documents The stored document or batch of stored documents.
 * @param options A previous slug or a request to propagate indexing failure to the caller.
 */
export declare function updateDocumentSearch(context: Pick<UttoriContext, 'config' | 'hooks'>, documents: UttoriWikiDocument | UttoriWikiDocument[], options?: {
    originalSlug?: string;
    verified?: boolean;
}): Promise<void>;
//# sourceMappingURL=document-write.d.ts.map