/**
 * @typedef {object} TokenizeThisConfig
 * @property {string[]} [shouldTokenize] The list of tokenizable substrings.
 * @property {string[]} [shouldMatch] The list of quotes to match explicit strings with.
 * @property {string[]} [shouldDelimitBy] The list of delimiters.
 * @property {boolean} convertLiterals If literals should be converted or not, ie 'true' -> true.
 * @property {string} escapeCharacter Character to use as an escape in strings.
 */
/**
 * Takes in the config, processes it, and creates tokenizer instances based on that config.
 * @property {TokenizeThisConfig} config The configuration object.
 * @property {boolean} convertLiterals If literals should be converted or not, ie 'true' -> true.
 * @property {string} escapeCharacter Character to use as an escape in strings.
 * @property {string[]} tokenizeList Holds the list of tokenizable substrings.
 * @property {object} tokenizeMap Holds an easy lookup map of tokenizable substrings.
 * @property {object} matchList Holds the list of quotes to match explicit strings with.
 * @property {object} matchMap Holds an easy lookup map of quotes to match explicit strings with.
 * @property {object} delimiterList Holds the list of delimiters.
 * @property {object} delimiterMap Holds an easy lookup map of delimiters.
 * @example <caption>Init TokenizeThis</caption>
 * const tokenizer = new TokenizeThis(config.tokenizer);
 * this.tokenizer.tokenize('(sql)', (token, surroundedBy) => { ... });
 * @class
 */
export class TokenizeThis {
    /**
     * @param {TokenizeThisConfig} config The configuration object.
     */
    constructor(config: TokenizeThisConfig);
    /** @type {boolean} If literals should be converted or not, ie 'true' -> true. */
    convertLiterals: boolean;
    /** @type {string} Character to use as an escape in strings. */
    escapeCharacter: string;
    /** @type {string[]} Holds the list of tokenizable substrings. */
    tokenizeList: string[];
    /** @type {Map} Holds an easy lookup map of tokenizable substrings. */
    tokenizeMap: Map<any, any>;
    /** @type {Array} Holds the list of quotes to match explicit strings with. */
    matchList: any[];
    /** @type {Map} Holds an easy lookup map of quotes to match explicit strings with. */
    matchMap: Map<any, any>;
    /** @type {Array} Holds the list of delimiters. */
    delimiterList: any[];
    /** @type {Map} Holds an easy lookup map of delimiters. */
    delimiterMap: Map<any, any>;
    /** @type {TokenizeThisConfig} The current configuration. */
    config: TokenizeThisConfig;
    /**
     * Creates a Tokenizer, then immediately calls "tokenize".
     * @param {string} input The string to scan for tokens.
     * @param {function((null | true | false | number | string), string): void} forEachToken Function to run over each token.
     * @returns {void} The new Tokenizer instance after being tokenized.
     */
    tokenize(input: string, forEachToken: (arg0: (null | true | false | number | string), arg1: string) => void): void;
}
declare namespace _default {
    export { Tokenizer };
    export { TokenizeThis };
}
export default _default;
export type TokenizeThisConfig = {
    /**
     * The list of tokenizable substrings.
     */
    shouldTokenize?: string[];
    /**
     * The list of quotes to match explicit strings with.
     */
    shouldMatch?: string[];
    /**
     * The list of delimiters.
     */
    shouldDelimitBy?: string[];
    /**
     * If literals should be converted or not, ie 'true' -> true.
     */
    convertLiterals: boolean;
    /**
     * Character to use as an escape in strings.
     */
    escapeCharacter: string;
};
/**
 * Parse a string into a token structure.
 * Create an instance of this class for each new string you wish to parse.
 * @property {TokenizeThis} factory Holds the processed configuration.
 * @property {string} str The string to tokenize.
 * @property {Function} forEachToken The function to call for teach token.
 * @property {string} previousCharacter The previous character consumed.
 * @property {string} toMatch The current quote to match.
 * @property {string} currentToken The current token being created.
 * @property {string[]} modeStack Keeps track of the current "mode" of tokenization. The tokenization rules are different depending if you are tokenizing an explicit string (surrounded by quotes), versus a non-explicit string (not surrounded by quotes).
 * @example <caption>Init Tokenizer</caption>
 * const tokenizerInstance = new Tokenizer(this, str, forEachToken);
 * return tokenizerInstance.tokenize();
 * @class
 */
declare class Tokenizer {
    /**
     * @param {TokenizeThis} factory Holds the processed configuration.
     * @param {string} str The string to tokenize.
     * @param {function((null | true | false | number | string), string): void} forEachToken The function to call for teach token.
     */
    constructor(factory: TokenizeThis, str: string, forEachToken: (arg0: (null | true | false | number | string), arg1: string) => void);
    /** @type {TokenizeThis} Holds the processed configuration. */
    factory: TokenizeThis;
    /** @type {string} The string to tokenize. */
    str: string;
    /** @type {Function} The function to call for teach token. */
    forEachToken: Function;
    /** @type {string} The previous character consumed. */
    previousCharacter: string;
    /** @type {string} The current quote to match. */
    toMatch: string;
    /** @type {string} The current token being created. */
    currentToken: string;
    /** @type {Array<'modeNone' | 'modeDefault' | 'modeMatch'>} Keeps track of the current "mode" of tokenization. The tokenization rules are different depending if you are tokenizing an explicit string (surrounded by quotes), versus a non-explicit string (not surrounded by quotes). */
    modeStack: Array<"modeNone" | "modeDefault" | "modeMatch">;
    /**
     * Get the current mode from the stack.
     * @returns {('modeNone' | 'modeDefault' | 'modeMatch' | string)} The current mode from the stack.
     */
    getCurrentMode(): ("modeNone" | "modeDefault" | "modeMatch" | string);
    /**
     * Set the current mode on the stack.
     * @param {'modeNone' | 'modeDefault' | 'modeMatch'} mode The mode to set on the stack.
     * @returns {number} The size of the mode stack.
     */
    setCurrentMode(mode: "modeNone" | "modeDefault" | "modeMatch"): number;
    /**
     * Ends the current mode and removes it from the stack.
     * @returns {string | undefined} The last mode of the stack.
     */
    completeCurrentMode(): string | undefined;
    /**
     * Parse the provided token.
     * @param {string} token The token to parse.
     */
    push(token: string): void;
    /**
     * Convert the string version of literals into their literal types.
     * @param {string} token The token to convert.
     * @returns {null | true | false | number | string} The converted token.
     */
    convertToken(token: string): null | true | false | number | string;
    /**
     * Process the string.
     */
    tokenize(): void;
    /**
     * Adds a character with the current mode.
     * @param {string} character The character to process.
     */
    consume(character: string): void;
    /**
     * Parse out potential tokenizable substrings out of the current token.
     */
    pushDefaultModeTokenizables(): void;
    /**
     * Changes the current mode depending on the character.
     * @param {string} character The character to consider.
     */
    modeNone(character: string): void;
    /**
     * Checks the token for delimiter or quotes, else continue building token.
     * @param {string} character The character to consider.
     * @returns {string | undefined} The current token.
     */
    modeDefault(character: string): string | undefined;
    /**
     * Checks for a completed match between characters.
     * @param {string} character The character to match.
     * @returns {string | undefined} The current token.
     */
    modeMatch(character: string): string | undefined;
}
//# sourceMappingURL=tokenizer.d.ts.map