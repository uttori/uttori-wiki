// Constants for heuristics
const minCostLimit = 4096;
const goodDiagMinLen = 20;     // Minimal length of a diagonal for it to be considered.
const goodDiagCostLimit = 256; // The Heuristic is only applied if the cost exceeds this number.
const goodDiagMagic = 4;       // Magic number for diagonal selection.

/**
 * Myers algorithm implementation for diff computation.
 * This is a full implementation based on "An O(ND) Difference Algorithm and its Variations"
 * by Eugene W. Myers.
 * @template T
 */
class Myers {
  // Inputs to compare.
  /** @type {T[]} */
  x = [];
  /** @type {T[]} */
  y = [];

  // v-arrays for forwards and backwards iteration respectively.
  // A v-array stores the furthest reaching endpoint of a d-path in diagonal k in v[v0+k] where v0 is the offset that translates k in [-d, d] to k0 = v0+k in [0, 2*d].
  // The endpoints only store the s-coordinate since t = s - k.
  /** @type {number[]} */
  vf = [];
  /** @type {number[]} */
  vb = [];
  /** @type {number} */
  v0 = 0;

  // The costLimit parameter controls the TOO_EXPENSIVE heuristic that limits the runtime of
  // the algorithm for large inputs.
  /** @type {number} */
  costLimit = 0;

  // Mapping of s, t indices to the location in the result vectors.
  /** @type {number[]} */
  xidx = [];
  /** @type {number[]} */
  yidx = [];

  // Result vectors.
  /** @type {boolean[]} */
  resultVectorX = [];
  /** @type {boolean[]} */
  resultVectorY = [];

  /**
   * @param {number[]} xidx
   * @param {number[]} yidx
   * @param {T[]} x
   * @param {T[]} y
   */
  constructor(xidx, yidx, x, y) {
    this.xidx = xidx;
    this.yidx = yidx;
    this.resultVectorX = new Array(x.length + 1).fill(false);
    this.resultVectorY = new Array(y.length + 1).fill(false);
  }

  /**
   * @param {T[]} x0 The first array to compare
   * @param {T[]} y0 The second array to compare
   * @param {function(T, T): boolean} eq Equality function to compare elements
   * @returns {Array<number, number, number, number>}
   */
  init(x0, y0, eq) {
    let smin = 0;
    let tmin = 0;
    let smax = x0.length;
    let tmax = y0.length;

    // Strip common prefix.
    while (smin < smax && tmin < tmax && eq(x0[smin], y0[tmin])) {
      smin++;
      tmin++;
    }

    // Strip common suffix.
    while (smax > smin && tmax > tmin && eq(x0[smax - 1], y0[tmax - 1])) {
      smax--;
      tmax--;
    }

    const N = smax - smin;
    const M = tmax - tmin;
    const diagonals = N + M;
    // +1 for the middle point and +2 for the borders
    const vlen = 2 * diagonals + 3;
    // allocate space for vf and vb with a single allocation
    const buf = new Array(2 * vlen).fill(0);

    this.x = x0;
    this.y = y0;
    this.vf = buf.slice(0, vlen);
    this.vb = buf.slice(vlen);
    // +1 for the middle point
    this.v0 = diagonals + 1;

    // Set the costLimit to the approximate square root of the number of diagonals bounded by minCostLimit.
    let costLimit = 1;
    for (let i = diagonals; i !== 0; i >>= 2) {
      costLimit <<= 1;
    }
    this.costLimit = Math.max(minCostLimit, costLimit);

    return [smin, smax, tmin, tmax];
  }

  /**
   * compare finds an optimal d-path from (smin, tmin) to (smax, tmax).
   * Important: x[smin:smax] and y[tmin:tmax] must not have a common prefix or a common suffix.
   * @param {number} smin
   * @param {number} smax
   * @param {number} tmin
   * @param {number} tmax
   * @param {boolean} optimal
   * @param {function(T, T): boolean} eq Equality function to compare elements
   */
  compare(smin, smax, tmin, tmax, optimal, eq) {
    if (smin === smax) {
      // s is empty, therefore everything in tmin to tmax is an insertion.
      for (let t = tmin; t < tmax; t++) {
        this.resultVectorY[this.yidx[t]] = true;
      }
    } else if (tmin === tmax) {
      // t is empty, therefore everything in smin to smax is a deletion.
      for (let s = smin; s < smax; s++) {
        this.resultVectorX[this.xidx[s]] = true;
      }
    } else {
      // Use split to divide the input into three pieces:
      //
      //   (1) A, possibly empty, rect (smin, tmin) to (s0, t0)
      //   (2) A, possibly empty, sequence of diagonals (matches) (s0, t0) to (s1, t1)
      //   (3) A, possibly empty, rect (s1, t1) to (smax, tmax)
      //
      // (1) and (3) will not have a common suffix or a common prefix, so we can use them directly as inputs to compare.
      const [s0, s1, t0, t1, opt0, opt1] = this.split(smin, smax, tmin, tmax, optimal, eq);

      // Recurse into (1) and (3).
      this.compare(smin, s0, tmin, t0, opt0, eq);
      this.compare(s1, smax, t1, tmax, opt1, eq);
    }
  }

