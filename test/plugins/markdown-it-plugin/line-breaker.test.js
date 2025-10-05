import test from 'ava';
import MarkdownItRenderer from '../../../src/plugins/renderer-markdown-it.js';

test('MarkdownItRenderer.render(content, config): can render line breaks', (t) => {
  const markdown = 'test<br>one<br />two<br/>three';
  const output = `<p>test<br>
one<br>
two<br>
three</p>`;
  t.is(MarkdownItRenderer.render(markdown, { ...MarkdownItRenderer.defaultConfig(), markdownIt: { ...MarkdownItRenderer.defaultConfig().markdownIt, uttori: { ...MarkdownItRenderer.defaultConfig().markdownIt.uttori } } }), output);
});

test('MarkdownItRenderer.render(content, config): can render line breaks in tables', (t) => {
  const markdown = `| Col 1 | Col 2 | Col 3 |
|-------|-------|-------|
| Row 1 | Row 1 | Row 1 |
| Row 2A<br/>Row 2B | Row 2A<br/>Row 2B | Row 2A<br/>Row 2B |
`;
  const output = `<table>
<thead>
<tr>
<th>Col 1</th>
<th>Col 2</th>
<th>Col 3</th>
</tr>
</thead>
<tbody>
<tr>
<td>Row 1</td>
<td>Row 1</td>
<td>Row 1</td>
</tr>
<tr>
<td>Row 2A<br>
Row 2B</td>
<td>Row 2A<br>
Row 2B</td>
<td>Row 2A<br>
Row 2B</td>
</tr>
</tbody>
</table>`;
  t.is(MarkdownItRenderer.render(markdown, { ...MarkdownItRenderer.defaultConfig(), markdownIt: { ...MarkdownItRenderer.defaultConfig().markdownIt, uttori: { ...MarkdownItRenderer.defaultConfig().markdownIt.uttori } } }), output);
});
