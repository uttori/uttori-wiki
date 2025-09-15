import fs from 'node:fs';
import path from 'node:path';
import express from 'express';

import multer from 'multer';

let debug = (..._) => {};
/* c8 ignore next 2 */
try { const { default: d } = await import('debug'); debug = d('Uttori.Plugin.MulterUpload'); } catch {}

/**
 * @typedef {object} MulterUploadConfig
 * @property {Record<string, string[]>} [events] An object whose keys correspond to methods, and contents are events to listen for.
 * @property {string} [directory] Directory files will be uploaded to. The default is 'uploads'.
 * @property {string} [route] Server route to POST uploads to. The default is '/upload'.
 * @property {string} [publicRoute] Server route to GET uploads from. The default is '/uploads'.
 * @property {import('express').RequestHandler[]} [middleware] Custom Middleware for the Upload route
 */

/**
 * Uttori Multer Upload
 * @example <caption>MulterUpload</caption>
 * const content = MulterUpload.storeFile(request);
 * @class
 */
class MulterUpload {
  /**
   * The configuration key for plugin to look for in the provided configuration.
   * @type {string}
   * @returns {string} The configuration key.
   * @example <caption>MulterUpload.configKey</caption>
   * const config = { ...MulterUpload.defaultConfig(), ...context.config[MulterUpload.configKey] };
   * @static
   */
  static get configKey() {
    return 'uttori-plugin-upload-multer';
  }

  /**
   * The default configuration.
   * @returns {MulterUploadConfig} The configuration.
   * @example <caption>MulterUpload.defaultConfig()</caption>
   * const config = { ...MulterUpload.defaultConfig(), ...context.config[MulterUpload.configKey] };
   * @static
   */
  static defaultConfig() {
    return {
      directory: 'uploads',
      route: '/upload',
      publicRoute: '/uploads',
      middleware: [],
    };
  }

  /**
   * Validates the provided configuration for required entries.
   * @param {Record<string, MulterUploadConfig>} config A configuration object.
   * @param {import('../../dist/custom.d.ts').UttoriContextWithPluginConfig<'uttori-plugin-upload-multer', MulterUploadConfig>} _context Unused.
   * @example <caption>MulterUpload.validateConfig(config, _context)</caption>
   * MulterUpload.validateConfig({ ... });
   * @static
   */
  static validateConfig(config, _context) {
    debug('Validating config...');
    if (!config || !config[MulterUpload.configKey]) {
      const error = `Config Error: '${MulterUpload.configKey}' configuration key is missing.`;
      debug(error);
      throw new Error(error);
    }
    if (typeof config[MulterUpload.configKey].directory !== 'string') {
      const error = 'Config Error: `directory` should be a string path to where files should be stored.';
      debug(error);
      throw new Error(error);
    }
    if (typeof config[MulterUpload.configKey].route !== 'string') {
      const error = 'Config Error: `route` should be a string server route to where files should be POSTed to.';
      debug(error);
      throw new Error(error);
    }
    if (typeof config[MulterUpload.configKey].publicRoute !== 'string') {
      const error = 'Config Error: `publicRoute` should be a string server route to where files should be GET from.';
      debug(error);
      throw new Error(error);
    }
    if (!Array.isArray(config[MulterUpload.configKey].middleware)) {
      const error = 'Config Error: `middleware` should be an array of middleware.';
      debug(error);
      throw new Error(error);
    }
    debug('Validated config.');
  }

  /**
   * Register the plugin with a provided set of events on a provided Hook system.
   * @param {import('../../dist/custom.d.ts').UttoriContextWithPluginConfig<'uttori-plugin-upload-multer', MulterUploadConfig>} context A Uttori-like context.
   * @example <caption>MulterUpload.register(context)</caption>
   * const context = {
   *   hooks: {
   *     on: (event, callback) => { ... },
   *   },
   *   config: {
   *     [MulterUpload.configKey]: {
   *       ...,
   *       events: {
   *         bindRoutes: ['bind-routes'],
   *       },
   *     },
   *   },
   * };
   * MulterUpload.register(context);
   * @static
   */
  static register(context) {
    debug('register');
    if (!context || !context.hooks || typeof context.hooks.on !== 'function') {
      throw new Error('Missing event dispatcher in \'context.hooks.on(event, callback)\' format.');
    }
    /** @type {MulterUploadConfig} */
    const config = { ...MulterUpload.defaultConfig(), ...context.config[MulterUpload.configKey] };
    if (!config.events) {
      throw new Error('Missing events to listen to for in \'config.events\'.');
    }

    // Ensure the directory exists.
    /* c8 ignore next 8 */
    try {
      if (!fs.existsSync(config.directory)) {
        debug('Directory missing, creating:', config.directory);
        fs.mkdirSync(config.directory, { recursive: true });
      }
    } catch (error) {
      debug('Error creating directory:', error);
    }

    // Bind events
    for (const [method, events] of Object.entries(config.events)) {
      if (typeof MulterUpload[method] === 'function') {
        for (const event of events) {
          /** @type {import('@uttori/event-dispatcher').UttoriEventCallback} */
          const callback = MulterUpload[method];
          context.hooks.on(event, callback);
        }
      } else {
        debug(`Missing function "${method}"`);
      }
    }
  }

