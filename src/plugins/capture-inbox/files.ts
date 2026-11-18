import { randomUUID } from 'node:crypto';
import { rename, rm, writeFile } from 'node:fs/promises';

/** An error safe to show to the authenticated maintainer. */
export class CaptureError extends Error {
  /** @param status HTTP status. @param message User-visible explanation. */
  constructor(readonly status: number, message: string) {
    super(message);
  }
}

/**
 * Replace a file only after its complete contents reach a sibling file.
 * @param file Destination under the inbox or sidecar directory.
 * @param bytes Contents to persist.
 */
export async function writeCheckpoint(file: string, bytes: Buffer | string): Promise<void> {
  const temporary = `${file}.${randomUUID()}.tmp`;
  try {
    await writeFile(temporary, bytes, { flag: 'wx', mode: 0o600 });
    await rename(temporary, file);
  } finally {
    await rm(temporary, { force: true });
  }
}
