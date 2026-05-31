# Sitemap Generator

> Writes a standards-compliant `sitemap.xml`, merging your hand-picked URLs with your documents.

```javascript
import { SitemapGenerator } from '@uttori/wiki';
// or: import SitemapGenerator from '@uttori/wiki/plugins/sitemap-generator';
```

**configKey:** `uttori-plugin-generator-sitemap`

## What it does

Builds a valid `sitemap.xml` and writes it to disk whenever triggered (typically on document save/delete). It merges the URLs you configure with up to 10,000 document slugs fetched from storage, applies optional regex exclusion filters, and emits `<loc>`, `<lastmod>`, `<priority>`, and optional `<changefreq>` entries.

## What it doesn't do

- **No default `events`** - wire `callback` yourself.
- **It doesn't submit to search engines or serve the file over HTTP** - it just writes the file (serve it via your static directory).
- **Hard 10,000-document cap** per generation.
- **Write failures are logged, not thrown** - a failed write won't crash a save.
- **No sitemap-index files** for very large multi-file sitemaps.

## How to use

```javascript
import path from 'node:path';
import { SitemapGenerator } from '@uttori/wiki';

const config = {
  plugins: [SitemapGenerator],

  [SitemapGenerator.configKey]: {
    base_url: 'https://example.org',
    directory: path.join(import.meta.dirname, 'public'),
    urls: [
      { url: '/', lastmod: new Date().toISOString(), priority: '1.00' },
      { url: '/tags', lastmod: new Date().toISOString(), priority: '0.90' },
    ],
    events: {
      callback: ['document-save', 'document-delete'],
      validateConfig: ['validate-config'],
    },
  },
};
```

Point `directory` at your static folder so `sitemap.xml` is served at `/sitemap.xml`.

## Configuration

| Option | Default | What it does |
|--------|---------|--------------|
| `base_url` | `''` *(required)* | Site origin prepended to every `<loc>`. |
| `directory` | `''` *(required)* | Folder the file is written to. |
| `urls` | `[]` | Seed URLs; documents are appended at generation time. |
| `url_filters` | `[]` | `RegExp` array - matching URLs are excluded. |
| `filename` | `'sitemap'` | Output filename (without extension). |
| `extension` | `'xml'` | Output file extension. |
| `page_priority` | `'0.80'` | Default `<priority>` for auto-added document URLs. |
| `xml_header` / `xml_footer` | standard wrapper | Customize the XML envelope. |
| `events` | *(none)* | Hook wiring. |

## Good to know

- Use `url_filters` to keep private or noisy routes out of the sitemap.
- Generation runs on every save/delete, so the file stays fresh without a cron job.
