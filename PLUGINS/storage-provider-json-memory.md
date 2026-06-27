# Storage Provider: JSON Memory

> The same storage API as the file provider - but entirely in RAM. Perfect for tests, demos, and throwaway wikis.

```javascript
import { StorageProviderJsonMemory } from '@uttori/wiki';
```

**configKey:** `uttori-plugin-storage-provider-json-memory`

## What it does

Identical document API to the [JSON File provider](storage-provider-json-file.md) - add, get, update, delete, history, and queries - but nothing ever touches disk. It's the fastest way to spin up a wiki for a test suite, a live demo, or a quick experiment, because there's nothing to configure and nothing to clean up.

## What it doesn't do

- **It doesn't persist.** Restart the process and your content is gone. That's the whole point.
- **It doesn't write to disk.** Ever.
- **It doesn't search.** Add a search provider.
- **It's single-process.** No sharing between instances.

## How to use

```javascript
import { StorageProviderJsonMemory, SearchProviderLunr } from '@uttori/wiki';

const config = {
  plugins: [StorageProviderJsonMemory, SearchProviderLunr],
  // Defaults are fine - no config block required.
};
```

## Configuration

| Option | Default | What it does |
|--------|---------|--------------|
| `events` | sensible defaults | Maps provider methods to `storage-*` hooks. Rarely needs changing. |

Timestamp and history behavior are handled by the underlying memory store (both on by default); there's nothing else to set.

## Good to know

- This is the provider the project's own test suite uses - it's battle-tested as a stand-in.
- Seed it at startup by saving documents through the wiki (or dispatching `storage-add`) once the server is up.
- When you're ready for content that survives restarts, swap to the [JSON File provider](storage-provider-json-file.md) - the API is the same.
