import ava from 'ava';

/**
 * Integration tests that hit SQLite indexing or Ollama timeouts.
 * Skipped when `AVA_FAST=1` (default `npm test`); run via `npm run test:full`.
 * @type {typeof ava}
 */
export const slow = process.env.AVA_FAST === '1' ? ava.skip : ava;
