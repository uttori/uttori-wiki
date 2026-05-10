import test from 'ava';

import {
  sanitizeSearchQuery,
  sanitizeCategoryPath,
  sanitizeSlug,
  validateAndSanitizeUrl,
  sanitizeFilename,
  validateMimeType,
} from '../../../src/plugins/utilities/security.js';

test('sanitizeSearchQuery: should sanitize normal search queries', (t) => {
  t.is(sanitizeSearchQuery('hello world'), 'hello world');
  t.is(sanitizeSearchQuery('test query 123'), 'test query 123');
});

test('sanitizeSearchQuery: should remove control characters', (t) => {
  t.is(sanitizeSearchQuery('hello\x00world'), 'helloworld');
  t.is(sanitizeSearchQuery('test\x1fquery'), 'testquery');
  t.is(sanitizeSearchQuery('foo\x7fbar'), 'foobar');
});

test('sanitizeSearchQuery: should trim whitespace', (t) => {
  t.is(sanitizeSearchQuery('  hello world  '), 'hello world');
  t.is(sanitizeSearchQuery('\t\ntest\n\t'), 'test');
});

test('sanitizeSearchQuery: should limit length', (t) => {
  const longQuery = 'a'.repeat(1000);
  t.is(sanitizeSearchQuery(longQuery).length, 500);
  t.is(sanitizeSearchQuery(longQuery, 100).length, 100);
});

test('sanitizeSearchQuery: should handle empty or invalid input', (t) => {
  t.is(sanitizeSearchQuery(''), '');
  t.is(sanitizeSearchQuery(null), '');
  t.is(sanitizeSearchQuery(undefined), '');
  t.is(sanitizeSearchQuery(123), '');
  t.is(sanitizeSearchQuery({}), '');
});

test('sanitizeSearchQuery: should handle queries with only whitespace', (t) => {
  t.is(sanitizeSearchQuery('   '), '');
  t.is(sanitizeSearchQuery('\t\n\r'), '');
});

test('sanitizeCategoryPath: should sanitize normal category paths', (t) => {
  t.is(sanitizeCategoryPath('category'), 'category');
  t.is(sanitizeCategoryPath('parent/child'), 'parent/child');
  t.is(sanitizeCategoryPath('a/b/c'), 'a/b/c');
});

test('sanitizeCategoryPath: should remove path separators and dangerous characters', (t) => {
  t.is(sanitizeCategoryPath('../etc/passwd'), 'etcpasswd');
  t.is(sanitizeCategoryPath('category\\sub'), 'categorysub');
  t.is(sanitizeCategoryPath('cat\x00egory'), 'category');
});

test('sanitizeCategoryPath: should sanitize each part of the path', (t) => {
  t.is(sanitizeCategoryPath('  parent  /  child  '), 'parent/child');
  // Input containing ../ (e.g. .../ matches) is treated as path traversal: slashes removed
  t.is(sanitizeCategoryPath('...parent.../...child...'), 'parent....child');
  t.is(sanitizeCategoryPath('-parent-/child-'), 'parent/child');
});

test('sanitizeCategoryPath: should limit depth', (t) => {
  const deepPath = Array(30).fill('level').join('/');
  const parts = sanitizeCategoryPath(deepPath).split('/');
  t.true(parts.length <= 20);
});

test('sanitizeCategoryPath: should limit total length', (t) => {
  const longPath = 'a'.repeat(1000);
  t.true(sanitizeCategoryPath(longPath).length <= 500);
});

test('sanitizeCategoryPath: should handle empty or invalid input', (t) => {
  t.is(sanitizeCategoryPath(''), '');
  t.is(sanitizeCategoryPath(null), '');
  t.is(sanitizeCategoryPath(undefined), '');
});

test('sanitizeCategoryPath: should handle custom separators', (t) => {
  t.is(sanitizeCategoryPath('a|b|c', '|'), 'a|b|c');
  t.is(sanitizeCategoryPath('a-b-c', '-'), 'a-b-c');
});

test('sanitizeCategoryPath: should filter out empty parts', (t) => {
  t.is(sanitizeCategoryPath('a//b'), 'a/b');
  t.is(sanitizeCategoryPath('/a/b/'), 'a/b');
});

test('sanitizeSlug: should sanitize normal slugs', (t) => {
  t.is(sanitizeSlug('my-slug'), 'my-slug');
  t.is(sanitizeSlug('test123'), 'test123');
  t.is(sanitizeSlug('hello-world'), 'hello-world');
});

test('sanitizeSlug: should remove path separators', (t) => {
  t.is(sanitizeSlug('../etc/passwd'), 'etcpasswd');
  t.is(sanitizeSlug('slug\\sub'), 'slugsub');
  t.is(sanitizeSlug('slug/sub'), 'slugsub');
});

test('sanitizeSlug: should remove dangerous characters', (t) => {
  t.is(sanitizeSlug('slug\x00test'), 'slugtest');
  t.is(sanitizeSlug('slug\x1ftest'), 'slugtest');
  t.is(sanitizeSlug('slug\x7ftest'), 'slugtest');
});

test('sanitizeSlug: should remove leading/trailing dots, spaces, and hyphens', (t) => {
  t.is(sanitizeSlug('...slug...'), 'slug');
  t.is(sanitizeSlug('   slug   '), 'slug');
  t.is(sanitizeSlug('---slug---'), 'slug');
  t.is(sanitizeSlug('...   ---slug---   ...'), 'slug');
});

test('sanitizeSlug: should limit length', (t) => {
  const longSlug = 'a'.repeat(500);
  t.is(sanitizeSlug(longSlug).length, 255);
});

