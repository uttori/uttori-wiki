import test from 'ava';
import { hunks, edits, findChangeBounds } from '../../../src/plugins/diff/diff.js';
import { Op } from '../../../src/plugins/diff/diff.js';

test('edits: should find differences between arrays', (t) => {
  const x = ['a', 'b', 'c'];
  const y = ['a', 'x', 'c'];

  const result = edits(x, y);

  t.is(result.length, 4);
  t.deepEqual(result[0], { op: Op.Match, x: 'a', y: 'a' });
  t.deepEqual(result[1], { op: Op.Delete, x: 'b', y: 'b' });
  t.deepEqual(result[2], { op: Op.Insert, x: 'x', y: 'x' });
  t.deepEqual(result[3], { op: Op.Match, x: 'c', y: 'c' });
});

test('edits: should handle identical arrays', (t) => {
  const x = ['a', 'b', 'c'];
  const y = ['a', 'b', 'c'];

  const result = edits(x, y);

  t.is(result.length, 3);
  t.true(result.every(edit => edit.op === Op.Match));
});

test('edits: should handle completely different arrays', (t) => {
  const x = ['a', 'b'];
  const y = ['x', 'y'];

  const result = edits(x, y);

  t.is(result.length, 4);
  t.deepEqual(result[0], { op: Op.Delete, x: 'a', y: 'a' });
  t.deepEqual(result[1], { op: Op.Delete, x: 'b', y: 'b' });
  t.deepEqual(result[2], { op: Op.Insert, x: 'x', y: 'x' });
  t.deepEqual(result[3], { op: Op.Insert, x: 'y', y: 'y' });
});

test('hunks: should create hunks with context', (t) => {
  const x = ['a', 'b', 'c', 'd', 'e'];
  const y = ['a', 'x', 'c', 'd', 'e'];

  const result = hunks(x, y);

  t.is(result.length, 1);
  t.is(result[0].posX, 1);
  t.is(result[0].endX, 2);
  t.is(result[0].posY, 1);
  t.is(result[0].endY, 2);
});

test('findChangeBounds: identical arrays should return bounds indicating no changes', (t) => {
  const x = ['a', 'b', 'c'];
  const y = ['a', 'b', 'c'];

  const { smin, smax, tmin, tmax } = findChangeBounds(x, y);

  t.is(smin, 3);
  t.is(smax, 3);
  t.is(tmin, 3);
  t.is(tmax, 3);
});

test('findChangeBounds: completely different arrays should return full bounds', (t) => {
  const x = ['a', 'b', 'c'];
  const y = ['x', 'y', 'z'];

  const { smin, smax, tmin, tmax } = findChangeBounds(x, y);

  t.is(smin, 0);
  t.is(smax, 3);
  t.is(tmin, 0);
  t.is(tmax, 3);
});

test('findChangeBounds: common prefix only', (t) => {
  const x = ['a', 'b', 'c', 'd'];
  const y = ['a', 'b', 'x', 'y'];

  const { smin, smax, tmin, tmax } = findChangeBounds(x, y);

  t.is(smin, 2); // Common prefix is ['a', 'b']
  t.is(smax, 4);
  t.is(tmin, 2);
  t.is(tmax, 4);
});

test('findChangeBounds: common suffix only', (t) => {
  const x = ['a', 'b', 'y', 'z'];
  const y = ['x', 'w', 'y', 'z'];

  const { smin, smax, tmin, tmax } = findChangeBounds(x, y);

  t.is(smin, 0);
  t.is(smax, 2); // Common suffix is ['y', 'z']
  t.is(tmin, 0);
  t.is(tmax, 2);
});

test('findChangeBounds: common prefix and suffix', (t) => {
  const x = ['a', 'b', 'c', 'd', 'e', 'f'];
  const y = ['a', 'b', 'x', 'y', 'e', 'f'];

  const { smin, smax, tmin, tmax } = findChangeBounds(x, y);

  t.is(smin, 2); // Common prefix is ['a', 'b']
  t.is(smax, 4); // Common suffix is ['e', 'f']
  t.is(tmin, 2);
  t.is(tmax, 4);
});

