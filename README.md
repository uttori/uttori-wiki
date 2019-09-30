# Uttori Wiki

UttoriWiki is a fast, simple, wiki knowledge base for Express.js & Node.js that stores data in any format (Markdown, Wikitext, Creole, AsciiDoc, Textile, reStructuredText, BBCode, Pendown, etc.), and renders to HTML.

UttoriWiki is the wiki module for the [Uttori](https://github.com/uttori) set of components allowing single chunks of functionality be changed or update to fit specific needs. Don't want to write in Markdown? You don't need to! Don't want to store files on disk? Choose a database storage module! Already running a bunch of external dependencies and want to plug into those? You can most likely do it!

## Site Configuration

Please see `app/config.default.js` for all options. You will likely want something like the following changes for your site:

```javascript
const StorageProvider = require('uttori-storage-provider-json-file');
const SearchProvider = require('uttori-search-provider-lunr');
const UploadProvider = require('uttori-upload-provider-multer');

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

  // Use the JSON analyticsProvider
  AnalyticsProvider,
  analyticsProviderConfig: {
    directory: `${__dirname}/data`,
  },

  // Use the Lunr Search Provider
  SearchProvider,
  searchProviderConfig: {
    // Optional Lunr locale
    lunr_locales: [],
  },

  // Use the Multer Upload Provider
  UploadProvider,
  uploadProviderConfig: {
    // Path in which to store uploads (images etc.), no trailing slash
    uploads_dir: `${__dirname}/uploads`,
  }

  // Plugins
  ...
};

module.exports = config;
```

## Tests

To run the test suite, first install the dependencies, then run `npm test`:

```bash
$ npm install
$ DEBUG=Uttori* npm test
```

## Contributors

- [Matthew Callis](https://github.com/MatthewCallis) - rewrite, refactor, testing of UttoriWiki
- [Wade Kallhoff](https://github.com/wkallhof) - original author of Hazel
- [Egor Kuryanovich](https://github.com/Sontan) - contributions to the original Hazel codebase

## License

[GPL-3.0](LICENSE)
