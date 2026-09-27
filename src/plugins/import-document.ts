import { getPluginMethod } from './utilities/plugin-method.js';
import { createDebug } from '../debug.js';

const debug = createDebug('Uttori.Plugin.ImportDocument');
import fs, { createWriteStream } from 'node:fs';
import path, { dirname } from 'node:path';
import { Readable } from 'node:stream';
import { fileURLToPath } from 'node:url';
import { cmd } from './utilities/cmd.js';
import { sanitizeSlug, sanitizeFilename, validateAndSanitizeUrl } from './utilities/security.js';
import type {
  ImportDocumentConfigPage, ImportDocumentProcessConfig, ImportDocumentProcessPage,
  ImportDocumentRequestHandlerFactory, ImportDocumentConfig, ImportDocumentPayload,
} from '../types/plugins/import-document.js';

export type {
  ImportDocumentConfigPage, ImportDocumentDownload, ImportDocumentDownloadFile,
  ImportDocumentProcessConfig, ImportDocumentProcessPageFunction, ImportDocumentProcessPage,
  ImportDocumentApiPayload, ImportDocumentContext, ImportDocumentRequestHandlerFactory,
  ImportDocumentConfig, ImportDocumentPayload,
} from '../types/plugins/import-document.js';

/**
 * Uttori Import Document
 * Imports documents from a variety of sources, including markdown, PDF, and image files.
 */
class ImportDocument {
  /**
   * The configuration key for plugin to look for in the provided configuration.
   *
   * @returns The configuration key.
   * @example <caption>ImportDocument.configKey</caption>
   * const config = { ...ImportDocument.defaultConfig(), ...context.config[ImportDocument.configKey] };
   */
  static get configKey(): 'uttori-plugin-import-document' {
    return 'uttori-plugin-import-document';
  }

  /**
   * The default configuration.
   * @returns The configuration.
   * @example <caption>ImportDocument.defaultConfig()</caption>
   * const config = { ...ImportDocument.defaultConfig(), ...context.config[ImportDocument.configKey] };
   */
  static defaultConfig(): import('../custom.js').DefaultPluginConfig<ImportDocumentConfig, 'apiRoute' | 'publicRoute' | 'uploadPath' | 'uploadDirectory' | 'allowedReferrers' | 'middlewarePublic' | 'middlewareApi' | 'downloadFile' | 'processPage' | 'apiRequestHandler' | 'interfaceRequestHandler'> {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    return {
      apiRoute: '/import-api',
      publicRoute: '/import',
      uploadPath: 'uploads',
      uploadDirectory: path.join(__dirname, 'uploads'),
      allowedReferrers: [],
      middlewarePublic: [],
      middlewareApi: [],

      downloadFile: ImportDocument.downloadFile,

      processPage: ImportDocument.processPage,

      apiRequestHandler: ImportDocument.apiRequestHandler,

      interfaceRequestHandler: ImportDocument.interfaceRequestHandler,
    };
  }

