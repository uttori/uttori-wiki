import { stat } from 'node:fs/promises';
import path from 'node:path';
/** The previous complete checkout stays readable between the two directory renames. */
export const previousSidecars = (directory) => `${path.resolve(directory)}.uttori-previous`;
/** Identify a directory across renames, independently of its current pathname. */
export async function directoryIdentity(directory) {
    try {
        const info = await stat(directory, { bigint: true });
        return `${info.dev}/${info.ino}`;
    }
    catch (error) {
        if (error.code === 'ENOENT')
            return undefined;
        throw error;
    }
}
/** Select the committed checkout, including after a process stops between renames. */
export async function sidecarGeneration(directory) {
    const identity = await directoryIdentity(directory);
    if (identity)
        return { directory, identity };
    const previous = previousSidecars(directory);
    const backup = await directoryIdentity(previous);
    if (backup)
        return { directory: previous, identity: backup };
    // Promotion may have completed and cleaned up the backup since the first lookup.
    return { directory, identity: await directoryIdentity(directory) };
}
//# sourceMappingURL=sidecar-generation.js.map