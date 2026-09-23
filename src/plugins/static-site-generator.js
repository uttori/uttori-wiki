import { promises as fs } from 'node:fs';
import path from 'node:path';
import SearchProviderLunr from './search-provider-lunr.js';
import SitemapGenerator from './sitemap-generator.js';

/**
 * @typedef {object} StaticSiteRoute
 * @property {string} url Public root-relative URL. HTML routes end in `/`.
 * @property {number} [status=200] Expected response status; use 404 for the not-found page.
 * @property {string} [output] Explicit relative output path, used for `404.html`.
 * @property {number} [updateDate] Last content change in Unix milliseconds.
 */

/**
 * @typedef {object} StaticSiteAsset
 * @property {string} source Source file or directory to copy.
 * @property {string} target Root-relative destination within the artifact.
 */

/**
 * @typedef {object} StaticSiteBuildOptions
 * @property {import('express').Application} app Configured wiki Express application.
 * @property {StaticSiteRoute[]} routes Finite public route list, including the search shell and 404 page.
 * @property {string} outputDirectory Directory to replace only after a complete build.
 * @property {StaticSiteAsset[]} [assets] Explicit public assets to copy.
 * @property {import('../wiki.js').UttoriWikiDocument[]} [searchDocuments] Public documents used by the existing Lunr indexer.
 * @property {string} [canonicalOrigin] HTTP(S) origin for the sitemap. Omit only for local builds.
 */

/**
 * Export a configured Uttori Wiki app through its real HTTP routes and templates.
 * The temporary listener is loopback-only and is always closed, including on
 * render failures. The deployed artifact contains only the requested routes.
 */
class StaticSiteGenerator {
  static get configKey() {
    return 'uttori-plugin-generator-static-site';
  }

  /** Plugin registration is intentionally inert; export is an explicit build operation. */
  static register() {}

  /**
   * Map a URL to a safe directory-index path inside the staging tree.
   * @param {StaticSiteRoute} route Public route.
   * @returns {string} Relative output file path.
   */
  static outputPath(route) {
    const segments = route.url.split('/');
    if (!route.url.startsWith('/') || route.url.includes('?') || route.url.includes('#')
      || route.url.includes('\\') || route.url.includes('//') || route.url.includes('%')
      || segments.includes('.') || segments.includes('..')) {
      throw new Error(`Unsafe public route: ${route.url}`);
    }
    if (route.output) {
      return StaticSiteGenerator.safeRelative(route.output);
    }
    if (!route.url.endsWith('/')) {
      throw new Error(`HTML route needs a trailing slash: ${route.url}`);
    }
    return StaticSiteGenerator.safeRelative(`${route.url.slice(1)}index.html`);
  }

  /**
   * Keep output destinations below staging even when supplied by a caller.
   * @param {string} destination Relative artifact path.
   * @returns {string} Normalized safe path.
   */
  static safeRelative(destination) {
    const normalized = path.posix.normalize(destination.replace(/^\/+/, ''));
    if (!normalized || normalized === '.' || normalized === '..' || normalized.startsWith('../')
      || path.isAbsolute(destination) || destination.includes('\\')) {
      throw new Error(`Unsafe output path: ${destination}`);
    }
    return normalized;
  }

  /**
   * Fetch a page through the configured renderer, rejecting redirects and
   * mismatched status/content types before writing it to the artifact.
   * @param {string} origin Temporary loopback origin.
   * @param {StaticSiteRoute} route Route to render.
   * @returns {Promise<string>} Rendered HTML.
   */
  static async capture(origin, route) {
    const response = await fetch(`${origin}${route.url}`, { redirect: 'manual' });
    const expectedStatus = route.status ?? 200;
    if (response.status !== expectedStatus || !response.headers.get('content-type')?.includes('text/html')) {
      throw new Error(`Export ${route.url}: expected HTML ${expectedStatus}, got ${response.status} ${response.headers.get('content-type')}`);
    }
    return response.text();
  }

