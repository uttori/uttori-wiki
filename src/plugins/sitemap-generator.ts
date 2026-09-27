import { getPluginMethod } from './utilities/plugin-method.js';
import { createDebug } from '../debug.js';
import fs from 'node:fs';
import path from 'node:path';
import type {
  SitemapGeneratorUrl, SitemapUrlFilter, SitemapGeneratorConfig,
} from '../types/plugins/sitemap-generator.js';

export type {
  SitemapGeneratorUrl, SitemapUrlFilter, SitemapGeneratorConfig,
} from '../types/plugins/sitemap-generator.js';

const debug = createDebug('Uttori.Plugin.SitemapGenerator');

/**
 * Uttori Sitemap Generator
 *
 * Generates a valid sitemap.xml file for submitting to search engines.
 * @example <caption>SitemapGenerator</caption>
 * const sitemap = SitemapGenerator.generate({ ... });
 */
class SitemapGenerator {
  /**
   * The configuration key for plugin to look for in the provided configuration.
   *
   * @returns The configuration key.
   * @example <caption>SitemapGenerator.configKey</caption>
   * const config = { ...SitemapGenerator.defaultConfig(), ...context.config[SitemapGenerator.configKey] };
   */
  static get configKey(): 'uttori-plugin-generator-sitemap' {
    return 'uttori-plugin-generator-sitemap';
  }

  /**
   * The default configuration.
   * @returns The configuration.
   * @example <caption>SitemapGenerator.defaultConfig()</caption>
   * const config = { ...SitemapGenerator.defaultConfig(), ...context.config[SitemapGenerator.configKey] };
   */
  static defaultConfig(): import('../custom.js').DefaultPluginConfig<SitemapGeneratorConfig, 'urls' | 'url_filters' | 'base_url' | 'directory' | 'filename' | 'extension' | 'page_priority' | 'xml_header' | 'xml_footer'> {
    return {
      urls: [],
      url_filters: [],
      base_url: '',
      directory: '',
      filename: 'sitemap',
      extension: 'xml',
      page_priority: '0.80',
      xml_header: '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">',
      xml_footer: '</urlset>',
    };
  }

  /**
   * Validates the provided configuration for required entries.
   * @param config A configuration object.
   * @param [_context] A Uttori-like context (unused).
   * @example <caption>SitemapGenerator.validateConfig(config, _context)</caption>
   * SitemapGenerator.validateConfig({ ... });
   */
  static validateConfig(config: Record<string, SitemapGeneratorConfig>, _context?: unknown) {
    debug('Validating config...');
    if (!config[SitemapGenerator.configKey]) {
      debug('Config Error: `sitemap` configuration key is missing.');
      throw new Error('sitemap configuration key is missing.');
    }
    if (!Array.isArray(config[SitemapGenerator.configKey].urls)) {
      debug('Config Error: `urls` should be an array of documents.');
      throw new Error('urls should be an array of documents.');
    }
    if (config[SitemapGenerator.configKey].url_filters && !Array.isArray(config[SitemapGenerator.configKey].url_filters)) {
      debug('Config Error: `url_filters` should be an array of regular expression url filters.');
      throw new Error('url_filters should be an array of regular expression url filters.');
    }
    if (!config[SitemapGenerator.configKey].base_url || typeof config[SitemapGenerator.configKey].base_url !== 'string') {
      debug('Config Error: `base_url` is required should be an string of your base URL (ie https://domain.tld).');
      throw new Error('base_url is required should be an string of your base URL (ie https://domain.tld).');
    }
    if (!config[SitemapGenerator.configKey].directory || typeof config[SitemapGenerator.configKey].directory !== 'string') {
      debug('Config Error: `directory` is required should be the path to the location you want the sitemap to be writtent to.');
      throw new Error('directory is required should be the path to the location you want the sitemap to be writtent to.');
    }
    debug('Validated config.');
  }

  /**
   * Register the plugin with a provided set of events on a provided Hook system.
   * @param context A Uttori-like context.
   * @example <caption>SitemapGenerator.register(context)</caption>
   * const context = {
   *   hooks: {
   *     on: (event, callback) => { ... },
   *   },
   *   config: {
   *     [SitemapGenerator.configKey]: {
   *       ...,
   *       events: {
   *         callback: ['document-save', 'document-delete'],
   *         validateConfig: ['validate-config'],
   *       },
   *     },
   *   },
   * };
   * SitemapGenerator.register(context);
   */
  static register(context: import('../custom.js').UttoriContextWithPluginConfig<'uttori-plugin-generator-sitemap', SitemapGeneratorConfig>) {
    if (!context || !context.hooks || typeof context.hooks.on !== 'function') {
      throw new Error('Missing event dispatcher in \'context.hooks.on(event, callback)\' format.');
    }

    const config = { ...SitemapGenerator.defaultConfig(), ...context.config[SitemapGenerator.configKey] };
    if (!config.events) {
      throw new Error('Missing events to listen to for in \'config.events\'.');
    }

    // Bind events
    for (const [method, events] of Object.entries(config.events)) {
      const SitemapGeneratorMethod = getPluginMethod<import('@uttori/event-dispatcher').UttoriEventCallback<unknown, unknown, unknown>>(SitemapGenerator, method);
      if (SitemapGeneratorMethod) {
        for (const event of events) {

          const callback = SitemapGeneratorMethod;
          context.hooks.on(event, callback);
        }
      } else {
        debug(`Missing function "${method}"`);
      }
    }
  }