  /**
   * Validates the provided configuration for required entries.
   * @param config A provided configuration to use.
   * @param [_context] Unused.
   * @example <caption>ImportDocument.validateConfig(config, _context)</caption>
   * ImportDocument.validateConfig({ ... });
   */
  static validateConfig(config: Record<string, ImportDocumentConfig>, _context?: unknown) {
    debug('Validating config...');
    if (!config || !config[ImportDocument.configKey]) {
      const error = `Config Error: '${ImportDocument.configKey}' configuration key is missing.`;
      debug(error);
      throw new Error(error);
    }
    const configExtended = { ...ImportDocument.defaultConfig(), ...config[ImportDocument.configKey] };
    if (!Array.isArray(configExtended.allowedReferrers)) {
      const error = 'Config Error: `allowedReferrers` should be an array of URLs or an empty array.';
      debug(error);
      throw new Error(error);
    }
    if (typeof configExtended.uploadPath !== 'string' || !configExtended.uploadPath.length) {
      const error = 'Config Error: `uploadPath` should be a string path to reference uploaded files by.';
      debug(error);
      throw new Error(error);
    }
    if (typeof configExtended.uploadDirectory !== 'string' || !configExtended.uploadDirectory.length) {
      const error = 'Config Error: `uploadDirectory` should be a string path to a directory to upload files to.';
      debug(error);
      throw new Error(error);
    }
    if (typeof configExtended.apiRequestHandler !== 'function') {
      const error = 'Config Error: `apiRequestHandler` should be a function to handle the API route.';
      debug(error);
      throw new Error(error);
    }
    if (typeof configExtended.interfaceRequestHandler !== 'function') {
      const error = 'Config Error: `interfaceRequestHandler` should be a function to handle the interface route.';
      debug(error);
      throw new Error(error);
    }
    if (typeof configExtended.downloadFile !== 'function') {
      const error = 'Config Error: `downloadFile` should be a function to handle the download.';
      debug(error);
      throw new Error(error);
    }
    if (!Array.isArray(configExtended.middlewareApi)) {
      const error = 'Config Error: `middlewareApi` should be an array of middleware.';
      debug(error);
      throw new Error(error);
    }
    if (!Array.isArray(configExtended.middlewarePublic)) {
      const error = 'Config Error: `middlewarePublic` should be an array of middleware.';
      debug(error);
      throw new Error(error);
    }
    debug('Validated config.');
  }

