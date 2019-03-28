# Uttori Wiki

UttoriWiki is a fast, simple, wiki knowledge base for Express.js & Node.js that stores data in any format (Markdown, Wikitext, Creole, AsciiDoc, Textile, reStructuredText, BBCode, Pendown, etc.), and renders to HTML.

UttoriWiki is the wiki module for the [Uttori](https://github.com/uttori) set of components allowing single chunks of functionality be changed or update to fit specific needs. Don't want to write in Markdown? You don't need to! Don't want to store files on disk? Choose a database storage module! Already running a bunch of external dependencies and want to plug into those? You can most likely do it!

UttoriWiki was originally a fork of [Hazel](https://github.com/wkallhof/hazel) but has since become a set of projects with every aspect of the original codebase having been fully rewritten, fully tested, and refactored into several smaller projects each with a brand new set of unit tests. The goal has shifted away from just being a wiki to becoming a modular set of components to quickly spin up not only a wiki, but many other types of content flows all powered by the same underlying components.

## Site Configuration

Please see `app/config.default.js`. You will likely want something like the following changes:

```javascript
// Specify the theme to use, no trailing slash
theme_dir: `${__dirname}/themes`,

// Path in which to store uploads (images etc.), no trailing slash
uploads_dir: `${__dirname}/uploads`,

// Path in which to store content (markdown files, etc.), no trailing slash
content_dir: `${__dirname}/content`,

// Path in which to store content history (markdown files, etc.), no trailing slash
history_dir: `${__dirname}/content/history`,

// Path in which to store data (analytics, etc.), no trailing slash
data_dir: `${__dirname}/data`,

// Path to the static file directory for themes, no trailing slash
public_dir: `${__dirname}/themes/default/public`,
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
  - Images
- History Diff View
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
 - [Egor Kuryanovich](https://github.com/Sontan) - contributions to the original Hazel codebase

# License
  [GPL-3.0](LICENSE)
