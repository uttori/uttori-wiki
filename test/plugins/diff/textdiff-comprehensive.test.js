import test from 'ava';
import { textHunks, textEdits, unified } from '../../../src/plugins/diff/textdiff/textdiff.js';
import { Op } from '../../../src/plugins/diff/types.js';

test('Hunks: identical text should return empty result', (t) => {
  const x = 'line1\nline2\nline3';
  const y = 'line1\nline2\nline3';

  const result = textHunks(x, y);

  t.is(result.length, 0);
});

test('Hunks: empty text should return empty result', (t) => {
  const x = '';
  const y = '';

  const result = textHunks(x, y);

  t.is(result.length, 0);
});

test('Hunks: x-empty should return insertion hunk', (t) => {
  const x = '';
  const y = 'line1\nline2\nline3';

  const result = textHunks(x, y);

  t.is(result.length, 1);
  t.is(result[0].posX, 0);
  t.is(result[0].endX, 0);
  t.is(result[0].posY, 0);
  t.is(result[0].endY, 3);
  t.is(result[0].edits.length, 3);
  t.true(result[0].edits.every(edit => edit.op === Op.Insert));
});

test('Hunks: y-empty should return deletion hunk', (t) => {
  const x = 'line1\nline2\nline3';
  const y = '';

  const result = textHunks(x, y);

  t.is(result.length, 1);
  t.is(result[0].posX, 0);
  t.is(result[0].endX, 3);
  t.is(result[0].posY, 0);
  t.is(result[0].endY, 0);
  t.is(result[0].edits.length, 3);
  t.true(result[0].edits.every(edit => edit.op === Op.Delete));
});

test('Hunks: single line change', (t) => {
  const x = 'line1\nline2\nline3';
  const y = 'line1\nmodified\nline3';

  const result = textHunks(x, y);

  t.is(result.length, 1);
  // With default context=3, hunk includes context lines
  t.is(result[0].posX, 0);
  t.is(result[0].endX, 3);
  t.is(result[0].posY, 0);
  t.is(result[0].endY, 3);
  t.is(result[0].edits.length, 4); // 1 match (line1), 1 delete (line2), 1 insert (modified), 1 match (line3)
});

test('Hunks: multiple line changes', (t) => {
  const x = 'line1\nline2\nline3\nline4';
  const y = 'line1\nmodified2\nmodified3\nline4';

  const result = textHunks(x, y);

  t.is(result.length, 1);
  // With default context=3, hunk includes context lines
  t.is(result[0].posX, 0);
  t.is(result[0].endX, 4);
  t.is(result[0].posY, 0);
  t.is(result[0].endY, 4);
  t.is(result[0].edits.length, 6); // 1 match (line1), 2 deletes, 2 inserts, 1 match (line4)
});

test('Edits: identical text should return all matches', (t) => {
  const x = 'line1\nline2\nline3';
  const y = 'line1\nline2\nline3';

  const result = textEdits(x, y);

  t.is(result.length, 3);
  // All edits should be Match operations for identical text
  t.true(result.every(edit => edit.op === Op.Match));
});

test('Edits: empty text should return empty result', (t) => {
  const x = '';
  const y = '';

  const result = textEdits(x, y);

  t.is(result.length, 0);
});

test('Edits: single line change', (t) => {
  const x = 'line1\nline2\nline3';
  const y = 'line1\nmodified\nline3';

  const result = textEdits(x, y);

  t.is(result.length, 4);
  t.is(result[0].op, Op.Match); // line1
  t.is(result[1].op, Op.Delete); // line2
  t.is(result[2].op, Op.Insert); // modified
  t.is(result[3].op, Op.Match); // line3
});

test('Unified Format: should generate unified diff format', (t) => {
  const x = 'line1\nline2\nline3';
  const y = 'line1\nmodified\nline3';

  const result = unified(x, y);

  t.is(typeof result, 'string');
  t.true(result.includes('@@'));
  t.true(result.includes('-'));
  t.true(result.includes('+'));
});

test('Unified Format: identical text should return empty unified diff', (t) => {
  const x = 'line1\nline2\nline3';
  const y = 'line1\nline2\nline3';

  const result = unified(x, y);

  t.is(typeof result, 'string');
  t.is(result, '');
});

test('Unified Format: empty text should return empty unified diff', (t) => {
  const x = '';
  const y = '';

  const result = unified(x, y);

  t.is(typeof result, 'string');
  t.is(result, '');
});

test('Unified Format: should handle text without trailing newline', (t) => {
  const x = 'line1\nline2';
  const y = 'line1\nmodified';

  const result = unified(x, y);

  t.is(typeof result, 'string');
  t.true(result.includes('@@'));
});

test('Unified Format: should handle single line changes', (t) => {
  const x = 'single line';
  const y = 'modified line';

  const result = unified(x, y);

  t.is(typeof result, 'string');
  t.true(result.includes('@@'));
  t.true(result.includes('-'));
  t.true(result.includes('+'));
});

test('Edge Cases: single line text', (t) => {
  const x = 'hello';
  const y = 'world';

  const result = textEdits(x, y);

  t.is(result.length, 2);
  t.is(result[0].op, Op.Delete);
  t.is(result[1].op, Op.Insert);
});

test('Edge Cases: text with only newlines', (t) => {
  const x = '\n\n';
  const y = '\n\n\n';

  const result = textEdits(x, y);

  t.is(result.length, 3); // 2 matches, 1 insert
});

test('Edge Cases: moderate length text', (t) => {
  const lines = Array.from({ length: 10 }, (_, i) => `line${i}`);
  const x = lines.join('\n');
  const y = lines.join('\n');

  const result = textEdits(x, y);

  t.is(result.length, 10); // 10 matches for identical text
  t.true(result.every(edit => edit.op === Op.Match));
});

test('Edge Cases: text with special characters', (t) => {
  const x = 'line with spaces\nline\twith\ttabs\nline\nwith\nnewlines';
  const y = 'line with spaces\nline\twith\ttabs\nline\nwith\nnewlines';

  const result = textEdits(x, y);

  t.is(result.length, 5); // 5 lines, all matches for identical text
});
