import test from 'ava';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import sinon from 'sinon';
import { PdfReader } from 'pdfreader';
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

test.serial('extractAttachmentText: returns empty string when PDF parser errors', async (t) => {
  const pdfSandbox = sinon.createSandbox();
  try {
    pdfSandbox.stub(PdfReader.prototype, 'parseBuffer').callsFake((_buffer, cb) => {
      cb(new Error('parse failed'));
    });
    const { dir, name } = await writeTempFile('document.pdf', Buffer.from('not a real pdf file'));
    const config = makeConfig(dir);
    const result = await extractAttachmentText(config, { path: name });
    fs.rmSync(dir, { recursive: true });
    t.is(result, '');
  } finally {
    pdfSandbox.restore();
  }
});

test.serial('extractAttachmentText: returns empty string for PDF detected via mime type', async (t) => {
  const pdfSandbox = sinon.createSandbox();
  try {
    pdfSandbox.stub(PdfReader.prototype, 'parseBuffer').callsFake((_buffer, cb) => {
      cb(new Error('parse failed'));
    });
    const { dir, name } = await writeTempFile('document.dat', Buffer.from('not a real pdf file'));
    const config = makeConfig(dir);
    const result = await extractAttachmentText(config, { path: name, type: 'application/pdf' });
    fs.rmSync(dir, { recursive: true });
    t.is(result, '');
  } finally {
    pdfSandbox.restore();
  }
});

test.serial('extractAttachmentText: extracts page-separated text from valid PDF buffers', async (t) => {
  const pdfSandbox = sinon.createSandbox();
  try {
    pdfSandbox.stub(PdfReader.prototype, 'parseBuffer').callsFake((_buffer, cb) => {
      cb(null, { page: 1, text: 'Page one text' });
      cb(null, { page: 2, text: 'Page two text' });
      cb(null, null);
    });

    const { dir, name } = await writeTempFile('manual.pdf', Buffer.from('%PDF-1.4 fake'));
    const config = makeConfig(dir);
    const result = await extractAttachmentText(config, { path: name, type: 'application/pdf' });
    fs.rmSync(dir, { recursive: true });

    t.true(result.includes('[Page 1]'));
    t.true(result.includes('Page one text'));
  } finally {
    pdfSandbox.restore();
  }
});