test('sanitizeSlug: should handle empty or invalid input', (t) => {
  t.is(sanitizeSlug(''), '');
  t.is(sanitizeSlug(null), '');
  t.is(sanitizeSlug(undefined), '');
  t.is(sanitizeSlug(123), '');
});

test('sanitizeSlug: should handle slugs with only special characters', (t) => {
  t.is(sanitizeSlug('...'), '');
  t.is(sanitizeSlug('---'), '');
  t.is(sanitizeSlug('   '), '');
});

test('validateAndSanitizeUrl: should accept valid http URLs', (t) => {
  t.is(validateAndSanitizeUrl('http://example.com'), 'http://example.com/');
  t.is(validateAndSanitizeUrl('http://example.com/path'), 'http://example.com/path');
  t.is(validateAndSanitizeUrl('http://example.com:8080/path'), 'http://example.com:8080/path');
});

test('validateAndSanitizeUrl: should accept valid https URLs', (t) => {
  t.is(validateAndSanitizeUrl('https://example.com'), 'https://example.com/');
  t.is(validateAndSanitizeUrl('https://example.com/path'), 'https://example.com/path');
});

test('validateAndSanitizeUrl: should reject non-http/https protocols', (t) => {
  t.is(validateAndSanitizeUrl('ftp://example.com'), null);
  t.is(validateAndSanitizeUrl('file:///etc/passwd'), null);
  t.is(validateAndSanitizeUrl('javascript:alert(1)'), null);
  t.is(validateAndSanitizeUrl('data:text/html,<script>alert(1)</script>'), null);
});

test('validateAndSanitizeUrl: should normalize URLs', (t) => {
  t.is(validateAndSanitizeUrl('http://EXAMPLE.COM'), 'http://example.com/');
  t.is(validateAndSanitizeUrl('http://example.com:80/path'), 'http://example.com/path');
});

test('validateAndSanitizeUrl: should handle invalid URLs', (t) => {
  t.is(validateAndSanitizeUrl('not a url'), null);
  t.is(validateAndSanitizeUrl('http://'), null);
  t.is(validateAndSanitizeUrl('://example.com'), null);
});

test('validateAndSanitizeUrl: should handle empty or invalid input', (t) => {
  t.is(validateAndSanitizeUrl(''), null);
  t.is(validateAndSanitizeUrl(null), null);
  t.is(validateAndSanitizeUrl(undefined), null);
  t.is(validateAndSanitizeUrl(123), null);
});

test('sanitizeFilename: should sanitize normal filenames', (t) => {
  t.is(sanitizeFilename('file.txt'), 'file.txt');
  t.is(sanitizeFilename('image.jpg'), 'image.jpg');
  t.is(sanitizeFilename('document.pdf'), 'document.pdf');
});

test('sanitizeFilename: should remove path separators', (t) => {
  t.is(sanitizeFilename('../etc/passwd'), 'etcpasswd');
  t.is(sanitizeFilename('file\\name.txt'), 'filename.txt');
  t.is(sanitizeFilename('/root/file.txt'), 'rootfile.txt');
});

test('sanitizeFilename: should remove dangerous characters', (t) => {
  t.is(sanitizeFilename('file\x00name.txt'), 'filename.txt');
  t.is(sanitizeFilename('file\x1fname.txt'), 'filename.txt');
  t.is(sanitizeFilename('file\x7fname.txt'), 'filename.txt');
});

test('sanitizeFilename: should remove leading/trailing dots and spaces', (t) => {
  t.is(sanitizeFilename('...file.txt'), 'file.txt');
  t.is(sanitizeFilename('file.txt...'), 'file.txt');
  t.is(sanitizeFilename('   file.txt   '), 'file.txt');
});

test('sanitizeFilename: should limit length', (t) => {
  const longFilename = 'a'.repeat(500) + '.txt';
  t.true(sanitizeFilename(longFilename).length <= 255);
});

test('sanitizeFilename: should use default name for empty input', (t) => {
  t.is(sanitizeFilename(''), 'file');
  t.is(sanitizeFilename(null), 'file');
  t.is(sanitizeFilename(undefined), 'file');
  t.is(sanitizeFilename('...'), 'file');
  t.is(sanitizeFilename('   '), 'file');
});

test('sanitizeFilename: should use custom default name', (t) => {
  t.is(sanitizeFilename('', 'default'), 'default');
  t.is(sanitizeFilename(null, 'backup'), 'backup');
});

test('validateMimeType: should allow all types when no restrictions', (t) => {
  t.true(validateMimeType('image/jpeg', []));
  t.true(validateMimeType('application/pdf', []));
  t.true(validateMimeType('text/html', []));
  t.true(validateMimeType('image/jpeg', undefined));
  t.true(validateMimeType('image/jpeg', null));
});

test('validateMimeType: should validate against allowed types', (t) => {
  const allowed = ['image/jpeg', 'image/png', 'image/gif'];
  t.true(validateMimeType('image/jpeg', allowed));
  t.true(validateMimeType('image/png', allowed));
  t.true(validateMimeType('image/gif', allowed));
  t.false(validateMimeType('application/pdf', allowed));
  t.false(validateMimeType('text/html', allowed));
});

test('validateMimeType: should be case sensitive', (t) => {
  const allowed = ['image/jpeg'];
  t.true(validateMimeType('image/jpeg', allowed));
  t.false(validateMimeType('Image/Jpeg', allowed));
  t.false(validateMimeType('IMAGE/JPEG', allowed));
});