  /**
   * Add the upload route to the server object.
   * @param {import('express').Application} server An Express server instance.
   * @param {import('../../dist/custom.d.ts').UttoriContextWithPluginConfig<'uttori-plugin-upload-multer', MulterUploadConfig>} context A Uttori-like context.
   * @example <caption>MulterUpload.bindRoutes(server, context)</caption>
   * const context = {
   *   config: {
   *     [MulterUpload.configKey]: {
   *       directory: 'uploads',
   *       route: '/upload',
   *     },
   *   },
   * };
   * MulterUpload.bindRoutes(server, context);
   * @static
   */
  static bindRoutes(server, context) {
    debug('bindRoutes');
    /** @type {MulterUploadConfig} */
    const { directory, route, publicRoute, middleware } = { ...MulterUpload.defaultConfig(), ...context.config[MulterUpload.configKey] };
    debug('bindRoutes route:', route);
    debug('bindRoutes directory:', directory);
    server.use(publicRoute, express.static(directory));
    server.post(route, ...middleware, MulterUpload.upload(context));
  }

  /**
   * The Express route method to process the upload request and provide a response.
   * @param {import('../../dist/custom.d.ts').UttoriContextWithPluginConfig<'uttori-plugin-upload-multer', MulterUploadConfig>} context A Uttori-like context.
   * @returns {import('express').RequestHandler<{}, string, { fullPath: string }>} The function to pass to Express.
   * @example <caption>MulterUpload.upload(context)(request, response, _next)</caption>
   * server.post('/upload', MulterUpload.upload);
   * @static
   */
  static upload(context) {
    return (request, response, _next) => {
      debug('upload');
      /** @type {MulterUploadConfig} */
      const config = { ...MulterUpload.defaultConfig(), ...context.config[MulterUpload.configKey] };

      /** @type {import('multer').StorageEngine} */
      const storage = multer.diskStorage({
        destination: (destinationRequest, _file, callback) => {
          // Check for subdirectories ignoring any malicious or weird paths.
          if (destinationRequest.body.fullPath && !destinationRequest.body.fullPath.includes('..') && !destinationRequest.body.fullPath.includes('\0')) {
            try {
              // Extract the subdirectory from the fullPath.
              const subdirectory = path.dirname(destinationRequest.body.fullPath);
              const fullPath = path.join(config.directory, subdirectory);
              // Create the subdirectory if it doesn't exist.
              /* c8 ignore next 4 */
              if (!fs.existsSync(fullPath)) {
                debug('Subdirectory missing, creating:', fullPath);
                fs.mkdirSync(fullPath, { recursive: true });
              }
              callback(null, fullPath);
              return;
            } catch (error) {
              /* c8 ignore next 2 */
              debug('Error creating subdirectory:', error);
            }
          }

          // No subdirectory, just the file.
          callback(null, config.directory);
        },
        filename(_request, file, callback) {
          const { name, ext } = path.parse(file.originalname);
          const filename = `${name}-${Date.now()}${ext}`;
          callback(null, filename);
        },
      });

      // Create Multer handler and run.
      const handler = multer({ storage }).single('file');
      handler(request, response, (error) => {
        let status = 200;
        // Respond with the relatize path to the file.
        /** @type {string} */
        let send = request.file?.path.replace(config.directory, config.publicRoute);
        /* c8 ignore next 5 */
        if (error) {
          debug('Upload Error:', error);
          status = 422;
          send = error;
        }
        return response.status(status).send(send);
      });
    };
  }
}

export default MulterUpload;
