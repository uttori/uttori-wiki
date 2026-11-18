import type { UttoriContext } from '../../custom.js';
import type { UttoriWikiDocument } from '../../wiki.js';
import { type CapturedSource } from '../utilities/source-citations.js';
import { type SidecarReview } from './sidecars.js';
export declare const captureId: RegExp;
export declare const maxOriginalBytes: number;
export declare const maxDraftBytes: number;
/** Editable page content. Review freezes it with the exact live version displayed to the maintainer. */
interface Draft {
    slug: string;
    title: string;
    content: string;
    review?: {
        expectedVersion: string | null;
        before: Pick<UttoriWikiDocument, 'title' | 'content'> | null;
    };
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
export declare class CaptureQueue {
    readonly directory: string;
    /** @param directory Operator-owned root outside the wiki's public tree. */
    constructor(directory: string);
    /**
     * Publish an inbox entry only after any uploaded original is present.
     * @param source Source label and, for remote captures, the checked URL.
     * @param pdf PDF bytes when a maintainer uploads an original.
     * @returns New queued capture.
     */
    create(source: Pick<Capture, 'label' | 'url'>, pdf?: Buffer): Promise<Capture>;
    /** @param id Validated capture ID. @returns The durable record, or undefined if it does not exist. */
    read(id: string): Promise<Capture | undefined>;
    /** @returns Published queue records, newest first. */
    list(): Promise<Capture[]>;
    /** @param capture Record being checkpointed by the active item operation. */
    save(capture: Capture): Promise<void>;
    /** @param capture Record whose original is requested. @returns Private path, whether or not the original has arrived. */
    original(capture: Capture): string;
}
/** @param capture Current inbox state. @returns Version bound to the browser's reviewed form. */
export declare function captureVersion(capture: Capture): string;
/** @param bytes Uploaded or downloaded bytes. @returns Whether they have a PDF header. */
export declare function isPdf(bytes: Buffer): boolean;
/**
 * Require an operator-trusted origin before making a server-side request.
 * @param value URL submitted by the maintainer or restored from the queue.
 * @param origins Exact origins the deployment allows the server to contact.
 * @returns Normalized URL with the fragment removed.
 */
export declare function captureUrl(value: unknown, origins: Set<string>): URL;
/**
 * Prepare a draft. A retry reads the saved original before attempting another download.
 * @param queue Private capture queue.
 * @param capture Queued item.
 * @param origins Currently permitted remote origins.
 * @param [sidecarIngest] Use a public-safe starter title for the Git-managed topic.
 */
export declare function prepareCapture(queue: CaptureQueue, capture: Capture, origins: Set<string>, sidecarIngest?: boolean): Promise<void>;
/**
 * Store a fresh comparison for the exact draft submitted by the maintainer.
 * @param context Active wiki.
 * @param queue Private capture queue.
 * @param capture Capture being reviewed.
 * @param input Untrusted form fields.
 */
export declare function reviewCapture(context: UttoriContext, queue: CaptureQueue, capture: Capture, input: Record<string, unknown>): Promise<void>;
/**
 * Publish an approved draft or resume its stored checkpoint without repeating the revision.
 * @param context Active wiki.
 * @param queue Private capture queue.
 * @param capture Reviewed capture.
 */
export declare function publishCapture(context: UttoriContext, queue: CaptureQueue, capture: Capture): Promise<void>;
export {};
//# sourceMappingURL=queue.d.ts.map