/**
 * @typedef {object} Turn
 * @property {string} user The user's message.
 * @property {string} [assistant] The assistant's message.
 * @property {number} ts The timestamp of the turn.
 */
/**
 * @typedef {object} Memory
 * @property {string} summary The summary of the memory, rolling 1 to 3 sentences.
 * @property {Turn[]} last The last N turns.
 * @property {Record<string,string>} [entities] The optional entities.
 */
/**
 * @typedef {object} Memories
 * @property {Memory} mem The memory.
 * @property {number} expires The expiration time.
 */
export class MemoryStore {
    /**
     * The constructor.
     * @param {number} [ttlMs] The TTL in milliseconds, defaults to 1 hour.
     * @param {number} [maxTurns] The maximum number of turns, defaults to 5.
     */
    constructor(ttlMs?: number, maxTurns?: number);
    /**
     * The memories.
     * @type {Map<string, Memories>}
     */
    memories: Map<string, Memories>;
    /**
     * The TTL in milliseconds.
     * @type {number}
     */
    ttlMs: number;
    /**
     * The maximum number of turns.
     * @type {number}
     */
    maxTurns: number;
    /**
     * Get the current time.
     * @returns {number} The current time.
     */
    now: () => number;
    /**
     * Clip the memory.
     * @param {Memory} memory The memory.
     * @returns {Memory} The clipped memory.
     */
    clip: (memory: Memory) => Memory;
    /**
     * Get the memory.
     * @param {string} id The id of the memory.
     * @returns {Memory | undefined} The memory.
     */
    get(id: string): Memory | undefined;
    /**
     * Set the memory.
     * @param {string} id The id of the memory.
     * @param {Memory} mem The memory.
     */
    set(id: string, mem: Memory): void;
    /**
     * Touch the memory.
     * @param {string} id The id of the memory.
     */
    touch(id: string): void;
    /**
     * Cleanup the memory store.
     */
    cleanup(): void;
}
export type Turn = {
    /**
     * The user's message.
     */
    user: string;
    /**
     * The assistant's message.
     */
    assistant?: string;
    /**
     * The timestamp of the turn.
     */
    ts: number;
};
export type Memory = {
    /**
     * The summary of the memory, rolling 1 to 3 sentences.
     */
    summary: string;
    /**
     * The last N turns.
     */
    last: Turn[];
    /**
     * The optional entities.
     */
    entities?: Record<string, string>;
};
export type Memories = {
    /**
     * The memory.
     */
    mem: Memory;
    /**
     * The expiration time.
     */
    expires: number;
};
//# sourceMappingURL=memory.d.ts.map