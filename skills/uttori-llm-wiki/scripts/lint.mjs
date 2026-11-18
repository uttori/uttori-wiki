import { readdir, realpath, stat } from 'node:fs/promises';
import path from 'node:path';
import MarkdownItRenderer from '../../../dist/plugins/renderer-markdown-it.js';
import StorageProvider from '../../../dist/plugins/storeage-provider-json/storage-provider-file.js';
import { readArchivedSource } from '../../../dist/plugins/utilities/source-citations.js';

const indexSlug = 'wiki-index';
const logSlug = 'wiki-log';

/**
 * Extract canonical document targets using Uttori's parser so code blocks and escaped links are ignored.
 * @param {string} content Markdown from a managed page.
 * @returns {Set<string>} Unique page slugs, with fragments removed.
 */
function pageLinks(content) {
  /** @type {Set<string>} */
  const links = new Set();
  for (const block of MarkdownItRenderer.parse(content)) {
    for (const token of block.children ?? []) {
      if (token.type !== 'link_open') continue;
      const href = /** @type {string | null} */ (token.attrGet('href'));
      // shortcut: Validate page slugs only, add fragment checks when renderer settings can be shared.
      const slug = href?.match(/^([a-z0-9][a-z0-9-]*)(?:#.*)?$/)?.[1];
      if (slug) links.add(slug);
    }
  }
  return links;
}

/**
 * Verify provenance against the archived bytes without following paths outside the archive.
 * @param {{ slug: string, source?: unknown }} document A source note.
 * @param {string} rawDirectory Absolute, resolved archive directory.
 * @param {string | undefined} captureDirectory Private inbox directory for captured sources.
 * @returns {Promise<string | undefined>} A diagnostic if the source cannot be verified.
 */
async function checkSource(document, rawDirectory, captureDirectory) {
  const { slug, source } = document;
  const result = await readArchivedSource(document, rawDirectory, Infinity, captureDirectory);
  if ('reason' in result) {
    const { path: archivePath, format } = /** @type {{ path?: string, format?: string }} */ (source ?? {});
    const messages = {
      invalid_source: 'source SHA-256 or digest-based slug is invalid',
      invalid_path: format === undefined ? 'source path must name a Markdown file relative to raw/' : 'source path must name an original in the private Capture Inbox',
      revision_mismatch: `source SHA-256 mismatch: ${archivePath}`,
      source_unavailable: format === undefined ? `source cannot be read from raw/: ${archivePath}` : `capture original or citation text cannot be read: ${archivePath}`,
      source_too_large: `source is too large: ${archivePath}`,
    };
    return `${slug}: ${messages[result.reason]}`;
  }
  return undefined;
}

/**
 * Check a checkout without updating its files, including unmanaged pairs the storage provider will load.
 * @param {string} wikiRoot Directory containing raw/ and content/.
 * @param {string | undefined} captureDirectory Private inbox directory for captured sources.
 * @returns {Promise<string[]>} Diagnostics for issues found after loading the sidecars.
 * @throws {Error} If the directories or sidecars cannot be loaded safely.
 */
async function lint(wikiRoot, captureDirectory) {
  const root = await realpath(wikiRoot);
  const rawDirectory = path.join(root, 'raw');
  const contentDirectory = path.join(root, 'content');
  for (const directory of [rawDirectory, contentDirectory]) {
    if (await realpath(directory) !== directory || !(await stat(directory)).isDirectory()) {
      throw new Error(`Expected a directory inside the wiki root: ${directory}`);
    }
  }

  // Refuse linked sidecars before the provider reads them into the served collection.
  for (const entry of await readdir(contentDirectory, { withFileTypes: true })) {
    if (/\.(md|json)$/.test(entry.name) && !entry.isFile()) {
      throw new Error(`Sidecar must be a regular file: ${entry.name}`);
    }
  }

  const provider = new StorageProvider({ contentDirectory, sidecarContentExtension: 'md', useHistory: false });
  const pages = new Map(Object.entries(await provider.all()));
  const issues = [];
  const inbound = new Set();
  // Resolve stored aliases like Uttori's detail route, giving live canonical pages precedence.
  const destinations = new Map([...pages.keys()].map(slug => [slug, slug]));
  for (const [slug, page] of pages) {
    const aliases = typeof page.redirects === 'string' ? page.redirects.split(/[,\n]/) : page.redirects ?? [];
    if (!Array.isArray(aliases)) continue;
    for (const value of aliases) {
      const alias = typeof value === 'string' ? value.trim() : '';
      if (alias && !destinations.has(alias)) destinations.set(alias, slug);
    }
  }
  const catalog = new Set([...pageLinks(pages.get(indexSlug)?.content ?? '')].map(slug => destinations.get(slug) ?? slug));
  for (const slug of [indexSlug, logSlug]) {
    if (!pages.has(slug)) issues.push(`Missing ${slug} sidecar pair`);
  }

  for (const [slug, page] of pages) {
    const isUtilityPage = slug === indexSlug || slug === logSlug;
    if (!isUtilityPage && page.wikiKind === undefined) continue;

    const links = slug === indexSlug ? catalog : new Set([...pageLinks(page.content)].map(target => destinations.get(target) ?? target));
    for (const target of links) {
      if (!pages.has(target)) issues.push(`${slug}: broken page link to ${target}`);
      // The catalog and log would otherwise make every linked page look connected.
      if (!isUtilityPage && target !== slug) inbound.add(target);
    }
    if (isUtilityPage) continue;

    if (!catalog.has(slug)) issues.push(`${slug}: missing from ${indexSlug}`);
    if (page.wikiKind === 'source') {
      const issue = await checkSource(page, rawDirectory, captureDirectory);
      if (issue) issues.push(issue);
    } else if (page.wikiKind === 'topic') {
      if (![...links].some(target => pages.get(target)?.wikiKind === 'source')) {
        issues.push(`${slug}: missing a source-note citation`);
      }
    } else {
      issues.push(`${slug}: wikiKind must be source or topic`);
    }
  }

  for (const [slug, page] of pages) {
    if (page.wikiKind !== undefined && slug !== indexSlug && slug !== logSlug && !inbound.has(slug)) {
      issues.push(`${slug}: orphan page with no inbound content link`);
    }
  }
  return issues;
}

try {
  const [wikiRoot, captureDirectory, extra] = process.argv.slice(2);
  if (!wikiRoot || extra !== undefined) throw new Error('Usage: node lint.mjs <wiki-root> [capture-directory]');
  const issues = await lint(wikiRoot, captureDirectory);
  if (issues.length) {
    console.error(issues.join('\n'));
    process.exitCode = 1;
  } else {
    console.log('Wiki structural lint passed.');
  }
} catch (error) {
  console.error(`Wiki structural lint failed: ${error.message}`);
  process.exitCode = 1;
}
