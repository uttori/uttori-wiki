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
 * @typedef {function} EqualityFunction
 * @param {string | Uint8Array} a The first element to compare
 * @param {string | Uint8Array} b The second element to compare
 * @returns {boolean} Whether the two elements are equal
 */
/**
 * @typedef {object} DiffResult
 * @property {boolean[]} rx The first array of booleans
 * @property {boolean[]} ry The second array of booleans
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
 * @param {EqualityFunction} eq Equality function to compare elements
 * @param {number} context Number of matching elements to include around changes (default: 3)
 * @returns {Hunk[]}
 */
export function hunks(x: string | Uint8Array[], y: string | Uint8Array[], eq?: EqualityFunction, context?: number): Hunk[];
/**
 * Compares the contents of x and y using the provided equality comparison and returns the
 * changes necessary to convert from one to the other.
 * Returns edits for every element in the input.
 * If both x and y are identical, the output will consist of a match edit for every input element.
 * Note that this function has generally worse performance than [Edits] for diffs with many changes.
 * @param {string | Uint8Array[]} x The first array to compare
 * @param {string | Uint8Array[]} y The second array to compare
 * @param {EqualityFunction} eq Equality function to compare elements
 * @returns {Edit[]}
 */
export function edits(x: string | Uint8Array[], y: string | Uint8Array[], eq?: EqualityFunction): Edit[];
/**
 * Simple implementation of findChangeBounds that strips common prefix and suffix.
 * @param {string | Uint8Array[]} x The first array to compare
 * @param {string | Uint8Array[]} y The second array to compare
 * @param {EqualityFunction} eq Equality function to compare elements
 * @returns {import('./myers.js').InitResult}
 */
export function findChangeBounds(x: string | Uint8Array[], y: string | Uint8Array[], eq?: EqualityFunction): import("./myers.js").InitResult;
/**
 * Main diff function.
 * @param {string[] | Uint8Array[]} x The first array to compare
 * @param {string[] | Uint8Array[]} y The second array to compare
 * @param {EqualityFunction} eq Equality function to compare elements
 * @returns {DiffResult}
 */
export function diff(x: string[] | Uint8Array[], y: string[] | Uint8Array[], eq?: EqualityFunction): DiffResult;
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
export type EqualityFunction = Function;
export type DiffResult = {
    /**
     * The first array of booleans
     */
    rx: boolean[];
    /**
     * The second array of booleans
     */
    ry: boolean[];
};
//# sourceMappingURL=diff.d.ts.map