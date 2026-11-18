import test from 'ava';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import { pdfFixture } from '../../_helpers/pdf.js';
import { extractAttachmentText, extractPdfText } from '../../../dist/plugins/chat-bot/attachment-extractor.js';

/**
 * Minimal config containing the attachments root.
 * @param {string} root Directory containing attachment fixtures.
 * @returns {{ attachmentsRoot: string }} Attachment extractor settings.
 */
const makeConfig = (root) => ({ attachmentsRoot: root });

/**
 * Write an attachment fixture in a temporary directory.
 * @param {string} name Filename to write.
 * @param {string | Buffer} content File contents.
 * @returns {Promise<{ dir: string, name: string }>} Fixture directory and filename.
 */
async function writeTempFile(name, content) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'uttori-test-'));
  const filePath = path.join(dir, name);
  fs.writeFileSync(filePath, content);
  return { dir, name };
}

test('extractAttachmentText: returns empty string when file does not exist', async (t) => {
  const config = makeConfig('/nonexistent-dir');
  const result = await extractAttachmentText(config, { path: 'missing.txt' });
  t.is(result, '');
});

test('extractAttachmentText: returns empty string when attachment.skip is true', async (t) => {
  const { dir, name } = await writeTempFile('skip.txt', 'should not be read');
  const config = makeConfig(dir);
  const result = await extractAttachmentText(config, { path: name, skip: true });
  fs.rmSync(dir, { recursive: true });
  t.is(result, '');
});

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

test('extractAttachmentText: returns empty string for unsupported file extension', async (t) => {
  const { dir, name } = await writeTempFile('binary.bin', Buffer.from([0, 1, 2, 3]));
  const config = makeConfig(dir);
  const result = await extractAttachmentText(config, { path: name, type: 'application/octet-stream' });
  fs.rmSync(dir, { recursive: true });
  t.is(result, '');
});

test('extractAttachmentText: keeps malformed PDFs out of indexed text', async (t) => {
  const { dir, name } = await writeTempFile('broken.dat', 'Invalid PDF');
  t.teardown(() => fs.rmSync(dir, { recursive: true }));
  t.is(await extractAttachmentText(makeConfig(dir), { path: name, type: 'application/pdf' }), '');
});

test('extractPdfText: preserves literal text and physical page numbers across blank pages', async (t) => {
  const bytes = pdfFixture(['Page one text', '', 'Page three: 97% (%20)']);
  const { dir, name } = await writeTempFile('manual.pdf', bytes);
  t.teardown(() => fs.rmSync(dir, { recursive: true }));
  t.is(await extractAttachmentText(makeConfig(dir), { path: name }), '[Page 1]\nPage one text\n\n---\n\n[Page 3]\nPage three: 97% (%20)');
  t.is(await extractPdfText(pdfFixture([''])), '');
  await t.throwsAsync(extractPdfText(Buffer.alloc(0)), { message: /empty PDF/ });
});
