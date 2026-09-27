export type DebugLogger = (...args: unknown[]) => void;

export type CreateDebugLogger = (namespace: string) => DebugLogger;
