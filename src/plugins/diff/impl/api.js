/* eslint-disable @typescript-eslint/no-unused-vars */
import { ByteView } from '../textdiff/byteview.js';
import { Myers } from './myers.js';

/**
 * @typedef {Object} Pair
 * @param {number} s
 * @param {number} t
 */
// export interface Pair {
//   s: number;
//   t: number;
// }

/**
 * Simple implementation of findChangeBounds that strips common prefix and suffix.
 * @param {string | Uint8Array[]} x The first array to compare
 * @param {string | Uint8Array[]} y The second array to compare
 * @param {function(string | Uint8Array, string | Uint8Array): boolean} eq Equality function to compare elements
 * @returns {[number, number, number, number]}
 */
export function findChangeBounds(x, y, eq = (a, b) => a === b) {
  let smin = 0, tmin = 0;
  let smax = x.length, tmax = y.length;

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
 * Simple preprocessing function.
 * @param {string | Uint8Array[]} x The first array to compare
 * @param {string | Uint8Array[]} y The second array to compare
 * @param {function(string | Uint8Array, string | Uint8Array): boolean} eq Equality function to compare elements
 * @returns {[number[], number[], number[], number[], number[], number]}
 */
export function preprocess(x, y, eq) {
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
  let nanchors = 0;

  if (eq) {
    // Use custom equality function - store unique elements in an array
    /** @type {string | Uint8Array[] | ByteView} */
    const elements = [];

    /**
     * @param {string | Uint8Array | ByteView} e
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
  } else {
    // Use default Map-based approach for primitive types
    /** @type {Map<string | Uint8Array, number>} */
    const idx = new Map();

    // Process x
    for (let i = 0; i < x.length; i++) {
      const e = x[i];
      let id = idx.get(e);
      if (id === undefined) {
        id = idx.size;
        idx.set(e, id);
        counts[id] = 0;
      }
      counts[id] = (counts[id] || 0) + 1;
      x0.push(id);
      xidx.push(i);
    }

    // Process y
    for (let i = 0; i < y.length; i++) {
      const e = y[i];
      let id = idx.get(e);
      if (id === undefined) {
        id = idx.size;
        idx.set(e, id);
        counts[id] = 0;
      }
      counts[id] = (counts[id] || 0) + 1;
      y0.push(id);
      yidx.push(i);
    }
  }

  return [x0, y0, xidx, yidx, counts, nanchors];
}

/**
 * Simple segments function that returns basic segments.
 * @param {string | Uint8Array[]} x The first array to compare
 * @param {string | Uint8Array[]} y The second array to compare
 * @param {function(string | Uint8Array, string | Uint8Array): boolean} eq Equality function to compare elements
 * @returns {Pair[]}
 */
export function segments(x, y, eq = (a, b) => a === b) {
  const [smin, smax, tmin, tmax] = findChangeBounds(x, y, eq || ((a, b) => a === b));

  // Return simple segments
  return [
    { s: smin, t: tmin },
    { s: smax, t: tmax },
  ];
}

/**
 * Main diff function.
 * @param {string | Uint8Array[]} x The first array to compare
 * @param {string | Uint8Array[]} y The second array to compare
 * @param {function(string | Uint8Array, string | Uint8Array): boolean} eq Equality function to compare elements
 * @returns {[boolean[], boolean[]]}
 */
export function diff(x, y, eq = (a, b) => a === b) {
  const [x0, y0, xidx, yidx, _counts, _nanchors] = preprocess(x, y, eq);
  /** @type {boolean[]} */
  const resultVectorX = new Array(x.length + 1).fill(false);
  /** @type {boolean[]} */
  const resultVectorY = new Array(y.length + 1).fill(false);

  /** @type {Myers<string | Uint8Array>} */
  const m = new Myers();
  m.xidx = xidx;
  m.yidx = yidx;
  m.resultVectorX = resultVectorX;
  m.resultVectorY = resultVectorY;
  const [smin0, smax0, tmin0, tmax0] = m.init(x0, y0, (a, b) => a === b);
  m.compare(smin0, smax0, tmin0, tmax0, true, (a, b) => a === b);

  return [resultVectorX, resultVectorY];
}

