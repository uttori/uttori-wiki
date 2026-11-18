import type { UttoriContext } from '../../custom.js';
import type { UttoriWikiDocument } from '../../wiki.js';
import { type CapturedSource } from '../utilities/source-citations.js';
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
    swap?: {
        stage: string;
        previous: string;
        next: string;
        legacyPartial?: boolean;
    };
    approved?: boolean;
    stored?: boolean;
    indexed?: boolean;
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
export declare function planSidecars(context: UttoriContext, directory: string, captureDirectory: string, draft: Pick<UttoriWikiDocument, 'slug' | 'title' | 'content'>, source: CapturedSource): Promise<SidecarReview>;
/**
 * Stage a complete checkout and publish it with a single reader-visible commit point.
 * @param context Active wiki, used to recheck aliases before the first file replacement.
 * @param review Exact sidecar file changes displayed for approval.
 * @param confirm Persist the approval before touching any sidecar.
 */
export declare function applySidecars(context: UttoriContext, review: SidecarReview, confirm: () => Promise<void>): Promise<void>;
export {};
//# sourceMappingURL=sidecars.d.ts.map