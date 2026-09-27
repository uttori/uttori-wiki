const noop = () => { };
let createDebugLogger = () => noop;
/* c8 ignore next 2 */
try {
    const { default: debug } = await import('debug');
    createDebugLogger = (namespace) => debug(namespace);
}
catch { }
/**
 * Create a namespaced debug logger.
 * @param namespace The debug namespace.
 * @returns The debug logger, or a noop logger when debug is unavailable.
 */
export function createDebug(namespace) {
    return createDebugLogger(namespace);
}
//# sourceMappingURL=debug.js.map