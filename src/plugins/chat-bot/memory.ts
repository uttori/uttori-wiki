import type { Memory, Memories } from '../../types/plugins/chat-bot/memory.js';

export type { Turn, Memory, Memories } from '../../types/plugins/chat-bot/memory.js';

export class MemoryStore {
  /**
   * The memories.
   *
   */
  memories = new Map<string, Memories>();
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
  constructor(ttlMs = 60 * 60 * 1000, maxTurns = 5) {
    this.ttlMs = ttlMs;
    this.maxTurns = maxTurns;
  }

  /**
   * Get the current time.
   * @returns The current time.
   */
  now = (): number => Date.now();

  /**
   * Clip the memory.
   * @param memory The memory.
   * @returns The clipped memory.
   */
  clip = (memory: Memory): Memory => ({
    ...memory,
    last: memory.last.slice(-this.maxTurns),
  });

  /**
   * Get the memory.
   * @param id The id of the memory.
   * @returns The memory.
   */
  get(id: string): Memory | undefined {
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
  set(id: string, mem: Memory) {
    this.memories.set(id, {
      mem: this.clip(mem),
      expires: this.now() + this.ttlMs,
    });
  }

  /**
   * Touch the memory.
   * @param id The id of the memory.
   */
  touch(id: string) {
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
