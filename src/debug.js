/**
 * @callback DebugLogger
 * @param {...unknown} args Debug arguments.
 * @returns {void}
 */

/**
 * @callback CreateDebugLogger
 * @param {string} namespace The debug namespace.
 * @returns {DebugLogger}
 */

const noop = /** @type {DebugLogger} */ ((..._args) => {});

/** @type {CreateDebugLogger} */
let createDebugLogger = () => noop;

/* c8 ignore next 2 */
try { const { default: debug } = await import('debug'); createDebugLogger = (namespace) => debug(namespace); } catch {}

/**
 * Create a namespaced debug logger.
 * @param {string} namespace The debug namespace.
 * @returns {DebugLogger} The debug logger, or a noop logger when debug is unavailable.
 */
export function createDebug(namespace) {
  return createDebugLogger(namespace);
}
