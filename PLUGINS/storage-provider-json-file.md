# Storage Provider: JSON File

> The everyday workhorse - one JSON file per document on disk, with optional revision history.

```javascript
import { StorageProviderJsonFile } from '@uttori/wiki';
```

**configKey:** `uttori-plugin-storage-provider-json-file`

## What it does

This is the storage backend most production sites reach for. Each document becomes a JSON file in a directory you choose, and (optionally) every edit snapshots the previous version into a history directory. It answers all the `storage-*` hooks the core relies on - get, add, update, delete, history, revisions, and SQL-like queries - so the rest of UttoriWiki never has to know your data lives in flat files. An in-memory cache keeps repeat reads snappy.

If you want a wiki whose content you can `git`-track, diff, and back up with `cp`, this is the one.

## What it doesn't do

- **It doesn't search.** Pair it with [Lunr](search-provider-lunr.md) or [SQLite](search-provider-sqlite.md) search.
- **It doesn't sync across servers.** Multiple instances need shared storage (NFS, etc.) - there's no coordination built in.
- **It needs its directories.** Both `contentDirectory` and `historyDirectory` must be set, or construction throws.
- **It's filesystem-only.** No S3, no database - see other providers for those.

## How to use

```javascript
import path from 'node:path';
import { StorageProviderJsonFile, SearchProviderLunr } from '@uttori/wiki';

const config = {
  // Storage goes first in the array.
  plugins: [StorageProviderJsonFile, SearchProviderLunr],

  [StorageProviderJsonFile.configKey]: {
    contentDirectory: path.join(import.meta.dirname, 'content'),
    historyDirectory: path.join(import.meta.dirname, 'content', 'history'),
    extension: 'json',
    useHistory: true,
    useCache: true,
  },
};
```

## Configuration

| Option | Default | What it does |
|--------|---------|--------------|
| `contentDirectory` | `''` *(required)* | Folder where document JSON files are written. |
| `historyDirectory` | `''` *(required)* | Folder for revision snapshots. |
| `extension` | `'json'` | File extension for stored documents. |
| `updateTimestamps` | `true` | Auto-set `createDate` / `updateDate` on writes. |
| `useHistory` | `true` | Save a revision snapshot on each edit. |
| `useCache` | `true` | Keep loaded documents in memory for faster reads. |
| `spacesDocument` | `undefined` | `JSON.stringify` indent for content files (e.g. `2` for pretty files). |
| `spacesHistory` | `undefined` | `JSON.stringify` indent for history files. |
| `events` | sensible defaults | Maps provider methods to `storage-*` hooks; rarely needs changing. |

## Good to know

- The default `events` already wire `add ➜ storage-add`, `get ➜ storage-get`, `getQuery ➜ storage-query`, and so on. You usually don't touch them.
- Set `spacesDocument: 2` if you want human-readable, diff-friendly files in version control.
- Turning off `useCache` trades speed for always-fresh reads if something else edits the files out from under the process.
