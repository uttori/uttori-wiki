import test from 'ava';
import MarkdownIt from 'markdown-it';
import Plugin from '../../../src/plugins/markdown-it-plugin/markdown-it-plugin.js';

test('registered examples render escaped static input and output', (t) => {
  const md = new MarkdownIt({ html: false, uttori: {
    examples: { sample: { source: 'db "<unsafe>"', expectedOutput: '00 < 01', inputLabel: 'Source', outputLabel: 'Bytes' } },
  } }).use(Plugin);
  const html = md.render('[example:sample]');
  t.regex(html, /class="uttori-example"/);
  t.regex(html, /class="uttori-example-input"/);
  t.regex(html, /data-example-id="sample"/);
  t.regex(html, /db &quot;&lt;unsafe&gt;&quot;/);
  t.regex(html, /00 &lt; 01/);
  t.regex(html, /<strong>Bytes<\/strong>/);
  t.throws(() => md.render('[example:unknown]'), { message: /Unknown Markdown example ID/ });
  t.throws(() => new MarkdownIt({ uttori: { examples: { broken: { source: 'x' } } } }).use(Plugin).render('[example:broken]'), { message: /needs source and expectedOutput strings/ });
});

test('example defaults describe generic input and output', (t) => {
  const md = new MarkdownIt({ uttori: {
    examples: { sample: { source: 'hello', expectedOutput: 'world' } },
  } }).use(Plugin);
  const html = md.render('[example:sample]');
  t.regex(html, /<label for="example-sample">Input<\/label>/);
  t.regex(html, /<strong>Output<\/strong>/);
  t.regex(html, /Expected output/);
  t.notRegex(html, /asm-example|Assembly source|Output bytes/);
});
