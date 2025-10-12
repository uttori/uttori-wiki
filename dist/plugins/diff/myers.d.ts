export default Myers;
/**
 * Myers algorithm implementation for diff computation.
 * This is a full implementation based on "An O(ND) Difference Algorithm and its Variations"
 * by Eugene W. Myers.
 * @template T
 */
declare class Myers<T> {
    /**
     * @param {number[]} xidx
     * @param {number[]} yidx
     * @param {T[]} x
     * @param {T[]} y
     */
    constructor(xidx: number[], yidx: number[], x: T[], y: T[]);
    /** @type {T[]} */
    x: T[];
    /** @type {T[]} */
    y: T[];
    /** @type {number[]} */
    vf: number[];
    /** @type {number[]} */
    vb: number[];
    /** @type {number} */
    v0: number;
    /** @type {number} */
    costLimit: number;
    /** @type {number[]} */
    xidx: number[];
    /** @type {number[]} */
    yidx: number[];
    /** @type {boolean[]} */
    resultVectorX: boolean[];
    /** @type {boolean[]} */
    resultVectorY: boolean[];
    /**
     * @param {T[]} x0 The first array to compare
     * @param {T[]} y0 The second array to compare
     * @param {function(T, T): boolean} eq Equality function to compare elements
     * @returns {Array<number, number, number, number>}
     */
    init(x0: T[], y0: T[], eq: (arg0: T, arg1: T) => boolean): Array<number, number, number, number>;
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
    compare(smin: number, smax: number, tmin: number, tmax: number, optimal: boolean, eq: (arg0: T, arg1: T) => boolean): void;
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
    split(smin: number, smax: number, tmin: number, tmax: number, optimal: boolean, eq: (arg0: T, arg1: T) => boolean): [number, number, number, number, boolean, boolean];
}
//# sourceMappingURL=myers.d.ts.map