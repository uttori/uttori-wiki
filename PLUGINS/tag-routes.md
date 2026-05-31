# Tag Routes

> A tag index, per-tag pages, and a JSON API - with tag tidying on save.

```javascript
import { TagRoutesPlugin } from '@uttori/wiki';
```

**configKey:** `uttori-plugin-tag-routes`

## What it does

Adds tag browsing to your wiki: an index page listing every tag and its documents, individual `/tags/:tag` detail pages, and an optional JSON API route. On document save it normalizes tags (trim, dedupe, sort) so your taxonomy stays clean. It reads documents through `storage-query`, respects `config.ignoreSlugs` and `config.ignoreTags`, and renders your theme's `tags` and `tag` templates.

## What it doesn't do

- **It doesn't create tags** - it surfaces and tidies whatever tags your documents already carry.
- **It needs templates.** You must provide `tags` and `tag` templates; there's no built-in UI.
- **The default API handler isn't a real JSON list** - it's aliased to the per-tag handler (expects a `:tag` param). Supply a custom `apiRequestHandler` for a useful API.
- **Empty tag pages fall through** (`next()`) rather than rendering an explicit 404.

## How to use

```javascript
import { TagRoutesPlugin } from '@uttori/wiki';

const config = {
  plugins: [TagRoutesPlugin],

  [TagRoutesPlugin.configKey]: {
    title: 'Tags',
    tagIndexRoute: 'tags',
    tagRoute: 'tags',
    apiRoute: 'tag-api',
    limit: 1024,
    events: {
      bindRoutes: ['bind-routes'],
      normalizeDocumentTags: ['document-save'],
      validateConfig: ['validate-config'],
    },
  },
};
```

This registers `GET /tags` (index) and `GET /tags/:tag` (detail).

## Configuration

| Option | Default | What it does |
|--------|---------|--------------|
| `title` | `'Tags'` | Page title for the tag index. |
| `limit` | `1024` | Max documents returned per tag. |
| `tagIndexRoute` | `'tags'` | URL path for the index page. |
| `tagRoute` | `'tags'` | URL prefix for individual tag pages. |
| `apiRoute` | `'tag-api'` | URL path for the API route. |
| `middleware.tagIndex` / `.tag` / `.api` | `[]` | Express middleware per route. |
| `tagIndexRequestHandler` / `tagRequestHandler` / `apiRequestHandler` | built-in | Override handlers. |
| `events` | see above | Hook wiring. |

## Good to know

- The view models pass through `view-model-tag-index` and `view-model-tag` filters, so you can enrich them with another plugin or inline hook.
- Want hierarchy (e.g. `Hardware/Controllers`) instead of a flat list? Use [Category Routes](category-routes.md).
