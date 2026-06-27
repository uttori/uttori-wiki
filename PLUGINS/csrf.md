# CSRF Protection

> Token protection for saves - session-backed, constant-time compared, body or header.

```javascript
import { CsrfProtection } from '@uttori/wiki';
// or: import CsrfProtection from '@uttori/wiki/plugins/csrf';
```

**configKey:** `uttori-plugin-csrf`

## What it does

Protects your wiki's saves from cross-site request forgery. It generates cryptographically random tokens, stores them in the user's session, injects a hidden form field (and view-model data for JS clients) on the edit/create/restore pages, and validates the token on every save using a constant-time comparison. Tokens can arrive in the POST body or an HTTP header (for AJAX saves).

## What it doesn't do

- **It needs sessions** when `requireSession` is `true` (the default) - set up `express-session`.
- **It only guards saves** wired through `validate-save` - not arbitrary routes.
- **It doesn't render your forms** - your theme must output `csrf.input` (or send the header).
- **`checkFetchMetadata` is supplemental** - older browsers may not send `Sec-Fetch-Site`.
- **`rotateOnValidation: true` breaks multi-tab editing** - old tabs hold stale tokens.

## How to use

```javascript
import { CsrfProtection } from '@uttori/wiki';

const config = {
  plugins: [CsrfProtection],

  [CsrfProtection.configKey]: {
    ...CsrfProtection.defaultConfig(),
  },
};
```

Then in your edit/create templates, drop the hidden field the plugin provides:

```html
<form method="post" action="/<%= slug %>/save">
  <%- csrf?.input || '' %>
  <!-- ...your fields... -->
</form>
```

For AJAX saves, send the token in the `x-csrf-token` header instead.

## Configuration

| Option | Default | What it does |
|--------|---------|--------------|
| `fieldName` | `'_csrf'` | Hidden form field name. |
| `headerName` | `'x-csrf-token'` | Header name for JS/AJAX clients. |
| `sessionKey` | `'uttoriCsrfToken'` | Session property that stores the token. |
| `tokenBytes` | `32` | Random bytes (hex output is twice this length). |
| `sources` | `['body', 'header']` | Where to look for the submitted token, in order. |
| `requireSession` | `true` | Block saves when there's no session. |
| `rotateOnValidation` | `false` | Issue a fresh token after each valid save. |
| `checkFetchMetadata` | `false` | Also reject `Sec-Fetch-Site: cross-site` requests. |

## Good to know

- The `validate-save` listener returns `true` to **block** - that's the convention for save-gating plugins (it also means it composes cleanly with [Spam](filter-spam-edit.md) and [IP](filter-ip-address.md) filters).
- Keep `rotateOnValidation: false` unless you're sure users never keep multiple edit tabs open.
