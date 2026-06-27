# IP Address Filter

> Logs every save and blocks IPs on your blocklist. A simple ban hammer with an audit trail.

```javascript
import { FilterIPAddress } from '@uttori/wiki';
// or: import FilterIPAddress from '@uttori/wiki/plugins/filter-ip-address';
```

**configKey:** `uttori-plugin-filter-ip-address`

## What it does

Runs on every save: it resolves the client IP, appends a JSON line (IP, URL, request body) to a daily log file, and blocks the save if the IP is on your blocklist. Two jobs in one - keep a record of who submitted what, and slam the door on known bad actors.

## What it doesn't do

- **An empty blocklist blocks no one** - by default it only logs.
- **It's a blocklist, not an allowlist** - you name the bad IPs.
- **No rate limiting, geo-blocking, or CIDR ranges** - exact-string matches only.
- **`trustProxy: true` stringifies the whole `X-Forwarded-For` header** rather than parsing the leftmost client IP, so blocklist entries must match that exact string.
- **It only runs on `validate-save`** - not other routes.

## How to use

```javascript
import { FilterIPAddress } from '@uttori/wiki';

const config = {
  plugins: [FilterIPAddress],

  [FilterIPAddress.configKey]: {
    ...FilterIPAddress.defaultConfig(),
    logPath: './logs',
    blocklist: ['203.0.113.50'],
    trustProxy: true, // if you're behind a reverse proxy
  },
};
```

## Configuration

| Option | Default | What it does |
|--------|---------|--------------|
| `logPath` | `<plugin-dir>/logs` | Folder for daily `ip-activity-YYYY-MM-DD.log` files. |
| `blocklist` | `[]` | IP strings to reject on save. |
| `trustProxy` | `false` | Use the `X-Forwarded-For` header instead of `request.ip`. |

## Good to know

- The activity logs double as a breadcrumb trail when you're chasing down abuse.
- For smarter, content-aware blocking (link spam, churn, suspicious terms), reach for the [Spam Edit Filter](filter-spam-edit.md) - the two stack nicely.