test('findChangeBounds: y is prefix of x', (t) => {
  const x = ['a', 'b', 'c', 'd'];
  const y = ['a', 'b'];

  const { smin, smax, tmin, tmax } = findChangeBounds(x, y);

  t.is(smin, 2);
  t.is(smax, 4);
  t.is(tmin, 2);
  t.is(tmax, 2);
});

test('findChangeBounds: x is prefix of y', (t) => {
  const x = ['a', 'b'];
  const y = ['a', 'b', 'c', 'd'];

  const { smin, smax, tmin, tmax } = findChangeBounds(x, y);

  t.is(smin, 2);
  t.is(smax, 2);
  t.is(tmin, 2);
  t.is(tmax, 4);
});

test('findChangeBounds: empty arrays', (t) => {
  const x = [];
  const y = [];

  const { smin, smax, tmin, tmax } = findChangeBounds(x, y);

  t.is(smin, 0);
  t.is(smax, 0);
  t.is(tmin, 0);
  t.is(tmax, 0);
});

test('findChangeBounds: x empty, y has elements', (t) => {
  const x = [];
  const y = ['a', 'b', 'c'];

  const { smin, smax, tmin, tmax } = findChangeBounds(x, y);

  t.is(smin, 0);
  t.is(smax, 0);
  t.is(tmin, 0);
  t.is(tmax, 3);
});

test('findChangeBounds: x has elements, y empty', (t) => {
  const x = ['a', 'b', 'c'];
  const y = [];

  const { smin, smax, tmin, tmax } = findChangeBounds(x, y);

  t.is(smin, 0);
  t.is(smax, 3);
  t.is(tmin, 0);
  t.is(tmax, 0);
});

test('findChangeBounds: single element arrays - same', (t) => {
  const x = ['a'];
  const y = ['a'];

  const { smin, smax, tmin, tmax } = findChangeBounds(x, y);

  t.is(smin, 1);
  t.is(smax, 1);
  t.is(tmin, 1);
  t.is(tmax, 1);
});

test('findChangeBounds: single element arrays - different', (t) => {
  const x = ['a'];
  const y = ['b'];

  const { smin, smax, tmin, tmax } = findChangeBounds(x, y);

  t.is(smin, 0);
  t.is(smax, 1);
  t.is(tmin, 0);
  t.is(tmax, 1);
});

test('findChangeBounds: with custom equality function', (t) => {
  const x = [{ id: 1 }, { id: 2 }, { id: 3 }];
  const y = [{ id: 1 }, { id: 2 }, { id: 4 }];
  const eq = (a, b) => a.id === b.id;

  const { smin, smax, tmin, tmax } = findChangeBounds(x, y, eq);

  t.is(smin, 2); // Common prefix is first 2 elements
  t.is(smax, 3);
  t.is(tmin, 2);
  t.is(tmax, 3);
});

test('findChangeBounds: middle insertion', (t) => {
  const x = ['a', 'b', 'd'];
  const y = ['a', 'b', 'c', 'd'];

  const { smin, smax, tmin, tmax } = findChangeBounds(x, y);

  t.is(smin, 2); // Common prefix ['a', 'b'], common suffix ['d']
  t.is(smax, 2);
  t.is(tmin, 2);
  t.is(tmax, 3);
});

test('findChangeBounds: middle deletion', (t) => {
  const x = ['a', 'b', 'c', 'd'];
  const y = ['a', 'b', 'd'];

  const { smin, smax, tmin, tmax } = findChangeBounds(x, y);

  t.is(smin, 2); // Common prefix ['a', 'b'], common suffix ['d']
  t.is(smax, 3);
  t.is(tmin, 2);
  t.is(tmax, 2);
});