  /**
   * Register the plugin with a provided set of events on a provided Hook system.
   * @param context A Uttori-like context.
   * @example <caption>ImportDocument.register(context)</caption>
   * const context = {
   *   hooks: {
   *     on: (event, callback) => { ... },
   *   },
   *   config: {
   *     [ImportDocument.configKey]: {
   *       ...,
   *       events: {
   *         bindRoutes: ['bind-routes'],
   *       },
   *     },
   *   },
   * };
   * ImportDocument.register(context);
   */
  static register(context: import('../custom.js').UttoriContextWithPluginConfig<'uttori-plugin-import-document', ImportDocumentConfig>) {
    debug('register');
    if (!context || !context.hooks || typeof context.hooks.on !== 'function') {
      throw new Error('Missing event dispatcher in \'context.hooks.on(event, callback)\' format.');
    }

    const config = { ...ImportDocument.defaultConfig(), ...context.config[ImportDocument.configKey] };
    if (!config.events) {
      throw new Error('Missing events to listen to for in \'config.events\'.');
    }
    // Bind events
    for (const [method, events] of Object.entries(config.events)) {
      const ImportDocumentMethod = getPluginMethod<import('@uttori/event-dispatcher').UttoriEventCallback<unknown, unknown, unknown>>(ImportDocument, method);
      if (ImportDocumentMethod) {
        for (const event of events) {

          const callback = ImportDocumentMethod;
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
   * @example <caption>ImportDocument.bindRoutes(server, context)</caption>
   * const context = {
   *   config: {
   *     [ImportDocument.configKey]: {
   *       middleware: [],
   *       publicRoute: '/download',
   *     },
   *   },
   * };
   * ImportDocument.bindRoutes(server, context);
   */
  static bindRoutes(server: import('express').Application, context: import('../custom.js').UttoriContextWithPluginConfig<'uttori-plugin-import-document', ImportDocumentConfig>) {
    debug('bindRoutes');

    const pluginConfig: ImportDocumentConfig = context.config[ImportDocument.configKey] ?? {};
    const configExtended = { ...ImportDocument.defaultConfig(), ...pluginConfig };
    const { apiRoute, publicRoute, middlewareApi, middlewarePublic } = configExtended;

    const apiHandler: ImportDocumentRequestHandlerFactory = pluginConfig.apiRequestHandler !== undefined
      ? pluginConfig.apiRequestHandler
      : ImportDocument.apiRequestHandler;

    const interfaceHandler: ImportDocumentRequestHandlerFactory = pluginConfig.interfaceRequestHandler !== undefined
      ? pluginConfig.interfaceRequestHandler
      : ImportDocument.interfaceRequestHandler;
    if (typeof interfaceHandler !== 'function') {
      throw new Error('Config Error: `interfaceRequestHandler` is missing.');
    }
    debug('bindRoutes:', { apiRoute, publicRoute });
    server.post(`${apiRoute}`, ...middlewareApi, apiHandler(context));
    server.get(`${publicRoute}`, ...middlewarePublic, interfaceHandler(context));
  }

  /**
   * The Express route method to process the upload request and provide a response.
   * Supports both file imports and URL scraping through the pages array.
   *
   * File handling (detected by file extension in page.name):
   * - Markdown files (.md/.markdown): Used directly as content (supports URLs and local paths)
   * - PDF files (.pdf): Stored as attachments (supports URLs and local paths, stub articles only when PDF is the only page)
   * - Image files (.jpg/.jpeg/.png/.gif/.webp/.svg): Stored as attachments (supports URLs and local paths)
   * - Other files: Treated as URLs for web scraping
   *
   * File processing:
   * - All file types support both URLs and local file paths
   * - URLs are downloaded using wget, local files are copied
   * - Provided 'image' parameter (URL) is downloaded to uploads directory
   * - Document image priority: downloaded image > first image page > provided image URL
   *
   * Request body structure:
   * - pages: Array of page objects (files or URLs)
   * - title, image, excerpt, tags, slug, redirects: Document metadata
   * @param context A Uttori-like context.
   * @returns The function to pass to Express.
   * @example <caption>ImportDocument.apiRequestHandler(context)(request, response, _next)</caption>
   * server.post('/chat-api', ImportDocument.apiRequestHandler(context));
   */
  static apiRequestHandler(context: import('../custom.js').UttoriContextWithPluginConfig<'uttori-plugin-import-document', ImportDocumentConfig>): import('express').RequestHandler {

    return async (request, response, next) => {
      debug('apiRequestHandler');

      const config = { ...ImportDocument.defaultConfig(), ...context.config[ImportDocument.configKey] };
      const referrer = request.get('Referrer') || '';
      debug('apiRequestHandler referrer:', referrer);
      // referrer is an optional http header, it may not exist
      if (config.allowedReferrers.length && !referrer) {
        debug('apiRequestHandler empty referrer:', referrer);
        next();
        return;
      }

      // Check for our allowed domains
      if (config.allowedReferrers.length && !config.allowedReferrers.some((check) => referrer.startsWith(check))) {
        debug('apiRequestHandler referrer not allowed:', referrer);
        next();
        return;
      }

      // Extract the needed keys from the request body
      const { title, image, excerpt, pages, tags, slug, redirects } = (request.body ?? {}) as ImportDocumentPayload;
      debug('apiRequestHandler request.body:', request.body);
      if (!title || !slug) {
        debug('apiRequestHandler title or slug is missing:', request.body);
        response.status(400).send({ error: 'Title and slug are required.' });
        return;
      }

      // Sanitize slug to prevent path traversal
      const sanitizedSlug = sanitizeSlug(slug);
      if (!sanitizedSlug) {
        debug('apiRequestHandler invalid slug:', slug);
        response.status(400).send({ error: 'Invalid slug provided.' });
        return;
      }

      // Get the absolute path to the upload directory
      const uploadDir = path.join(config.uploadDirectory, sanitizedSlug);

      // Create directory for uploaded files
      await fs.promises.mkdir(uploadDir, { recursive: true });

      let content = '';

      const attachments: import('../wiki.js').UttoriWikiDocumentAttachment[] = [];

      let importedImagePath: string | null = null;

      // Import the provided image if it exists
      if (image) {
        debug('apiRequestHandler image:', image);
        try {
          // Validate and sanitize the image URL
          const validatedImageUrl = validateAndSanitizeUrl(image);
          if (!validatedImageUrl) {
            debug('apiRequestHandler invalid image URL:', image);
            throw new Error('Invalid image URL');
          }

          const imageFileName = sanitizeFilename(path.basename(validatedImageUrl));
          const imageExt = path.extname(imageFileName).toLowerCase();

          // Download the image from URL to uploads directory
          await config.downloadFile({
            url: validatedImageUrl,
            fileName: path.join(config.uploadDirectory, sanitizedSlug, imageFileName),
            type: 'image',
          });

          // Add to attachments
          attachments.push({
            id: crypto.randomUUID(),
            metadata: {},
            name: imageFileName,
            path: path.join(config.uploadPath, sanitizedSlug, imageFileName),
            size: fs.statSync(path.join(config.uploadDirectory, sanitizedSlug, imageFileName)).size,
            type: `image/${imageExt.slice(1)}`,
          });

          importedImagePath = path.join(config.uploadPath, sanitizedSlug, imageFileName);
        } catch (error) {
          debug('apiRequestHandler failed to import provided image:', error);
        }
      }

      // Process all pages (files and URLs)
      if (pages && pages.length > 0) {
        debug('apiRequestHandler pages:', pages);
        for (const page of pages) {
          if (!page.url || !page.name) {
            debug('apiRequestHandler page.url or page.name is missing:', page);
            continue;
          }

          const processPage = config.processPage ?? ImportDocument.processPage;
          const processedPage = await processPage(config, slug, page);
          if (processedPage.attachments && Array.isArray(processedPage.attachments)) {
            attachments.push(...processedPage.attachments);
          }
          if (processedPage.content && typeof processedPage.content === 'string') {
            content += processedPage.content;
          }
        }
      }

      // Create the document
      const updateDate = Date.now();
      const createDate = updateDate;

      // Use imported image if available, otherwise use validated image URL.
      const documentImage = importedImagePath || (image ? validateAndSanitizeUrl(image) : null);

      let document: import('../wiki.js').UttoriWikiDocument = {
        title,
        image: documentImage,
        excerpt,
        content,
        tags,
        slug: sanitizedSlug,
        redirects,
        createDate,
        updateDate,
        attachments,
      };
      document = await context.hooks.filter('document-save', document, context);

      // Save document, write the joined file, and a history entry
      await context.hooks.fetch('storage-update', { document }, context);
      context.hooks.dispatch('search-update', [{ document }], context);

      response.set('Content-Type', 'application/json');
      response.status(200).send(document);
    };
  }

  /**
   * The Express request handler for the interface route.
   * @param context A Uttori-like context.
   * @returns The function to pass to Express.
   * @example <caption>ImportDocument.interfaceRequestHandler(context)(request, response, _next)</caption>
   * server.get('/import', ImportDocument.interfaceRequestHandler(context));
   */
  static interfaceRequestHandler (context: import('../custom.js').UttoriContextWithPluginConfig<'uttori-plugin-import-document', ImportDocumentConfig>): import('express').RequestHandler {
    return async (request, response, _next) => {
      debug('interfaceRequestHandler');

      // Fetch all the used tags to populate the tags dropdown.

      let tags: string[] = [];
      try {
        const query = 'SELECT tags FROM documents WHERE slug NOT_IN ("home-page") ORDER BY updateDate DESC LIMIT -1';

        const [results]: import('../wiki.js').UttoriWikiDocument[][] = await context.hooks.fetch('storage-query', query, context);
        // Organize and deduplicate, and sort the tags.
        tags = [...new Set(results.flatMap((t) => t.tags))].filter(Boolean).sort((a, b) => a.localeCompare(b));
      /* c8 ignore next 3 */
      } catch (error) {
        debug('Error fetching tags:', error);
      }

      let viewModel = {
        title: 'Import Document',
        config: context.config,
        session: request.session || {},
        slug: 'import-document',
        meta: {},
        basePath: request.baseUrl,
        flash: request.wikiFlash(),
        tags,
      };
      viewModel = await context.hooks.filter('view-model-import-document', viewModel, this);
      response.set('X-Robots-Tag', 'noindex');
      response.render('import', viewModel);
    };
  }

  /**
   * Downloads a file from a URL and saves it to the uploads directory.
   * @param options The options for the download, represents a page
   * @param options.url The URL of the file to download.
   * @param options.fileName The name of the file to save the file to.
   * @param options.type The type of the file to download.
   */
  static async downloadFile({ url, fileName, type }: { url: string; fileName: string; type: string }): Promise<void> {
    debug('downloadFile:', { url, fileName, type });
    try {
      // Validate URL before fetching
      const validatedUrl = validateAndSanitizeUrl(url);
      if (!validatedUrl) {
        throw new Error(`Invalid URL: ${url}`);
      }

      // Normalize and validate file path to prevent path traversal
      const normalizedFileName = path.resolve(fileName);
      const normalizedDir = path.resolve(path.dirname(normalizedFileName));

      // Ensure the directory exists before writing the file
      await fs.promises.mkdir(normalizedDir, { recursive: true });

      const response = await fetch(validatedUrl);
      if (response.ok && response.body) {
        debug('downloadFile: writing to file:', normalizedFileName);
        const writer = createWriteStream(normalizedFileName);

        const body: import('stream/web').ReadableStream = response.body;
        await new Promise<void>((resolve, reject) => {
          Readable.fromWeb(body)
            .pipe(writer)
            .on('finish', () => resolve())
            .on('error', reject);
        });
        debug('downloadFile: file written:', normalizedFileName);
      }
    } catch (error) {
      debug('downloadFile: error:', error);
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to download file from ${url}: ${message}`);
    }
  }

  /**
   * Processes a page and returns the content and attachment.
   * @param config The configuration object.
   * @param slug The slug of the document.
   * @param page The page to process.
   * @returns The content and attachments.
   */
  static async processPage(config: ImportDocumentProcessConfig, slug: string, page: ImportDocumentConfigPage): Promise<ImportDocumentProcessPage> {
    debug('processPage:', page);

    // Sanitize slug to prevent path traversal
    const sanitizedSlug = sanitizeSlug(slug);
    if (!sanitizedSlug) {
      debug('processPage: invalid slug:', slug);
      return { content: '', attachments: [] };
    }

    const uploadDir = path.join(config.uploadDirectory, sanitizedSlug);

    let hasContent = false;

    let content = '';

    const attachments: import('../wiki.js').UttoriWikiDocumentAttachment[] = [];

    // Handle local files (markdown, PDF, and images)
    if (page.type === 'text') {
      // Validate URL and sanitize filename
      const validatedUrl = validateAndSanitizeUrl(page.url);
      if (!validatedUrl) {
        debug('processPage: invalid URL for text type:', page.url);
        return { content, attachments };
      }
      const sanitizedFileName = sanitizeFilename(page.name);
      const markdownFileName = path.join(config.uploadDirectory, sanitizedSlug, sanitizedFileName);
      await config.downloadFile({ url: validatedUrl, fileName: markdownFileName, type: 'text' });
      const markdownContent = await fs.promises.readFile(markdownFileName, { encoding: 'utf-8' });
      content += `${markdownContent}\n\n---\n\n`;
      hasContent = true;
    }

    // Store binary files as attachments
    if (page.type === 'binary') {
      // Validate URL and sanitize filename
      const validatedUrl = validateAndSanitizeUrl(page.url);
      if (!validatedUrl) {
        debug('processPage: invalid URL for binary type:', page.url);
        return { content, attachments };
      }
      const sanitizedFileName = sanitizeFilename(page.name);
      const binaryFileName = path.join(config.uploadDirectory, sanitizedSlug, sanitizedFileName);
      await config.downloadFile({ url: validatedUrl, fileName: binaryFileName, type: 'binary' });
      attachments.push({
        id: crypto.randomUUID(),
        metadata: {},
        name: sanitizedFileName,
        path: path.join(config.uploadPath, sanitizedSlug, sanitizedFileName),
        size: fs.statSync(binaryFileName).size,
        type: path.extname(sanitizedFileName).slice(1).toLowerCase() === 'pdf' ? 'application/pdf' : path.extname(sanitizedFileName).slice(1).toLowerCase(),
      });
    }

    // Handle URL scraping
    if (page.type === 'scrape') {
      try {
        // Validate and sanitize URL before passing to wget
        const validatedUrl = validateAndSanitizeUrl(page.url);
        if (!validatedUrl) {
          debug('scraping page: invalid url:', page.url);
          return { content, attachments };
        }

        // Ensure uploadDir is absolute and normalized to prevent path traversal
        const normalizedUploadDir = path.resolve(uploadDir);

        const scrapeArgs = [
          '--no-parent',
          '--convert-links',
          '--html-extension',
          '--adjust-extension',
          '--no-host-directories',
          `--directory-prefix=${normalizedUploadDir}`,
          '--page-requisites',
          '--timestamping',
          '--execute',
          'robots=off',
          '--random-wait',
          '--span-hosts',
          validatedUrl,
        ];
        debug('scraping page:', { url: validatedUrl, uploadDir: normalizedUploadDir });
        await cmd({ file: 'wget', args: scrapeArgs }, { log: () => {}, timeout: 60000 });
      } catch (error) {
        debug('scrape page error:', error);
      }

      // Once we have the site fetched, we need to find all the HTML files in the directory
      const normalizedUploadDir = path.resolve(uploadDir);
      const htmlFiles = await fs.promises.readdir(normalizedUploadDir, { recursive: true });
      // Loop over all found HTML files and convert each to markdown and add to content
      for (const htmlFile of htmlFiles) {
        // Skip non-HTML files
        if (!htmlFile.endsWith('.html') && !htmlFile.endsWith('.htm')) {
          continue;
        }
        // Skip favicon files interpreted as HTML during fetch
        if (htmlFile.includes('favicon')) {
          continue;
        }
        // Sanitize file paths to prevent traversal
        const sanitizedHtmlFile = sanitizeFilename(htmlFile);
        if (!sanitizedHtmlFile) {
          continue;
        }
        const baseName = path.parse(sanitizedHtmlFile).name;
        const mdFile = `${baseName}.md`;
        const htmlFilePath = path.join(normalizedUploadDir, sanitizedHtmlFile);
        const mdFilePath = path.join(normalizedUploadDir, mdFile);

        // Ensure paths are within the upload directory (prevent path traversal)
        if (!htmlFilePath.startsWith(normalizedUploadDir) || !mdFilePath.startsWith(normalizedUploadDir)) {
          debug('processPage: path traversal detected:', { htmlFile, htmlFilePath, mdFilePath });
          continue;
        }
        const convertArgs = [
          '--from=html',
          '--wrap=none',
          '--to=gfm+gfm_auto_identifiers+autolink_bare_uris-raw_html-fenced_divs-bracketed_spans',
          '--output',
          mdFilePath,
          htmlFilePath,
        ];
        try {
          debug('converting page:', { htmlFile: htmlFilePath, mdFile: mdFilePath });
          await cmd({ file: 'pandoc', args: convertArgs });
          // Wait for the file to be written
          await new Promise((resolve) => setTimeout(resolve, 1000));
        } catch (error) {
          debug(`Failed to convert ${htmlFile}:`, error);
          continue;
        }

        // Read the markdown file
        try {
          const pageContent = await fs.promises.readFile(mdFilePath, { encoding: 'utf-8' });
          debug('pageContent:', pageContent.length);
          content += `${pageContent}\n\n---\n\n`;
          hasContent = true;
        } catch (error) {
          debug(`Failed to read generated markdown file ${mdFile}:`, error);
        }
      }
    }

    // If we only have PDFs and no other content, create a stub article
    if (!hasContent && attachments.length > 0 && attachments.some(({ type }) => type?.includes('pdf'))) {
      debug('creating stub article for PDF files');
      const attachmentList = attachments.map(({ type, path, name }) => {
        const isImage = type?.includes('image') ?? false;
        const escapedPath = path?.split('/')?.map((part) => encodeURIComponent(part))?.join('/') ?? '';
        return `- ${isImage ? '!' : ''}[${name}](${escapedPath})`;
      }).join('\n');
      content += `This document contains ${attachments.length} file(s) as attachments.

## Attachments

${attachmentList}

*This article was automatically generated for PDF files.*`;
    }
    return { content, attachments };
  }
}

export default ImportDocument;
