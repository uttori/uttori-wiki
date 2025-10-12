import test from 'ava';
import { hunks, edits } from '../../../src/plugins/diff/diff.js';
import { Op } from '../../../src/plugins/diff/diff.js';

test('hunks: identical arrays should return empty result', (t) => {
  const x = ['foo', 'bar', 'baz'];
  const y = ['foo', 'bar', 'baz'];

  const result = hunks(x, y);

  t.is(result.length, 0);
});

test('hunks: empty arrays should return empty result', (t) => {
  const x = [];
  const y = [];

  const result = hunks(x, y);

  t.is(result.length, 0);
});

test('hunks: x-empty should return insertion hunk', (t) => {
  const x = [];
  const y = ['foo', 'bar', 'baz'];

  const result = hunks(x, y);

  t.is(result.length, 1);
  t.is(result[0].posX, 0);
  t.is(result[0].endX, 0);
  t.is(result[0].posY, 0);
  t.is(result[0].endY, 3);
  t.is(result[0].edits.length, 3);
  t.is(result[0].edits[0].op, Op.Insert);
  t.is(result[0].edits[1].op, Op.Insert);
  t.is(result[0].edits[2].op, Op.Insert);
});

test('hunks: y-empty should return deletion hunk', (t) => {
  const x = ['foo', 'bar', 'baz'];
  const y = [];

  const result = hunks(x, y);

  t.is(result.length, 1);
  t.is(result[0].posX, 0);
  t.is(result[0].endX, 3);
  t.is(result[0].posY, 0);
  t.is(result[0].endY, 0);
  t.is(result[0].edits.length, 3);
  t.is(result[0].edits[0].op, Op.Delete);
  t.is(result[0].edits[1].op, Op.Delete);
  t.is(result[0].edits[2].op, Op.Delete);
});

test('hunks: same-prefix should return single hunk', (t) => {
  const x = ['foo', 'bar'];
  const y = ['foo', 'baz'];

  const result = hunks(x, y);

  t.is(result.length, 1);
  t.is(result[0].posX, 0);
  t.is(result[0].endX, 2);
  t.is(result[0].posY, 0);
  t.is(result[0].endY, 2);
  t.is(result[0].edits.length, 3);
  t.is(result[0].edits[0].op, Op.Match);
  t.is(result[0].edits[1].op, Op.Delete);
  t.is(result[0].edits[2].op, Op.Insert);
});

test('hunks: same-suffix should return single hunk', (t) => {
  const x = ['foo', 'bar'];
  const y = ['loo', 'bar'];

  const result = hunks(x, y);

  t.is(result.length, 1);
  t.is(result[0].posX, 0);
  t.is(result[0].endX, 2);
  t.is(result[0].posY, 0);
  t.is(result[0].endY, 2);
  t.is(result[0].edits.length, 3);
  t.is(result[0].edits[0].op, Op.Delete);
  t.is(result[0].edits[1].op, Op.Insert);
  t.is(result[0].edits[2].op, Op.Match);
});

test('hunks: ABCABBA_to_CBABAC should return correct diff', (t) => {
  const x = 'ABCABBA'.split('');
  const y = 'CBABAC'.split('');

  const result = hunks(x, y);

  t.is(result.length, 1);
  t.is(result[0].posX, 0);
  t.is(result[0].endX, 7);
  t.is(result[0].posY, 0);
  t.is(result[0].endY, 6);
  t.is(result[0].edits.length, 9);

  // Check the sequence of operations
  const ops = result[0].edits.map(edit => edit.op);
  t.deepEqual(ops, [
    Op.Delete,  // A
    Op.Insert,  // C
    Op.Match,   // B
    Op.Delete,  // C
    Op.Match,   // A
    Op.Match,   // B
    Op.Delete,  // B
    Op.Match,   // A
    Op.Insert,  // C
  ]);
});

test('hunks: ABCABBA_to_CBABAC with no context should return same result', (t) => {
  const x = 'ABCABBA'.split('');
  const y = 'CBABAC'.split('');

  const result = hunks(x, y);

  t.is(result.length, 1);
  t.is(result[0].posX, 0);
  t.is(result[0].endX, 7);
  t.is(result[0].posY, 0);
  t.is(result[0].endY, 6);
  t.is(result[0].edits.length, 9);
});

test('edits: identical arrays should return all matches', (t) => {
  const x = ['foo', 'bar', 'baz'];
  const y = ['foo', 'bar', 'baz'];

  const result = edits(x, y);

  t.is(result.length, 3);
  t.true(result.every(edit => edit.op === Op.Match));
});

test('edits: empty arrays should return empty result', (t) => {
  const x = [];
  const y = [];

  const result = edits(x, y);

  t.is(result.length, 0);
});

test('edits: x-empty should return all insertions', (t) => {
  const x = [];
  const y = ['foo', 'bar', 'baz'];

  const result = edits(x, y);

  t.is(result.length, 3);
  t.true(result.every(edit => edit.op === Op.Insert));
});

test('edits: y-empty should return all deletions', (t) => {
  const x = ['foo', 'bar', 'baz'];
  const y = [];

  const result = edits(x, y);

  t.is(result.length, 3);
  t.true(result.every(edit => edit.op === Op.Delete));
});

test('edits: ABCABBA_to_CBABAC should return correct edit sequence', (t) => {
  const x = 'ABCABBA'.split('');
  const y = 'CBABAC'.split('');

  const result = edits(x, y);

  t.is(result.length, 9);

  // Check the sequence of operations
  const ops = result.map(edit => edit.op);
  t.deepEqual(ops, [
    Op.Delete,  // A
    Op.Insert,  // C
    Op.Match,   // B
    Op.Delete,  // C
    Op.Match,   // A
    Op.Match,   // B
    Op.Delete,  // B
    Op.Match,   // A
    Op.Insert,  // C
  ]);
});

test('edits: single element arrays', (t) => {
  const x = ['a'];
  const y = ['b'];

  const result = edits(x, y);

  t.is(result.length, 2);
  t.is(result[0].op, Op.Delete);
  t.is(result[1].op, Op.Insert);
});

test('edits: arrays with repeated elements', (t) => {
  const x = ['a', 'a', 'a'];
  const y = ['a', 'b', 'a'];

  const result = edits(x, y);

  t.is(result.length, 4);
  t.is(result[0].op, Op.Match);  // Match 'a'
  t.is(result[1].op, Op.Delete); // Delete 'a'
  t.is(result[2].op, Op.Insert); // Insert 'b'
  t.is(result[3].op, Op.Match);  // Match 'a'
});

test('edits: moderate length arrays', (t) => {
  const x = Array.from({ length: 10 }, (_, i) => `item${i}`);
  const y = Array.from({ length: 10 }, (_, i) => `item${i}`);

  const result = edits(x, y);

  t.is(result.length, 10);
  t.true(result.every(edit => edit.op === Op.Match));
});
