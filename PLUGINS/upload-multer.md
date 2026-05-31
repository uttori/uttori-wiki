# Multer Upload

> A file-upload endpoint powered by Multer, with sanitized filenames and an optional MIME allowlist.

```javascript
import { MulterUpload } from '@uttori/wiki';
// or: import MulterUpload from '@uttori/wiki/plugins/upload-multer';
```

**configKey:** `uttori-plugin-upload-multer`

## What it does

Adds a file-upload route powered by [Multer](https://github.com/expressjs/multer). POST a single file (form field name `file`) to the configured route; the server saves it with a sanitized, timestamped filename and returns its public URL path. Uploaded files are then served statically from a public route. You can cap the file size and restrict MIME types.

## What it doesn't do

- **No default `events`** - wire `bindRoutes`, or registration fails.
- **No built-in authentication** - it's wide open unless you add `middleware`.
- **Single-file uploads only** (the `file` field); no multi-file batches.
- **No image processing** (resize/optimize) - files are stored as received.
- **Empty `allowedMimeTypes` allows everything** - set it to actually restrict types.
- **It doesn't auto-attach uploads to documents** - wiring uploads into content is up to your theme/editor.

## How to use

```javascript
import { MulterUpload } from '@uttori/wiki';

const config = {
  plugins: [MulterUpload],

  [MulterUpload.configKey]: {
    directory: './uploads',
    route: '/upload',
    publicRoute: '/uploads',
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxFileSize: 10 * 1024 * 1024,
    middleware: [],
    events: {
      bindRoutes: ['bind-routes'],
      validateConfig: ['validate-config'],
    },
  },
};
```

POST a file to `/upload`; fetch it from `/uploads/<filename>`.

## Configuration

| Option | Default | What it does |
|--------|---------|--------------|
| `directory` | `'uploads'` | On-disk storage folder (created if missing). |
| `route` | `'/upload'` | POST endpoint for uploads. |
| `publicRoute` | `'/uploads'` | Static GET prefix for serving files. |
| `middleware` | `[]` | Extra Express middleware on the upload route. |
| `allowedMimeTypes` | `[]` | Allowed MIME types; empty means allow all. |
| `maxFileSize` | `10485760` (10 MB) | Max upload size in bytes. |
| `events` | *(none)* | Hook wiring. |

## Good to know

- Always set `allowedMimeTypes` for public uploads - an open endpoint that accepts any file type is a foot-gun.
- Add auth/rate-limiting via `middleware` if uploads aren't meant for anonymous visitors.