  /**
   * Wrapper function for calling generating and writing the sitemap file.
   * @async
   * @param document A Uttori document (unused).
   * @param context A Uttori-like context.
   * @returns The provided document.
   * @example <caption>SitemapGenerator.callback(_document, context)</caption>
   * const context = {
   *   config: {
   *     [SitemapGenerator.configKey]: {
   *       ...,
   *     },
   *   },
   *   hooks: {
   *     on: (event) => { ... }
   *   },
   * };
   * SitemapGenerator.callback(null, context);
   */
  static async callback(document: import('../wiki.js').UttoriWikiDocument, context: import('../custom.js').UttoriContextWithPluginConfig<'uttori-plugin-generator-sitemap', SitemapGeneratorConfig>): Promise<object> {
    debug('callback');

    const { directory, filename, extension } = { ...SitemapGenerator.defaultConfig(), ...context.config[SitemapGenerator.configKey] };
    const sitemap = await SitemapGenerator.generateSitemap(context);
    const target = path.join(directory, `${filename}.${extension}`);
    debug(`File: ${target}`);
    /* c8 ignore next 3 */
    try { fs.writeFileSync(target, sitemap, 'utf8'); } catch (error) {
      debug('Error writing file:', target, sitemap, error);
    }
    return document;
  }

  /**
   * Generates a sitemap from the provided context.
   * @param context A Uttori-like context.
   * @returns The generated sitemap.
   * @example <caption>SitemapGenerator.callback(_document, context)</caption>
   * const context = {
   *   config: {
   *     [SitemapGenerator.configKey]: {
   *       ...,
   *     },
   *   },
   *   hooks: {
   *     on: (event) => { ... },
   *     fetch: (event, query) => { ... },
   *   },
   * };
   * SitemapGenerator.generateSitemap(context);
   */
  static async generateSitemap(context: import('../custom.js').UttoriContextWithPluginConfig<'uttori-plugin-generator-sitemap', SitemapGeneratorConfig>): Promise<string> {
    debug('generateSitemap');

    const {
      base_url,
      page_priority,
      url_filters,
      urls,
      xml_footer,
      xml_header,
    }: SitemapGeneratorConfig = { ...SitemapGenerator.defaultConfig(), ...context.config[SitemapGenerator.configKey] };

    let documents: import('../wiki.js').UttoriWikiDocument[] = [];
    try {
      [documents] = await context.hooks.fetch('storage-query', 'SELECT \'slug\', \'createDate\', \'updateDate\' FROM documents WHERE slug != \'\' ORDER BY updateDate DESC LIMIT 10000');
    } catch (error) {
      /* c8 ignore next 1 */
      debug('Error geting documents:', error);
    }

    // Keep configured URLs immutable across repeated builds and callbacks.
    const routes = [...urls];
    // Add all documents to the urls array
    for (const document of documents) {
      routes.push({
        url: `/${document.slug}`,
        lastmod: document.updateDate ? new Date(document.updateDate).toISOString() : new Date(document.createDate).toISOString(),
        priority: page_priority,
      });
    }

    let urlFilter: SitemapUrlFilter = () => true;
    if (Array.isArray(url_filters) && url_filters.length > 0) {

      const filters: RegExp[] = url_filters;
      urlFilter = (route) => {
        let pass = true;
        for (const url_filter of filters) {
          try {
            if (url_filter.test(route.url)) {
              pass = false;
            }
          } catch (error) {
            /* c8 ignore next 2 */
            debug('Sitemap Filter Error:', error, url_filter, route.url);
          }
        }
        return pass;
      };
    }

    const data = routes.reduce((accumulator, route) => {
      if (urlFilter(route)) {
        accumulator += `<url><loc>${base_url}${route.url}</loc>`;
        if (route.lastmod) {
          accumulator += `<lastmod>${route.lastmod}</lastmod>`;
        }
        if (route.priority) {
          accumulator += `<priority>${route.priority}</priority>`;
        }
        if (route.changefreq) {
          accumulator += `<changefreq>${route.changefreq}</changefreq>`;
        }
        accumulator += '</url>';
      }
      return accumulator;
    }, '');

    return `${xml_header}${data}${xml_footer}`;
  }

  /**
   * Render an explicit finite route list without querying storage.
   * Static exports use this so the sitemap has exactly the pages in the artifact.
   * @param routes Public paths and their content dates.
   * @param config Sitemap formatting and canonical origin.
   * @returns Sitemap XML.
   */
  static generateRoutes(routes: SitemapGeneratorUrl[], config: Partial<SitemapGeneratorConfig>): string {
    const { base_url, xml_header, xml_footer } = { ...SitemapGenerator.defaultConfig(), ...config };
    if (!/^https?:\/\//.test(base_url)) {
      throw new Error('Sitemap canonical base_url must be an HTTP(S) origin.');
    }
    const unique = new Set();
    const entries = routes.map((route) => {
      if (!route.url.startsWith('/') || unique.has(route.url)) {
        throw new Error(`Invalid or duplicate sitemap URL: ${route.url}`);
      }
      unique.add(route.url);
      let entry = `<url><loc>${base_url.replace(/\/$/, '')}${route.url}</loc>`;
      if (route.lastmod) entry += `<lastmod>${route.lastmod}</lastmod>`;
      if (route.priority) entry += `<priority>${route.priority}</priority>`;
      if (route.changefreq) entry += `<changefreq>${route.changefreq}</changefreq>`;
      return `${entry}</url>`;
    }).join('');
    return `${xml_header}${entries}${xml_footer}`;
  }
}

export default SitemapGenerator;
