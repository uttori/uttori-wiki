# Renderer: Replacer

> A simple ordered find-and-replace pass over rendered HTML. Emoji swaps, profanity filters, legacy cleanup.

```javascript
import { ReplacerRenderer } from '@uttori/wiki';
// or: import ReplacerRenderer from '@uttori/wiki/plugins/renderer-replacer';
```

**configKey:** `uttori-plugin-renderer-replacer`

## What it does

Runs an ordered list of find-and-replace rules over HTML strings. Each rule has a `test` (a string, compiled with the global flag, or a `RegExp`) and an `output` string. It plugs into the same render hooks as [MarkdownIt](renderer-markdown-it.md), so you can chain "render Markdown ➜ replace text." Classic uses: swap `:cat:` for 🐱, scrub naughty words, or fix up patterns left over from an old system.

## What it doesn't do

- **No default `events`** - wire them or it won't register.
- **It's not a template engine** - just literal/regex substitution.
- **It works on raw strings, not parsed HTML** - a greedy regex can over-match, so write rules carefully.
- **Bad rules are skipped silently** (e.g. a `test` that isn't a string or RegExp).

## How to use

```javascript
import { MarkdownItRenderer, ReplacerRenderer } from '@uttori/wiki';

const config = {
  // MarkdownIt first, then Replacer runs on its output.
  plugins: [MarkdownItRenderer, ReplacerRenderer],

  [ReplacerRenderer.configKey]: {
    events: {
      renderContent: ['render-content'],
      renderCollection: ['render-search-results'],
      validateConfig: ['validate-config'],
    },
    rules: [
      { test: /bunny|rabbit/gim, output: '🐰' },
      { test: ':coffee:', output: '☕️' },
    ],
  },
};
```

## Configuration

| Option | Default | What it does |
|--------|---------|--------------|
| `rules` | `[]` | Array of `{ test: string \| RegExp, output: string }` replacements, applied in order. |
| `events` | *(none)* | Maps plugin methods to render hooks. |

## Good to know

- Order matters - both within `rules` and in the `plugins` array. Put this after the renderer whose output you want to touch.
- Prefer a `RegExp` with explicit flags when you need word boundaries or case-insensitivity.
