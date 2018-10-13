# Uttori Wiki

UttoriWiki is a wiki module for the Uttori system. Does everything a wiki should.

# Config

## Environment

`.env` used by dotenv:

```
DELETE_KEY=YOUR_KEY_GOES_HERE // This used to lock deletion of pages behind a given private key.
```

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
      'description': 'Frquently Asked Questions',
      'tag': 'faq'
    }
  ],

  // Excerpt length (used in search)
  excerpt_length: 400,

  // Application base url. While most of the application uses relative paths
  // for routing, this is used for things like SEO which require absolute URLs
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

  // Is content for the wiki written in Markdown format?
  markdown: true,
}
```

## Tests

To run the test suite, first install the dependencies, then run `npm test`:

```bash
$ npm install
$ DEBUG=Uttori* npm test
```

## TODO
- Spam Filter
- Richer Meta Data
  - Authors
  - Change Log
- History View
- Allow sections to be edited outside of config.
- Syncing
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
