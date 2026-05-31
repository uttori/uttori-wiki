# Query Output ➜ View Model

> Run storage queries while a page builds and attach the results to your templates - recent docs, all tags, related pages.

```javascript
import { AddQueryOutputToViewModel } from '@uttori/wiki';
// or: import AddQueryOutputToViewModel from '@uttori/wiki/plugins/query-output';
```

**configKey:** `uttori-plugin-add-query-output-to-view-model`

## What it does

A quietly powerful little plugin. During view-model building, it runs queries you define (or custom functions) and stuffs the results into the template context under keys you choose. That's how you get a sidebar of recent documents, a tag cloud on the home page, or a "related pages" list - without baking that logic into your theme or the core. Queries are grouped by hook name (e.g. `view-model-home`), plus a `*` bucket that runs on every matched event. If a query throws, it quietly uses your `fallback` value.

## What it doesn't do

- **It doesn't add routes or render templates** - it only enriches the view model.
- **It does nothing until configured** - empty `events` and `queries` by default.
- **It needs a storage provider** that answers `storage-query` (or you supply a `queryFunction`).

## How to use

```javascript
import { StorageProviderJsonFile, AddQueryOutputToViewModel } from '@uttori/wiki';

const ignoreSlugs = ['home-page'];

const config = {
  plugins: [StorageProviderJsonFile, AddQueryOutputToViewModel],

  [AddQueryOutputToViewModel.configKey]: {
    events: {
      callback: ['view-model-home', 'view-model-detail'],
    },
    queries: {
      // Runs on every event listed above:
      '*': [
        {
          key: 'recentDocuments',
          query: `SELECT 'slug', 'title' FROM documents ORDER BY updateDate DESC LIMIT 5`,
          fallback: [],
        },
      ],
      // Runs only when building the home page:
      'view-model-home': [
        {
          key: 'tags',
          query: `SELECT tags FROM documents WHERE slug NOT_IN ("${ignoreSlugs.join('", "')}") ORDER BY id ASC LIMIT -1`,
          format: (rows) => [...new Set(rows.flatMap((r) => r.tags))].filter(Boolean).sort(),
          fallback: [],
        },
      ],
    },
  },
};
```

Now `recentDocuments` and `tags` are available in your templates' locals.

## Configuration

| Option | Default | What it does |
|--------|---------|--------------|
| `queries` | `{}` | Map of hook label (or `*`) ➜ array of query objects. |
| `events` | `{}` | Maps `callback` to the `view-model-*` hooks to listen on. |

### Each query object

| Key | Required | What it does |
|-----|----------|--------------|
| `key` | yes | The view-model property to set. |
| `query` | one of | A SQL-like string sent to `storage-query`. |
| `queryFunction` | one of | A custom `async (target, context)` instead of `query`. |
| `format` | no | Post-process results before assigning. |
| `fallback` | yes | Value used if the query throws. |

## Good to know

- Use the `*` bucket for data you want everywhere (e.g. a global tag cloud) and named buckets for page-specific data.
- `queryFunction` lets you compose multiple hooks - e.g. fetch popular slugs from analytics, then look them up in storage (see the example in the main [README](../README.md)).
