import test from 'ava';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import StorageProvider from '../../src/plugins/storeage-provider-json/storage-provider-file.js';

test('sidecar Markdown loads as an ordinary read-only document', async (t) => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'uttori-sidecar-'));
  try {
    const metadata = { slug: 'hello', title: 'Hello', tags: ['docs'], createDate: 1790121600000 };
    await fs.writeFile(path.join(directory, 'hello.json'), JSON.stringify(metadata));
    await fs.writeFile(path.join(directory, 'hello.md'), '## Markdown body\n');
    const provider = new StorageProvider({ contentDirectory: directory, sidecarContentExtension: 'md', useHistory: false });
    const document = await provider.get('hello');
    t.deepEqual(document, { ...metadata, content: '## Markdown body\n' });
    t.deepEqual(Object.values(await provider.all()), [document]);
    await t.throwsAsync(provider.add(document), { message: 'Sidecar content is read-only.' });
    await t.throwsAsync(provider.update(document), { message: 'Sidecar content is read-only.' });
    await t.throwsAsync(provider.delete('hello'), { message: 'Sidecar content is read-only.' });
    t.deepEqual(await provider.getHistory('hello'), []);
  } finally {
    await fs.rm(directory, { recursive: true, force: true });
  }
});

test('sidecar loading rejects an incomplete or mismatched pair', async (t) => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'uttori-sidecar-'));
  try {
    const provider = new StorageProvider({ contentDirectory: directory, sidecarContentExtension: 'md', useHistory: false });
    await fs.writeFile(path.join(directory, 'hello.md'), 'body');
    await t.throwsAsync(provider.all(), { message: /Missing metadata/ });
    await fs.writeFile(path.join(directory, 'hello.json'), JSON.stringify({ slug: 'different', title: 'Hello' }));
    await t.throwsAsync(provider.all(), { message: /mismatched slug/ });
    await fs.writeFile(path.join(directory, 'hello.json'), JSON.stringify({ slug: 'hello', title: 'Hello' }));
    await fs.rm(path.join(directory, 'hello.md'));
    await t.throwsAsync(provider.all(), { message: /Missing or unreadable content/ });
  } finally {
    await fs.rm(directory, { recursive: true, force: true });
  }
});
