/**
 * Compares the contents of x and y using the provided equality comparison and returns the
 * changes necessary to convert from one to the other.
 *
 * The output is a sequence of hunks that each describe a number of consecutive edits. Hunks include
 * a number of matching elements before and after the last delete or insert operation.
 *
 * If x and y are identical, the output has length zero.
 *
 * Note that this function has generally worse performance than [Hunks] for diffs with many changes.
 *
 * @param {string | Uint8Array[]} x The first array to compare
 * @param {string | Uint8Array[]} y The second array to compare
 * @param {function(string | Uint8Array, string | Uint8Array): boolean} eq Equality function to compare elements
 * @param {number} context Number of matching elements to include around changes (default: 3)
 * @returns {import('./types.js').Hunk[]}
 */
export function hunks(x: string | Uint8Array[], y: string | Uint8Array[], eq?: (arg0: string | Uint8Array, arg1: string | Uint8Array) => boolean, context?: number): import("./types.js").Hunk[];
/**
 * Compares the contents of x and y using the provided equality comparison and returns the
 * changes necessary to convert from one to the other.
 *
 * Returns edits for every element in the input. If both x and y are identical, the output
 * will consist of a match edit for every input element.
 *
 * Note that this function has generally worse performance than [Edits] for diffs with many changes.
 *
 * @param {string | Uint8Array[]} x The first array to compare
 * @param {string | Uint8Array[]} y The second array to compare
 * @param {function(string | Uint8Array, string | Uint8Array): boolean} eq Equality function to compare elements
 * @returns {import('./types.js').Edit[]}
 */
export function edits(x: string | Uint8Array[], y: string | Uint8Array[], eq?: (arg0: string | Uint8Array, arg1: string | Uint8Array) => boolean): import("./types.js").Edit[];
//# sourceMappingURL=diff.d.ts.map