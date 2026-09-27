import { getPluginMethod } from './utilities/plugin-method.js';
import { createDebug } from '../debug.js';
import fs from 'node:fs';
import path from 'node:path';
import type { DownloadRouterConfig } from '../types/plugins/download-route.js';

export type { DownloadRouterConfig } from '../types/plugins/download-route.js';

const debug = createDebug('Uttori.Plugin.DownloadRouter');

/**
 * Uttori Download Router
 * @example <caption>DownloadRouter</caption>
 * const content = DownloadRouter.download(context);
 */
class DownloadRouter {
  /**
   * The configuration key for plugin to look for in the provided configuration.
   *
   * @returns The configuration key.
   * @example <caption>DownloadRouter.configKey</caption>
   * const config = { ...DownloadRouter.defaultConfig(), ...context.config[DownloadRouter.configKey] };
   */
  static get configKey(): 'uttori-plugin-download-router' {
    return 'uttori-plugin-download-router';
  }

  /**
   * The default configuration.
   * @returns The configuration.
   * @example <caption>DownloadRouter.defaultConfig()</caption>
   * const config = { ...DownloadRouter.defaultConfig(), ...context.config[DownloadRouter.configKey] };
   */
  static defaultConfig(): import('../custom.js').DefaultPluginConfig<DownloadRouterConfig, 'basePath' | 'publicRoute' | 'allowedReferrers' | 'middleware'> {
    return {
      // Directory files will be downloaded from.
      basePath: '/',

      // Server route to GET download from.
      publicRoute: '/download',

      // When set, check the referrers against this list, when disabled don't check at all.
      allowedReferrers: [],

      // Custom Middleware for the Upload route
      middleware: [],
    };
  }

  /**
   * Validates the provided configuration for required entries.
   * @param config - A provided configuration to use.
   * @param [_context] Unused.
   * @example <caption>DownloadRouter.validateConfig(config, _context)</caption>
   * DownloadRouter.validateConfig({ ... });
   */
  static validateConfig(config: Record<string, DownloadRouterConfig>, _context?: unknown) {
    debug('Validating config...');
    if (!config || !config[DownloadRouter.configKey]) {
      const error = `Config Error: '${DownloadRouter.configKey}' configuration key is missing.`;
      debug(error);
      throw new Error(error);
    }
    if (typeof config[DownloadRouter.configKey].basePath !== 'string') {
      const error = 'Config Error: `basePath` should be a string path to where files will be stored.';
      debug(error);
      throw new Error(error);
    }
    // Ensure the directory exists.
    if (!fs.existsSync(config[DownloadRouter.configKey].basePath)) {
      const error = 'Config Error: `basePath` should exist and be reachable.';
      debug(error);
      throw new Error(error);
    }
    if (typeof config[DownloadRouter.configKey].publicRoute !== 'string') {
      const error = 'Config Error: `publicRoute` should be a string server route to where files should be GET from.';
      debug(error);
      throw new Error(error);
    }
    if (!Array.isArray(config[DownloadRouter.configKey].allowedReferrers)) {
      const error = 'Config Error: `allowedReferrers` should be an array of URLs or a blank array.';
      debug(error);
      throw new Error(error);
    }
    if (!Array.isArray(config[DownloadRouter.configKey].middleware)) {
      const error = 'Config Error: `middleware` should be an array of middleware.';
      debug(error);
      throw new Error(error);
    }
    debug('Validated config.');
  }

  /**
   * Register the plugin with a provided set of events on a provided Hook system.
   * @param context A Uttori-like context.
   * @param context.hooks An event system / hook system to use.
   * @param context.hooks.on An event registration function.
   * @param context.config - A provided configuration to use.
   * @example <caption>DownloadRouter.register(context)</caption>
   * const context = {
   *   hooks: {
   *     on: (event, callback) => { ... },
   *   },
   *   config: {
   *     [DownloadRouter.configKey]: {
   *       ...,
   *       events: {
   *         bindRoutes: ['bind-routes'],
   *       },
   *     },
   *   },
   * };
   * DownloadRouter.register(context);
   */
  static register(context: Pick<import('../custom.js').UttoriContext, 'hooks' | 'config'>) {
    debug('register');
    if (!context || !context.hooks || typeof context.hooks.on !== 'function') {
      throw new Error('Missing event dispatcher in \'context.hooks.on(event, callback)\' format.');
    }

    const config = { ...DownloadRouter.defaultConfig(), ...context.config[DownloadRouter.configKey] };
    if (!config.events) {
      throw new Error('Missing events to listen to for in \'config.events\'.');
    }

    // Bind events
    for (const [method, eventNames] of Object.entries(config.events)) {
      const DownloadRouterMethod = getPluginMethod<import('@uttori/event-dispatcher').UttoriEventCallback<unknown, unknown, unknown>>(DownloadRouter, method);
      if (DownloadRouterMethod) {
        for (const event of eventNames) {
          context.hooks.on(event, DownloadRouterMethod);
        }
      } else {
        debug(`Missing function "${method}"`);
      }
    }
  }

