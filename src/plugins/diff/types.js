/**
 * Op describes an edit operation.
 */
export const Op = {
  Match: 0,  // Two slice elements match
  Delete: 1, // A deletion from an element on the left slice
  Insert: 2, // An insertion of an element from the right side
};

/**
 * Edit describes a single edit of a diff.
 *   - For Match, both X and Y contain the matching element.
 *   - For Delete, X contains the deleted element and Y is unset (zero value).
 *   - For Insert, Y contains the inserted element and X is unset (zero value).
 * @typedef {object} Edit
 * @property {number} op The edit operation (one of Op.Match = 0, Op.Delete = 1, Op.Insert = 2).
 * @property {string | Uint8Array} x The element from the left slice.
 * @property {string | Uint8Array} y The element from the right slice.
 */
// export interface Edit<T> {
//   op: Op;
//   x: T;
//   y: T;
// }

/**
 * Hunk describes a sequence of consecutive edits.
 * @typedef {object} Hunk
 * @property {number} posX The start position in x.
 * @property {number} endX The end position in x.
 * @property {number} posY The start position in y.
 * @property {number} endY The end position in y.
 * @property {Edit[]} edits The edits to transform x[PosX:EndX] to y[PosY:EndY].
 */
// export interface Hunk<T> {
//   posX: number;  // Start position in x.
//   endX: number;  // End position in x.
//   posY: number;  // Start position in y.
//   endY: number;  // End position in y.
//   edits: Edit<T>[]; // Edits to transform x[PosX:EndX] to y[PosY:EndY]
// }
