import { Op } from '../types.js';
import { diff } from '../impl/api.js';
// import { TextEdit, TextHunk } from './types.js';
import { Builder, ByteView } from './byteview.js';

const DEFAULT_CONTEXT = 3;

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
export function textHunks(x, y, context = DEFAULT_CONTEXT) {
  const [xlines] = ByteView.splitLines(ByteView.from(x));
  const [ylines] = ByteView.splitLines(ByteView.from(y));

  // Use diff with custom equality to compare ByteView content, not object references
  /**
   * @param {ByteView} a
   * @param {ByteView} b
   * @returns {boolean}
   */
  const eq = (a, b) => a.data === b.data;
  const [rx, ry] = diff(xlines, ylines, eq);

  return createTextHunks(xlines, ylines, rx, ry, context);
}

/**
 * textEdits compares the lines in x and y and returns the changes necessary to convert from one to the
 * other.
 * textEdits returns edits for every element in the input. If x and y are identical, the output will
 * consist of a match edit for every input element.
 * @param {string | Uint8Array} x The first text to compare
 * @param {string | Uint8Array} y The second text to compare
 * @returns {import('./types.js').TextEdit[]}
 */
export function textEdits(x, y) {
  const [xlines] = ByteView.splitLines(ByteView.from(x));
  const [ylines] = ByteView.splitLines(ByteView.from(y));

  // Use diff with custom equality to compare ByteView content, not object references
  /**
   * @param {ByteView} a
   * @param {ByteView} b
   * @returns {boolean}
   */
  const eq = (a, b) => a.data === b.data;
  const [rx, ry] = diff(xlines, ylines, eq);

  return createTextEdits(xlines, ylines, rx, ry);
}

const PREFIX_MATCH = ' ';
const PREFIX_DELETE = '-';
const PREFIX_INSERT = '+';

const MISSING_NEWLINE = '\n\\ No newline at end of file\n';

/**
 * Unified compares the lines in x and y and returns the changes necessary to convert from one to the other in unified format.
 *
 * @param {string | Uint8Array} x The first text to compare
 * @param {string | Uint8Array} y The second text to compare
 * @param {number} context Number of matching lines to include around changes (default: 3)
 * @returns {string | Uint8Array}
 */
export function unified(x, y, context = DEFAULT_CONTEXT) {
  const [xlines, xMissingNewline] = ByteView.splitLines(ByteView.from(x));
  const [ylines, yMissingNewline] = ByteView.splitLines(ByteView.from(y));

  // Use diff with custom equality to compare ByteView content, not object references
  /**
   * @param {ByteView} a
   * @param {ByteView} b
   * @returns {boolean}
   */
  const eq = (a, b) => a.data === b.data;
  const [rx, ry] = diff(xlines, ylines, eq);

  // Precompute output buffer size.
  let n = 0;
  /** @type {import('./types.js').TextHunk[]} */
  const hunks = createTextHunks(xlines, ylines, rx, ry, context);
  for (const h of hunks) {
    n += '@@ -, +, @@\n'.length;
    n += numDigits(h.posX + 1) + numDigits(h.endX - h.posX) + numDigits(h.posY + 1) + numDigits(h.endY - h.posY);
    for (const edit of h.edits) {
      n += 1 + (typeof edit.line === 'string' ? edit.line.length : edit.line.length);
    }
  }
  if (xMissingNewline >= 0) {
    n += MISSING_NEWLINE.length;
  }
  if (yMissingNewline >= 0) {
    n += MISSING_NEWLINE.length;
  }

  // Format output.
  const b = new Builder();
  b.grow(n);

  for (const h of hunks) {
    b.writeString(`@@ -${h.posX + 1},${h.endX - h.posX} +${h.posY + 1},${h.endY - h.posY} @@\n`);

    for (const edit of h.edits) {
      switch (edit.op) {
        case Op.Delete:
          b.writeString(PREFIX_DELETE);
          b.writeByteView(ByteView.from(edit.line));
          break;
        case Op.Insert:
          b.writeString(PREFIX_INSERT);
          b.writeByteView(ByteView.from(edit.line));
          break;
        case Op.Match:
          b.writeString(PREFIX_MATCH);
          b.writeByteView(ByteView.from(edit.line));
          break;
      }
    }
  }

  return b.build();
}

/**
 * Creates hunks with context support, based on Go's rvecs.Hunks implementation
 * @param {ByteView[]} x
 * @param {ByteView[]} y
 * @param {boolean[]} rx
 * @param {boolean[]} ry
 * @param {number} context
 * @returns {import('./types.js').TextHunk[]}
 */
