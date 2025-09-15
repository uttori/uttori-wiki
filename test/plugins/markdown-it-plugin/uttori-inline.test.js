import test from 'ava';
import MarkdownItRenderer from '../../../src/plugins/renderer-markdown-it.js';

test('MarkdownItRenderer.render(content, config): prepends the baseURL when set', (t) => {
  t.is(MarkdownItRenderer.render('[Test]', { markdownIt: { uttori: { baseUrl: '/wiki' } } }), '<p>[Test]</p>');
  t.is(MarkdownItRenderer.render('[Test]()', { markdownIt: { uttori: { baseUrl: '/wiki' } } }), '<p><a href="/wiki/test">Test</a></p>');
  t.is(MarkdownItRenderer.render('[CrAzY CaSe SpAcEd]()', { markdownIt: { uttori: { baseUrl: '/wiki' } } }), '<p><a href="/wiki/crazy-case-spaced">CrAzY CaSe SpAcEd</a></p>');
});

test('MarkdownItRenderer.render(content, config): protects SEO by ignoring unknown domains', (t) => {
  t.is(MarkdownItRenderer.render('[Test]', { markdownIt: { uttori: { allowedExternalDomains: ['example.org'] } } }), '<p>[Test]</p>');
  t.is(MarkdownItRenderer.render('[Test]()', { markdownIt: { uttori: { allowedExternalDomains: ['example.org'] } } }), '<p><a href="/test">Test</a></p>');
  t.is(MarkdownItRenderer.render('[Test](http://example.org/wiki/test)', { markdownIt: { uttori: { allowedExternalDomains: ['example.org'] } } }), '<p><a href="http://example.org/wiki/test" rel="external noopener noreferrer">Test</a></p>');
  t.is(MarkdownItRenderer.render('[Test](https://example.org/wiki/test)', { markdownIt: { uttori: { allowedExternalDomains: ['example.org'] } } }), '<p><a href="https://example.org/wiki/test" rel="external noopener noreferrer">Test</a></p>');
  t.is(MarkdownItRenderer.render('[Test](http://evil.org/wiki/test)', { markdownIt: { uttori: { allowedExternalDomains: ['example.org'] } } }), '<p><a href="http://evil.org/wiki/test" rel="external nofollow noopener noreferrer">Test</a></p>');
  t.is(MarkdownItRenderer.render('[Test](https://evil.org/wiki/test)', { markdownIt: { uttori: { allowedExternalDomains: ['example.org'] } } }), '<p><a href="https://evil.org/wiki/test" rel="external nofollow noopener noreferrer">Test</a></p>');
});

test('MarkdownItRenderer.render(content, config): can set external links to open in a new window', (t) => {
  t.is(MarkdownItRenderer.render('[Test]', { markdownIt: { uttori: { openNewWindow: true, allowedExternalDomains: ['example.org'] } } }), '<p>[Test]</p>');
  t.is(MarkdownItRenderer.render('[Test]()', { markdownIt: { uttori: { openNewWindow: true, allowedExternalDomains: ['example.org'] } } }), '<p><a href="/test">Test</a></p>');
  t.is(MarkdownItRenderer.render('[Test](/wiki/test)', { markdownIt: { uttori: { openNewWindow: true, allowedExternalDomains: ['example.org'] } } }), '<p><a href="/wiki/test">Test</a></p>');
  t.is(MarkdownItRenderer.render('[Test](/wiki/test)', { markdownIt: { uttori: { openNewWindow: true, allowedExternalDomains: ['example.org'] } } }), '<p><a href="/wiki/test">Test</a></p>');
  t.is(MarkdownItRenderer.render('[Test](http://example.org/wiki/test)', { markdownIt: { uttori: { openNewWindow: true, allowedExternalDomains: ['example.org'] } } }), '<p><a href="http://example.org/wiki/test" rel="external noopener noreferrer" target="_blank">Test</a></p>');
  t.is(MarkdownItRenderer.render('[Test](https://example.org/wiki/test)', { markdownIt: { uttori: { openNewWindow: true, allowedExternalDomains: ['example.org'] } } }), '<p><a href="https://example.org/wiki/test" rel="external noopener noreferrer" target="_blank">Test</a></p>');
  t.is(MarkdownItRenderer.render('[Test](http://evil.org/wiki/test)', { markdownIt: { uttori: { openNewWindow: true, allowedExternalDomains: ['example.org'] } } }), '<p><a href="http://evil.org/wiki/test" rel="external nofollow noopener noreferrer" target="_blank">Test</a></p>');
  t.is(MarkdownItRenderer.render('[Test](https://evil.org/wiki/test)', { markdownIt: { uttori: { openNewWindow: true, allowedExternalDomains: ['example.org'] } } }), '<p><a href="https://evil.org/wiki/test" rel="external nofollow noopener noreferrer" target="_blank">Test</a></p>');
});

test('MarkdownItRenderer.render(content, config): can set colors on spans with special links', (t) => {
  t.is(MarkdownItRenderer.render('[Test]', { markdownIt: { uttori: { } } }), '<p>[Test]</p>');
  t.is(MarkdownItRenderer.render('[Test]()', { markdownIt: { uttori: { } } }), '<p><a href="/test">Test</a></p>');
  t.is(MarkdownItRenderer.render('[Test](color:rgba(24,24,24,0.5))', { markdownIt: { uttori: { } } }), '<p><span style="color: rgba(24,24,24,0.5)">Test</a></p>');
  t.is(MarkdownItRenderer.render('[Test](color:#black)', { markdownIt: { uttori: { } } }), '<p><span style="color: #black">Test</a></p>');
});

test('MarkdownItRenderer.render(content, config): can render an Image with lazy loading', (t) => {
  const markdown = '![](example.png "image title")';
  const output = '<p><img src="example.png" alt="" title="image title" loading="lazy"></p>';
  t.is(MarkdownItRenderer.render(markdown, { ...MarkdownItRenderer.defaultConfig(), markdownIt: { ...MarkdownItRenderer.defaultConfig().markdownIt, uttori: { ...MarkdownItRenderer.defaultConfig().markdownIt.uttori, lazyImages: true } } }), output);
});

test('MarkdownItRenderer.render(content, config): can render an Image without lazy loading', (t) => {
  const markdown = '![](example.png "image title")';
  const output = '<p><img src="example.png" alt="" title="image title"></p>';
  t.is(MarkdownItRenderer.render(markdown, { ...MarkdownItRenderer.defaultConfig(), markdownIt: { ...MarkdownItRenderer.defaultConfig().markdownIt, uttori: { ...MarkdownItRenderer.defaultConfig().markdownIt.uttori, lazyImages: false } } }), output);
});
