import type { UttoriWikiDocument } from '../../wiki.js';
import { type MarkdownItRendererConfig } from '../renderer-markdown-it.js';
/** Canonical slugs are also safe filename stems and wiki route segments. */
export declare const refactorSlug: RegExp;
/** One source page moves to a new slug or is appended to an existing destination. */
export interface RefactorRequest {
    mode: 'rename' | 'merge';
    from: string;
    to: string;
}
/** Route and renderer settings used to distinguish internal URLs and resolve heading IDs. */
export interface RefactorOptions {
    publicUrl?: string;
    pathPrefix?: string;
    renderer?: MarkdownItRendererConfig;
    reserved?: string[];
}
/** The source leaves active storage only after the destination and inbound edits are in place. */
interface RefactorPlan {
    retired: UttoriWikiDocument;
    changes: {
        before?: UttoriWikiDocument;
        after: UttoriWikiDocument;
    }[];
    versions: Record<string, string | null>;
}
/**
 * @param value A possible canonical page slug.
 * @returns Whether it can be a refactor endpoint.
 */
export declare function isRefactorSlug(value: unknown): value is string;
/**
 * Plan a refactor from a complete corpus snapshot, with no storage side effects.
 * @param documents Every live document, including unmanaged pages that might link inward.
 * @param request The requested mode and source/destination slugs.
 * @param options Wiki routing and Markdown settings.
 * @returns The reviewed page replacements, retired source, and the whole-corpus optimistic guard.
 */
export declare function planDocumentRefactor(documents: UttoriWikiDocument[], request: RefactorRequest, options?: RefactorOptions): RefactorPlan;
export {};
//# sourceMappingURL=document-refactor.d.ts.map