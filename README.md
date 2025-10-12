[![view on npm](https://img.shields.io/npm/v/@uttori/wiki.svg)](https://www.npmjs.com/package/@uttori/wiki)
[![npm module downloads](https://img.shields.io/npm/dt/@uttori/wiki.svg)](https://www.npmjs.com/package/@uttori/wiki)
[![Coverage Status](https://coveralls.io/repos/github/uttori/uttori-wiki/badge.svg?branch=master)](https://coveralls.io/github/uttori/uttori-wiki?branch=master)

# Uttori Wiki

UttoriWiki is a fast, simple, blog / wiki / knowledge base / generic website built around Express.js using the [Uttori](https://github.com/uttori) set of components allowing specific chunks of functionality be changed or swapped out to fit specific needs.

Why yet another knowledge management / note taking app? I wanted to have something that functioned as a wiki or blog or similar small app that I could reuse components for and keep extensible without having to rewrite everything or learn a new framework.

Because of that, UttoriWiki is plugin based. Search and Storage engines are fully configurable. The format of the data is also up to you: Markdown, Wikitext, Creole, AsciiDoc, Textile, reStructuredText, BBCode, Pendown, etc. Markdown is the default and best supported.

Nothing is prescribed. Don't want to write in Markdown? You don't need to! Don't want to store files on disk? Choose a database storage engine! Already running a bunch of external dependencies and want to plug into those? You can _most likely_ do it!

Rendering happens in a pipeline making it easy to render to Markdown, then filter content out and manipulate the content like removing tags or replacing text with emojis.

## Configuration

Please see `src/config.js` or [the config doc](https://github.com/uttori/uttori-wiki/blob/master/docs/config.md) for all options. Below is an example configuration using some plugins:

- [@uttori/storage-provider-json-file](https://github.com/uttori/uttori-storage-provider-json-file)
- [@uttori/search-provider-lunr](https://github.com/uttori/uttori-search-provider-lunr)
- [@uttori/plugin-renderer-replacer](https://github.com/uttori/uttori-plugin-renderer-replacer)
- [@uttori/plugin-renderer-markdown-it](https://github.com/uttori/uttori-plugin-renderer-markdown-it)
- [@uttori/plugin-upload-multer](https://github.com/uttori/uttori-plugin-upload-multer)
- [@uttori/plugin-generator-sitemap](https://github.com/uttori/uttori-plugin-generator-sitemap)
- [@uttori/plugin-analytics-json-file](https://github.com/uttori/uttori-plugin-analytics-json-file)

```javascript
import { Plugin: StorageProvider } from '@uttori/storage-provider-json-file';
import { Plugin: SearchProvider } from '@uttori/search-provider-lunr';

import AnalyticsPlugin from '@uttori/plugin-analytics-json-file';
import MarkdownItRenderer from '@uttori/plugin-renderer-markdown-it';
import ReplacerRenderer from '@uttori/plugin-renderer-replacer';
import MulterUpload from '@uttori/plugin-upload-multer';
import SitemapGenerator from '@uttori/plugin-generator-sitemap';
import { AddQueryOutputToViewModel } from '@uttori/wiki';

const config = {
  homePage: 'home-page',
  ignoreSlugs: ['home-page'],
  excerptLength: 400,
  publicUrl: 'http://127.0.0.1:8000/wiki',
  themePath: path.join(__dirname, 'theme'),
  publicPath: path.join(__dirname, 'public'),
  useDeleteKey: false,
  deleteKey: process.env.DELETE_KEY || '',
  useEditKey: false,
  editKey: process.env.EDIT_KEY || '',
  publicHistory: true,
  allowedDocumentKeys: [],

  // Plugins
  plugins: [
    StorageProvider,
    SearchProvider,
    AnalyticsPlugin,
    MarkdownItRenderer,
    ReplacerRenderer,
    MulterUpload,
    SitemapGenerator,
  ],

  // Use the JSON to Disk Storage Provider
  [StorageProvider.configKey]: {
    // Path in which to store content (markdown files, etc.)
    contentDirectory: `${__dirname}/content`,

    // Path in which to store content history (markdown files, etc.)
    historyDirectory: `${__dirname}/content/history`,

    // File Extension
    extension: 'json',
  },

  // Use the Lunr Search Provider
  [SearchProvider.configKey]: {
    // Optional Lunr locale
    lunr_locales: [],

    // Ignore Slugs
    ignoreSlugs: ['home-page'],
  },

  // Plugin: Analytics with JSON Files
  [AnalyticsPlugin.configKey]: {
    events: {
      getPopularDocuments: ['popular-documents'],
      updateDocument: ['document-save', 'document-delete'],
      validateConfig: ['validate-config'],
    },

    // Directory files will be uploaded to.
    directory: `${__dirname}/data`,

    // Name of the JSON file.
    name: 'visits',

    // File extension to use for the JSON file.
    extension: 'json',
  },

  // Plugin: Markdown rendering with MarkdownIt
  [MarkdownItRenderer.configKey]: {
    events: {
      renderContent: ['render-content'],
      renderCollection: ['render-search-results'],
      validateConfig: ['validate-config'],
    },


    // Uttori Specific Configuration
    uttori: {
      // Prefix for relative URLs, useful when the Express app is not at root.
      baseUrl: '',

      // Safe List, if a domain is not in this list, it is set to 'external nofollow noreferrer'.
      allowedExternalDomains: [
        'my-site.org',
      ],

      // Open external domains in a new window.
      openNewWindow: true,

      // Table of Contents
      toc: {
        // The opening DOM tag for the TOC container.
        openingTag: '<nav class="table-of-contents">',

        // The closing DOM tag for the TOC container.
        closingTag: '</nav>',

        // Slugify options for convering content to anchor links.
        slugify: {
          lower: true,
        },
      },
    },
  },

  // Plugin: Replace text
  [ReplacerRenderer.configKey]: {
    events: {
      renderContent: ['render-content'],
      renderCollection: ['render-search-results'],
      validateConfig: ['validate-config'],
    },

    // Rules for text replace
    rules: [
      {
        test: /bunny|rabbit/gm,
        output: '🐰',
      },
    ],
  },

  // Plugin: Multer Upload
  [MulterUpload.configKey]: {
    events: {
      bindRoutes: ['bind-routes'],
      validateConfig: ['validate-config'],
    },

    // Directory files will be uploaded to
    directory: `${__dirname}/uploads`,

    // URL to POST files to
    route: '/upload',

    // URL to GET uploads from
    publicRoute: '/uploads',
  },

  // Plugin: Sitemap Generator
  [SitemapGenerator.configKey]: {
    events: {
      callback: ['document-save', 'document-delete'],
      validateConfig: ['validate-config'],
    },

    // Sitemap URL (ie https://wiki.domain.tld)
    base_url: 'https://wiki.domain.tld',

    // Location where the XML sitemap will be written to.
    directory: `${__dirname}/themes/default/public`,

    urls: [
      {
        url: '/',
        lastmod: new Date().toISOString(),
        priority: '1.00',
      },
      {
        url: '/tags',
        lastmod: new Date().toISOString(),
        priority: '0.90',
      },
      {
        url: '/new',
        lastmod: new Date().toISOString(),
        priority: '0.70',
      },
    ],
  },

  // Plugin: View Model Related Documents
  [AddQueryOutputToViewModel.configKey]: {
    events: {
      callback: [
        'view-model-home',
        'view-model-edit',
        'view-model-new',
        'view-model-search',
        'view-model-tag',
        'view-model-tag-index',
        'view-model-detail',
      ],
    },
    queries: {
      'view-model-home' : [
        {
          key: 'tags',
          query: `SELECT tags FROM documents WHERE slug NOT_IN ("${ignoreSlugs.join('", "')}") ORDER BY id ASC LIMIT -1`,
          format: (tags) => [...new Set(tags.flatMap((t) => t.tags))].filter(Boolean).sort((a, b) => a.localeCompare(b)),
          fallback: [],
        },
        {
          key: 'documents',
          query: `SELECT * FROM documents WHERE slug NOT_IN ("${ignoreSlugs.join('", "')}") ORDER BY id ASC LIMIT -1`,
          fallback: [],
        },
        {
          key: 'popularDocuments',
          fallback: [],
          format: (results) => results.map((result) => result.slug),
          queryFunction: async (target, context) => {
            const ignoreSlugs = ['home-page'];
            const [popular] = await context.hooks.fetch('popular-documents', { limit: 5 }, context);
            const slugs = `"${popular.map(({ slug }) => slug).join('", "')}"`;
            const query = `SELECT 'slug', 'title' FROM documents WHERE slug NOT_IN (${ignoreSlugs}) AND slug IN (${slugs}) ORDER BY updateDate DESC LIMIT 5`;
            const [results] = await context.hooks.fetch('storage-query', query);
            return [results];
          },
        }
      ],
    },
  },

  // Middleware Configuration in the form of ['function', 'param1', 'param2', ...]
  middleware: [
    ['disable', 'x-powered-by'],
    ['enable', 'view cache'],
    ['set', 'views', path.join(`${__dirname}/themes/`, 'default', 'templates')],

    // EJS Specific Setup
    ['use', layouts],
    ['set', 'layout extractScripts', true],
    ['set', 'layout extractStyles', true],
    // If you use the `.ejs` extension use the below:
    // ['set', 'view engine', 'ejs'],
    // I prefer using `.html` templates:
    ['set', 'view engine', 'html'],
    ['engine', 'html', ejs.renderFile],
  ],

  redirects: [
    {
      route: '/:year/:slug',
      target: '/:slug',
      status: 301,
      appendQueryString: true,
    },
  ],

  // Override route handlers
  homeRoute: (request, response, next) => { ... },
  tagIndexRoute: (request, response, next) => { ... },
  tagRoute: (request, response, next) => { ... },
  searchRoute: (request, response, next) => { ... },
  editRoute: (request, response, next) => { ... },
  deleteRoute: (request, response, next) => { ... },
  saveRoute: (request, response, next) => { ... },
  saveNewRoute: (request, response, next) => { ... },
  newRoute: (request, response, next) => { ... },
  detailRoute: (request, response, next) => { ... },
  previewRoute: (request, response, next) => { ... },
  historyIndexRoute: (request, response, next) => { ... },
  historyDetailRoute: (request, response, next) => { ... },
  historyRestoreRoute: (request, response, next) => { ... },
  notFoundRoute: (request, response, next) => { ... },
  saveValidRoute: (request, response, next) => { ... },

  // Custom per route middleware, in the order they should be used
  routeMiddleware: {
    home: [],
    tagIndex: [],
    tag: [],
    search: [],
    notFound: [],
    create: [],
    saveNew: [],
    preview: [],
    edit: [],
    delete: [],
    historyIndex: [],
    historyDetail: [],
    historyRestore: [],
    save: [],
    detail: [],
  },
};

export default config;
```

Use in an example Express.js app:

```javascript
// Server
import express from 'express';

// Reference the Uttori Wiki middleware
import { wiki as middleware } from '@uttori/wiki';

// Pull in our custom config, example above
import config from './config.js';

// Initilize Your app
const app = express();

// Setup the app
app.set('port', process.env.PORT || 8000);
app.set('ip', process.env.IP || '127.0.0.1');

// Setup Express
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Setup the wiki, could also mount under a sub directory path with other applications
app.use('/', middleware(config));

// Listen for connections
app.listen(app.get('port'), app.get('ip'), () => {
  console.log('✔ listening at %s:%d', app.get('ip'), app.get('port'));
});
```

## Events

The following events are avaliable to hook into through plugins and are used in the methods below:

| Name                         | Type       | Returns                   | Description |
|------------------------------|------------|---------------------------|-------------|
| `bind-routes`                | `dispatch` |                           | Called after the default routes are bound to the server. |
| `document-delete`            | `dispatch` |                           | Called when a document is about to be deleted. |
| `document-save`              | `filter`   | Uttori Document           | Called when a document is about to be saved. |
| `render-content`             | `filter`   | HTML Content              | Called when content is being prepared to be shown. |
| `render-search-results`      | `filter`   | Array of Uttori Documents | Called when search results have been collected and is being prepared to be shown. |
| `validate-config`            | `dispatch` |                           | Called after initial configuration validation. |
| `validate-invalid`           | `dispatch` |                           | Called when a document is found invalid (spam?). |
| `validate-valid`             | `dispatch` |                           | Called when a document is found to be valid. |
| `validate-save`              | `validate` | Boolean                   | Called before saving a document to validate the document. |
| `view-model-detail`          | `filter`   | View Model                | Called when rendering the detail page just before being shown. |
| `view-model-edit`            | `filter`   | View Model                | Called when rendering the edit page just before being shown. |
| `view-model-error-404`       | `filter`   | View Model                | Called when rendering a 404 Not Found error page just before being shown. |
| `view-model-history-detail`  | `filter`   | View Model                | Called when rendering a history detail page just before being shown. |
| `view-model-history-index`   | `filter`   | View Model                | Called when rendering a history index page just before being shown. |
| `view-model-history-restore` | `filter`   | View Model                | Called when rendering a history restore page just before being shown. |
| `view-model-home`            | `filter`   | View Model                | Called when rendering the home page just before being shown. |
| `view-model-metadata`        | `filter`   | View Model                | Called after the initial view model metadata is setup. |
| `view-model-new`             | `filter`   | View Model                | Called when rendering the new document page just before being shown. |
| `view-model-search`          | `filter`   | View Model                | Called when rendering a search result page just before being shown. |
| `view-model-tag-index`       | `filter`   | View Model                | Called when rendering the tag index page just before being shown. |
| `view-model-tag`             | `filter`   | View Model                | Called when rendering a tag detail page just before being shown. |

* * *

## Included Plugins

## Form Handler Plugin

A flexible form handling plugin for Uttori Wiki that allows you to easily define multiple forms through configuration objects and handle submissions with configurable handlers.

### Features

- **Multiple Form Support**: Define multiple forms with different configurations
- **Flexible Field Types**: Support for text, email, textarea, number, url, and custom validation
- **Configurable Handlers**: Default console logging, email sending, Google Sheets integration
- **JSON and Form Data**: Accepts both JSON and form-encoded data
- **Validation**: Built-in validation with custom regex support
- **Middleware Support**: Add custom middleware for authentication, rate limiting, etc.
- **Error Handling**: Comprehensive error handling and validation

### Configuration

Add the plugin to your Uttori Wiki configuration:

```javascript
import FormHandler from './src/plugins/form-handler.js';
import EmailHandler from './src/plugins/form-handlers/email-handler.js';
import GoogleDocsHandler from './src/plugins/form-handlers/google-docs-handler.js';

const config = {
  // ... other config
  plugins: [
    FormHandler,
    // ... other plugins
  ],
  [FormHandler.configKe]: {
    baseRoute: '/forms', // Optional: base route for all forms
    forms: [
      {
        name: 'contact',
        route: '/contact',
        fields: [
          {
            name: 'name',
            type: 'text',
            required: true,
            label: 'Full Name',
            placeholder: 'Enter your full name'
          },
          {
            name: 'email',
            type: 'email',
            required: true,
            label: 'Email Address',
            placeholder: 'Enter your email address'
          },
          {
            name: 'message',
            type: 'textarea',
            required: true,
            label: 'Message',
            placeholder: 'Enter your message'
          }
        ],
        handler: EmailHandler.create({
          host: 'smtp.gmail.com',
          port: 587,
          secure: false,
          user: 'your-email@gmail.com',
          pass: 'your-app-password',
          from: 'your-email@gmail.com',
          to: 'contact@yoursite.com',
          subject: 'Contact Form Submission from {name}',
          template: `
            <h2>New Contact Form Submission</h2>
            <p><strong>Name:</strong> {name}</p>
            <p><strong>Email:</strong> {email}</p>
            <p><strong>Message:</strong></p>
            <p>{message}</p>
            <hr>
            <p><em>Submitted at: {timestamp}</em></p>
          `
        }),
        successMessage: 'Thank you for your message! We will get back to you soon.',
        errorMessage: 'There was an error submitting your message. Please try again.'
      }
    ]
  }
};
```

### Form Configuration

#### Form Object Properties

- **name** (string, required): Unique identifier for the form
- **route** (string, required): URL route for form submission (relative to baseRoute)
- **fields** (array, required): Array of field configurations
- **handler** (function, optional): Custom handler function for form processing
- **successMessage** (string, required): Success message to return
- **errorMessage** (string, required): Error message to return
- **middleware** (array, optional): Custom Express middleware for the form route

#### Field Object Properties

- **name** (string, required): Field name (used as form data key)
- **type** (string, required): Field type (text, email, textarea, number, url)
- **required** (boolean, optional): Whether the field is required
- **label** (string, optional): Display label for the field
- **placeholder** (string, optional): Placeholder text for the field
- **validation** (function, optional): Custom validation function
- **errorMessage** (string, optional): Custom error message for validation

### Built-in Handlers

#### Default Handler (Console Logging)

If no custom handler is provided, the form data will be logged to the console:

```javascript
{
  name: 'feedback',
  route: '/feedback',
  fields: [
    { name: 'rating', type: 'number', required: true },
    { name: 'comment', type: 'textarea', required: false }
  ]
  // No handler - uses default console.log
}
```

#### Email Handler

Send form submissions via email using `nodemailer`:

```javascript
import EmailHandler from './src/plugins/form-handlers/email-handler.js';

// In your form configuration
handler: EmailHandler.create({
  transportOptions: { ... },
  from: 'your-email@gmail.com',
  to: 'contact@yoursite.com',
  subject: 'Contact Form Submission from {name}',
  template: `
    <h2>New Contact Form Submission</h2>
    <p><strong>Name:</strong> {name}</p>
    <p><strong>Email:</strong> {email}</p>
    <p><strong>Message:</strong></p>
    <p>{message}</p>
  `
})
```

##### Email Handler Configuration

- **transportOptions.host** (string, required): SMTP host
- **transportOptions.port** (number, required): SMTP port
- **transportOptions.secure** (boolean, optional): Whether to use SSL/TLS
- **transportOptions.auth.user** (string, required): SMTP username
- **transportOptions.auth.pass** (string, required): SMTP password
- **from** (string, required): Email address to send from
- **to** (string, required): Email address to send to
- **subject** (string, required): Email subject template
- **template** (string, optional): Email body HTML template

##### Email Template Variables

- `{formName}`: The form name
- `{timestamp}`: Current timestamp
- `{fieldName}`: Any form field value (replace `fieldName` with actual field name)

#### Google Sheets Handler

Write form submissions to Google Sheets:

```javascript
import GoogleDocsHandler from './src/plugins/form-handlers/google-docs-handler.js';

// In your form configuration
handler: GoogleDocsHandler.create({
  credentialsPath: './google-credentials.json',
  spreadsheetId: 'your-spreadsheet-id',
  sheetName: 'Form Submissions',
  headers: ['name', 'email', 'message'],
  appendTimestamp: true
})
```

##### Google Sheets Handler Configuration

- **credentialsPath** (string, required): Path to Google service account credentials JSON file
- **spreadsheetId** (string, required): Google Sheets spreadsheet ID
- **sheetName** (string, required): Name of the sheet to write to
- **headers** (array, optional): Custom headers for the spreadsheet
- **appendTimestamp** (boolean, optional): Whether to append timestamp to each row

##### Setting up Google Sheets

1. Create a Google Cloud Project and enable the Google Sheets API
2. Create a service account and download the credentials JSON file
3. Share your Google Sheet with the service account email
4. Use `GoogleDocsHandler.setupHeaders(config)` to initialize the sheet headers

### Custom Handlers

You can create custom handlers by providing a function that accepts form data, form config, request, and response:

```javascript
{
  name: 'custom-form',
  route: '/custom',
  fields: [
    { name: 'data', type: 'text', required: true }
  ],
  handler: async (formData, formConfig, req, res) => {
    // Custom processing logic
    console.log('Custom handler processing:', formData);

    // Save to database, send to API, etc.
    await saveToDatabase(formData);

    return {
      message: 'Data processed successfully',
      id: 'some-id'
    };
  }
}
```

### API Endpoints

Forms are accessible at: `{baseRoute}{formRoute}`

For example, with `baseRoute: '/forms'` and form `route: '/contact'`:
- POST `/forms/contact`

### Request/Response Format

#### Request

Accepts both JSON and form-encoded data:

```javascript
// JSON
fetch('/forms/contact', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    message: 'Hello world!'
  })
});

// Form data
const formData = new FormData();
formData.append('name', 'John Doe');
formData.append('email', 'john@example.com');
formData.append('message', 'Hello world!');

fetch('/forms/contact', {
  method: 'POST',
  body: formData
});
```

#### Response

```javascript
// Success
{
  "success": true,
  "message": "Thank you for your message! We will get back to you soon.",
  "data": {
    "messageId": "email-message-id",
    "message": "Email sent successfully"
  }
}

// Error
{
  "success": false,
  "message": "There was an error submitting your message. Please try again.",
  "errors": [
    "Field \"email\" must be a valid email address"
  ]
}
```

### Validation

The plugin provides built-in validation for:

- **Required fields**: Checks if required fields are present and not empty
- **Email format**: Validates email addresses using regex
- **Number format**: Validates numeric values
- **URL format**: Validates URLs
- **Custom regex**: Supports custom validation patterns

### Middleware Support

Add custom middleware for authentication, rate limiting, etc.:

```javascript
{
  name: 'admin-form',
  route: '/admin/feedback',
  fields: [
    { name: 'feedback', type: 'textarea', required: true }
  ],
  middleware: [
    // Authentication middleware
    (req, res, next) => {
      if (!req.session || !req.session.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      next();
    },
    // Rate limiting middleware
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 5 // limit each IP to 5 requests per windowMs
    })
  ],
  handler: customHandler
}
```

### Error Handling

The plugin handles various error scenarios:

- **Validation errors**: Returns 400 with validation details
- **Handler errors**: Returns 500 with error message
- **Configuration errors**: Throws during plugin registration
- **Missing fields**: Validates required fields
- **Invalid data types**: Validates field types and formats

### Dependencies

- **nodemailer**: For email handler (install with `npm install nodemailer`)
- **googleapis**: For Google Sheets handler (install with `npm install googleapis`)

### Security Considerations

- Validate all input data
- Use HTTPS in production
- Implement rate limiting for public forms
- Sanitize email templates to prevent injection
- Secure Google credentials file
- Use environment variables for sensitive configuration

---

## Tag Routes Plugin

This plugin provides tag index and individual tag pages.

### Installation

Add the plugin to your wiki configuration:

```javascript
import TagRoutesPlugin from './plugins/tag-routes.js';

const config = {
  plugins: [
    TagRoutesPlugin,
    // ... other plugins
  ],
  'uttori-plugin-tag-routes': {
    // plugin configuration
  }
};
```

### Configuration

The plugin accepts the following configuration options:

```javascript
{
  'uttori-plugin-tag-routes': {
    route: 'tags',                    // Route path for tag pages (default: 'tags')
    title: 'Tags',                    // Default title for tag pages (default: 'Tags')
    ignoreTags: [],                   // Tags to ignore when generating the tags page (default: [])
    limit: 1024,                      // Max documents per tag (default: 1024)
    titles: {},                       // Custom titles for specific tags (default: {})
    tagIndexRoute: undefined,         // Custom tag index route handler (default: undefined)
    tagRoute: undefined,              // Custom tag detail route handler (default: undefined)
    routeMiddleware: {                // Middleware for tag routes
      tagIndex: [],
      tag: []
    }
  }
}
```

### Required Hooks

The plugin uses the following hooks to maintain existing functionality:

#### Core Hooks Used

1. **`bind-routes`** (dispatch)
   - **Purpose**: Registers tag routes with the Express server
   - **Usage**: Plugin listens to this hook to add its routes
   - **Implementation**: `context.hooks.on('bind-routes', TagRoutesPlugin.bindRoutes(plugin))`

2. **`storage-query`** (fetch)
   - **Purpose**: Queries the storage system for documents
   - **Usage**: Used in `getTaggedDocuments()` to find documents with specific tags
   - **Implementation**: `await this.context.hooks.fetch('storage-query', query, this.context)`

3. **`view-model-tag-index`** (filter)
   - **Purpose**: Allows modification of the tag index view model
   - **Usage**: Applied to the view model before rendering the tag index page
   - **Implementation**: `await this.context.hooks.filter('view-model-tag-index', viewModel, this.context)`

4. **`view-model-tag`** (filter)
   - **Purpose**: Allows modification of the individual tag view model
   - **Usage**: Applied to the view model before rendering individual tag pages
   - **Implementation**: `await this.context.hooks.filter('view-model-tag', viewModel, this.context)`

#### Context Methods Used

The plugin relies on the following methods from the wiki context:

1. **`buildMetadata(document, path, robots)`**
   - **Purpose**: Builds metadata for view models
   - **Usage**: Creates metadata for tag index and tag detail pages

2. **`config.ignoreSlugs`**
   - **Purpose**: List of slugs to exclude from tag queries
   - **Usage**: Used in storage queries to filter out ignored documents

### Routes Provided

The plugin registers the following routes:

1. **`GET /{route}`** (default: `GET /tags`)
   - **Handler**: `tagIndex`
   - **Purpose**: Displays the tag index page with all available tags
   - **Template**: `tags`

2. **`GET /{route}/:tag`** (default: `GET /tags/:tag`)
   - **Handler**: `tag`
   - **Purpose**: Displays all documents with a specific tag
   - **Template**: `tag`

### Templates Required

The plugin expects the following templates to exist in your theme:

1. **`tags`** - Tag index page template
   - **Variables**: `title`, `config`, `session`, `taggedDocuments`, `meta`, `basePath`, `flash`

2. **`tag`** - Individual tag page template
   - **Variables**: `title`, `config`, `session`, `taggedDocuments`, `meta`, `basePath`, `flash`

### Migration from Core

When migrating from the core tag functionality:

1. **Remove from config.js**:
   - `ignoreTags` property
   - `routes.tags` property
   - `titles.tags` property
   - `tagIndexRoute` and `tagRoute` properties
   - `routeMiddleware.tagIndex` and `routeMiddleware.tag` properties

2. **Remove from wiki.js**:
   - `tagIndex` method
   - `tag` method
   - `getTaggedDocuments` method
   - Tag route binding in `bindRoutes`

3. **Add plugin to configuration**:
   - Import `TagRoutesPlugin`
   - Add to `plugins` array
   - Configure with `'uttori-plugin-tag-routes'` key

### Backward Compatibility

The plugin maintains full backward compatibility with existing functionality:

- All existing hooks continue to work
- Template variables remain the same
- Route structure is preserved (configurable)
- Custom route handlers are supported
- Middleware support is maintained

### Example Usage

```javascript
import UttoriWiki from './src/wiki.js';
import TagRoutesPlugin from './src/plugins/tag-routes.js';

const config = {
  plugins: [TagRoutesPlugin],
  'uttori-plugin-tag-routes': {
    route: 'categories',              // Use 'categories' instead of 'tags'
    title: 'Categories',              // Custom title
    ignoreTags: ['private', 'draft'], // Ignore these tags
    limit: 50,                        // Limit to 50 documents per tag
    titles: {                         // Custom titles for specific tags
      'javascript': 'JavaScript',
      'nodejs': 'Node.js'
    }
  }
};

const wiki = new UttoriWiki(config, server);
```

This will create routes at `/categories` and `/categories/:tag` with the specified configuration.

---

## API Reference

## Classes

<dl>
<dt><a href="#UttoriWiki">UttoriWiki</a></dt>
<dd><p>UttoriWiki is a fast, simple, wiki knowledge base.</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#UttoriWikiViewModel">UttoriWikiViewModel</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#UttoriWikiDocument">UttoriWikiDocument</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#UttoriWikiDocumentAttachment">UttoriWikiDocumentAttachment</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#UttoriWikiDocumentMetaData">UttoriWikiDocumentMetaData</a> : <code>object</code></dt>
<dd></dd>
</dl>

<a name="UttoriWiki"></a>

## UttoriWiki
UttoriWiki is a fast, simple, wiki knowledge base.

**Kind**: global class  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| config | <code>UttoriWikiConfig</code> | The configuration object. |
| hooks | <code>module:@uttori/event-dispatcher~EventDispatcher</code> | The hook / event dispatching object. |


* [UttoriWiki](#UttoriWiki)
    * [new UttoriWiki(config, server)](#new_UttoriWiki_new)
    * [.config](#UttoriWiki+config) : <code>UttoriWikiConfig</code>
    * [.hooks](#UttoriWiki+hooks) : <code>module:@uttori/event-dispatcher~EventDispatcher</code>
    * [.home](#UttoriWiki+home)
    * [.homepageRedirect](#UttoriWiki+homepageRedirect) : <code>module:express~RequestHandler</code>
    * [.search](#UttoriWiki+search)
    * [.edit](#UttoriWiki+edit)
    * [.delete](#UttoriWiki+delete)
    * [.save](#UttoriWiki+save)
    * [.saveNew](#UttoriWiki+saveNew)
    * [.create](#UttoriWiki+create)
    * [.detail](#UttoriWiki+detail)
    * [.preview](#UttoriWiki+preview)
    * [.historyIndex](#UttoriWiki+historyIndex)
    * [.historyDetail](#UttoriWiki+historyDetail)
    * [.historyRestore](#UttoriWiki+historyRestore)
    * [.notFound](#UttoriWiki+notFound)
    * [.saveValid](#UttoriWiki+saveValid)
    * [.registerPlugins(config)](#UttoriWiki+registerPlugins)
    * [.validateConfig(config)](#UttoriWiki+validateConfig)
    * [.buildMetadata(document, [path], [robots])](#UttoriWiki+buildMetadata) ⇒ [<code>Promise.&lt;UttoriWikiDocumentMetaData&gt;</code>](#UttoriWikiDocumentMetaData)
    * [.bindRoutes(server)](#UttoriWiki+bindRoutes)

<a name="new_UttoriWiki_new"></a>

### new UttoriWiki(config, server)
Creates an instance of UttoriWiki.


| Param | Type | Description |
| --- | --- | --- |
| config | <code>UttoriWikiConfig</code> | A configuration object. |
| server | <code>module:express~Application</code> | The Express server instance. |

**Example** *(Init UttoriWiki)*  
```js
const server = express();
const wiki = new UttoriWiki(config, server);
server.listen(server.get('port'), server.get('ip'), () => { ... });
```
<a name="UttoriWiki+config"></a>

### uttoriWiki.config : <code>UttoriWikiConfig</code>
**Kind**: instance property of [<code>UttoriWiki</code>](#UttoriWiki)  
<a name="UttoriWiki+hooks"></a>

### uttoriWiki.hooks : <code>module:@uttori/event-dispatcher~EventDispatcher</code>
**Kind**: instance property of [<code>UttoriWiki</code>](#UttoriWiki)  
<a name="UttoriWiki+home"></a>

### uttoriWiki.home
Renders the homepage with the `home` template.

Hooks:
- `filter` - `render-content` - Passes in the home-page content.
- `filter` - `view-model-home` - Passes in the viewModel.

**Kind**: instance property of [<code>UttoriWiki</code>](#UttoriWiki)  

| Param | Type | Description |
| --- | --- | --- |
| request | <code>module:express~Request</code> | The Express Request object. |
| response | <code>module:express~Response</code> | The Express Response object. |
| next | <code>module:express~NextFunction</code> | The Express Next function. |

<a name="UttoriWiki+homepageRedirect"></a>

### uttoriWiki.homepageRedirect : <code>module:express~RequestHandler</code>
Redirects to the homepage.

**Kind**: instance property of [<code>UttoriWiki</code>](#UttoriWiki)  
<a name="UttoriWiki+search"></a>

### uttoriWiki.search
Renders the search page using the `search` template.

Hooks:
- `filter` - `render-search-results` - Passes in the search results.
- `filter` - `view-model-search` - Passes in the viewModel.

**Kind**: instance property of [<code>UttoriWiki</code>](#UttoriWiki)  

| Param | Type | Description |
| --- | --- | --- |
| request | <code>module:express~Request.&lt;{}, {}, {}, {s: string}&gt;</code> | The Express Request object. |
| response | <code>module:express~Response</code> | The Express Response object. |
| next | <code>module:express~NextFunction</code> | The Express Next function. |

<a name="UttoriWiki+edit"></a>

### uttoriWiki.edit
Renders the edit page using the `edit` template.

Hooks:
- `filter` - `view-model-edit` - Passes in the viewModel.

**Kind**: instance property of [<code>UttoriWiki</code>](#UttoriWiki)  

| Param | Type | Description |
| --- | --- | --- |
| request | <code>module:express~Request</code> | The Express Request object. |
| response | <code>module:express~Response</code> | The Express Response object. |
| next | <code>module:express~NextFunction</code> | The Express Next function. |

<a name="UttoriWiki+delete"></a>

### uttoriWiki.delete
Attempts to delete a document and redirect to the homepage.
If the config `useDeleteKey` value is true, the key is verified before deleting.

Hooks:
- `dispatch` - `document-delete` - Passes in the document beind deleted.

**Kind**: instance property of [<code>UttoriWiki</code>](#UttoriWiki)  

| Param | Type | Description |
| --- | --- | --- |
| request | <code>module:express~Request</code> | The Express Request object. |
| response | <code>module:express~Response</code> | The Express Response object. |
| next | <code>module:express~NextFunction</code> | The Express Next function. |

<a name="UttoriWiki+save"></a>

### uttoriWiki.save
Attempts to update an existing document and redirects to the detail view of that document when successful.

Hooks:
- `validate` - `validate-save` - Passes in the request.
- `dispatch` - `validate-invalid` - Passes in the request.
- `dispatch` - `validate-valid` - Passes in the request.

**Kind**: instance property of [<code>UttoriWiki</code>](#UttoriWiki)  

| Param | Type | Description |
| --- | --- | --- |
| request | <code>module:express~Request.&lt;SaveParams, {}, UttoriWikiDocument&gt;</code> | The Express Request object. |
| response | <code>module:express~Response</code> | The Express Response object. |
| next | <code>module:express~NextFunction</code> | The Express Next function. |

<a name="UttoriWiki+saveNew"></a>

### uttoriWiki.saveNew
Attempts to save a new document and redirects to the detail view of that document when successful.

Hooks:
- `validate` - `validate-save` - Passes in the request.
- `dispatch` - `validate-invalid` - Passes in the request.
- `dispatch` - `validate-valid` - Passes in the request.

**Kind**: instance property of [<code>UttoriWiki</code>](#UttoriWiki)  

| Param | Type | Description |
| --- | --- | --- |
| request | <code>module:express~Request.&lt;SaveParams, {}, UttoriWikiDocument&gt;</code> | The Express Request object. |
| response | <code>module:express~Response</code> | The Express Response object. |
| next | <code>module:express~NextFunction</code> | The Express Next function. |

<a name="UttoriWiki+create"></a>

### uttoriWiki.create
Renders the creation page using the `edit` template.

Hooks:
- `filter` - `view-model-new` - Passes in the viewModel.

**Kind**: instance property of [<code>UttoriWiki</code>](#UttoriWiki)  

| Param | Type | Description |
| --- | --- | --- |
| request | <code>module:express~Request</code> | The Express Request object. |
| response | <code>module:express~Response</code> | The Express Response object. |
| next | <code>module:express~NextFunction</code> | The Express Next function. |

<a name="UttoriWiki+detail"></a>

### uttoriWiki.detail
Renders the detail page using the `detail` template.

Hooks:
- `fetch` - `storage-get` - Get the requested content from the storage.
- `filter` - `render-content` - Passes in the document content.
- `filter` - `view-model-detail` - Passes in the viewModel.

**Kind**: instance property of [<code>UttoriWiki</code>](#UttoriWiki)  

| Param | Type | Description |
| --- | --- | --- |
| request | <code>module:express~Request</code> | The Express Request object. |
| response | <code>module:express~Response</code> | The Express Response object. |
| next | <code>module:express~NextFunction</code> | The Express Next function. |

<a name="UttoriWiki+preview"></a>

### uttoriWiki.preview
Renders the a preview of the passed in content.
Sets the `X-Robots-Tag` header to `noindex`.

Hooks:
- `render-content` - `render-content` - Passes in the request body content.

**Kind**: instance property of [<code>UttoriWiki</code>](#UttoriWiki)  

| Param | Type | Description |
| --- | --- | --- |
| request | <code>module:express~Request</code> | The Express Request object. |
| response | <code>module:express~Response</code> | The Express Response object. |
| next | <code>module:express~NextFunction</code> | The Express Next function. |

<a name="UttoriWiki+historyIndex"></a>

### uttoriWiki.historyIndex
Renders the history index page using the `history_index` template.
Sets the `X-Robots-Tag` header to `noindex`.

Hooks:
- `filter` - `view-model-history-index` - Passes in the viewModel.

**Kind**: instance property of [<code>UttoriWiki</code>](#UttoriWiki)  

| Param | Type | Description |
| --- | --- | --- |
| request | <code>module:express~Request</code> | The Express Request object. |
| response | <code>module:express~Response</code> | The Express Response object. |
| next | <code>module:express~NextFunction</code> | The Express Next function. |

<a name="UttoriWiki+historyDetail"></a>

### uttoriWiki.historyDetail
Renders the history detail page using the `detail` template.
Sets the `X-Robots-Tag` header to `noindex`.

Hooks:
- `render-content` - `render-content` - Passes in the document content.
- `filter` - `view-model-history-index` - Passes in the viewModel.

**Kind**: instance property of [<code>UttoriWiki</code>](#UttoriWiki)  

| Param | Type | Description |
| --- | --- | --- |
| request | <code>module:express~Request</code> | The Express Request object. |
| response | <code>module:express~Response</code> | The Express Response object. |
| next | <code>module:express~NextFunction</code> | The Express Next function. |

<a name="UttoriWiki+historyRestore"></a>

### uttoriWiki.historyRestore
Renders the history restore page using the `edit` template.
Sets the `X-Robots-Tag` header to `noindex`.

Hooks:
- `filter` - `view-model-history-restore` - Passes in the viewModel.

**Kind**: instance property of [<code>UttoriWiki</code>](#UttoriWiki)  

| Param | Type | Description |
| --- | --- | --- |
| request | <code>module:express~Request</code> | The Express Request object. |
| response | <code>module:express~Response</code> | The Express Response object. |
| next | <code>module:express~NextFunction</code> | The Express Next function. |

<a name="UttoriWiki+notFound"></a>

### uttoriWiki.notFound
Renders the 404 Not Found page using the `404` template.
Sets the `X-Robots-Tag` header to `noindex`.

Hooks:
- `filter` - `view-model-error-404` - Passes in the viewModel.

**Kind**: instance property of [<code>UttoriWiki</code>](#UttoriWiki)  

| Param | Type | Description |
| --- | --- | --- |
| request | <code>module:express~Request</code> | The Express Request object. |
| response | <code>module:express~Response</code> | The Express Response object. |
| next | <code>module:express~NextFunction</code> | The Express Next function. |

<a name="UttoriWiki+saveValid"></a>

### uttoriWiki.saveValid
Handles saving documents, and changing the slug of documents, then redirecting to the document.

`title`, `excerpt`, and `content` will default to a blank string
`tags` is expected to be a comma delimited string in the request body, "tag-1,tag-2"
`slug` will be converted to lowercase and will use `request.body.slug` and fall back to `request.params.slug`.

Hooks:
- `filter` - `document-save` - Passes in the document.

**Kind**: instance property of [<code>UttoriWiki</code>](#UttoriWiki)  

| Param | Type | Description |
| --- | --- | --- |
| request | <code>module:express~Request.&lt;SaveParams, {}, UttoriWikiDocument&gt;</code> | The Express Request object. |
| response | <code>module:express~Response</code> | The Express Response object. |
| next | <code>module:express~NextFunction</code> | The Express Next function. |

<a name="UttoriWiki+registerPlugins"></a>

### uttoriWiki.registerPlugins(config)
Registers plugins with the Event Dispatcher.

**Kind**: instance method of [<code>UttoriWiki</code>](#UttoriWiki)  

| Param | Type | Description |
| --- | --- | --- |
| config | <code>UttoriWikiConfig</code> | A configuration object. |

<a name="UttoriWiki+validateConfig"></a>

### uttoriWiki.validateConfig(config)
Validates the config.

Hooks:
- `dispatch` - `validate-config` - Passes in the config object.

**Kind**: instance method of [<code>UttoriWiki</code>](#UttoriWiki)  

| Param | Type | Description |
| --- | --- | --- |
| config | <code>UttoriWikiConfig</code> | A configuration object. |

<a name="UttoriWiki+buildMetadata"></a>

### uttoriWiki.buildMetadata(document, [path], [robots]) ⇒ [<code>Promise.&lt;UttoriWikiDocumentMetaData&gt;</code>](#UttoriWikiDocumentMetaData)
Builds the metadata for the view model.

Hooks:
- `filter` - `render-content` - Passes in the meta description.

**Kind**: instance method of [<code>UttoriWiki</code>](#UttoriWiki)  
**Returns**: [<code>Promise.&lt;UttoriWikiDocumentMetaData&gt;</code>](#UttoriWikiDocumentMetaData) - Metadata object.  

| Param | Type | Description |
| --- | --- | --- |
| document | [<code>Partial.&lt;UttoriWikiDocument&gt;</code>](#UttoriWikiDocument) | A UttoriWikiDocument. |
| [path] | <code>string</code> | The URL path to build meta data for with leading slash. |
| [robots] | <code>string</code> | A meta robots tag value. |

**Example**  
```js
const metadata = await wiki.buildMetadata(document, '/private-document-path', 'no-index');
➜ {
  canonical,   // `${this.config.publicUrl}/private-document-path`
  robots,      // 'no-index'
  title,       // document.title
  description, // document.excerpt || document.content.slice(0, 160)
  modified,    // new Date(document.updateDate).toISOString()
  published,   // new Date(document.createDate).toISOString()
}
```
<a name="UttoriWiki+bindRoutes"></a>

### uttoriWiki.bindRoutes(server)
Bind the routes to the server.
Routes are bound in the order of Home, Tags, Search, Not Found Placeholder, Document, Plugins, Not Found - Catch All

Hooks:
- `dispatch` - `bind-routes` - Passes in the server instance.

**Kind**: instance method of [<code>UttoriWiki</code>](#UttoriWiki)  

| Param | Type | Description |
| --- | --- | --- |
| server | <code>module:express~Application</code> | The Express server instance. |

<a name="UttoriWikiViewModel"></a>

## UttoriWikiViewModel : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| title | <code>string</code> | The document title to be used anywhere a title may be needed. |
| config | <code>UttoriWikiConfig</code> | The configuration object. |
| meta | [<code>UttoriWikiDocumentMetaData</code>](#UttoriWikiDocumentMetaData) | The metadata object. |
| basePath | <code>string</code> | The base path of the request. |
| [document] | [<code>UttoriWikiDocument</code>](#UttoriWikiDocument) | The document object. |
| [session] | <code>module:express-session~Session</code> | The Express session object. |
| [flash] | <code>boolean</code> \| <code>object</code> \| <code>Array.&lt;string&gt;</code> | The flash object. |
| [taggedDocuments] | [<code>Array.&lt;UttoriWikiDocument&gt;</code>](#UttoriWikiDocument) \| <code>Record.&lt;string, Array.&lt;UttoriWikiDocument&gt;&gt;</code> | An array of documents that are tagged with the document. |
| [searchTerm] | <code>string</code> | The search term to be used in the search results. |
| [searchResults] | [<code>Array.&lt;UttoriWikiDocument&gt;</code>](#UttoriWikiDocument) | An array of search results. |
| [slug] | <code>string</code> | The slug of the document. |
| [action] | <code>string</code> | The action to be used in the form. |
| [revision] | <code>string</code> | The revision of the document. |
| [historyByDay] | <code>Record.&lt;string, Array.&lt;string&gt;&gt;</code> | An object of history by day. |
| [currentDocument] | [<code>UttoriWikiDocument</code>](#UttoriWikiDocument) | The current version of the document for comparison. |
| [diffs] | <code>Record.&lt;string, string&gt;</code> | An object containing HTML table diffs for changed fields. |

<a name="UttoriWikiDocument"></a>

## UttoriWikiDocument : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| slug | <code>string</code> | The document slug to be used in the URL and as a unique ID. |
| title | <code>string</code> | The document title to be used anywhere a title may be needed. |
| [image] | <code>string</code> | An image to represent the document in Open Graph or elsewhere. |
| [excerpt] | <code>string</code> | A succinct deescription of the document, think meta description. |
| content | <code>string</code> | All text content for the doucment. |
| [html] | <code>string</code> | All rendered HTML content for the doucment that will be presented to the user. |
| createDate | <code>number</code> | The Unix timestamp of the creation date of the document. |
| updateDate | <code>number</code> | The Unix timestamp of the last update date to the document. |
| tags | <code>string</code> \| <code>Array.&lt;string&gt;</code> | A collection of tags that represent the document. |
| [redirects] | <code>string</code> \| <code>Array.&lt;string&gt;</code> | An array of slug like strings that will redirect to this document. Useful for renaming and keeping links valid or for short form WikiLinks. |
| [layout] | <code>string</code> | The layout to use when rendering the document. |
| [attachments] | [<code>Array.&lt;UttoriWikiDocumentAttachment&gt;</code>](#UttoriWikiDocumentAttachment) | An array of attachments to the document with name being a display name, path being the path to the file, and type being the MIME type of the file. Useful for storing files like PDFs, images, etc. |

<a name="UttoriWikiDocumentAttachment"></a>

## UttoriWikiDocumentAttachment : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | The display name of the attachment. |
| path | <code>string</code> | The path to the attachment. |
| type | <code>string</code> | The MIME type of the attachment. |
| [skip] | <code>boolean</code> | Whether to skip the attachment. Used to control whether to index the attachment. |

<a name="UttoriWikiDocumentMetaData"></a>

## UttoriWikiDocumentMetaData : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| canonical | <code>string</code> | `${this.config.publicUrl}/private-document-path` |
| robots | <code>string</code> | 'no-index' |
| title | <code>string</code> | document.title |
| description | <code>string</code> | document.excerpt || document.content.slice(0, 160) |
| modified | <code>string</code> | new Date(document.updateDate).toISOString() |
| published | <code>string</code> | new Date(document.createDate).toISOString() |
| image | <code>string</code> | OpenGraph Image |


* * *

## Tests

To run the test suite, first install the dependencies, then run `npm test`:

```bash
npm install
DEBUG=Uttori* npm test
```

## Contributors

- [Matthew Callis](https://github.com/MatthewCallis) - author of UttoriWiki

## License

[MIT](LICENSE)
