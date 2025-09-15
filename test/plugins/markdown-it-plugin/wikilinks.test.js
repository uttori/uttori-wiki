import test from 'ava';
import MarkdownItRenderer from '../../../src/plugins/renderer-markdown-it.js';

test('MarkdownItRenderer.render(content, config): can render a WikiLink', (t) => {
  const markdown = 'A deep [[Link]]';
  const output = '<p>A deep <a href="link">Link</a></p>';
  t.is(MarkdownItRenderer.render(markdown, MarkdownItRenderer.defaultConfig()), output);
});

test('MarkdownItRenderer.render(content, config): can render multiple WikiLinks', (t) => {
  const markdown = 'A deep [[Link]] and a deeper [[hole]] but maybe a [[lake|big lake]]';
  const output = '<p>A deep <a href="link">Link</a> and a deeper <a href="hole">hole</a> but maybe a <a href="lake">big lake</a></p>';
  t.is(MarkdownItRenderer.render(markdown, MarkdownItRenderer.defaultConfig()), output);
});

test('MarkdownItRenderer.render(content, config): can render a WikiLink with custom anchor text', (t) => {
  const markdown = 'A deep [[LINK|hole]]';
  const output = '<p>A deep <a href="link">hole</a></p>';
  t.is(MarkdownItRenderer.render(markdown, MarkdownItRenderer.defaultConfig()), output);
});

test('MarkdownItRenderer.render(content, config): can render a WikiLink with a bracket character in the text', (t) => {
  const markdown = `A deep [[LINK|\\[hole]]`;
  const output = '<p>A deep <a href="link">\\[hole</a></p>';
  t.is(MarkdownItRenderer.render(markdown, MarkdownItRenderer.defaultConfig()), output);
});

test('MarkdownItRenderer.render(content, config): can render a WikiLink with a bad text part', (t) => {
  const markdown = 'A deep [[LINK|]]';
  const output = '<p>A deep <a href="link">LINK</a></p>';
  t.is(MarkdownItRenderer.render(markdown, MarkdownItRenderer.defaultConfig()), output);
});

test('MarkdownItRenderer.render(content, config): does not error with a WikiLink with another WikiLink starting before the first closed', (t) => {
  const markdown = 'A deep [[LINK[[]]';
  const output = '<p>A deep <a href=""></a>[[LINK<a href=""></a></p>';
  t.is(MarkdownItRenderer.render(markdown, MarkdownItRenderer.defaultConfig()), output);
});

test('MarkdownItRenderer.render(content, config): does not error with a WikiLink with a line break in the text part', (t) => {
  const markdown = `A deep [[LINK|
]]`;
  const output = `<p>A deep [[LINK|
]]</p>`;
  t.is(MarkdownItRenderer.render(markdown, MarkdownItRenderer.defaultConfig()), output);
});

test('MarkdownItRenderer.render(content, config): can render a WikiLink with a baseUrl', (t) => {
  const markdown = 'A deep [[Link]]';
  const output = '<p>A deep <a href="/wiki/link">Link</a></p>';
  t.is(MarkdownItRenderer.render(markdown, { ...MarkdownItRenderer.defaultConfig(), markdownIt: { ...MarkdownItRenderer.defaultConfig().markdownIt, uttori: { ...MarkdownItRenderer.defaultConfig().markdownIt.uttori, baseUrl: '/wiki' } } }), output);
});
