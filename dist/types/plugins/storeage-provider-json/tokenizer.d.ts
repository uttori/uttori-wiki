export interface TokenizeThisConfig {
    /** The list of tokenizable substrings. */
    shouldTokenize?: string[];
    /** The list of quotes to match explicit strings with. */
    shouldMatch?: string[];
    /** The list of delimiters. */
    shouldDelimitBy?: string[];
    /** If literals should be converted or not, ie 'true' -> true. */
    convertLiterals: boolean;
    /** Character to use as an escape in strings. */
    escapeCharacter: string;
}
//# sourceMappingURL=tokenizer.d.ts.map