# Search Provider: Lunr

> Classic full-text search powered by Lunr.js - simple, dependable, no external services.

```javascript
import { SearchProviderLunr } from '@uttori/wiki';
// or: import SearchProviderLunr from '@uttori/wiki/plugins/search-provider-lunr';
```

**configKey:** `uttori-plugin-search-provider-lunr`

## What it does

Builds an in-memory [Lunr.js](https://lunrjs.com/) index from your documents (fetched via `storage-query`) and searches their titles and content. It answers `search-query`, tracks popular search terms, and can do multi-language stemming via `lunr-languages`. It's the no-drama choice: nothing to install beyond the optional `lunr` dependency, nothing to operate.

## What it doesn't do

- **It doesn't store documents.** Pair it with a [storage provider](storage-provider-json-file.md).
- **It doesn't do semantic / vector / AI search.** That's [SQLite search](search-provider-sqlite.md).
- **It doesn't persist the index.** The index is rebuilt at startup (and on `search-rebuild`), so it's always fresh but never saved.
- **Its incremental hooks rebuild everything.** `search-add` / `search-update` / `search-remove` trigger a full rebuild rather than touching a single entry - simple and correct, not clever.
- **Popular terms are in-memory only**, and reset on restart.

## How to use

```javascript
import { StorageProviderJsonFile, SearchProviderLunr } from '@uttori/wiki';

const config = {
  plugins: [StorageProviderJsonFile, SearchProviderLunr],

  [SearchProviderLunr.configKey]: {
    ignoreSlugs: ['home-page'],
    lunr_locales: [],
    events: {
      search: ['search-query'],
      // Build the index right before the server starts serving:
      buildIndex: ['before-server-listening', 'search-rebuild'],
      indexAdd: ['search-add'],
      indexUpdate: ['search-update'],
      indexRemove: ['search-remove'],
      getPopularSearchTerms: ['search-popular-terms'],
      validateConfig: ['validate-config'],
    },
  },
};
```

## Configuration

| Option | Default | What it does |
|--------|---------|--------------|
| `ignoreSlugs` | `[]` | Slugs to leave out of the index. |
| `lunr_locales` | `[]` | Locale codes for `lunr.multiLanguage()` (needs `lunr-languages`). |
| `lunrLocaleFunctions` | *(unset)* | Custom lunr-languages plugin functions. |
| `events` | see above | Maps search methods to `search-*` hooks. |

## Good to know

- Wiring `buildIndex` to `before-server-listening` (as above) means the index is ready before the first request - well worth it.
- For a multilingual wiki, set `lunr_locales` (e.g. `['en', 'fr']`) and install `lunr-languages`.
- If you outgrow Lunr - large corpus, want AI retrieval - graduate to [SQLite search](search-provider-sqlite.md).
