/**
 * ByteView provides a mechanism to handle strings and Uint8Array as immutable byte views.
 */
export class ByteView {
    /**
     * @param {string | Uint8Array} in_ The input to convert to a ByteView.
     * @returns {ByteView}
     */
    static from(in_: string | Uint8Array): ByteView;
    /**
     * SplitLines splits the input on '\n' and returns the lines including the newline character and
     * and either -1 if the last line ends in a newline character or len([]ByteView) if it's missing
     * a newline character.
     *
     * @param {ByteView} v The ByteView to split.
     * @returns {[ByteView[], number]} The lines and the index of the missing newline.
     */
    static splitLines(v: ByteView): [ByteView[], number];
    /**
     * @param {string} data
     */
    constructor(data: string);
    /** @type {string} */
    data: string;
    /**
     * @returns {number}
     */
    len(): number;
    /**
     * @returns {number}
     */
    get length(): number;
    /**
     * @returns {IterableIterator<number>}
     */
    bytes(): IterableIterator<number>;
    /**
     * renderAs converts a ByteView to the provided type independently of what it was originally.
     * This is only safe if the type is the same one used for From and either the result is not modified or the ByteView is no longer used.
     * @param {string} [type] The type to convert to.
     * @returns {string | Uint8Array}
     */
    renderAs(type?: string): string | Uint8Array;
}
/**
 */
export class Builder {
    /** @type {string} */
    buf: string;
    /** @type {boolean} */
    isString: boolean;
    /**
     * @param {number[]} v
     * @returns {number}
     */
    write(v: number[]): number;
    /**
     * @param {ByteView} v
     * @returns {number}
     */
    writeByteView(v: ByteView): number;
    /**
     * @param {string} v
     * @returns {number}
     */
    writeString(v: string): number;
    /**
     * @returns {string | Uint8Array}
     */
    build(): string | Uint8Array;
}
//# sourceMappingURL=byteview.d.ts.map