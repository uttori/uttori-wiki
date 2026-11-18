/** The previous complete checkout stays readable between the two directory renames. */
export declare const previousSidecars: (directory: string) => string;
/** Identify a directory across renames, independently of its current pathname. */
export declare function directoryIdentity(directory: string): Promise<string | undefined>;
/** Select the committed checkout, including after a process stops between renames. */
export declare function sidecarGeneration(directory: string): Promise<{
    directory: string;
    identity: string | undefined;
}>;
//# sourceMappingURL=sidecar-generation.d.ts.map