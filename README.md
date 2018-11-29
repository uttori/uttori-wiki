# Uttori Wiki

UttoriWiki is a fast, simple, wiki knowledge base for Express.js & Node.js that stores data in any format (Markdown, Wikitext, Creole, AsciiDoc, Textile, reStructuredText, BBCode, Pendown, etc.), and renders to HTML.

UttoriWiki is the wiki module for the [Uttori](https://github.com/uttori) set of components allowing single chunks of functionality be changed or update to fit specific needs. Don't want to write in Markdown? You don't need to! Don't want to store files on disk? Choose a database storage module! Already running a bunch of external dependencies and want to plug into those? You can most likely do it!

UttoriWiki was originally a fork of [Hazel](https://github.com/wkallhof/hazel) but has since become a set of projects with every aspect of the original codebase having been fully refactored into several smaller projects each with a brand spankin' new set of unit tests. The goal has shifted away from just being a wiki to becoming a modular set of components to quickly spin up not only a wiki, but many other types of sites all powered by the same underlying components.

## Site Configuration

```js
{
  // Your site title (format: page_title | site_title)
  site_title: 'Wiki',

  // Your site sections for homepage. For each section below, the home page
  // will display a section box that lists the document count for documents
  // that have a matching tag. Clicking the section link will list the documents.
  site_sections: [
    {
      'title': 'Example',
      'description': 'Example description text.',
      'tag': 'example'
    },
    {
      'title': 'Team',
      'description': 'Team of Wiki Editors',
      'tag': 'team'
    },
    {
      'title': 'FAQ',
      'description': 'Frequently Asked Questions',
      'tag': 'faq'
    }
  ],

  // Excerpt length (used in search)
  excerpt_length: 400,

  // Application base url.
  base: '/',

  // Specify the theme to use
  theme_dir: `${__dirname}/themes/`,
  theme_name: 'default',

  // Path in which to store uploads (images etc.)
  uploads_dir: `${__dirname}/uploads/`,

  // Path in which to store content (markdown files, etc.)
  content_dir: `${__dirname}/content/`,

  // Path in which to store content history (markdown files, etc.)
  history_dir: `${__dirname}/content/history`,

  // Path in which to store data (analytics, etc.)
  data_dir: `${__dirname}/data/`,

  // Path to the static file directory for themes
  public_dir: `${__dirname}/themes/default/public/`,

  // Optional Lunr locales
  lunr_locales: [],

  // Secret key used to sync two servers
  sync_key: '',

  // Flat file storageProvider config
  extension: 'json',

  // Content is in the Markdown language
  markdown: true,

  // Enable hiding document deletion behind a private key
  use_delete_key: false,

  // Key used for verifying document deletion
  delete_key: '',

  // Enable reCaptcha on Creation & Document Editing
  use_recaptcha: false,

  // reCaptcha Site key
  recaptcha_site_key: '',

  // reCaptcha Secret key
  recaptcha_secret_key: '',

  // Enable Google Analytics
  use_google_analytics: false,

  // Google Analytics UA ID
  google_analytics_id: '',
}
```

## Tests

To run the test suite, first install the dependencies, then run `npm test`:

```bash
$ npm install
$ DEBUG=Uttori* npm test
```

## TODO
- Richer Meta Data
  - Authors
- History View
- Allow sections to be edited outside of config.
- Rewrite Syncing
  - Read Only Sync
  - Authentication for Sync (Writes)

### TODO Eventually / Would Be Nice
- Convert to `import` Syntax (Breaks Node v8)
- Electron wrapper for wiki app.
- Support for more Storage Providers:
  - MySQL
- Support for more Search Providers:
  - http://fusejs.io/
  - https://github.com/fergiemcdowall/search-index
  - https://github.com/techfort/LokiJS
  - https://github.com/weixsong/elasticlunr.js

# Namesake

> ウットリ, うっとり: When you become enraptured by beauty. In rapture, in ecstasy, captivated. A rapt stare.

# Contributors

 - [Matthew Callis](https://github.com/MatthewCallis) - rewrite, refactor, testing of UttoriWiki
 - [Wade Kallhoff](https://github.com/wkallhof) - original author of Hazel
 - [Egor Kuryanovich](https://github.com/Sontan) - contributions to the original codebase

# License
  [GPL-3.0](LICENSE)
