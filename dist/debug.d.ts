/**
 * @callback DebugLogger
 * @param {...unknown} args Debug arguments.
 * @returns {void}
 */
export type DebugLogger = (...args: unknown) => void;
export type CreateDebugLogger = (namespace: string) => DebugLogger;
/**
 * Create a namespaced debug logger.
 * @param {string} namespace The debug namespace.
 * @returns {DebugLogger} The debug logger, or a noop logger when debug is unavailable.
 */
export declare function createDebug(namespace: string): DebugLogger;
//# sourceMappingURL=debug.d.ts.map