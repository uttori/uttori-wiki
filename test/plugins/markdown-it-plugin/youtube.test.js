import test from 'ava';
import MarkdownItRenderer from '../../../src/plugins/renderer-markdown-it.js';

test('MarkdownItRenderer.render(content, config): can render a YouTube video', (t) => {
  const markdown = '<youtube v="aR3fVuLEtj8" width="560" height="315" title="YouTube Video Player" start="0">';
  const output = '<div class="youtube-embed"><iframe class="youtube-embed-video" width="560" height="315" src="https://www.youtube-nocookie.com/embed/aR3fVuLEtj8?start=0" title="YouTube Video Player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen="true"></iframe></div>';
  t.is(MarkdownItRenderer.render(markdown, { ...MarkdownItRenderer.defaultConfig(), markdownIt: { ...MarkdownItRenderer.defaultConfig().markdownIt, uttori: { ...MarkdownItRenderer.defaultConfig().markdownIt.uttori, lazyImages: false } } }), output);
});

test('MarkdownItRenderer.render(content, config): can render a YouTube video with only a v tag', (t) => {
  const markdown = '<youtube v="aR3fVuLEtj8">';
  const output = '<div class="youtube-embed"><iframe class="youtube-embed-video" width="560" height="315" src="https://www.youtube-nocookie.com/embed/aR3fVuLEtj8?start=0" title="" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen="true"></iframe></div>';
  t.is(MarkdownItRenderer.render(markdown, { ...MarkdownItRenderer.defaultConfig(), markdownIt: { ...MarkdownItRenderer.defaultConfig().markdownIt, uttori: { ...MarkdownItRenderer.defaultConfig().markdownIt.uttori, lazyImages: false } } }), output);
});

test('MarkdownItRenderer.render(content, config): will render nothing with a missing v', (t) => {
  const markdown = '<youtube width="360">';
  const output = '<div class="youtube-embed"></div>';
  t.is(MarkdownItRenderer.render(markdown, { ...MarkdownItRenderer.defaultConfig(), markdownIt: { ...MarkdownItRenderer.defaultConfig().markdownIt, uttori: { ...MarkdownItRenderer.defaultConfig().markdownIt.uttori, lazyImages: false } } }), output);
});

test('MarkdownItRenderer.render(content, config): can render multiple YouTube videos', (t) => {
  const markdown = `
Content

## Part 1

<youtube width="960" height="720" v="FNpNvGzH47E">

## Part 2

Content

<youtube width="960" height="720" v="z81kLjaLUvw">`;
  const output = `<p>Content</p>
<h2 id="part-1-3">Part 1</h2>
<div class="youtube-embed"><iframe class="youtube-embed-video" width="960" height="720" src="https://www.youtube-nocookie.com/embed/FNpNvGzH47E?start=0" title="" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen="true"></iframe></div>
<h2 id="part-2-7">Part 2</h2>
<p>Content</p>
<div class="youtube-embed"><iframe class="youtube-embed-video" width="960" height="720" src="https://www.youtube-nocookie.com/embed/z81kLjaLUvw?start=0" title="" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen="true"></iframe></div>`;
  t.is(MarkdownItRenderer.render(markdown, { ...MarkdownItRenderer.defaultConfig(), markdownIt: { ...MarkdownItRenderer.defaultConfig().markdownIt, uttori: { ...MarkdownItRenderer.defaultConfig().markdownIt.uttori, lazyImages: false } } }), output);
});
