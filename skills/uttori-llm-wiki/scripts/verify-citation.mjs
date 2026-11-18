import { realpath } from 'node:fs/promises';
import path from 'node:path';
import { text } from 'node:stream/consumers';
import StorageProvider from '../../../dist/plugins/storeage-provider-json/storage-provider-file.js';
import { parseCitationRequest, verifySourceCitation } from '../../../dist/plugins/utilities/source-citations.js';

try {
  const [wikiRoot, captureDirectory, extra] = process.argv.slice(2);
  if (!wikiRoot || extra !== undefined) throw new Error('Usage: node verify-citation.mjs <wiki-root> [capture-directory] < citation.json');

  const citation = parseCitationRequest(JSON.parse(await text(process.stdin)));
  const root = await realpath(wikiRoot);
  const provider = new StorageProvider({ contentDirectory: path.join(root, 'content'), sidecarContentExtension: 'md', useHistory: false });
  const document = await provider.get(citation.sourceSlug);
  const result = await verifySourceCitation(citation, document, path.join(root, 'raw'), captureDirectory);
  console.log(JSON.stringify(result));
  if (result.status !== 'verified') process.exitCode = 1;
} catch (error) {
  console.error(`Citation check failed: ${error.message}`);
  process.exitCode = 2;
}
