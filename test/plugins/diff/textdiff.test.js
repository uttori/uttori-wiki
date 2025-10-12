import test from 'ava';
import { textEdits, unified } from '../../../src/plugins/diff/textdiff/textdiff.js';
import { Op } from '../../../src/plugins/diff/types.js';

test('should find differences between strings', (t) => {
  const x = 'line1\nline2\nline3';
  const y = 'line1\nmodified\nline3';

  const result = textEdits(x, y);

  t.is(result.length, 4);
  t.is(result[0].op, Op.Match);   // line1 matches
  t.is(result[1].op, Op.Delete);  // line2 deleted
  t.is(result[2].op, Op.Insert);  // modified inserted
  t.is(result[3].op, Op.Match);   // line3 matches
});

test('should generate unified diff format', (t) => {
  const x = 'line1\nline2\nline3';
  const y = 'line1\nmodified\nline3';

  const result = unified(x, y);

  t.is(typeof result, 'string');
  t.true(result.includes('@@'));
  t.true(result.includes('-'));
  t.true(result.includes('+'));
});

test('should handle identical strings', (t) => {
  const x = 'line1\nline2\nline3';
  const y = 'line1\nline2\nline3';

  const result = textEdits(x, y);

  t.is(result.length, 3);
  t.true(result.every(edit => edit.op === Op.Match));
});
