import test from 'ava';
import MarkdownItRenderer from '../../../src/plugins/renderer-markdown-it.js';

test('MarkdownItRenderer.render(content, config): can render a video', (t) => {
  const markdown = '<video src="/uploads/example.mp4">';
  const output = '<div class="video-embed"><video class="video-embed-video" src="/uploads/example.mp4" controls="true" playsinline="true" muted="true"></video></div>';
  t.is(MarkdownItRenderer.render(markdown, { ...MarkdownItRenderer.defaultConfig(), markdownIt: { ...MarkdownItRenderer.defaultConfig().markdownIt, uttori: { ...MarkdownItRenderer.defaultConfig().markdownIt.uttori, allowedExternalDomains: [] } } }), output);
});

test('MarkdownItRenderer.render(content, config): will render garbage with a missing src', (t) => {
  const markdown = '<video test="/uploads/example.mp4">';
  const output = '<p>&lt;video test=&quot;/uploads/example.mp4&quot;&gt;</p>';
  t.is(MarkdownItRenderer.render(markdown, { ...MarkdownItRenderer.defaultConfig(), markdownIt: { ...MarkdownItRenderer.defaultConfig().markdownIt, uttori: { ...MarkdownItRenderer.defaultConfig().markdownIt.uttori, lazyImages: false } } }), output);
});

test('MarkdownItRenderer.render(content, config): can render a video from an allowed domain', (t) => {
  const markdown = '<video src="https://wiki.superfamicom.org/uploads/example.mp4">';
  const output = '<div class="video-embed"><video class="video-embed-video video-embed-external" src="https://wiki.superfamicom.org/uploads/example.mp4" controls="true" playsinline="true" muted="true"></video></div>';
  t.is(MarkdownItRenderer.render(markdown, { ...MarkdownItRenderer.defaultConfig(), markdownIt: { ...MarkdownItRenderer.defaultConfig().markdownIt, uttori: { ...MarkdownItRenderer.defaultConfig().markdownIt.uttori, allowedExternalDomains: ['wiki.superfamicom.org'] } } }), output);
});

test('MarkdownItRenderer.render(content, config): can render nothing a video from an unallowed domain', (t) => {
  const markdown = '<video src="https://evil.com/uploads/example.mp4">';
  const output = '<div class="video-embed"></div>';
  t.is(MarkdownItRenderer.render(markdown, { ...MarkdownItRenderer.defaultConfig(), markdownIt: { ...MarkdownItRenderer.defaultConfig().markdownIt, uttori: { ...MarkdownItRenderer.defaultConfig().markdownIt.uttori, allowedExternalDomains: [] } } }), output);
});

test('MarkdownItRenderer.render(content, config): can render multiple videos', (t) => {
  const markdown = `
Content

## Part 1

<video src="/uploads/example-1.mp4">

## Part 2

Content

<video src="/uploads/example-2.mp4">`;
  const output = `<p>Content</p>
<h2 id="part-1-3">Part 1</h2>
<div class="video-embed"><video class="video-embed-video" src="/uploads/example-1.mp4" controls="true" playsinline="true" muted="true"></video></div>
<h2 id="part-2-7">Part 2</h2>
<p>Content</p>
<div class="video-embed"><video class="video-embed-video" src="/uploads/example-2.mp4" controls="true" playsinline="true" muted="true"></video></div>`;
  t.is(MarkdownItRenderer.render(markdown, { ...MarkdownItRenderer.defaultConfig(), markdownIt: { ...MarkdownItRenderer.defaultConfig().markdownIt, uttori: { ...MarkdownItRenderer.defaultConfig().markdownIt.uttori, lazyImages: false } } }), output);
});
