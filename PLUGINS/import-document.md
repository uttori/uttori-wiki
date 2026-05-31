# Import Document

> Bulk-import pages from Markdown, PDFs, images, or scraped websites - via a UI or a JSON API.

```javascript
import { ImportDocument } from '@uttori/wiki';
// or: import ImportDocument from '@uttori/wiki/plugins/import-document';
```

**configKey:** `uttori-plugin-import-document`

## What it does

Gives you a way to pour existing content into your wiki. It exposes a browser UI (`GET /import`, rendering your theme's `import` template) and a JSON API (`POST /import-api`) that accepts a title, slug, tags, an array of pages, an optional hero image, and more. It downloads remote files, converts scraped HTML (via `wget` + `pandoc`), stores attachments, runs the result through the `document-save` filter, persists it, and updates search.

Three page types:
- **`text`** - Markdown content.
- **`binary`** - PDFs and images, stored as attachments.
- **`scrape`** - mirror a site with `wget`, then convert to Markdown with `pandoc`.

## What it doesn't do

- **No default `events`** - wire `bindRoutes` yourself.
- **It needs an `import` template** in your theme for the UI.
- **Scraping requires `wget` and `pandoc`** on the server's PATH.
- **No built-in auth** - protect it with `middlewareApi` / `middlewarePublic`.
- **Failed referrer checks fall through** (`next()`) rather than hard-erroring.

## How to use

```javascript
import { ImportDocument } from '@uttori/wiki';

const config = {
  plugins: [ImportDocument],

  [ImportDocument.configKey]: {
    ...ImportDocument.defaultConfig(),
    apiRoute: '/import-api',
    publicRoute: '/import',
    uploadDirectory: './uploads',
    uploadPath: 'uploads',
    allowedReferrers: [], // or ['https://mywiki.example.com'] to restrict the API
    events: {
      bindRoutes: ['bind-routes'],
      validateConfig: ['validate-config'],
    },
  },
};
```

## Configuration

| Option | Default | What it does |
|--------|---------|--------------|
| `apiRoute` | `'/import-api'` | POST endpoint for the import API. |
| `publicRoute` | `'/import'` | GET endpoint for the import UI. |
| `uploadDirectory` | `<plugin-dir>/uploads` | Absolute path where downloaded files land. |
| `uploadPath` | `'uploads'` | URL path prefix referenced in document attachments. |
| `allowedReferrers` | `[]` | If non-empty, the API requires a matching `Referer` prefix. |
| `middlewareApi` | `[]` | Middleware on the API route. |
| `middlewarePublic` | `[]` | Middleware on the UI route. |
| `downloadFile` / `processPage` / `apiRequestHandler` / `interfaceRequestHandler` | built-in | Override the moving parts. |

## Good to know

- It interacts with several hooks during an import: `document-save` (filter), `storage-update` (fetch), `search-update` (dispatch), and `view-model-import-document` (filter).
- Always gate the API and UI behind auth middleware on a public wiki - importing is a write operation.
