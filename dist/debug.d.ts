import type { DebugLogger } from './types/debug.js';
export type { DebugLogger, CreateDebugLogger } from './types/debug.js';
/**
 * Create a namespaced debug logger.
 * @param namespace The debug namespace.
 * @returns The debug logger, or a noop logger when debug is unavailable.
 */
export declare function createDebug(namespace: string): DebugLogger;
//# sourceMappingURL=debug.d.ts.map