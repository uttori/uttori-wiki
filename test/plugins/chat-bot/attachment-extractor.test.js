import test from 'ava';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import { extractAttachmentText } from '../../../src/plugins/chat-bot/attachment-extractor.js';

/** Minimal config – only attachmentsRoot is used */
const makeConfig = (root) => ({ attachmentsRoot: root });

/** Write a temp file and return its basename + tmpdir root */
async function writeTempFile(name, content) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'uttori-test-'));
  const filePath = path.join(dir, name);
  fs.writeFileSync(filePath, content);
  return { dir, name };
}

// ── file-not-found ────────────────────────────────────────────────────────────

test('extractAttachmentText: returns empty string when file does not exist', async (t) => {
  const config = makeConfig('/nonexistent-dir');
  const result = await extractAttachmentText(config, { path: 'missing.txt' });
  t.is(result, '');
});

// ── skip flag ─────────────────────────────────────────────────────────────────

test('extractAttachmentText: returns empty string when attachment.skip is true', async (t) => {
  const { dir, name } = await writeTempFile('skip.txt', 'should not be read');
  const config = makeConfig(dir);
  const result = await extractAttachmentText(config, { path: name, skip: true });
  fs.rmSync(dir, { recursive: true });
  t.is(result, '');
});

// ── plain-text extraction ─────────────────────────────────────────────────────

test('extractAttachmentText: extracts plain text from .txt file', async (t) => {
  const content = 'Hello, world!';
  const { dir, name } = await writeTempFile('hello.txt', content);
  const config = makeConfig(dir);
  const result = await extractAttachmentText(config, { path: name });
  fs.rmSync(dir, { recursive: true });
  t.is(result, content);
});

test('extractAttachmentText: extracts text when type is text/plain', async (t) => {
  const content = 'Plain text via mime type';
  const { dir, name } = await writeTempFile('file.dat', content);
  const config = makeConfig(dir);
  const result = await extractAttachmentText(config, { path: name, type: 'text/plain' });
  fs.rmSync(dir, { recursive: true });
  t.is(result, content);
});

test('extractAttachmentText: extracts text from .md file', async (t) => {
  const content = '# Heading\n\nParagraph text.';
  const { dir, name } = await writeTempFile('readme.md', content);
  const config = makeConfig(dir);
  const result = await extractAttachmentText(config, { path: name });
  fs.rmSync(dir, { recursive: true });
  t.is(result, content);
});

test('extractAttachmentText: extracts text from .csv file', async (t) => {
  const content = 'a,b,c\n1,2,3';
  const { dir, name } = await writeTempFile('data.csv', content);
  const config = makeConfig(dir);
  const result = await extractAttachmentText(config, { path: name });
  fs.rmSync(dir, { recursive: true });
  t.is(result, content);
});

test('extractAttachmentText: extracts text from .log file', async (t) => {
  const content = 'ERROR something happened';
  const { dir, name } = await writeTempFile('app.log', content);
  const config = makeConfig(dir);
  const result = await extractAttachmentText(config, { path: name });
  fs.rmSync(dir, { recursive: true });
  t.is(result, content);
});

// ── unsupported type ──────────────────────────────────────────────────────────

test('extractAttachmentText: returns empty string for unsupported file extension', async (t) => {
  const { dir, name } = await writeTempFile('binary.bin', Buffer.from([0, 1, 2, 3]));
  const config = makeConfig(dir);
  const result = await extractAttachmentText(config, { path: name, type: 'application/octet-stream' });
  fs.rmSync(dir, { recursive: true });
  t.is(result, '');
});

// ── PDF path (enter branch; invalid buffer → error path) ──────────────────────

test('extractAttachmentText: returns empty string for invalid PDF content', async (t) => {
  // A file with a .pdf extension but non-PDF bytes triggers the PDF branch.
  // PdfReader will either error or produce no items; both paths return ''.
  const { dir, name } = await writeTempFile('document.pdf', Buffer.from('not a real pdf file'));
  const config = makeConfig(dir);
  const result = await extractAttachmentText(config, { path: name });
  fs.rmSync(dir, { recursive: true });
  t.is(result, '');
});

test('extractAttachmentText: returns empty string for PDF detected via mime type', async (t) => {
  const { dir, name } = await writeTempFile('document.dat', Buffer.from('not a real pdf file'));
  const config = makeConfig(dir);
  const result = await extractAttachmentText(config, { path: name, type: 'application/pdf' });
  fs.rmSync(dir, { recursive: true });
  t.is(result, '');
});
