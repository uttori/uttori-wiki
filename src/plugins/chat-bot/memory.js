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
 * @property {Record<string, string>} [entities] The optional entities.
 */

/**
 * @typedef {object} Memories
 * @property {Memory} mem The memory.
 * @property {number} expires The expiration time.
 */

export class MemoryStore {
  /**
   * The memories.
   * @type {Map<string, Memories>}
   */
  memories = new Map();
  /**
   * The TTL in milliseconds.
   * @type {number}
   */
  ttlMs;
  /**
   * The maximum number of turns.
   * @type {number}
   */
  maxTurns;

  /**
   * The constructor.
   * @param {number} [ttlMs] The TTL in milliseconds, defaults to 1 hour.
   * @param {number} [maxTurns] The maximum number of turns, defaults to 5.
   */
  constructor(ttlMs = 60 * 60 * 1000, maxTurns = 5) {
    this.ttlMs = ttlMs;
    this.maxTurns = maxTurns;
  }

  /**
   * Get the current time.
   * @returns {number} The current time.
   */
  now = () => Date.now();

  /**
   * Clip the memory.
   * @param {Memory} memory The memory.
   * @returns {Memory} The clipped memory.
   */
  clip = (memory) => ({
    ...memory,
    last: memory.last.slice(-this.maxTurns),
  });

  /**
   * Get the memory.
   * @param {string} id The id of the memory.
   * @returns {Memory | undefined} The memory.
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
   * @param {string} id The id of the memory.
   * @param {Memory} mem The memory.
   */
  set(id, mem) {
    this.memories.set(id, {
      mem: this.clip(mem),
      expires: this.now() + this.ttlMs,
    });
  }

  /**
   * Touch the memory.
   * @param {string} id The id of the memory.
   */
  touch(id) {
    const memory = this.memories.get(id);
    if (memory) {
      memory.expires = this.now() + this.ttlMs;
    }
  }

  /**
   * Cleanup the memory store.
   */
  cleanup() {
    const now = this.now();
    for (const [k, v] of this.memories.entries()) {
      if (v.expires < now) {
        this.memories.delete(k);
      }
    }
  }
}
