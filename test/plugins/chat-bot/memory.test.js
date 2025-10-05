import test from 'ava';
import { MemoryStore } from '../../../src/plugins/chat-bot/memory.js';

test('MemoryStore: constructor with default values', (t) => {
  const store = new MemoryStore();
  t.is(store.ttlMs, 60 * 60 * 1000); // 1 hour
  t.is(store.maxTurns, 5);
  t.true(store.memories instanceof Map);
});

test('MemoryStore: constructor with custom values', (t) => {
  const ttlMs = 30 * 60 * 1000; // 30 minutes
  const maxTurns = 10;
  const store = new MemoryStore(ttlMs, maxTurns);
  t.is(store.ttlMs, ttlMs);
  t.is(store.maxTurns, maxTurns);
});

test('MemoryStore: now() returns current timestamp', (t) => {
  const store = new MemoryStore();
  const before = Date.now();
  const now = store.now();
  const after = Date.now();
  t.true(now >= before);
  t.true(now <= after);
});

test('MemoryStore: clip() limits turns to maxTurns', (t) => {
  const store = new MemoryStore(1000, 3);
  const memory = {
    summary: 'Test summary',
    last: [
      { user: 'msg1', assistant: 'resp1', ts: 1000 },
      { user: 'msg2', assistant: 'resp2', ts: 2000 },
      { user: 'msg3', assistant: 'resp3', ts: 3000 },
      { user: 'msg4', assistant: 'resp4', ts: 4000 },
      { user: 'msg5', assistant: 'resp5', ts: 5000 },
    ],
    entities: { key: 'value' },
  };

  const clipped = store.clip(memory);
  t.is(clipped.last.length, 3);
  t.deepEqual(clipped.last, memory.last.slice(-3));
  t.is(clipped.summary, memory.summary);
  t.deepEqual(clipped.entities, memory.entities);
});

test('MemoryStore: clip() preserves all turns when under limit', (t) => {
  const store = new MemoryStore(1000, 10);
  const memory = {
    summary: 'Test summary',
    last: [
      { user: 'msg1', assistant: 'resp1', ts: 1000 },
      { user: 'msg2', assistant: 'resp2', ts: 2000 },
    ],
  };

  const clipped = store.clip(memory);
  t.is(clipped.last.length, 2);
  t.deepEqual(clipped.last, memory.last);
});

test('MemoryStore: get() returns undefined for non-existent memory', (t) => {
  const store = new MemoryStore();
  t.is(store.get('nonexistent'), undefined);
});

test('MemoryStore: get() returns memory when not expired', (t) => {
  const store = new MemoryStore(1000, 5);
  const memory = {
    summary: 'Test summary',
    last: [{ user: 'msg1', assistant: 'resp1', ts: 1000 }],
  };

  store.set('test-id', memory);
  const retrieved = store.get('test-id');
  t.deepEqual(retrieved, memory);
});

test('MemoryStore: get() returns undefined for expired memory', (t) => {
  const store = new MemoryStore(100, 5); // Very short TTL
  const memory = {
    summary: 'Test summary',
    last: [{ user: 'msg1', assistant: 'resp1', ts: 1000 }],
  };

  store.set('test-id', memory);

  // Wait for expiration
  return new Promise((resolve) => {
    setTimeout(() => {
      const retrieved = store.get('test-id');
      t.is(retrieved, undefined);
      resolve();
    }, 150);
  });
});

test('MemoryStore: get() deletes expired memory', (t) => {
  const store = new MemoryStore(100, 5); // Very short TTL
  const memory = {
    summary: 'Test summary',
    last: [{ user: 'msg1', assistant: 'resp1', ts: 1000 }],
  };

  store.set('test-id', memory);
  t.true(store.memories.has('test-id'));

  // Wait for expiration
  return new Promise((resolve) => {
    setTimeout(() => {
      store.get('test-id'); // This should delete the expired memory
      t.false(store.memories.has('test-id'));
      resolve();
    }, 150);
  });
});

test('MemoryStore: set() stores memory with expiration', (t) => {
  const store = new MemoryStore(1000, 5);
  const memory = {
    summary: 'Test summary',
    last: [{ user: 'msg1', assistant: 'resp1', ts: 1000 }],
  };

  store.set('test-id', memory);
  t.true(store.memories.has('test-id'));

  const stored = store.memories.get('test-id');
  t.deepEqual(stored.mem, memory);
  t.true(stored.expires > store.now());
});

test('MemoryStore: set() clips memory when storing', (t) => {
  const store = new MemoryStore(1000, 2);
  const memory = {
    summary: 'Test summary',
    last: [
      { user: 'msg1', assistant: 'resp1', ts: 1000 },
      { user: 'msg2', assistant: 'resp2', ts: 2000 },
      { user: 'msg3', assistant: 'resp3', ts: 3000 },
      { user: 'msg4', assistant: 'resp4', ts: 4000 },
    ],
  };

  store.set('test-id', memory);
  const stored = store.memories.get('test-id');
  t.is(stored.mem.last.length, 2);
  t.deepEqual(stored.mem.last, memory.last.slice(-2));
});