function createTextHunks(x, y, rx, ry, context) {
  /** @type {import('./types.js').TextHunk[]} */
  const hunks = [];

  let s = 0, t = 0;           // current index into x, y
  let s0 = -1, t0 = -1;       // start of the current hunk
  let run = 0;                // number of consecutive matches
  const n = x.length;
  const m = y.length;

  while (s < n || t < m) {
    if ((s < n && rx[s]) || (t < m && ry[t])) {
      run = 0; // not a match, reset run counter

      // If we're not inside a hunk, start a new hunk or, if there's an overlap due to
      // context, continue with the previous hunk.
      if (s0 < 0) {
        // Start of hunk - include context lines before
        s0 = Math.max(0, s - context);
        t0 = Math.max(0, t - context);
      }

      // Process deletions
      while (s < n && rx[s]) {
        s++;
      }
      // Process insertions
      while (t < m && ry[t]) {
        t++;
      }
    } else {
      // Match - advance both pointers and count consecutive matches
      while (s < n && t < m && !rx[s] && !ry[t]) {
        s++;
        t++;
        run++;
      }
    }

    // Active in-progress hunk and we've seen enough matches to close it, or reached end
    if (s0 >= 0 && (run > 2 * context || (s === n && t === m))) {
      // Calculate how much context to include after the changes
      const delta = Math.min(0, -run + context);
      const s1 = s + delta;
      const t1 = t + delta;

      const edits = createTextEditsForRange(x, y, rx, ry, s0, s1, t0, t1);
      if (edits.length > 0) {
        hunks.push({
          posX: s0,
          endX: s1,
          posY: t0,
          endY: t1,
          edits,
        });
      }

      s0 = -1;
      t0 = -1;
      run = 0;
    }
  }

  return hunks;
}

/**
 * @param {ByteView[]} x
 * @param {ByteView[]} y
 * @param {boolean[]} rx
 * @param {boolean[]} ry
 * @param {number} startX
 * @param {number} endX
 * @param {number} startY
 * @param {number} endY
 * @returns {import('./types.js').TextEdit[]}
 */
function createTextEditsForRange(x, y, rx, ry, startX, endX, startY, endY) {
  /** @type {import('./types.js').TextEdit[]} */
  const edits = [];

  let s = startX, t = startY;
  while (s < endX || t < endY) {
    const oldS = s, oldT = t;

    // Process deletions
    while (s < endX && s < rx.length && rx[s]) {
      edits.push({
        op: Op.Delete,
        line: x[s].unsafeAs(),
      });
      s++;
    }

    // Process insertions
    while (t < endY && t < ry.length && ry[t]) {
      edits.push({
        op: Op.Insert,
        line: y[t].unsafeAs(),
      });
      t++;
    }

    // Process matches
    while (s < endX && t < endY && s < rx.length && t < ry.length && !rx[s] && !ry[t]) {
      edits.push({
        op: Op.Match,
        line: x[s].unsafeAs(),
      });
      s++;
      t++;
    }

    // Safety check to prevent infinite loop
    if (s === oldS && t === oldT) {
      // If no progress was made, force increment to avoid infinite loop
      if (s < endX) s++;
      else if (t < endY) t++;
      else break;
    }
  }

  return edits;
}

/**
 * @template T extends string | Uint8Array
 * @param {ByteView[]} x
 * @param {ByteView[]} y
 * @param {boolean[]} rx
 * @param {boolean[]} ry
 * @returns {import('./types.js').TextEdit[]}
 */
function createTextEdits(x, y, rx, ry) {
  /** @type {import('./types.js').TextEdit[]} */
  const edits = [];
  const n = rx.length - 1;
  const m = ry.length - 1;

  let s = 0, t = 0;
  while (s < n || t < m) {
    // Process deletions
    while (s < n && rx[s]) {
      edits.push({
        op: Op.Delete,
        line: x[s].unsafeAs(),
      });
      s++;
    }

    // Process insertions
    while (t < m && ry[t]) {
      edits.push({
        op: Op.Insert,
        line: y[t].unsafeAs(),
      });
      t++;
    }

    // Process matches
    while (s < n && t < m && !rx[s] && !ry[t]) {
      edits.push({
        op: Op.Match,
        line: x[s].unsafeAs(),
      });
      s++;
      t++;
    }
  }

  return edits;
}

/**
 * @param {number} v
 * @returns {number}
 */
function numDigits(v) {
  if (v < 10) return 1;
  if (v < 100) return 2;
  if (v < 1000) return 3;
  if (v < 10000) return 4;
  if (v < 100000) return 5;

  let n = 0;
  while (v > 0) {
    v = Math.floor(v / 10);
    n++;
  }
  return n;
}
