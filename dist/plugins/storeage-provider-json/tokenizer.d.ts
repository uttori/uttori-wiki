import type { TokenizeThisConfig } from '../../types/plugins/storeage-provider-json/tokenizer.js';
export type { TokenizeThisConfig } from '../../types/plugins/storeage-provider-json/tokenizer.js';
declare const MODE_NONE = "modeNone";
declare const MODE_DEFAULT = "modeDefault";
declare const MODE_MATCH = "modeMatch";
/**
 * Parse a string into a token structure.
 * Create an instance of this class for each new string you wish to parse.
 * @example <caption>Init Tokenizer</caption>
 * const tokenizerInstance = new Tokenizer(this, str, forEachToken);
 * return tokenizerInstance.tokenize();
 */
declare class Tokenizer {
    /** Holds the processed configuration. */
    factory: TokenizeThis;
    /** The string to tokenize. */
    str: string;
    /** The function to call for teach token. */
    forEachToken: (token: string | number | boolean | null, quote: string) => void;
    /** The previous character consumed. */
    previousCharacter: string;
    /** The current quote to match. */
    toMatch: string;
    /** The current token being created. */
    currentToken: string;
    /** Keeps track of the current "mode" of tokenization. The tokenization rules are different depending if you are tokenizing an explicit string (surrounded by quotes), versus a non-explicit string (not surrounded by quotes). */
    modeStack: ('modeNone' | 'modeDefault' | 'modeMatch')[];
    /**
     * @param factory Holds the processed configuration.
     * @param str The string to tokenize.
     * @param forEachToken The function to call for teach token.
     */
    constructor(factory: TokenizeThis, str: string, forEachToken: (arg0: (null | true | false | number | string), arg1: string) => void);
    /**
     * Get the current mode from the stack.
     * @returns The current mode from the stack.
     */
    getCurrentMode(): 'modeNone' | 'modeDefault' | 'modeMatch';
    /**
     * Set the current mode on the stack.
     * @param mode The mode to set on the stack.
     * @returns The size of the mode stack.
     */
    setCurrentMode(mode: 'modeNone' | 'modeDefault' | 'modeMatch'): number;
    /**
     * Ends the current mode and removes it from the stack.
     * @returns The last mode of the stack.
     */
    completeCurrentMode(): string | undefined;
    /**
     * Parse the provided token.
     * @param token The token to parse.
     */
    push(token: string): void;
    /**
     * Convert the string version of literals into their literal types.
     * @param token The token to convert.
     * @returns The converted token.
     */
    convertToken(token: string): null | true | false | number | string;
    /** Process the string. */
    tokenize(): void;
    /**
     * Adds a character with the current mode.
     * @param character The character to process.
     */
    consume(character: string): void;
    /**
     * Changes the current mode depending on the character.
     * @param character The character to consider.
     */
    [MODE_NONE](character: string): void;
    /**
     * Checks the token for delimiter or quotes, else continue building token.
     * @param character The character to consider.
     * @returns The current token.
     */
    [MODE_DEFAULT](character: string): string | undefined;
    /** Parse out potential tokenizable substrings out of the current token. */
    pushDefaultModeTokenizables(): void;
    /**
     * Checks for a completed match between characters.
     * @param character The character to match.
     * @returns The current token.
     */
    [MODE_MATCH](character: string): string | undefined;
}
/**
 * Takes in the config, processes it, and creates tokenizer instances based on that config.
 * @example <caption>Init TokenizeThis</caption>
 * const tokenizer = new TokenizeThis(config.tokenizer);
 * this.tokenizer.tokenize('(sql)', (token, surroundedBy) => { ... });
 */
export declare class TokenizeThis {
    /** The current configuration. */
    config: TokenizeThisConfig;
    /** If literals should be converted or not, ie 'true' -> true. */
    convertLiterals: boolean;
    /** Character to use as an escape in strings. */
    escapeCharacter: string;
    /** Holds the list of tokenizable substrings. */
    tokenizeList: string[];
    /** Holds an easy lookup map of tokenizable substrings. */
    tokenizeMap: Map<string, string>;
    /** Holds the list of quotes to match explicit strings with. */
    matchList: string[];
    /** Holds an easy lookup map of quotes to match explicit strings with. */
    matchMap: Map<string, string>;
    /** Holds the list of delimiters. */
    delimiterList: string[];
    /** Holds an easy lookup map of delimiters. */
    delimiterMap: Map<string, string>;
    /**
     * @param config The configuration object.
     */
    constructor(config: Partial<TokenizeThisConfig>);
    /**
     * Creates a Tokenizer, then immediately calls "tokenize".
     * @param input The string to scan for tokens.
     * @param forEachToken Function to run over each token.
     * @returns The new Tokenizer instance after being tokenized.
     */
    tokenize(input: string, forEachToken: (arg0: (null | true | false | number | string), arg1: string) => void): void;
}
declare const _default: {
    Tokenizer: typeof Tokenizer;
    TokenizeThis: typeof TokenizeThis;
};
export default _default;
//# sourceMappingURL=tokenizer.d.ts.map