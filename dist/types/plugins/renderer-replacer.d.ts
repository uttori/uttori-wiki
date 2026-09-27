export interface ReplacerRendererRule {
    /** The test to use for replacing content. */
    test: string | RegExp;
    /** The output to use for replacing content. */
    output: string;
}
export interface ReplacerRendererConfig {
    /** The rules to use for replacing content. */
    rules: ReplacerRendererRule[];
    /** An object whose keys correspond to methods, and contents are events to listen for. */
    events?: Record<string, string[]>;
}
//# sourceMappingURL=renderer-replacer.d.ts.map