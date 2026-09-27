import type { Memory, Memories } from '../../types/plugins/chat-bot/memory.js';
export type { Turn, Memory, Memories } from '../../types/plugins/chat-bot/memory.js';
export declare class MemoryStore {
    /**
     * The memories.
     *
     */
    memories: Map<string, Memories>;
    /**
     * The TTL in milliseconds.
     *
     */
    ttlMs: number;
    /**
     * The maximum number of turns.
     *
     */
    maxTurns: number;
    /**
     * The constructor.
     * @param [ttlMs] The TTL in milliseconds, defaults to 1 hour.
     * @param [maxTurns] The maximum number of turns, defaults to 5.
     */
    constructor(ttlMs?: number, maxTurns?: number);
    /**
     * Get the current time.
     * @returns The current time.
     */
    now: () => number;
    /**
     * Clip the memory.
     * @param memory The memory.
     * @returns The clipped memory.
     */
    clip: (memory: Memory) => Memory;
    /**
     * Get the memory.
     * @param id The id of the memory.
     * @returns The memory.
     */
    get(id: string): Memory | undefined;
    /**
     * Set the memory.
     * @param id The id of the memory.
     * @param mem The memory.
     */
    set(id: string, mem: Memory): void;
    /**
     * Touch the memory.
     * @param id The id of the memory.
     */
    touch(id: string): void;
    /** Cleanup the memory store. */
    cleanup(): void;
}
//# sourceMappingURL=memory.d.ts.map