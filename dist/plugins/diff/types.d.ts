export namespace Op {
    let Match: number;
    let Delete: number;
    let Insert: number;
}
/**
 * Edit describes a single edit of a diff.
 *   - For Match, both X and Y contain the matching element.
 *   - For Delete, X contains the deleted element and Y is unset (zero value).
 *   - For Insert, Y contains the inserted element and X is unset (zero value).
 */
export type Edit = {
    /**
     * The edit operation (one of Op.Match = 0, Op.Delete = 1, Op.Insert = 2).
     */
    op: number;
    /**
     * The element from the left slice.
     */
    x: string | Uint8Array;
    /**
     * The element from the right slice.
     */
    y: string | Uint8Array;
};
/**
 * Hunk describes a sequence of consecutive edits.
 */
export type Hunk = {
    /**
     * The start position in x.
     */
    posX: number;
    /**
     * The end position in x.
     */
    endX: number;
    /**
     * The start position in y.
     */
    posY: number;
    /**
     * The end position in y.
     */
    endY: number;
    /**
     * The edits to transform x[PosX:EndX] to y[PosY:EndY].
     */
    edits: Edit[];
};
//# sourceMappingURL=types.d.ts.map