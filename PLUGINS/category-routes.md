# Category Routes

> Like tags, but hierarchical (`Hardware/Controllers`) - with breadcrumbs, a tree view, and a JSON API.

```javascript
import { CategoryRoutesPlugin } from '@uttori/wiki';
```

**configKey:** `uttori-plugin-category-routes`

## What it does

Adds category browsing for nested taxonomies. You get a category index with a tree view, category detail pages with breadcrumbs, and a JSON API listing all categories. Categories are read from a configurable document field (default `categories`), nested paths use a configurable separator (default `/`), and paths are sanitized against directory-traversal tricks. It reads documents through `storage-query` and renders your theme's `categories` and `category` templates.

## What it doesn't do

- **It doesn't normalize categories on save** (unlike [Tag Routes](tag-routes.md), which tidies tags).
- **It needs templates** - provide `categories` and `category`; no built-in UI.
- **It doesn't enforce a taxonomy schema** beyond treating categories as separator-delimited strings.
- **Empty category pages fall through** (`next()`) rather than rendering an explicit 404.

## How to use

```javascript
import { CategoryRoutesPlugin } from '@uttori/wiki';

const config = {
  plugins: [CategoryRoutesPlugin],

  [CategoryRoutesPlugin.configKey]: {
    title: 'Categories',
    categoryIndexRoute: 'categories',
    categoryRoute: 'categories',
    apiRoute: 'category-api',
    categoryField: 'categories',
    separator: '/',
    limit: 1024,
  },
};
```

Documents declare categories in their `categories` field, e.g. `["Hardware/Controllers", "Guides"]`.

## Configuration

| Option | Default | What it does |
|--------|---------|--------------|
| `title` | `'Categories'` | Page title for the category index. |
| `limit` | `1024` | Max documents per category. |
| `categoryIndexRoute` | `'categories'` | URL path for the index. |
| `categoryRoute` | `'categories'` | URL prefix for category detail pages. |
| `apiRoute` | `'category-api'` | URL path returning the JSON category list. |
| `categoryField` | `'categories'` | Document field holding category strings. |
| `separator` | `'/'` | Delimiter for hierarchy in category paths. |
| `middleware.categoryIndex` / `.category` / `.api` | `[]` | Express middleware per route. |
| `categoryIndexRequestHandler` / `categoryRequestHandler` / `apiRequestHandler` | built-in | Override handlers. |
| `events` | `bindRoutes`, `validateConfig` | Hook wiring. |

## Good to know

- The detail and index view models pass through `view-model-category` and `view-model-category-index` filters for enrichment.
- If `categoryField` isn't a default document key, add it to the wiki's `allowedDocumentKeys` so it survives saves.
- For a flat, non-hierarchical taxonomy, [Tag Routes](tag-routes.md) is the simpler fit.
