import test from 'ava';
import { hunks, edits } from '../../../src/plugins/diff/diff.js';
import { Op } from '../../../src/plugins/diff/types.js';

test('should find differences between arrays', (t) => {
  const x = ['a', 'b', 'c'];
  const y = ['a', 'x', 'c'];

  const result = edits(x, y);

  t.is(result.length, 4);
  t.deepEqual(result[0], { op: Op.Match, x: 'a', y: 'a' });
  t.deepEqual(result[1], { op: Op.Delete, x: 'b', y: 'b' });
  t.deepEqual(result[2], { op: Op.Insert, x: 'x', y: 'x' });
  t.deepEqual(result[3], { op: Op.Match, x: 'c', y: 'c' });
});

test('should handle identical arrays', (t) => {
  const x = ['a', 'b', 'c'];
  const y = ['a', 'b', 'c'];

  const result = edits(x, y);

  t.is(result.length, 3);
  t.true(result.every(edit => edit.op === Op.Match));
});

test('should handle completely different arrays', (t) => {
  const x = ['a', 'b'];
  const y = ['x', 'y'];

  const result = edits(x, y);

  t.is(result.length, 4);
  t.deepEqual(result[0], { op: Op.Delete, x: 'a', y: 'a' });
  t.deepEqual(result[1], { op: Op.Delete, x: 'b', y: 'b' });
  t.deepEqual(result[2], { op: Op.Insert, x: 'x', y: 'x' });
  t.deepEqual(result[3], { op: Op.Insert, x: 'y', y: 'y' });
});

test('should create hunks with context', (t) => {
  const x = ['a', 'b', 'c', 'd', 'e'];
  const y = ['a', 'x', 'c', 'd', 'e'];

  const result = hunks(x, y);

  t.is(result.length, 1);
  t.is(result[0].posX, 1);
  t.is(result[0].endX, 2);
  t.is(result[0].posY, 1);
  t.is(result[0].endY, 2);
});
