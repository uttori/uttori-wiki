[![view on npm](http://img.shields.io/npm/v/uttori-wiki.svg)](https://www.npmjs.org/package/uttori-wiki)
[![npm module downloads](http://img.shields.io/npm/dt/uttori-wiki.svg)](https://www.npmjs.org/package/uttori-wiki)
[![Build Status](https://travis-ci.org/uttori/uttori-wiki.svg?branch=master)](https://travis-ci.org/uttori/uttori-wiki)
[![Dependency Status](https://david-dm.org/uttori/uttori-wiki.svg)](https://david-dm.org/uttori/uttori-wiki)
[![Coverage Status](https://coveralls.io/repos/uttori/uttori-wiki/badge.svg?branch=master)](https://coveralls.io/r/uttori/uttori-wiki?branch=master)

# Uttori Wiki

UttoriWiki is a fast, simple, wiki knowledge base for Express.js & Node.js that stores data in any format (Markdown, Wikitext, Creole, AsciiDoc, Textile, reStructuredText, BBCode, Pendown, etc.), and renders to HTML.

UttoriWiki is the wiki module for the [Uttori](https://github.com/uttori) set of components allowing single chunks of functionality be changed or update to fit specific needs. Don't want to write in Markdown? You don't need to! Don't want to store files on disk? Choose a database storage module! Already running a bunch of external dependencies and want to plug into those? You can most likely do it!

## Configuration

Please see `src/config.default.js` for all options. You will likely want something like the following changes for your site:

```javascript
const StorageProvider = require('uttori-storage-provider-json-file');
const SearchProvider = require('uttori-search-provider-lunr');

const config = {
  // Specify the theme to use, no trailing slash
  theme_dir: `${__dirname}/themes`,

  // Path to the static file directory for themes, no trailing slash
  public_dir: `${__dirname}/themes/default/public`,

  // Use the JSON to Disk Storage Provider
  StorageProvider,
  storageProviderConfig: {
    // Path in which to store content (markdown files, etc.)
    content_dir: `${__dirname}/content`,

    // Path in which to store content history (markdown files, etc.)
    history_dir: `${__dirname}/content/history`,

    // File Extension
    extension: 'json',

    // JSON stringify parameter for formatting output
    spaces_article: 2,
    spaces_history: 2,
  },

  // Use the Lunr Search Provider
  SearchProvider,
  searchProviderConfig: {
    // Optional Lunr locale
    lunr_locales: [],
  },

  // Plugins
  ...
};

module.exports = config;
```

## Events

The following events are avaliable to hook into through plugins:

| Name                         | Type       | Returns                   | Description |
|------------------------------|------------|---------------------------|-------------|
| `bind-routes`                | `dispatch` |                           | Called after the default routes are bound to the server. |
| `document-delete`            | `dispatch` |                           | Called when a document is about to be deleted. |
| `document-save`              | `filter`   | Uttori Document           | Called when a document is about to be saved. |
| `render-content`             | `filter`   | HTML Content              | Called anytime content is being prepared to be shown. |
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

## API Reference

{{>main}}

* * *

## Tests

To run the test suite, first install the dependencies, then run `npm test`:

```bash
npm install
DEBUG=Uttori* npm test
```

## Contributors

- [Matthew Callis](https://github.com/MatthewCallis) - author of UttoriWiki
- [Wade Kallhoff](https://github.com/wkallhof) - author of Hazel
- [Egor Kuryanovich](https://github.com/Sontan) - contributions to the Hazel codebase

## License

[GPL-3.0](LICENSE)
