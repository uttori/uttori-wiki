# Analytics (JSON File)

> Lightweight, file-based page-view counts and a "popular documents" feed. No third party, no tracking scripts.

```javascript
import { AnalyticsPlugin } from '@uttori/wiki';
// or: import AnalyticsPlugin from '@uttori/wiki/plugins/analytics-json-file';
```

**configKey:** `uttori-plugin-analytics-json-file`

## What it does

Counts page views per document slug and stores them in a single JSON file on disk (`visits.json` by default). It exposes hooks to bump a count when documents are viewed/saved, look up a single slug's count, and return your most popular documents. It's deliberately tiny - no external service, no cookies, no PII.

## What it doesn't do

- **No unique visitors, sessions, referrers, or time-on-page** - just counts.
- **No dashboard or UI** - data comes out through hooks (feed it to a template via [Query Output](query-output.md) or your own code).
- **It doesn't create the visits file** - the file must exist at startup (even just `{}`).
- **No cross-instance aggregation** without a shared filesystem.
- **It's not Google Analytics** - that's a separate, site-level concern.

## How to use

```javascript
import path from 'node:path';
import { StorageProviderJsonFile, AnalyticsPlugin } from '@uttori/wiki';

const config = {
  plugins: [StorageProviderJsonFile, AnalyticsPlugin],

  [AnalyticsPlugin.configKey]: {
    directory: path.join(import.meta.dirname, 'data'),
    name: 'visits',
    extension: 'json',
    limit: 10,
    events: {
      updateDocument: ['document-save'],
      getPopularDocuments: ['popular-documents'],
      validateConfig: ['validate-config'],
    },
  },
};
```

Make sure `data/visits.json` exists (containing `{}`) before you start.

## Configuration

| Option | Default | What it does |
|--------|---------|--------------|
| `directory` | `'./'` *(required)* | Folder holding the analytics JSON file. |
| `name` | `'visits'` | Filename (without extension). |
| `extension` | `'json'` | File extension. |
| `limit` | `10` | Max documents returned by `getPopularDocuments`. |
| `events` | `{}` | Maps plugin methods to hooks (you must wire these). |

## Good to know

- The `popular-documents` hook is a `fetch` - surface it on your home page with [Query Output](query-output.md)'s `queryFunction`.
- Set `limit` to at least `1` (a `limit` of `0` fails validation).
