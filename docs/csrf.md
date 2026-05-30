# CsrfProtection Plugin

Protects Uttori Wiki edit, create, and history-restore forms against Cross-Site Request Forgery (CSRF) attacks by embedding a cryptographically random token in each rendered form and verifying it on every save request.

No additional runtime dependencies are required. The plugin uses Node's built-in `crypto` module and the `express-session` session object that most Uttori Wiki deployments already configure.

---

## Threat Model

A CSRF attack tricks an already-authenticated user's browser into submitting a state-changing HTTP request (such as editing a wiki page) to your server from a malicious third-party page. Because the browser automatically attaches cookies to every request, the server cannot distinguish a legitimate form submission from a forged one using cookies alone.

The CSRF token pattern breaks this by embedding an unpredictable, per-session value in the form that the browser only sends when the user actually submits the form from your own page. A cross-origin attacker cannot read the value (same-origin policy) and therefore cannot include it in the forged request.

For a detailed explanation, see [Cross-site request forgery (CSRF) - MDN](https://developer.mozilla.org/en-US/docs/Web/Security/Attacks/CSRF).

---

## When CSRF Protection Matters

CSRF protection is relevant when **all three** of the following are true:

1. Your wiki accepts state-changing requests via standard HTML forms (`<form method="POST">` or similar).
2. The session or authentication is carried via cookies.
3. The routes in question are accessible to users who are not fully isolated behind a private edit key.

If you rely solely on a private `editKey` URL parameter (i.e. `useEditKey: true`) and that key is truly secret, a CSRF attack still works if the attacker somehow discovers the key (e.g. via browser history or a compromised referrer header). CSRF tokens add an independent layer of protection.

---

## Installation

The plugin is exported from the main package alongside all other built-in plugins:

```js
import { CsrfProtection } from '@uttori/wiki';
```

Or via the scoped subpath export:

```js
import CsrfProtection from '@uttori/wiki/plugins/csrf';
```

---

## Quick Start

Add `CsrfProtection` to your `plugins` array and provide its configuration key. All settings shown below are the defaults; omit any you do not need to change:

```js
import { CsrfProtection } from '@uttori/wiki';

const config = {
  plugins: [
    // ... other plugins ...
    CsrfProtection,
  ],

  [CsrfProtection.configKey]: {
    ...CsrfProtection.defaultConfig(),
  },
};
```

Then update your edit template to render the hidden input inside the save form. The plugin places a pre-built `<input>` element on the view model:

```html
<form action="<%= action -%>" method="POST">
  <%- csrf?.input || '' -%>
  <!-- rest of your form fields -->
</form>
```

That is all that is required for the common case. The sections below document every setting in detail.

---

## Configuration reference

| Setting | Type | Default | Description |
|---|---|---|---|
| `fieldName` | `string` | `'_csrf'` | The hidden form field name that themes render and that is read from the POST body on save. |
| `headerName` | `string` | `'x-csrf-token'` | The HTTP request header name for JavaScript / API clients. |
| `sessionKey` | `string` | `'uttoriCsrfToken'` | The `express-session` key used to store the token server-side. |
| `tokenBytes` | `number` | `32` | Number of random bytes. Each byte becomes two hex characters, so 32 bytes produces a 64-character token. Minimum is 16 (32 hex characters). |
| `sources` | `Array<'body'\|'header'>` | `['body', 'header']` | Ordered list of sources to search for the submitted token. The first source with a non-empty value wins. |
| `requireSession` | `boolean` | `true` | When `true`, a missing session causes token injection to be skipped and save requests to be blocked. |
| `rotateOnValidation` | `boolean` | `false` | When `true`, a new token is written to the session after every successful save. |
| `checkFetchMetadata` | `boolean` | `false` | When `true`, requests flagged as `cross-site` by the `Sec-Fetch-Site` header are rejected as an additional layer of defense. |
| `events` | `object` | _(see below)_ | Maps plugin method names to the hook event names they listen for. Override individual keys to reassign hooks. |

### Default events

```js
events: {
  injectToken:  ['view-model-edit', 'view-model-new', 'view-model-history-restore'],
  validateToken: ['validate-save'],
  validateConfig: ['validate-config'],
}
```

---

## Setting-by-Setting Guide

### `fieldName`

The name of the hidden `<input>` rendered in the form. The same name is read from `request.body` on save. Change this only if `_csrf` conflicts with a field your documents or custom plugins already use.

```js
fieldName: '_csrf', // default
```

### `headerName`

The HTTP header name for programmatic clients (e.g. `fetch()` or `XMLHttpRequest`) that cannot use a hidden form field. Change this if your proxy strips `x-csrf-token` or if you prefer a different convention.

```js
headerName: 'x-csrf-token', // default
```

For JavaScript client usage see [Layout-Level Token for JavaScript Clients](#layout-level-token-for-javascript-clients) below.


### `sessionKey`

The key under which the token is stored on `request.session`. The default `'uttoriCsrfToken'` is unlikely to conflict with anything, but change it if you need to avoid a collision with another plugin or your own session fields.

```js
sessionKey: 'uttoriCsrfToken', // default
```

### `tokenBytes`

Controls the size of the token. Larger values are slightly slower to generate and transmit but offer no meaningful security improvement over the default for web use. The minimum allowed value is `16` (producing a 32-character hex string).

```js
tokenBytes: 32, // default - produces a 64-character hex token
```

### `sources`

The ordered list of request sources to check for the submitted token. The first non-empty value found wins.

```js
sources: ['body', 'header'], // default - check form body first, then header
```

**API-only setup** (skip body, require header):

```js
sources: ['header'],
```

**Form-only setup** (ignore headers entirely):

```js
sources: ['body'],
```

### `requireSession`

When `true` (default), the plugin will not inject a token into the view model if there is no session, and will block any save request that arrives without a session. This is the safe default because without a session there is no server-side anchor for the token.

Set `requireSession: false` only if you have an unusual setup where sessions are not available (e.g. a stateless API behind a proxy that validates tokens by other means). In practice, Uttori Wiki requires `express-session` for flash messages and authentication, so you almost certainly want to leave this `true`.

```js
requireSession: true, // default
```

### `rotateOnValidation`

When `true`, the plugin writes a fresh token to the session immediately after a valid save completes, limiting the window during which a previously intercepted token could be replayed.

**Tradeoff - multiple browser tabs:** Because all tabs in the same browser session share one session, rotating the token on every save means that submitting a form in one tab invalidates the token loaded in any other tab that has the edit page open. The user will get a CSRF error if they submit the second tab without first refreshing it.

For a typical wiki this is annoying enough that `false` (the default) is strongly recommended. Enable rotation only if your threat model specifically requires it (e.g. a high-security admin interface where each action must be individually authorized).

```js
rotateOnValidation: false, // default - safe for multi-tab usage
```

### `checkFetchMetadata`

When `true`, the plugin also inspects the `Sec-Fetch-Site` request header as a secondary, defense-in-depth measure. Requests that arrive with `Sec-Fetch-Site: cross-site` are rejected even if they include a valid CSRF token.

**Important limitations:**
- Not all browsers send Fetch Metadata headers (older browsers send nothing). Absence of the header is treated as safe by the plugin and does **not** cause a block.
- This is supplemental defense, not a replacement for token checking. Always keep the token check enabled; `checkFetchMetadata` only adds an extra gate for modern browsers.

```js
checkFetchMetadata: false, // default - enable for additional defense in depth
```

---

## Theme Integration

The plugin exposes the following object on the view model as `csrf`:

| Property | Type | Description |
|---|---|---|
| `csrf.token` | `string` | The raw hex token value. |
| `csrf.fieldName` | `string` | The form field name (mirrors config). |
| `csrf.headerName` | `string` | The HTTP header name (mirrors config). |
| `csrf.input` | `string` | A fully rendered `<input type="hidden">` element. |

### Standard EJS Form Integration

Inside your edit template, add the hidden input **inside** the `<form>` tag:

```html
<form action="<%= action -%>" method="POST">
  <%- csrf?.input || '' -%>

  <div class="form-group">
    <label for="title">Title</label>
    <input type="text" name="title" value="<%= document.title -%>" required />
  </div>

  <!-- ... other fields ... -->

  <input type="submit" value="Save" />
</form>
```

The `|| ''` fallback means the template continues to work without errors if the plugin is not registered or if the session is unavailable.

### Layout-Level Token for JavaScript Clients

If your theme uses JavaScript to submit save requests via `fetch()`, expose the token at the layout level so all pages have access to it:

```html
<!-- In your layout.html, inside <head> -->
<% if (typeof csrf !== 'undefined' && csrf) { %>
<meta name="csrf-token" content="<%= csrf.token -%>" />
<% } %>
```

Then in your client-side JavaScript:

```js
function getCsrfToken() {
  return document.querySelector('meta[name="csrf-token"]')?.content ?? '';
}

async function saveDocument(slug, data) {
  return fetch(`/${slug}/save`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'x-csrf-token': getCsrfToken(),
    },
    body: JSON.stringify(data),
  });
}
```

---

## What this plugin does not protect against

### GET-based Delete

The built-in delete route (`/:slug/delete/:key`) uses a `GET` request, which makes it awkward to token-protect directly (form submissions and navigations freely trigger GET requests). The recommended long-term solution is to move deletion to a `DELETE` or `POST` endpoint behind a confirmation form, which would then be covered by this plugin's `validate-save`-style hook.

Until then, the existing `useDeleteKey` mechanism provides some protection against casual forgery, but it is not a substitute for proper CSRF defense on destructive actions.

### Upload Routes

The upload route (`/upload`) is registered by the `MulterUpload` plugin and is not covered by the `validate-save` hook. If your upload endpoint performs state changes that require CSRF protection, you can add a custom middleware on that route that reads and validates `request.session[sessionKey]` against the submitted token manually.

### API Routes Registered by Custom Plugins

Any route registered via `bind-routes` by a third-party plugin is responsible for its own CSRF defense. This plugin only intercepts the core wiki edit/create/restore save path.

---

## Example Configurations

### Default (sessions required, no rotation)

```js
[CsrfProtection.configKey]: {
  ...CsrfProtection.defaultConfig(),
},
```

### Header-Only API Clients

```js
[CsrfProtection.configKey]: {
  ...CsrfProtection.defaultConfig(),
  sources: ['header'],
  headerName: 'x-wiki-csrf',
},
```

### Stricter Setup with Fetch Metadata and Token Rotation

```js
[CsrfProtection.configKey]: {
  ...CsrfProtection.defaultConfig(),
  checkFetchMetadata: true,
  rotateOnValidation: true, // note: breaks multi-tab editing
},
```

### Larger token for extra entropy (diminishing returns beyond 32 bytes)

```js
[CsrfProtection.configKey]: {
  ...CsrfProtection.defaultConfig(),
  tokenBytes: 64,
},
```

### Custom Field & Session Key Names

```js
[CsrfProtection.configKey]: {
  ...CsrfProtection.defaultConfig(),
  fieldName: 'wiki_token',
  sessionKey: 'wikiCsrf',
},
```

---

## SameSite Cookies as Defense-in-Depth

The `express-session` configuration used in the Uttori Wiki test helper already sets `sameSite: true` (equivalent to `'Strict'`). In production, configuring your session cookie with `SameSite=Lax` or `SameSite=Strict` provides meaningful defense-in-depth:

- `Strict` - The cookie is never sent on any cross-site request, including top-level navigations. Most protective, but can cause the user to appear logged out when following a link from another site.
- `Lax` - The cookie is sent on safe top-level navigations (`GET`), but not on cross-site `POST` / `PUT`. This is a good default for wikis and protects against forged `POST` saves without the `Strict` usability cost.

`SameSite` cookies alone are not sufficient because they do not apply equally across all browsers and versions, and `Lax` still permits forged `GET` requests. Always pair them with CSRF tokens for complete protection.

```js
// Example express-session configuration
session({
  secret: process.env.SESSION_SECRET,
  cookie: {
    sameSite: 'Lax',    // or 'Strict' for maximum protection
    secure: true,       // always use HTTPS in production
    httpOnly: true,     // prevent JavaScript access to the cookie
  },
});
```
