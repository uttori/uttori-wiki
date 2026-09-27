import type { DebugLogger, CreateDebugLogger } from './types/debug.js';

export type { DebugLogger, CreateDebugLogger } from './types/debug.js';

const noop: DebugLogger = () => {};

let createDebugLogger: CreateDebugLogger = () => noop;

/* c8 ignore next 2 */
try { const { default: debug } = await import('debug'); createDebugLogger = (namespace) => debug(namespace); } catch {}

/**
 * Create a namespaced debug logger.
 * @param namespace The debug namespace.
 * @returns The debug logger, or a noop logger when debug is unavailable.
 */
export function createDebug(namespace: string): DebugLogger {
  return createDebugLogger(namespace);
}
