const test = require('ava');
const MarkdownHelpers = require('../../app/utilities/markdownHelpers.js');

test('Markdown Helpers: prepare(config, content): handles empty values', (t) => {
  t.is(MarkdownHelpers.prepare({}, ''), '');
  t.is(MarkdownHelpers.prepare({}, null), '');
  t.is(MarkdownHelpers.prepare({}, NaN), '');
  t.is(MarkdownHelpers.prepare({}, undefined), '');
  t.is(MarkdownHelpers.prepare({ markdown: true }, ''), '');
  t.is(MarkdownHelpers.prepare({ markdown: true }, null), '');
  t.is(MarkdownHelpers.prepare({ markdown: true }, NaN), '');
  t.is(MarkdownHelpers.prepare({ markdown: true }, undefined), '');
});

test('Markdown Helpers: prepare(config, content): replaces missing links with ', (t) => {
  t.is(MarkdownHelpers.prepare({}, '[Test]'), '[Test]');
  t.is(MarkdownHelpers.prepare({}, '[Test]()'), '[Test]()');
  t.is(MarkdownHelpers.prepare({}, '[CrAzY CaSe SpAcEd]()'), '[CrAzY CaSe SpAcEd]()');
  t.is(MarkdownHelpers.prepare({ markdown: true }, '[Test]'), '[Test]');
  t.is(MarkdownHelpers.prepare({ markdown: true }, '[Test]()'), '[Test](/test)');
  t.is(MarkdownHelpers.prepare({ markdown: true }, '[CrAzY CaSe SpAcEd]()'), '[CrAzY CaSe SpAcEd](/crazy-case-spaced)');
});
