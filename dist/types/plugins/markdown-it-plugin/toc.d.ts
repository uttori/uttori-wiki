export interface MarkdownItTocHeading {
    /** Heading text content. */
    content: string;
    /** Heading map index. */
    index: string | number;
    /** Heading level (1-6). */
    level: number;
    /** Slugified heading id prefix. */
    slug: string;
    /** The final heading ID, including duplicate suffixes in stable mode. */
    id?: string;
}
/** MarkdownIt env object extended with cached TOC headings. */
export interface MarkdownItTocStateEnv {
    /** Cached headings for the table of contents. */
    toc_headings?: MarkdownItTocHeading[];
}
//# sourceMappingURL=toc.d.ts.map