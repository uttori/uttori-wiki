/* eslint-disable @typescript-eslint/no-unused-vars */
import { Op } from '../types.js';

/**
 * Edit describes a single edit of a line-by-line diff.
 * @typedef {Object} TextEdit
 * @template T extends string | Uint8Array
 * @param {typeof Op} op Edit operation
 * @param {string} line Line, including newline character (if any)
 */
// export interface TextEdit<T extends string | Uint8Array> {
//   op: Op; // Edit operation
//   line: T; // Line, including newline character (if any)
// }

/**
 * Hunk describes a sequence of consecutive edits.
 * @typedef {Object} TextHunk
 * @template T extends string | Uint8Array
 * @param {number} posX Start line in x (zero-based).
 * @param {number} endX End line in x (zero-based).
 * @param {number} posY Start line in y (zero-based).
 * @param {number} endY End line in y (zero-based).
 * @param {TextEdit[]} edits Edits to transform x lines PosX..EndX to y lines PosY..EndY
 */
// export interface TextHunk<T extends string | Uint8Array> {
//   posX: number;  // Start line in x (zero-based).
//   endX: number;  // End line in x (zero-based).
//   posY: number;  // Start line in y (zero-based).
//   endY: number;  // End line in y (zero-based).
//   edits: TextEdit<T>[]; // Edits to transform x lines PosX..EndX to y lines PosY..EndY
// }
