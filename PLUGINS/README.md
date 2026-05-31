# UttoriWiki Plugins - The Friendly Guide

Welcome to the plugin drawer. 🧰

Every page in this folder explains one plugin (or a small family of related ones) in plain language: **what it does**, **what it deliberately doesn't do**, **how to use it**, and **its configuration**. This is the conversational companion to the auto-generated, deeply-technical API docs in [`../docs/plugins/`](../docs/plugins/) - read those when you need every last parameter; read these when you're deciding what to use and how to wire it up.

New here? Start with the [README](../README.md) and [QUICKSTART](../QUICKSTART.md) first - especially the section on [the hooks system](../README.md#the-hooks-system), which makes everything below click into place.

## How plugins work, in one breath

You list a plugin in `config.plugins`, and you configure it under its `configKey`. Most plugins expose an `events` map that says "run my method when this hook fires" - and because that map lives in _your_ config, you can re-point when things happen without editing plugin code. Storage providers go **first** in the array; everything else asks them for documents.

```javascript
import { StorageProviderJsonFile, MarkdownItRenderer } from '@uttori/wiki';

const config = {
  plugins: [StorageProviderJsonFile, MarkdownItRenderer],
  [StorageProviderJsonFile.configKey]: { /* ... */ },
  [MarkdownItRenderer.configKey]: { /* ... */ },
};
```

## The catalog

### Storage - where documents live
- [Storage Provider: JSON File](storage-provider-json-file.md) - one JSON file per document on disk, with history.
- [Storage Provider: JSON Memory](storage-provider-json-memory.md) - the same, but in RAM. For tests and demos.

### Search - finding things
- [Search Provider: Lunr](search-provider-lunr.md) - classic full-text search, no external services.
- [Search Provider: SQLite](search-provider-sqlite.md) - storage **and** search in one, with vector embeddings for AI.

### Rendering - content into HTML
- [Renderer: MarkdownIt](renderer-markdown-it.md) - Markdown plus footnotes, TOC, wikilinks, embeds, and link hardening.
- [Renderer: Replacer](renderer-replacer.md) - ordered find-and-replace over rendered HTML.
- [Renderer: EJS](renderer-ejs.md) - runs inline EJS found in content.

### Routes & navigation
- [Tag Routes](tag-routes.md) - a tag index, per-tag pages, and a JSON API.
- [Category Routes](category-routes.md) - hierarchical categories with breadcrumbs.
- [Download Router](download-route.md) - forced-download file streaming.

### Content tools
- [Multer Upload](upload-multer.md) - a file-upload endpoint.
- [Import Document](import-document.md) - bulk-import from Markdown, PDFs, images, or scraped sites.
- [Form Handler](form-handler.md) - config-defined forms ➜ email, Google Sheets, or custom handlers.
- [Query Output ➜ View Model](query-output.md) - attach query results to your templates.

### Insight & SEO
- [Analytics (JSON File)](analytics-json-file.md) - file-based page-view counts.
- [Sitemap Generator](sitemap-generator.md) - writes `sitemap.xml`.

### Safety & access
- [Auth (Simple)](auth-simple.md) - minimal login/logout routes.
- [CSRF Protection](csrf.md) - token protection for saves.
- [IP Address Filter](filter-ip-address.md) - log saves, block bad IPs.
- [Spam Edit Filter](filter-spam-edit.md) - heuristic spam scoring for edits.

### AI & integrations
- [AI Chat Bot](ai-chat-bot.md) - a streaming, tool-calling chat bot over your wiki.
- [MCP Provider](mcp-provider.md) - expose your wiki to AI clients via Model Context Protocol.

## A note on import paths

Everything imports from `@uttori/wiki`:

```javascript
import { MarkdownItRenderer } from '@uttori/wiki';
```

Many plugins also have a dedicated subpath export if you'd rather keep bundles lean - each page notes its own (e.g. `@uttori/wiki/plugins/renderer-markdown-it`).
