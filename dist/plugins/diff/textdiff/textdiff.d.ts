/**
 * Hunks compares the lines in x and y and returns the changes necessary to convert from one to the
 * other.
 * The output is a sequence of hunks that each describe a number of consecutive edits. Hunks include
 * a number of matching elements before and after the last delete or insert operation.
 * If x and y are identical, the output has length zero.
 * @param {string | Uint8Array} x The first text to compare
 * @param {string | Uint8Array} y The second text to compare
 * @param {number} context Number of matching lines to include around changes (default: 3)
 * @returns {import('./types.js').TextHunk[]}
 */
export function textHunks(x: string | Uint8Array, y: string | Uint8Array, context?: number): import("./types.js").TextHunk[];
/**
 * textEdits compares the lines in x and y and returns the changes necessary to convert from one to the
 * other.
 * textEdits returns edits for every element in the input. If x and y are identical, the output will
 * consist of a match edit for every input element.
 * @param {string | Uint8Array} x The first text to compare
 * @param {string | Uint8Array} y The second text to compare
 * @returns {import('./types.js').TextEdit[]}
 */
export function textEdits(x: string | Uint8Array, y: string | Uint8Array): import("./types.js").TextEdit[];
/**
 * Unified compares the lines in x and y and returns the changes necessary to convert from one to the other in unified format.
 *
 * @param {string | Uint8Array} x The first text to compare
 * @param {string | Uint8Array} y The second text to compare
 * @param {number} context Number of matching lines to include around changes (default: 3)
 * @returns {string | Uint8Array}
 */
export function unified(x: string | Uint8Array, y: string | Uint8Array, context?: number): string | Uint8Array;
//# sourceMappingURL=textdiff.d.ts.map