  /**
   * Validate root-relative links, assets, and same-page fragments in emitted
   * HTML. External URLs remain the responsibility of their original source.
   * @param {Map<string, string>} pages URL-to-HTML map.
   * @param {string} staging Staging artifact directory.
   */
  static async validateLinks(pages, staging) {
    const ids = new Map([...pages].map(([url, html]) => [url, new Set([...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]))]));
    for (const [url, html] of pages) {
      for (const match of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
        const value = match[1];
        if (/^javascript:/i.test(value)) throw new Error(`Unsafe local link ${value} in ${url}`);
        if (!value || value === '#' || /^(?:https?:|mailto:|tel:|data:|\/\/)/i.test(value)) continue;
        const target = new URL(value, `https://artifact.invalid${url}`);
        if (target.origin !== 'https://artifact.invalid') continue;
        const targetUrl = target.pathname;
        if (pages.has(targetUrl)) {
          if (target.hash && !ids.get(targetUrl).has(decodeURIComponent(target.hash.slice(1)))) {
            throw new Error(`Missing fragment ${value} in ${url}`);
          }
          continue;
        }
        const file = path.join(staging, StaticSiteGenerator.safeRelative(targetUrl.slice(1)));
        try {
          const stat = await fs.stat(file);
          if (!stat.isFile()) throw new Error('not a file');
        } catch {
          throw new Error(`Broken local link ${value} in ${url}`);
        }
      }
    }
  }

  /**
   * Build a complete static artifact and atomically promote it on success.
   * @param {StaticSiteBuildOptions} options Build inputs.
   * @returns {Promise<{ pages: number, assets: number }>} Output summary.
   */
  static async build({ app, routes, outputDirectory, assets = [], searchDocuments = [], canonicalOrigin }) {
    if (!app || !Array.isArray(routes) || routes.length === 0 || !outputDirectory) {
      throw new Error('Static export requires an app, routes, and outputDirectory.');
    }
    const destinations = new Set();
    const urls = new Set();
    for (const route of routes) {
      const output = StaticSiteGenerator.outputPath(route);
      if (destinations.has(output) || urls.has(route.url)) throw new Error(`Duplicate static route: ${route.url}`);
      destinations.add(output);
      urls.add(route.url);
    }
    // Reserve generated files and copied trees before any output is written.
    // A directory asset can otherwise replace a route below the same prefix.
    if (searchDocuments.length && destinations.has('search-index.json')) throw new Error('Route overlaps search-index.json');
    if (canonicalOrigin && destinations.has('sitemap.xml')) throw new Error('Route overlaps sitemap.xml');
    if (searchDocuments.length) destinations.add('search-index.json');
    if (canonicalOrigin) destinations.add('sitemap.xml');
    const assetTargets = [];
    for (const asset of assets) {
      const target = StaticSiteGenerator.safeRelative(asset.target);
      if ([...destinations, ...assetTargets].some((reserved) => reserved === target || reserved.startsWith(`${target}/`) || target.startsWith(`${reserved}/`))) {
        throw new Error(`Asset overlaps generated output: ${asset.target}`);
      }
      assetTargets.push(target);
    }
    const parent = path.dirname(outputDirectory);
    await fs.mkdir(parent, { recursive: true });
    const staging = await fs.mkdtemp(path.join(parent, '.uttori-static-'));
    const pages = new Map();
    let server;
    try {
      server = await new Promise((resolve, reject) => {
        const listener = app.listen(0, '127.0.0.1');
        listener.once('error', reject);
        listener.once('listening', () => resolve(listener));
      });
      const origin = `http://127.0.0.1:${server.address().port}`;
      for (const route of routes) {
        const html = await StaticSiteGenerator.capture(origin, route);
        pages.set(route.url, html);
        const target = path.join(staging, StaticSiteGenerator.outputPath(route));
        await fs.mkdir(path.dirname(target), { recursive: true });
        await fs.writeFile(target, html);
      }
      for (const asset of assets) {
        const target = path.join(staging, StaticSiteGenerator.safeRelative(asset.target));
        await fs.mkdir(path.dirname(target), { recursive: true });
        await fs.cp(asset.source, target, { recursive: true, force: false });
      }
      if (searchDocuments.length) {
        const sorted = [...searchDocuments].sort((a, b) => a.slug.localeCompare(b.slug));
        const index = SearchProviderLunr.exportIndex(sorted);
        await fs.writeFile(path.join(staging, 'search-index.json'), JSON.stringify({ index, pages: sorted.map(({ slug, title, excerpt }) => ({ slug, title, excerpt })) }));
      }
      if (canonicalOrigin) {
        const sitemapRoutes = routes.filter((route) => (route.status ?? 200) === 200 && !route.url.endsWith('/search/'))
          .map((route) => ({ url: route.url, lastmod: route.updateDate ? new Date(route.updateDate).toISOString() : undefined }));
        const xml = SitemapGenerator.generateRoutes(sitemapRoutes, { base_url: canonicalOrigin });
        await fs.writeFile(path.join(staging, 'sitemap.xml'), xml);
      }
      await StaticSiteGenerator.validateLinks(pages, staging);
      // Keep the last complete artifact for a one-step deployment rollback.
      const backup = `${outputDirectory}.previous`;
      await fs.rm(backup, { recursive: true, force: true });
      let previousExists = false;
      try {
        await fs.rename(outputDirectory, backup);
        previousExists = true;
      } catch (error) {
        if (error.code !== 'ENOENT') throw error;
      }
      try {
        await fs.rename(staging, outputDirectory);
      } catch (error) {
        if (previousExists) await fs.rename(backup, outputDirectory);
        throw error;
      }
      return { pages: routes.length, assets: assets.length };
    } finally {
      if (server) await new Promise((resolve) => server.close(resolve));
      await fs.rm(staging, { recursive: true, force: true });
    }
  }
}

export default StaticSiteGenerator;
