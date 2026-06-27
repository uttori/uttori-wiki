/**
 * Create a namespaced debug logger.
 * @param {string} namespace The debug namespace.
 * @returns {DebugLogger} The debug logger, or a noop logger when debug is unavailable.
 */
export function createDebug(namespace: string): DebugLogger;
export type DebugLogger = (...args: unknown[]) => void;
export type CreateDebugLogger = (namespace: string) => DebugLogger;
//# sourceMappingURL=debug.d.ts.map