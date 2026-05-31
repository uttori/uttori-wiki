# Download Router

> A forced-download route that streams files to the browser as attachments.

```javascript
import { DownloadRouter } from '@uttori/wiki';
// or: import DownloadRouter from '@uttori/wiki/plugins/download-route';
```

**configKey:** `uttori-plugin-download-router`

## What it does

Adds an Express route that streams files from a local directory to the browser with `Content-Disposition: attachment`, so they download instead of opening in-tab. It includes basic directory-traversal protection, optional referrer whitelisting, and a slot for your own middleware.

## What it doesn't do

- **No default `events`** - wire `bindRoutes`.
- **It doesn't upload files** - that's [Multer Upload](upload-multer.md).
- **No authentication** beyond optional referrer checks - add your own `middleware` for real access control.
- **It needs `basePath` to exist** on disk at startup (validation fails otherwise).
- **Missing files / failed referrer checks fall through** (`next()`) rather than returning explicit 403/404s.
- **No MIME allowlist or per-file ACL** - anything under `basePath` matching the URL is fair game.

## How to use

```javascript
import { DownloadRouter } from '@uttori/wiki';

const config = {
  plugins: [DownloadRouter],

  [DownloadRouter.configKey]: {
    basePath: '/var/wiki/downloads', // must already exist
    publicRoute: '/download',
    allowedReferrers: ['https://example.org'],
    middleware: [],
    events: {
      bindRoutes: ['bind-routes'],
    },
  },
};
```

This serves `GET /download/<file>` as a forced download.

## Configuration

| Option | Default | What it does |
|--------|---------|--------------|
| `basePath` | `'/'` | Local directory files are read from (**must exist**). |
| `publicRoute` | `'/download'` | URL prefix for downloads. |
| `allowedReferrers` | `[]` | If non-empty, the request `Referrer` must start with one of these. |
| `middleware` | `[]` | Express middleware run before the download handler. |
| `events` | *(none)* | Hook wiring. |

## Good to know

- Lock it down with `middleware` (auth, rate limiting) if the files aren't meant to be fully public.
- Keep `basePath` pointed at a dedicated downloads folder - never your whole content tree.
