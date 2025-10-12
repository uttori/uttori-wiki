import test from 'ava';
import { textEdits, unified, htmlTable } from '../../../src/plugins/diff/textdiff.js';
import { Op } from '../../../src/plugins/diff/diff.js';

test('textEdits: should find differences between strings', (t) => {
  const x = 'line1\nline2\nline3';
  const y = 'line1\nmodified\nline3';

  const result = textEdits(x, y);

  t.is(result.length, 4);
  t.is(result[0].op, Op.Match);   // line1 matches
  t.is(result[1].op, Op.Delete);  // line2 deleted
  t.is(result[2].op, Op.Insert);  // modified inserted
  t.is(result[3].op, Op.Match);   // line3 matches
});

test('unified: should generate unified diff format', (t) => {
  const x = 'line1\nline2\nline3';
  const y = 'line1\nmodified\nline3';

  const result = unified(x, y);

  t.is(typeof result, 'string');
  t.true(result.includes('@@'));
  t.true(result.includes('-'));
  t.true(result.includes('+'));
});

test('textEdits: should handle identical strings', (t) => {
  const x = 'line1\nline2\nline3';
  const y = 'line1\nline2\nline3';

  const result = textEdits(x, y);

  t.is(result.length, 3);
  t.true(result.every(edit => edit.op === Op.Match));
});

test('htmlTable: should generate HTML table diff', (t) => {
  const x = 'line1\nline2\nline3';
  const y = 'line1\nmodified\nline3';

  const result = htmlTable(x, y);

  t.is(typeof result, 'string');
  t.true(result.includes('<table class="diff">'));
  t.true(result.includes('<tbody>'));
  t.true(result.includes('</tbody>'));
  t.true(result.includes('</table>'));
  t.true(result.includes('class="src delete"'));
  t.true(result.includes('class="src insert"'));
  t.true(result.includes('class="src match"'));
  t.true(result.includes('data-op="delete"'));
  t.true(result.includes('data-op="insert"'));
  t.true(result.includes('data-op="match"'));
  t.true(result.includes('data-block-start'));
  t.true(result.includes('data-block-end'));
});
