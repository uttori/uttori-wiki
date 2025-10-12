/**
 * Edit describes a single edit of a diff.
 * - For Match, both X and Y contain the matching element.
 * - For Delete, X contains the deleted element and Y is unset (zero value).
 * - For Insert, Y contains the inserted element and X is unset (zero value).
 * @typedef {object} Edit
 * @property {number} op The edit operation: Match = 0, Delete = 1, Insert = 2.
 * @property {string | Uint8Array} x The element from the left slice.
 * @property {string | Uint8Array} y The element from the right slice.
 */
/**
 * Hunk describes a sequence of consecutive edits.
 * @typedef {object} Hunk
 * @property {number} posX The start position in x.
 * @property {number} endX The end position in x.
 * @property {number} posY The start position in y.
 * @property {number} endY The end position in y.
 * @property {Edit[]} edits The edits to transform x[PosX:EndX] to y[PosY:EndY].
 */
/**
 * Compares the contents of x and y using the provided equality comparison and returns the
 * changes necessary to convert from one to the other.
 * The output is a sequence of hunks that each describe a number of consecutive edits.
 * Hunks include a number of matching elements before and after the last delete or insert operation.
 * If x and y are identical, the output has length zero.
 * Note that this function has generally worse performance than [Hunks] for diffs with many changes.
 * @param {string | Uint8Array[]} x The first array to compare
 * @param {string | Uint8Array[]} y The second array to compare
 * @param {function(string | Uint8Array, string | Uint8Array): boolean} eq Equality function to compare elements
 * @param {number} context Number of matching elements to include around changes (default: 3)
 * @returns {Hunk[]}
 */
export function hunks(x: string | Uint8Array[], y: string | Uint8Array[], eq?: (arg0: string | Uint8Array, arg1: string | Uint8Array) => boolean, context?: number): Hunk[];
/**
 * Compares the contents of x and y using the provided equality comparison and returns the
 * changes necessary to convert from one to the other.
 * Returns edits for every element in the input.
 * If both x and y are identical, the output will consist of a match edit for every input element.
 * Note that this function has generally worse performance than [Edits] for diffs with many changes.
 * @param {string | Uint8Array[]} x The first array to compare
 * @param {string | Uint8Array[]} y The second array to compare
 * @param {function(string | Uint8Array, string | Uint8Array): boolean} eq Equality function to compare elements
 * @returns {Edit[]}
 */
export function edits(x: string | Uint8Array[], y: string | Uint8Array[], eq?: (arg0: string | Uint8Array, arg1: string | Uint8Array) => boolean): Edit[];
/**
 * Simple implementation of findChangeBounds that strips common prefix and suffix.
 * @param {string | Uint8Array[]} x The first array to compare
 * @param {string | Uint8Array[]} y The second array to compare
 * @param {function(string | Uint8Array, string | Uint8Array): boolean} eq Equality function to compare elements
 * @returns {[number, number, number, number]}
 */
export function findChangeBounds(x: string | Uint8Array[], y: string | Uint8Array[], eq?: (arg0: string | Uint8Array, arg1: string | Uint8Array) => boolean): [number, number, number, number];
/**
 * Main diff function.
 * @param {string[] | Uint8Array[]} x The first array to compare
 * @param {string[] | Uint8Array[]} y The second array to compare
 * @param {function(string | Uint8Array, string | Uint8Array): boolean} eq Equality function to compare elements
 * @returns {[boolean[], boolean[]]}
 */
export function diff(x: string[] | Uint8Array[], y: string[] | Uint8Array[], eq?: (arg0: string | Uint8Array, arg1: string | Uint8Array) => boolean): [boolean[], boolean[]];
export const DEFAULT_CONTEXT: 3;
export namespace Op {
    let Match: number;
    let Delete: number;
    let Insert: number;
}
/**
 * Edit describes a single edit of a diff.
 * - For Match, both X and Y contain the matching element.
 * - For Delete, X contains the deleted element and Y is unset (zero value).
 * - For Insert, Y contains the inserted element and X is unset (zero value).
 */
export type Edit = {
    /**
     * The edit operation: Match = 0, Delete = 1, Insert = 2.
     */
    op: number;
    /**
     * The element from the left slice.
     */
    x: string | Uint8Array;
    /**
     * The element from the right slice.
     */
    y: string | Uint8Array;
};
/**
 * Hunk describes a sequence of consecutive edits.
 */
export type Hunk = {
    /**
     * The start position in x.
     */
    posX: number;
    /**
     * The end position in x.
     */
    endX: number;
    /**
     * The start position in y.
     */
    posY: number;
    /**
     * The end position in y.
     */
    endY: number;
    /**
     * The edits to transform x[PosX:EndX] to y[PosY:EndY].
     */
    edits: Edit[];
};
//# sourceMappingURL=diff.d.ts.map