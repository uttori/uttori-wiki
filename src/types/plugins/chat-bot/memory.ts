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