  /**
   * split finds the endpoints of a, potentially empty, sequence of diagonals in the middle of an
   * optimal path from (smin, tmin) to (smax, tmax).
   *
   * Important: x[smin:smax] and y[tmin:tmax] must not have a common prefix or a common suffix and
   * they may not both be empty.
   * @param {number} smin
   * @param {number} smax
   * @param {number} tmin
   * @param {number} tmax
   * @param {boolean} optimal
   * @param {function(T, T): boolean} eq Equality function to compare elements
   * @returns {[number, number, number, number, boolean, boolean]}
   */
  split(smin, smax, tmin, tmax, optimal, eq) {
    const N = smax - smin;
    const M = tmax - tmin;
    const x = this.x;
    const y = this.y;
    const vf = this.vf;
    const vb = this.vb;
    const v0 = this.v0;

    // Bounds for k. Since t = s - k, we can determine the min and max for k using: k = s - t.
    const kmin = smin - tmax;
    const kmax = smax - tmin;

    // In contrast to the paper, we're going to number all diagonals with consistent k's by
    // centering the forwards and backwards searches around different midpoints. This way, we don't
    // need to convert k's when checking for overlap and it improves readability.
    const fmid = smin - tmin;
    const bmid = smax - tmax;
    let fmin = fmid, fmax = fmid;
    let bmin = bmid, bmax = bmid;

    // We know from Corollary 1 that the optimal diff length is going to be odd or even as (N-M) is
    // odd or even. We're going to use this below to decide on when to check for path overlaps.
    const odd = (N - M) % 2 !== 0;

    // Since we can assume that split is not called with a common prefix or suffix, we know that
    // x != y, therefore there is no 0-path. Furthermore, the d=0 iteration would result in the
    // following trivial result:
    vf[v0 + fmid] = smin;
    vb[v0 + bmid] = smax;
    // Consequently, we can start at d=1 which allows us to omit special handling of d==0 in the hot
    // k-loops below.
    //
    // We know from Lemma 3 that there's a d-path with d = ⌈N + M⌉/2. Therefore, we can omit the
    // loop condition and instead blindly increment d.
    for (let d = 1; ; d++) {
      // Each loop iteration, we're trying to find a d-path by first searching forwards and then
      // searching backwards for a d-path. If two paths overlap, we have found a d-path, if not
      // we're going to continue searching.

      let longestDiag = 0; // Longest diagonal we found

      // Forwards iteration.
      //
      // First determine which diagonals k to search. Originally, we would search k = [fmid-d,
      // fmid+d] in steps of 2, but that would lead us to move outside the edit grid and would
      // require more memory, more work, and special handling for s and t coordinates outside x and y.
      //
      // Instead we put a few tighter bounds on k.
      // We need to make sure to pick a start and end point in the original search space.
      // Since we're searching in steps of 2, this requires changing the min and max for k when outside the boundary.
      //
      // Additionally, we're also initializing the v-array such that we can avoid a special case
      // in the k-loop below (for that we allocated an extra two elements up front): It let's us
      // handle the top and left hand border with the same logic as any other value.
      if (fmin > kmin) {
        fmin--;
        vf[v0 + fmin - 1] = Number.MIN_SAFE_INTEGER;
      } else {
        fmin++;
      }
      if (fmax < kmax) {
        fmax++;
        vf[v0 + fmax + 1] = Number.MIN_SAFE_INTEGER;
      } else {
        fmax--;
      }
      // The k-loop searches for the furthest reaching d-path from (0,0) to (N,M) in diagonal k.
      //
      // The v-array, v[i] = vf[v0+fmid+i] (modulo bounds on k), contains the endpoints for the
      // furthest reaching (d-1)-path in elements v[-d-1], v[-d+1], ..., v[d-1], v[d+1]. We know
      // from Lemma 1 that these elements will be disjoined from where we're going to store the
      // endpoint for the furthest reaching d-path that we're computing here.
      for (let k = fmin; k <= fmax; k += 2) {
        const k0 = k + v0; // k as an index into vf

        // According to Lemma 2 there are two possible furthest reaching d-paths:
        //
        //   1) A furthest reaching d-path on diagonal k-1, followed by a horizontal edge,
        //      followed by the longest possible sequence of diagonals.
        //   2) A furthest reaching d-path on diagonal k+1, followed by a vertical edge,
        //      followed by the longest possible sequence of diagonals
        //
        // First find the endpoint of the furthest reaching d-path followed by a horizontal or
        // vertical edge.
        /** @type {number} */
        let s;
        if (vf[k0 - 1] < vf[k0 + 1]) {
          // Case 2. The vertical edge is implied by t = s - k.
          s = vf[k0 + 1];
        } else {
          // Case 1 or case 2 when v[k-1] == v[k+1]. Handling the v[k-1] == v[k+1] case
          // here prioritizes deletions over insertions.
          s = vf[k0 - 1] + 1;
        }
        let t = s - k;

        // Then follow the diagonals as long as possible.
        const s0 = s, t0 = t;
        while (s < smax && t < tmax && eq(x[s], y[t])) {
          s++;
          t++;
        }

        // If we have found a long diagonal, we may be able to apply the GOOD_DIAGONAL heuristic (see below).
        longestDiag = Math.max(longestDiag, s - s0);

        // Then store the endpoint of the furthest reaching d-path.
        vf[k0] = s;

        // Potentially, check for an overlap with a backwards d-path. We're done when we found it.
        if (odd && bmin <= k && k <= bmax && s >= vb[k0]) {
          return [s0, s, t0, t, true, true];
        }
      }

      // Backwards iteration.
      //
      // This is mostly analogous to the forward iteration.
      if (bmin > kmin) {
        bmin--;
        vb[v0 + bmin - 1] = Number.MAX_SAFE_INTEGER;
      } else {
        bmin++;
      }
      if (bmax < kmax) {
        bmax++;
        vb[v0 + bmax + 1] = Number.MAX_SAFE_INTEGER;
      } else {
        bmax--;
      }
      for (let k = bmin; k <= bmax; k += 2) {
        const k0 = k + v0;
        /** @type {number} */
        let s;
        if (vb[k0 - 1] < vb[k0 + 1]) {
          s = vb[k0 - 1];
        } else {
          s = vb[k0 + 1] - 1;
        }
        let t = s - k;

        const s0 = s, t0 = t;
        while (s > smin && t > tmin && eq(x[s - 1], y[t - 1])) {
          s--;
          t--;
        }

        longestDiag = Math.max(longestDiag, s0 - s);

        vb[k0] = s;

        if (!odd && fmin <= k && k <= fmax && s <= vf[v0 + k]) {
          return [s, s0, t, t0, true, true];
        }
      }

      if (optimal) {
        continue;
      }

      // Heuristic (GOOD_DIAGONAL):
      // If we're over the cost limit for this heuristic, we accept a good diagonal to split the search space instead of searching for the optimal split point.
      // A good diagonal is one that's longer than goodDiagMinLen, not too far from a corner and not too far from the middle diagonal.
      if (longestDiag >= goodDiagMinLen && d >= goodDiagCostLimit) {
        const best = {
          v: 0,
          s0: 0, s1: 0, t0: 0, t1: 0,
          opt0: false, opt1: false,
        };
        // Check forward paths.
        for (let k = fmin; k <= fmax; k += 2) {
          const k0 = k + v0;
          const s = vf[k0];
          const t = s - k;
          const v = (s - smin) + (t - tmin) - Math.max(fmid - d, d - fmid);
          if (s < smin || smax <= s || t < tmin || tmax <= t) {
            continue;
          }
          if (v <= goodDiagMagic * d || v < best.v) {
            continue; // not good enough, check next diagonal
          }

          // Find the previous k, by doing the decision as in the forward iteration.
          // And use it to reconstruct the middle diagonal: By construction, the path from (s,t)
          // to (ps, pt) consists of horizontal or vertical step plus a possibly empty sequence of diagonals.
          /** @type {number} */
          let pk;
          if (vf[k0 - 1] < vf[k0 + 1]) {
            pk = k + 1;
          } else {
            pk = k - 1;
          }
          const ps = vf[pk + v0];
          const pt = ps - pk;
          // Number of diagonal steps.
          const diag = Math.min(s - ps, t - pt);
          if (diag >= goodDiagMinLen) {
            best.v = v;
            best.s0 = s - diag;
            best.s1 = s;
            best.t0 = t - diag;
            best.t1 = t;
            best.opt0 = true;
            best.opt1 = false;
          }
        }
        // Check backward paths.
        for (let k = bmin; k <= bmax; k += 2) {
          const k0 = k + v0;
          const s = vb[k0];
          const t = s - k;
          if (s < smin || smax <= s || t < tmin || tmax <= t) {
            continue;
          }
          const v = (smax - s) + (tmax - t) - Math.max(bmid - d, d - bmid);
          if (v <= goodDiagMagic * d || v < best.v) {
            continue;
          }

          /** @type {number} */
          let pk;
          if (vb[k0 - 1] < vb[k0 + 1]) {
            pk = k - 1;
          } else {
            pk = k + 1;
          }
          const ps = vb[pk + v0];
          const pt = ps - pk;
          // Number of diagonal steps.
          const diag = Math.min(ps - s, pt - t);
          if (diag >= goodDiagMinLen) {
            best.v = v;
            best.s0 = s;
            best.s1 = s + diag;
            best.t0 = t;
            best.t1 = t + diag;
            best.opt0 = false;
            best.opt1 = true;
          }
        }
        if (best.v > 0) {
          return [best.s0, best.s1, best.t0, best.t1, best.opt0, best.opt1];
        }
      }

      // Heuristic (TOO_EXPENSIVE):
      // Limit the amount of work to find an optimal path by picking a good-enough middle diagonal if we're over the cost limit.
      if (d >= this.costLimit) {
        // Find endpoint of the furthest reaching forward d-path that maximizes x+y.
        let fbest = Number.MIN_SAFE_INTEGER, fbestk = Number.MIN_SAFE_INTEGER;
        for (let k = fmin; k <= fmax; k += 2) {
          const k0 = k + v0;
          const s = vf[k0];
          const t = s - k;
          if (smin <= s && s < smax && tmin <= t && t < tmax && fbest < s + t) {
            fbest = s + t;
            fbestk = k;
          }
        }

        // Find endpoint of the furthest reaching backward d-path that minimizes x+y.
        let bbest = Number.MAX_SAFE_INTEGER, bbestk = Number.MAX_SAFE_INTEGER;
        for (let k = bmin; k <= bmax; k += 2) {
          const k0 = k + v0;
          const s = vb[k0];
          const t = s - k;
          if (smin <= s && s < smax && tmin <= t && t < tmax && s + t < bbest) {
            bbest = s + t;
            bbestk = k;
          }
        }

        // Use better of the two d-paths.
        if (fbest !== Number.MIN_SAFE_INTEGER && (smax + tmax) - bbest < fbest - (smin + tmin)) {
          const k = fbestk;
          const k0 = k + v0;
          const s = vf[k0];
          const t = s - k;

          // Same as in GOOD_DIAGONAL heuristic.
          /** @type {number} */
          let pk;
          if (vf[k0 - 1] < vf[k0 + 1]) {
            pk = k + 1;
          } else {
            pk = k - 1;
          }
          const ps = vf[pk + v0];
          const pt = ps - pk;
          // Number of diagonal steps.
          const diag = Math.min(s - ps, t - pt);
          // Start of diagonal.
          const s0 = s - diag;
          const t0 = t - diag;
          return [s0, s, t0, t, true, false];
        } else if (bbest !== Number.MAX_SAFE_INTEGER) {
          const k = bbestk;
          const k0 = k + v0;
          const s = vb[k0];
          const t = s - k;

          // Analogous to forward case.
          /** @type {number} */
          let pk;
          if (vb[k0 - 1] < vb[k0 + 1]) {
            pk = k - 1;
          } else {
            pk = k + 1;
          }
          const ps = vb[pk + v0];
          const pt = ps - pk;
          // Number of diagonal steps.
          const diag = Math.min(ps - s, pt - t);
          // End of diagonal.
          const s0 = s + diag;
          const t0 = t + diag;
          return [s, s0, t, t0, false, true];
        } else {
          throw new Error('no best path found');
        }
      }
    }
  }
}

export default  Myers;
