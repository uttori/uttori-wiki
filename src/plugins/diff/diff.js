import Myers from './myers.js';

export const DEFAULT_CONTEXT = 3;

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
export function hunks(x, y, eq = (a, b) => a === b, context = DEFAULT_CONTEXT) {
  const [rx, ry] = diff(x, y, eq);
  return createHunks(x, y, rx, ry, context);
}

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
export function edits(x, y, eq = (a, b) => a === b) {
  const [rx, ry] = diff(x, y, eq);
  return createEdits(x, y, rx, ry);
}

/**
 * @param {string | Uint8Array[]} x The first array to compare
 * @param {string | Uint8Array[]} y The second array to compare
 * @param {boolean[]} rx The first array of booleans
 * @param {boolean[]} ry The second array of booleans
 * @param {number} _context The context
 * @returns {Hunk[]}
 */
function createHunks(x, y, rx, ry, _context) {
  /** @type {Hunk[]} */
  const hunks = [];

  // Handle special cases
  if (x.length === 0 && y.length === 0) {
    return hunks; // Both empty
  }

  if (x.length === 0) {
    // x is empty, all of y is insertion
    /** @type {Edit[]} */
    const edits = [];
    for (const yi of y) {
      edits.push({
        op: Op.Insert,
        x: yi, // This should be zero value
        y: yi,
      });
    }
    if (edits.length > 0) {
      hunks.push({
        posX: 0,
        endX: 0,
        posY: 0,
        endY: y.length,
        edits,
      });
    }
    return hunks;
  }

  if (y.length === 0) {
    // y is empty, all of x is deletion
    /** @type {Edit[]} */
    const edits = [];
    for (const xi of x) {
      edits.push({
        op: Op.Delete,
        x: xi,
        y: xi, // This should be zero value
      });
    }
    if (edits.length > 0) {
      hunks.push({
        posX: 0,
        endX: x.length,
        posY: 0,
        endY: 0,
        edits,
      });
    }
    return hunks;
  }

  // Count the number of changes
  let changeCount = 0;
  for (let i = 0; i < x.length; i++) {
    if (rx[i]) changeCount++;
  }
  for (let i = 0; i < y.length; i++) {
    if (ry[i]) changeCount++;
  }

  // If there are changes, create a hunk
  if (changeCount > 0) {
    const edits = createEdits(x, y, rx, ry);

    // If there are many changes, cover the entire array
    // If there are few changes, cover only the changed portion
    if (changeCount > Math.min(x.length, y.length) / 2) {
      // Many changes - cover entire array
      hunks.push({
        posX: 0,
        endX: x.length,
        posY: 0,
        endY: y.length,
        edits,
      });
    } else {
      // Few changes - cover only changed portion
      let minX = x.length, maxX = 0;
      let minY = y.length, maxY = 0;

      // Find the range of changes in x
      for (let i = 0; i < x.length; i++) {
        if (rx[i]) {
          minX = Math.min(minX, i);
          maxX = Math.max(maxX, i + 1);
        }
      }

      // Find the range of changes in y
      for (let i = 0; i < y.length; i++) {
        if (ry[i]) {
          minY = Math.min(minY, i);
          maxY = Math.max(maxY, i + 1);
        }
      }

      hunks.push({
        posX: minX,
        endX: maxX,
        posY: minY,
        endY: maxY,
        edits,
      });
    }
  }

  return hunks;
}

/**
 * @param {string | Uint8Array[]} x The first array to compare
 * @param {string | Uint8Array[]} y The second array to compare
 * @param {boolean[]} rx The first array of booleans
 * @param {boolean[]} ry The second array of booleans
 * @returns {Edit[]}
 */
function createEdits(x, y, rx, ry) {
  /** @type {Edit[]} */
  const edits = [];
  const n = rx.length - 1;
  const m = ry.length - 1;

  let s = 0, t = 0;
  while (s < n || t < m) {
    // Process deletions
    while (s < n && rx[s]) {
      edits.push({
        op: Op.Delete,
        x: x[s],
        y: x[s], // This should be zero value
      });
      s++;
    }

    // Process insertions
    while (t < m && ry[t]) {
      edits.push({
        op: Op.Insert,
        x: y[t], // This should be zero value
        y: y[t],
      });
      t++;
    }

    // Process matches
    while (s < n && t < m && !rx[s] && !ry[t]) {
      edits.push({
        op: Op.Match,
        x: x[s],
        y: y[t],
      });
      s++;
      t++;
    }
  }

  return edits;
}

/**
 * Simple implementation of findChangeBounds that strips common prefix and suffix.
 * @param {string | Uint8Array[]} x The first array to compare
 * @param {string | Uint8Array[]} y The second array to compare
 * @param {function(string | Uint8Array, string | Uint8Array): boolean} eq Equality function to compare elements
 * @returns {[number, number, number, number]}
 */
export function findChangeBounds(x, y, eq = (a, b) => a === b) {
  let smin = 0;
  let tmin = 0;
  let smax = x.length;
  let tmax = y.length;

  // Strip common prefix.
  while (smin < smax && tmin < tmax && eq(x[smin], y[tmin])) {
    smin++;
    tmin++;
  }

  // Strip common suffix.
  while (smax > smin && tmax > tmin && eq(x[smax - 1], y[tmax - 1])) {
    smax--;
    tmax--;
  }

  return [smin, smax, tmin, tmax];
}

/**
 * Main diff function.
 * @param {string[] | Uint8Array[]} x The first array to compare
 * @param {string[] | Uint8Array[]} y The second array to compare
 * @param {function(string | Uint8Array, string | Uint8Array): boolean} eq Equality function to compare elements
 * @returns {[boolean[], boolean[]]}
 */
export function diff(x, y, eq = (a, b) => a === b) {
  /** @type {number[]} */
  const x0 = [];
  /** @type {number[]} */
  const y0 = [];
  /** @type {number[]} */
  const xidx = [];
  /** @type {number[]} */
  const yidx = [];
  /** @type {number[]} */
  const counts = [];

  /** @type {Uint8Array[]} */
  const elements = [];

  /**
   * @param {string | Uint8Array} e
   * @returns {number}
   */
  const findId = (e) => {
    for (let i = 0; i < elements.length; i++) {
      if (eq(elements[i], e)) {
        return i;
      }
    }
    // Not found, add new element
    const id = elements.length;
    elements.push(e);
    counts.push(0);
    return id;
  };

  // Process x
  for (let i = 0; i < x.length; i++) {
    const e = x[i];
    const id = findId(e);
    counts[id] = (counts[id] || 0) + 1;
    x0.push(id);
    xidx.push(i);
  }

  // Process y
  for (let i = 0; i < y.length; i++) {
    const e = y[i];
    const id = findId(e);
    counts[id] = (counts[id] || 0) + 1;
    y0.push(id);
    yidx.push(i);
  }

  /** @type {Myers<string | Uint8Array>} */
  const m = new Myers(xidx, yidx, x, y);
  const [smin0, smax0, tmin0, tmax0] = m.init(x0, y0, (a, b) => a === b);
  m.compare(smin0, smax0, tmin0, tmax0, true, (a, b) => a === b);

  return [m.resultVectorX, m.resultVectorY];
}
