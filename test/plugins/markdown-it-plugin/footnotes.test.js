import test from 'ava';
import MarkdownItRenderer from '../../../src/plugins/renderer-markdown-it.js';

test('MarkdownItRenderer.render(content, config): can render Footnotes', (t) => {
  const markdown = `Here is footnote-here reference.[^1].

[^1]: Here is the footnote.

Next footnote is here.[^2]

[^2]: Here is next footnote.
    With some indented _footnote_ [text](#test).

With some indented unrelated content.
`;
  const output = `<p>Here is footnote-here reference.<sup class="footnote-reference"><a href="#footnote-definition-0" aria-describedby="footnote-definition-0" id="footnote-0">[1]</a></sup>.</p>
<div id="footnote-definition-0" class="footnote-definition"><span class="footnote-id">1:</span><p>Here is the footnote.</p>
</div>
<p>Next footnote is here.<sup class="footnote-reference"><a href="#footnote-definition-1" aria-describedby="footnote-definition-1" id="footnote-1">[2]</a></sup></p>
<div id="footnote-definition-1" class="footnote-definition"><span class="footnote-id">2:</span><p>Here is next footnote.
With some indented <em>footnote</em> <a href="#test">text</a>.</p>
</div>
<p>With some indented unrelated content.</p>`;
  t.is(MarkdownItRenderer.render(markdown, { ...MarkdownItRenderer.defaultConfig(), markdownIt: { ...MarkdownItRenderer.defaultConfig().markdownIt, uttori: { ...MarkdownItRenderer.defaultConfig().markdownIt.uttori, lazyImages: false } } }), output);
});

test('MarkdownItRenderer.render(content, config): can render Footnotes with tabs', (t) => {
  const markdown = `Here is footnote-here reference.[^1].

[^1]:\tHere is the footnote.

Next footnote is here.[^2]

[^2]:\tHere is next footnote.`;
  const output = `<p>Here is footnote-here reference.<sup class="footnote-reference"><a href="#footnote-definition-0" aria-describedby="footnote-definition-0" id="footnote-0">[1]</a></sup>.</p>
<div id="footnote-definition-0" class="footnote-definition"><span class="footnote-id">1:</span><p>Here is the footnote.</p>
</div>
<p>Next footnote is here.<sup class="footnote-reference"><a href="#footnote-definition-1" aria-describedby="footnote-definition-1" id="footnote-1">[2]</a></sup></p>
<div id="footnote-definition-1" class="footnote-definition"><span class="footnote-id">2:</span><p>Here is next footnote.</p>
</div>`;
  t.is(MarkdownItRenderer.render(markdown, { ...MarkdownItRenderer.defaultConfig(), markdownIt: { ...MarkdownItRenderer.defaultConfig().markdownIt, uttori: { ...MarkdownItRenderer.defaultConfig().markdownIt.uttori, lazyImages: false } } }), output);
});

test('MarkdownItRenderer.render(content, config): can render Footnotes with ASCII labels', (t) => {
  const markdown = `Here is footnote-here reference.[^A].

[^A]:\tHere is the footnote.

Next footnote is here.[^B]

[^B]:\tHere is next footnote.`;
  const output = `<p>Here is footnote-here reference.<sup class="footnote-reference"><a href="#footnote-definition-0" aria-describedby="footnote-definition-0" id="footnote-0">[A]</a></sup>.</p>
<div id="footnote-definition-0" class="footnote-definition"><span class="footnote-id">A:</span><p>Here is the footnote.</p>
</div>
<p>Next footnote is here.<sup class="footnote-reference"><a href="#footnote-definition-1" aria-describedby="footnote-definition-1" id="footnote-1">[B]</a></sup></p>
<div id="footnote-definition-1" class="footnote-definition"><span class="footnote-id">B:</span><p>Here is next footnote.</p>
</div>`;
  t.is(MarkdownItRenderer.render(markdown, { ...MarkdownItRenderer.defaultConfig(), markdownIt: { ...MarkdownItRenderer.defaultConfig().markdownIt, uttori: { ...MarkdownItRenderer.defaultConfig().markdownIt.uttori, lazyImages: false } } }), output);
});

test('MarkdownItRenderer.render(content, config): can render Footnotes with broken tags', (t) => {
  const markdown = `Here is footnote-here reference.[^ 1].

Here is footnote-here reference.[^].

Here is footnote-here reference.[^Z].

Here is footnote-here reference.[^x].

[1^]: Here is the footnote.

[^1 ]: Here is the footnote.

[^]: Here is the footnote.

[^Z] Here is the footnote.

[^x\n]: Here is the footnote.

[^Y]: Here is the footnote.
`;
  const output = `<p>Here is footnote-here reference.[^ 1].</p>
<p>Here is footnote-here reference.[^].</p>
<p>Here is footnote-here reference.[^Z].</p>
<p>Here is footnote-here reference.[^x].</p>
<p>[1^]: Here is the footnote.</p>
<p>[^1 ]: Here is the footnote.</p>
<p>[^]: Here is the footnote.</p>
<p>[^Z] Here is the footnote.</p>
<p>[^x
]: Here is the footnote.</p>
<div id="footnote-definition-0" class="footnote-definition"><span class="footnote-id">Y:</span><p>Here is the footnote.</p>
</div>`;
  t.is(MarkdownItRenderer.render(markdown, { ...MarkdownItRenderer.defaultConfig(), markdownIt: { ...MarkdownItRenderer.defaultConfig().markdownIt, uttori: { ...MarkdownItRenderer.defaultConfig().markdownIt.uttori, lazyImages: false } } }), output);
});
