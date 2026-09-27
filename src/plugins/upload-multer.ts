import { getPluginMethod } from './utilities/plugin-method.js';
import { createDebug } from '../debug.js';
import fs from 'node:fs';
import path from 'node:path';
import express from 'express';

const debug = createDebug('Uttori.Plugin.MulterUpload');
import multer from 'multer';
import { sanitizeFilename, validateMimeType } from './utilities/security.js';
import type { MulterUploadConfig } from '../types/plugins/upload-multer.js';

export type { MulterUploadConfig } from '../types/plugins/upload-multer.js';

/**
 * Uttori Multer Upload
 * @example <caption>MulterUpload</caption>
 * const content = MulterUpload.storeFile(request);
 */
class MulterUpload {
  /**
   * The configuration key for plugin to look for in the provided configuration.
   *
   * @returns The configuration key.
   * @example <caption>MulterUpload.configKey</caption>
   * const config = { ...MulterUpload.defaultConfig(), ...context.config[MulterUpload.configKey] };
   */
  static get configKey(): 'uttori-plugin-upload-multer' {
    return 'uttori-plugin-upload-multer';
  }

  /**
   * The default configuration.
   * @returns The configuration.
   * @example <caption>MulterUpload.defaultConfig()</caption>
   * const config = { ...MulterUpload.defaultConfig(), ...context.config[MulterUpload.configKey] };
   */
  static defaultConfig(): import('../custom.js').DefaultPluginConfig<MulterUploadConfig, 'directory' | 'route' | 'publicRoute' | 'middleware' | 'allowedMimeTypes' | 'maxFileSize'> {
    return {
      directory: 'uploads',
      route: '/upload',
      publicRoute: '/uploads',
      middleware: [],
      allowedMimeTypes: [],
      maxFileSize: 10 * 1024 * 1024, // 10MB default
    };
  }

  /**
   * Validates the provided configuration for required entries.
   * @param config A configuration object.
   * @param _context Unused.
   * @example <caption>MulterUpload.validateConfig(config, _context)</caption>
   * MulterUpload.validateConfig({ ... });
   */
  static validateConfig(config: Record<string, MulterUploadConfig>, _context: unknown) {
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
   * @param context A Uttori-like context.
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
   */
  static register(context: import('../custom.js').UttoriContextWithPluginConfig<'uttori-plugin-upload-multer', MulterUploadConfig>) {
    debug('register');
    if (!context || !context.hooks || typeof context.hooks.on !== 'function') {
      throw new Error('Missing event dispatcher in \'context.hooks.on(event, callback)\' format.');
    }

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
      const MulterUploadMethod = getPluginMethod<import('@uttori/event-dispatcher').UttoriEventCallback<unknown, unknown, unknown>>(MulterUpload, method);
      if (MulterUploadMethod) {
        for (const event of events) {

          const callback = MulterUploadMethod;
          context.hooks.on(event, callback);
        }
      } else {
        debug(`Missing function "${method}"`);
      }
    }
  }

  /**
   * Add the upload route to the server object.
   * @param server An Express server instance.
   * @param context A Uttori-like context.
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
   */
  static bindRoutes(server: import('express').Application, context: import('../custom.js').UttoriContextWithPluginConfig<'uttori-plugin-upload-multer', MulterUploadConfig>) {
    debug('bindRoutes');

    const { directory, route, publicRoute, middleware } = { ...MulterUpload.defaultConfig(), ...context.config[MulterUpload.configKey] };
    debug('bindRoutes route:', route);
    debug('bindRoutes directory:', directory);
    server.use(publicRoute, express.static(directory));
    server.post(route, ...middleware, MulterUpload.upload(context));
  }

  /**
   * The Express route method to process the upload request and provide a response.
   * @param context A Uttori-like context.
   * @returns The function to pass to Express.
   * @example <caption>MulterUpload.upload(context)(request, response, _next)</caption>
   * server.post('/upload', MulterUpload.upload);
   */
  static upload(context: import('../custom.js').UttoriContextWithPluginConfig<'uttori-plugin-upload-multer', MulterUploadConfig>): import('express').RequestHandler<Record<string, never>, string, { fullPath: string }> {
    return (request, response, _next) => {
      debug('upload');

      const config = { ...MulterUpload.defaultConfig(), ...context.config[MulterUpload.configKey] };
      const baseDirectory = path.resolve(config.directory);

      const storage: import('multer').StorageEngine = multer.diskStorage({
        destination: (_destinationRequest, _file, callback) => {
          // Always store uploads at the base directory, no subdirectories.
          callback(null, baseDirectory);
        },
        filename(_request, file, callback) {
          // Sanitize filename to prevent path traversal
          const sanitizedOriginalName = sanitizeFilename(file.originalname);
          const { name, ext } = path.parse(sanitizedOriginalName);
          // Ensure extension is safe
          const safeExt = sanitizeFilename(ext) || ext;
          const filename = `${sanitizeFilename(name)}-${Date.now()}${safeExt}`;
          callback(null, filename);
        },
      });

      // Create Multer handler with file validation
      const handler = multer({
        storage,
        limits: {
          fileSize: config.maxFileSize,
        },
        fileFilter: (_request, file, callback) => {
          // Validate MIME type if restrictions are set
          if (config.allowedMimeTypes && config.allowedMimeTypes.length > 0) {
            if (!validateMimeType(file.mimetype, config.allowedMimeTypes)) {
              const error = new Error(`File type ${file.mimetype} is not allowed. Allowed types: ${config.allowedMimeTypes.join(', ')}`);
              debug('Upload Error - Invalid MIME type:', file.mimetype);
              callback(error);
              return;
            }
          }
          callback(null, true);
        },
      }).single('file');

      handler(request, response, (error) => {
        let status = 200;
        // Respond with the relative path to the file.

        let send: string | undefined = request.file?.path.replace(config.directory, config.publicRoute);
        /* c8 ignore next 5 */
        if (error) {
          debug('Upload Error:', error);
          status = 422;
          send = error instanceof Error ? error.message : String(error);
        }
        return response.status(status).send(send);
      });
    };
  }
}

export default MulterUpload;
