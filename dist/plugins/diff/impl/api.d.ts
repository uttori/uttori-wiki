/**
 * @typedef {Object} Pair
 * @param {number} s
 * @param {number} t
 */
/**
 * Simple implementation of findChangeBounds that strips common prefix and suffix.
 * @param {string | Uint8Array[]} x The first array to compare
 * @param {string | Uint8Array[]} y The second array to compare
 * @param {function(string | Uint8Array, string | Uint8Array): boolean} eq Equality function to compare elements
 * @returns {[number, number, number, number]}
 */
export function findChangeBounds(x: string | Uint8Array[], y: string | Uint8Array[], eq?: (arg0: string | Uint8Array, arg1: string | Uint8Array) => boolean): [number, number, number, number];
/**
 * Simple preprocessing function.
 * @param {string | Uint8Array[]} x The first array to compare
 * @param {string | Uint8Array[]} y The second array to compare
 * @param {function(string | Uint8Array, string | Uint8Array): boolean} eq Equality function to compare elements
 * @returns {[number[], number[], number[], number[], number[], number]}
 */
export function preprocess(x: string | Uint8Array[], y: string | Uint8Array[], eq: (arg0: string | Uint8Array, arg1: string | Uint8Array) => boolean): [number[], number[], number[], number[], number[], number];
/**
 * Simple segments function that returns basic segments.
 * @param {string | Uint8Array[]} x The first array to compare
 * @param {string | Uint8Array[]} y The second array to compare
 * @param {function(string | Uint8Array, string | Uint8Array): boolean} eq Equality function to compare elements
 * @returns {Pair[]}
 */
export function segments(x: string | Uint8Array[], y: string | Uint8Array[], eq?: (arg0: string | Uint8Array, arg1: string | Uint8Array) => boolean): Pair[];
/**
 * Main diff function.
 * @param {string | Uint8Array[]} x The first array to compare
 * @param {string | Uint8Array[]} y The second array to compare
 * @param {function(string | Uint8Array, string | Uint8Array): boolean} eq Equality function to compare elements
 * @returns {[boolean[], boolean[]]}
 */
export function diff(x: string | Uint8Array[], y: string | Uint8Array[], eq?: (arg0: string | Uint8Array, arg1: string | Uint8Array) => boolean): [boolean[], boolean[]];
export type Pair = any;
//# sourceMappingURL=api.d.ts.map