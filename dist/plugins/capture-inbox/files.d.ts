/** An error safe to show to the authenticated maintainer. */
export declare class CaptureError extends Error {
    readonly status: number;
    /** @param status HTTP status. @param message User-visible explanation. */
    constructor(status: number, message: string);
}
/**
 * Replace a file only after its complete contents reach a sibling file.
 * @param file Destination under the inbox or sidecar directory.
 * @param bytes Contents to persist.
 */
export declare function writeCheckpoint(file: string, bytes: Buffer | string): Promise<void>;
//# sourceMappingURL=files.d.ts.map