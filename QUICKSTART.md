# UttoriWiki Quick Start

Zero to a running wiki in about five minutes. This guide covers the requirements, the install, and the smallest config that actually boots. When you're ready to go further, the [README](README.md) explains the hooks system and the [PLUGINS/](PLUGINS/) folder walks through every plugin.

## Requirements

- **Node.js 24 or newer.** (The repo pins a specific version in [`.nvmrc`](.nvmrc) - run `nvm use` if you use nvm.)
- **Express 5.** It's a peer dependency, so you install it alongside the wiki.
- A folder for your **theme** (templates) and one for **static assets** (CSS, images, client JS).

Some plugins bring their own requirements (a running [Ollama](https://ollama.com/) server for AI features, `better-sqlite3` for SQLite search, `nodemailer` for email forms, etc.). The minimal setup below needs none of them.

## 1. Install

```bash
npm install @uttori/wiki express
```

For the EJS-based examples here, also grab a view engine and layout helper:

```bash
npm install ejs express-ejs-layouts
```

## 2. Pick your pieces

The core does nothing useful without at least a **storage** provider and (usually) a **search** provider. For a first run, the in-memory storage provider is the least fuss - no files, no setup, gone on restart:

- `StorageProviderJsonMemory` - keeps everything in RAM. Great for trying things out.
- `SearchProviderLunr` - full-text search with no external services.

Swap in `StorageProviderJsonFile` when you want your pages to survive a restart.

## 3. Minimal config

Create `config.js`:

```javascript
import path from 'node:path';
import {
  StorageProviderJsonMemory,
  SearchProviderLunr,
  MarkdownItRenderer,
} from '@uttori/wiki';

/** @type {import('@uttori/wiki').UttoriWikiConfig} */
const config = {
  homePage: 'home-page',
  ignoreSlugs: ['home-page'],
  publicUrl: 'http://localhost:8000',

  // Where your templates and static files live.
  themePath: path.join(import.meta.dirname, 'theme'),
  publicPath: path.join(import.meta.dirname, 'public'),

  // Storage first, then everything else.
  plugins: [
    StorageProviderJsonMemory,
    SearchProviderLunr,
    MarkdownItRenderer,
  ],

  [SearchProviderLunr.configKey]: {
    ...SearchProviderLunr.defaultConfig(),
  },

  [MarkdownItRenderer.configKey]: {
    events: {
      renderContent: ['render-content'],
      renderCollection: ['render-search-results'],
      validateConfig: ['validate-config'],
    },
    markdownIt: {
      html: false,
      linkify: true,
      uttori: { allowedExternalDomains: [], openNewWindow: true },
    },
  },
};

export default config;
```

## 4. Start the server

Create `server.js`:

```javascript
import express from 'express';
import ejs from 'ejs';
import layouts from 'express-ejs-layouts';
import path from 'node:path';
import { UttoriWiki } from '@uttori/wiki';
import config from './config.js';

const app = express();

// Body parsing for form posts / JSON.
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static assets + view engine.
app.use(express.static(config.publicPath));
app.set('views', path.join(config.themePath, 'templates'));
app.use(layouts);
app.set('view engine', 'html');
app.engine('html', ejs.renderFile);

// Construct the wiki - this binds all the routes onto `app`.
const wiki = new UttoriWiki(config, app);

// Let plugins warm up (search index, etc.) before serving.
await wiki.hooks.dispatch('before-server-listening', app, wiki);

const server = app.listen(8000, () => {
  wiki.hooks.dispatch('server-listening', server, wiki);
  console.log('UttoriWiki running at http://localhost:8000');
});
```

Run it:

```bash
node server.js
```

> **Note:** `before-server-listening` and `server-listening` are dispatched by _you_, not the core. Some plugins (search index warm-up, the AI chat bot's WebSocket, the MCP stdio transport) rely on them, so it's good practice to wire them in from the start.

## 5. You need templates

UttoriWiki renders your theme's templates - it doesn't ship a UI. At minimum you'll want templates for the pages the core renders: `home`, `detail`, `search`, `edit`, `error-404`, and (if you enable history) the history views. Point `themePath` at the folder containing a `templates/` directory and `publicPath` at your static assets.

The fastest way to get a real, styled theme is to copy one:

- [uttori-wiki-theme-default](https://github.com/uttori/uttori-wiki-theme-default) - the reference theme.
- [uttori-wiki-demo-site](https://github.com/uttori/uttori-wiki-demo-site) - a complete example app (config + theme + server) you can crib from.

## 6. Add your first page

With CRUD routes enabled (the default), visit `http://localhost:8000/new` to create your home page. Give it the slug `home-page` (matching `config.homePage`) and it becomes your front door.

Prefer files? Switch to `StorageProviderJsonFile`, point `contentDirectory` at a folder, and drop in JSON documents shaped like:

```json
{
  "slug": "home-page",
  "title": "Welcome",
  "content": "# Hello\n\nThis is **UttoriWiki**.",
  "tags": ["welcome"],
  "createDate": 1700000000000,
  "updateDate": 1700000000000
}
```

## Where to next

- **[README](README.md)** - the big picture, the hooks system, the full configuration reference.
- **[PLUGINS/](PLUGINS/)** - a friendly guide to every bundled plugin: what it does, what it doesn't, and how to set it up.
- **[docs/](docs/)** - the auto-generated, deeply technical API documentation.

Happy wiki-ing. 🐰