  /**
   * Add the upload route to the server object.
   * @param server An Express server instance.
   * @param server.get Function to register route.
   * @param context A Uttori-like context.
   * @param context.config - A provided configuration to use.
   * @example <caption>DownloadRouter.bindRoutes(server, context)</caption>
   * const context = {
   *   config: {
   *     [DownloadRouter.configKey]: {
   *       middleware: [],
   *       publicRoute: '/download',
   *     },
   *   },
   * };
   * DownloadRouter.bindRoutes(server, context);
   */
  static bindRoutes(server: Pick<import('express').Application, 'get'>, context: Pick<import('../custom.js').UttoriContext, 'config'>) {
    debug('bindRoutes');

    const { publicRoute, middleware } = { ...DownloadRouter.defaultConfig(), ...context.config[DownloadRouter.configKey] };
    debug('bindRoutes publicRoute:', `${publicRoute}/:file`);
    server.get(`${publicRoute}/*file`, ...middleware, DownloadRouter.download(context));
  }

  /**
   * The Express route method to process the upload request and provide a response.
   * @param context A Uttori-like context.
   * @param context.config - A provided configuration to use.
   * @returns The function to pass to Express.
   * @example <caption>DownloadRouter.download(context)(request, response, _next)</caption>
   * server.post('/upload', DownloadRouter.download);
   */
  static download(context: Pick<import('../custom.js').UttoriContext, 'config'>): import('express').RequestHandler {
    return (request, response, next) => {
      debug('download');

      const { basePath, allowedReferrers } = { ...DownloadRouter.defaultConfig(), ...context.config[DownloadRouter.configKey] };

      debug('download: request?.params:', request?.params);

      /* c8 ignore next 5 */
      if (!request?.params.file) {
        debug('download: no file parameter');
        next();
        return;
      }

      const filePath = Array.isArray(request?.params.file) ? request?.params.file.join('/') : request?.params.file;
      let filename = path.join(basePath, filePath.trim());
      debug('download: filename:', filename);
      // Prevent directory traversal with regex
      /* c8 ignore next 5 */
      if (/(\.\.\/|\/\.\.\/|\/\.\.$|^\.\.$)/.test(filename)) {
        debug('download: directory traversal');
        next();
        return;
      }

      // Make sure the file exists
      debug('download: checking if file exists...');
      filename = path.resolve(filename);
      if (!fs.existsSync(filename)) {
        debug('download: file does not exist');
        next();
        return;
      }

      const referrer = request.get('Referrer') || '';
      debug('referrer:', referrer);
      // referrer is an optional http header, it may not exist
      if (allowedReferrers.length && !referrer) {
        debug('empty referrer:', referrer);
        next();
        return;
      }

      // Check for our allowed domains
      if (allowedReferrers.length && !allowedReferrers.some((check) => referrer.startsWith(check))) { // compare referrer with your whitelist
        debug('now allowed referrer:', referrer);
        next();
        return;
      }

      // Get file stats
      const fileStats = fs.statSync(filename);

      // Set headers for forcing the browser to download the file
      response.setHeader('Pragma', 'BS-X Download');
      response.setHeader('Cache-Control', 'must-revalidate, post-check=0, pre-check=0');
      response.setHeader('Content-Disposition', `attachment; filename="${path.basename(filename)}"`);
      response.setHeader('Content-Length', fileStats.size);
      response.setHeader('Keep-Alive', 'timeout=2, max=100');
      response.setHeader('Connection', 'Keep-Alive');
      response.setHeader('Content-Type', 'application/octet-stream');

      // Stream the file to the client
      const stream = fs.createReadStream(filename);
      stream.pipe(response).on('error', (error) => {
        /* c8 ignore next 3 */
        debug(error);
        response.status(500).send('Server Error');
      });
    };
  }
}

export default DownloadRouter;
