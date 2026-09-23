/**
 * @param {import('markdown-it').Token} token The MarkdownIt token we are reading.
 * @param {string} key The key is the attribute name, like `src` or `href`.
 * @returns {*|undefined} The read value or undefined.
 */
export declare function getValue(token: import('markdown-it').Token, key: string): any | undefined;
/**
 * @param {import('markdown-it').Token} token The MarkdownIt token we are updating.
 * @param {string} key The key is the attribute name, like `src` or `href`.
 * @param {string} value The value we want to set to the provided key.
 */
export declare function updateValue(token: import('markdown-it').Token, key: string, value: string): void;
/**
 * Uttori specific rules for manipulating the markup.
 * External Domains are filtered for SEO and security.
 * @param {import('markdown-it').StateCore} state State of MarkdownIt.
 * @returns {boolean} Returns if parsing was successful or not.
 */
export declare function uttoriInline(state: import('markdown-it').StateCore): boolean;
declare const _default: {
    getValue: typeof getValue;
    updateValue: typeof updateValue;
    uttoriInline: typeof uttoriInline;
};
export default _default;
//# sourceMappingURL=uttori-inline.d.ts.map