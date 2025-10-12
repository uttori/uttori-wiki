/**
 * Hunks compares the lines in x and y and returns the changes necessary to convert from one to the other.
 * The output is a sequence of hunks that each describe a number of consecutive edits.
 * Hunks include a number of matching elements before and after the last delete or insert operation.
 * If x and y are identical, the output has length zero.
 * @param {string} x The first text to compare
 * @param {string} y The second text to compare
 * @param {number} context Number of matching lines to include around changes (default: 3)
 * @returns {TextHunk[]}
 */
export function textHunks(x: string, y: string, context?: number): TextHunk[];
/**
 * textEdits compares the lines in x and y and returns the changes necessary to convert from one to the other.
 * textEdits returns edits for every element in the input. If x and y are identical, the output will consist of a match edit for every input element.
 * @param {string} x The first text to compare
 * @param {string} y The second text to compare
 * @returns {TextEdit[]}
 */
export function textEdits(x: string, y: string): TextEdit[];
/**
 * Unified compares the lines in x and y and returns the changes necessary to convert from one to the other in unified format.
 *
 * @param {string} x The first text to compare
 * @param {string} y The second text to compare
 * @param {number} context Number of matching lines to include around changes (default: 3)
 * @returns {string}
 */
export function unified(x: string, y: string, context?: number): string;
/**
 * htmlTable compares the lines in x and y and returns an HTML table showing the differences.
 *
 * @param {string} x The first text to compare (old version)
 * @param {string} y The second text to compare (new version)
 * @param {number} context Number of matching lines to include around changes (default: 3)
 * @returns {string} HTML table string
 */
export function htmlTable(x: string, y: string, context?: number): string;
/**
 * Edit describes a single edit of a line-by-line diff.
 */
export type TextEdit = {
    /**
     * Edit operation
     */
    op: number;
    /**
     * Line, including newline character (if any)
     */
    line: string;
};
/**
 * Hunk describes a sequence of consecutive edits.
 */
export type TextHunk = {
    /**
     * Start line in x (zero-based).
     */
    posX: number;
    /**
     * End line in x (zero-based).
     */
    endX: number;
    /**
     * Start line in y (zero-based).
     */
    posY: number;
    /**
     * End line in y (zero-based).
     */
    endY: number;
    /**
     * Edits to transform x lines PosX..EndX to y lines PosY..EndY
     */
    edits: TextEdit[];
};
//# sourceMappingURL=textdiff.d.ts.map