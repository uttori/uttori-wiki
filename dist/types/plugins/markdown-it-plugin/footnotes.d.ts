export interface MarkdownItFootnotesEnv {
    /** Next footnote id counter. */
    length: number;
    /** Label to id mapping. */
    refs: Record<string, number>;
}
/** MarkdownIt env object extended with footnote state. */
export interface MarkdownItFootnotesStateEnv {
    /** Footnote definitions collected during parsing. */
    footnotes?: MarkdownItFootnotesEnv;
}
//# sourceMappingURL=footnotes.d.ts.map