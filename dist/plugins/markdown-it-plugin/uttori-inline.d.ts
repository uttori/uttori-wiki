/**
 * @param token The MarkdownIt token we are reading.
 * @param key The key is the attribute name, like `src` or `href`.
 * @returns The read value or undefined.
 */
export declare function getValue(token: import('markdown-it').Token, key: string): string | undefined;
/**
 * @param token The MarkdownIt token we are updating.
 * @param key The key is the attribute name, like `src` or `href`.
 * @param value The value we want to set to the provided key.
 */
export declare function updateValue(token: import('markdown-it').Token, key: string, value: string): void;
/**
 * Uttori specific rules for manipulating the markup.
 * External Domains are filtered for SEO and security.
 * @param state State of MarkdownIt.
 * @returns Returns if parsing was successful or not.
 */
export declare function uttoriInline(state: import('markdown-it').StateCore): boolean;
declare const _default: {
    getValue: typeof getValue;
    updateValue: typeof updateValue;
    uttoriInline: typeof uttoriInline;
};
export default _default;
//# sourceMappingURL=uttori-inline.d.ts.map