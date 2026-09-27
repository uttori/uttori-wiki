export class MemoryStore {
    /**
     * The memories.
     *
     */
    memories = new Map();
    /**
     * The TTL in milliseconds.
     *
     */
    ttlMs;
    /**
     * The maximum number of turns.
     *
     */
    maxTurns;
    /**
     * The constructor.
     * @param [ttlMs] The TTL in milliseconds, defaults to 1 hour.
     * @param [maxTurns] The maximum number of turns, defaults to 5.
     */
    constructor(ttlMs = 60 * 60 * 1000, maxTurns = 5) {
        this.ttlMs = ttlMs;
        this.maxTurns = maxTurns;
    }
    /**
     * Get the current time.
     * @returns The current time.
     */
    now = () => Date.now();
    /**
     * Clip the memory.
     * @param memory The memory.
     * @returns The clipped memory.
     */
    clip = (memory) => ({
        ...memory,
        last: memory.last.slice(-this.maxTurns),
    });
    /**
     * Get the memory.
     * @param id The id of the memory.
     * @returns The memory.
     */
    get(id) {
        const memory = this.memories.get(id);
        if (!memory) {
            return undefined;
        }
        if (memory.expires < this.now()) {
            this.memories.delete(id);
            return undefined;
        }
        return memory.mem;
    }
    /**
     * Set the memory.
     * @param id The id of the memory.
     * @param mem The memory.
     */
    set(id, mem) {
        this.memories.set(id, {
            mem: this.clip(mem),
            expires: this.now() + this.ttlMs,
        });
    }
    /**
     * Touch the memory.
     * @param id The id of the memory.
     */
    touch(id) {
        const memory = this.memories.get(id);
        if (memory) {
            memory.expires = this.now() + this.ttlMs;
        }
    }
    /** Cleanup the memory store. */
    cleanup() {
        const now = this.now();
        for (const [k, v] of this.memories.entries()) {
            if (v.expires < now) {
                this.memories.delete(k);
            }
        }
    }
}
//# sourceMappingURL=memory.js.map