## TypeScript declarations

<details>
<summary>View documented types and signatures</summary>

```typescript
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

export interface Turn {
    /** The user's message. */
    user: string;
    /** The assistant's message. */
    assistant?: string;
    /** The timestamp of the turn. */
    ts: number;
}
export interface Memory {
    /** The summary of the memory, rolling 1 to 3 sentences. */
    summary: string;
    /** The last N turns. */
    last: Turn[];
    /** The optional entities. */
    entities?: Record<string, string>;
}
export interface Memories {
    /** The memory. */
    mem: Memory;
    /** The expiration time. */
    expires: number;
}
```

</details>
