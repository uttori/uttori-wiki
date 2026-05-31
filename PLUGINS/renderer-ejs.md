# Renderer: EJS

> Runs inline EJS found in your content through `ejs.render()`.

```javascript
import { EJSRenderer } from '@uttori/wiki';
// or: import EJSRenderer from '@uttori/wiki/plugins/ejs-includes';
```

**configKey:** `uttori-plugin-renderer-ejs`

## What it does

If your authors write [EJS](https://ejs.co/) tags (`<%= ... %>`, `<%- ... %>`) directly inside document content, this renderer evaluates them. Like the other render plugins, it listens on the render hooks and processes both single documents and search-result collections.

## What it doesn't do

- **No default `events`** - wire them yourself.
- **It renders with empty locals (`{}`).** The wiki context, request, and document fields are **not** passed in automatically - so EJS in content can't reach page data out of the box.
- **It's synchronous** (`async: false`).
- **It's not a theme layout/include system** - that's your Express view engine's job. This is only for EJS embedded in content.
- **No sandbox.** EJS in content is executable code; only enable this where you trust your authors.

## How to use

```javascript
import { EJSRenderer } from '@uttori/wiki';

const config = {
  plugins: [EJSRenderer],

  [EJSRenderer.configKey]: {
    events: {
      renderContent: ['render-content'],
      validateConfig: ['validate-config'],
    },
    ejs: {
      // Any standard ejs.Options; defaults to {}.
    },
  },
};
```

## Configuration

| Option | Default | What it does |
|--------|---------|--------------|
| `ejs` | `{}` | Standard EJS options passed to `ejs.render(content, {}, options)`. |
| `events` | *(none)* | Maps plugin methods to render hooks. |

## Good to know

- Because locals are empty, this is best for self-contained snippets (loops over literals, date formatting), not for pulling in document/site data.
- Mind the security implications: untrusted EJS in content runs server-side.
