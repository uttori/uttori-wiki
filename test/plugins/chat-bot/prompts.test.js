import test from 'ava';
import { buildPromptMessages } from '../../../src/plugins/chat-bot/prompts.js';

test('buildPromptMessages: returns two messages with system and user roles', (t) => {
  const messages = buildPromptMessages('What is this?', [], {});
  t.is(messages.length, 2);
  t.is(messages[0].role, 'system');
  t.is(messages[1].role, 'user');
});

test('buildPromptMessages: user message contains the question', (t) => {
  const question = 'How do I install it?';
  const messages = buildPromptMessages(question, [], {});
  t.true(messages[1].content.includes(question));
});

test('buildPromptMessages: system message contains the slugs JSON', (t) => {
  const slugs = ['doc-one', 'doc-two'];
  const messages = buildPromptMessages('question', slugs, {});
  t.true(messages[0].content.includes(JSON.stringify(slugs)));
});

test('buildPromptMessages: system message contains vectorSearch instructions', (t) => {
  const messages = buildPromptMessages('question', [], {});
  t.true(messages[0].content.includes('vectorSearch'));
});

test('buildPromptMessages: empty slugs array renders as empty JSON array in system message', (t) => {
  const messages = buildPromptMessages('question', [], {});
  t.true(messages[0].content.includes('[]'));
});

test('buildPromptMessages: single slug appears in system message', (t) => {
  const messages = buildPromptMessages('question', ['my-slug'], {});
  t.true(messages[0].content.includes('my-slug'));
});

test('buildPromptMessages: system message contains the current date', (t) => {
  const messages = buildPromptMessages('question', [], {});
  const today = new Date().toLocaleDateString();
  t.true(messages[0].content.includes(today));
});

test('buildPromptMessages: user content is prefixed with "Question:"', (t) => {
  const messages = buildPromptMessages('test question', [], {});
  t.true(messages[1].content.startsWith('Question:'));
});