test('MemoryStore: touch() extends expiration for existing memory', (t) => {
  const store = new MemoryStore(1000, 5);
  const memory = {
    summary: 'Test summary',
    last: [{ user: 'msg1', assistant: 'resp1', ts: 1000 }],
  };

  store.set('test-id', memory);
  const originalExpires = store.memories.get('test-id').expires;

  // Wait a bit
  return new Promise((resolve) => {
    setTimeout(() => {
      store.touch('test-id');
      const newExpires = store.memories.get('test-id').expires;
      t.true(newExpires > originalExpires);
      resolve();
    }, 50);
  });
});

test('MemoryStore: touch() does nothing for non-existent memory', (t) => {
  const store = new MemoryStore(1000, 5);

  // Should not throw
  store.touch('nonexistent');
  t.pass();
});

test('MemoryStore: cleanup() removes expired memories', (t) => {
  const store = new MemoryStore(100, 5); // Very short TTL
  const memory1 = {
    summary: 'Test summary 1',
    last: [{ user: 'msg1', assistant: 'resp1', ts: 1000 }],
  };
  const memory2 = {
    summary: 'Test summary 2',
    last: [{ user: 'msg2', assistant: 'resp2', ts: 2000 }],
  };

  store.set('test-id-1', memory1);
  store.set('test-id-2', memory2);
  t.is(store.memories.size, 2);

  // Wait for expiration
  return new Promise((resolve) => {
    setTimeout(() => {
      store.cleanup();
      t.is(store.memories.size, 0);
      resolve();
    }, 150);
  });
});

test('MemoryStore: cleanup() preserves non-expired memories', (t) => {
  const store = new MemoryStore(1000, 5);
  const memory1 = {
    summary: 'Test summary 1',
    last: [{ user: 'msg1', assistant: 'resp1', ts: 1000 }],
  };
  const memory2 = {
    summary: 'Test summary 2',
    last: [{ user: 'msg2', assistant: 'resp2', ts: 2000 }],
  };

  store.set('test-id-1', memory1);
  store.set('test-id-2', memory2);
  t.is(store.memories.size, 2);

  store.cleanup();
  t.is(store.memories.size, 2);
});

test('MemoryStore: handles memory with entities', (t) => {
  const store = new MemoryStore(1000, 5);
  const memory = {
    summary: 'Test summary',
    last: [{ user: 'msg1', assistant: 'resp1', ts: 1000 }],
    entities: {
      user: 'john',
      topic: 'programming',
    },
  };

  store.set('test-id', memory);
  const retrieved = store.get('test-id');
  t.deepEqual(retrieved.entities, memory.entities);
});

test('MemoryStore: handles memory without entities', (t) => {
  const store = new MemoryStore(1000, 5);
  const memory = {
    summary: 'Test summary',
    last: [{ user: 'msg1', assistant: 'resp1', ts: 1000 }],
  };

  store.set('test-id', memory);
  const retrieved = store.get('test-id');
  t.is(retrieved.entities, undefined);
});

test('MemoryStore: handles memory with assistant response', (t) => {
  const store = new MemoryStore(1000, 5);
  const memory = {
    summary: 'Test summary',
    last: [
      { user: 'msg1', assistant: 'resp1', ts: 1000 },
      { user: 'msg2', ts: 2000 }, // No assistant response yet
    ],
  };

  store.set('test-id', memory);
  const retrieved = store.get('test-id');
  t.is(retrieved.last[0].assistant, 'resp1');
  t.is(retrieved.last[1].assistant, undefined);
});

test('MemoryStore: multiple memory operations', (t) => {
  const store = new MemoryStore(1000, 3);

  // Set multiple memories
  const memory1 = {
    summary: 'Summary 1',
    last: [{ user: 'msg1', assistant: 'resp1', ts: 1000 }],
  };
  const memory2 = {
    summary: 'Summary 2',
    last: [{ user: 'msg2', assistant: 'resp2', ts: 2000 }],
  };

  store.set('id1', memory1);
  store.set('id2', memory2);

  // Verify both exist
  t.deepEqual(store.get('id1'), memory1);
  t.deepEqual(store.get('id2'), memory2);

  // Touch one
  store.touch('id1');

  // Update one
  const updatedMemory2 = {
    summary: 'Updated Summary 2',
    last: [
      { user: 'msg2', assistant: 'resp2', ts: 2000 },
      { user: 'msg3', assistant: 'resp3', ts: 3000 },
    ],
  };
  store.set('id2', updatedMemory2);

  t.deepEqual(store.get('id1'), memory1);
  t.deepEqual(store.get('id2'), updatedMemory2);
});
