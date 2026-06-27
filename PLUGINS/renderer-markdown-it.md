# Renderer: MarkdownIt

> Markdown ➜ HTML via markdown-it, plus a basket of Uttori extras: footnotes, `[toc]`, `[[wikilinks]]`, embeds, link hardening, and lazy images.

```javascript
import { MarkdownItRenderer } from '@uttori/wiki';
// or: import MarkdownItRenderer from '@uttori/wiki/plugins/renderer-markdown-it';
```

**configKey:** `uttori-plugin-renderer-markdown-it`

## What it does

The default renderer. It turns document Markdown into HTML using [markdown-it](https://github.com/markdown-it/markdown-it), bundled with Uttori's custom extensions. It hooks into the render pipeline, so document bodies, search-result snippets, and meta descriptions all get converted at serve time. It also tidies content first (drops broken `[]()` links, auto-slugifies `[Title]()` placeholders) and can lift a generated table of contents out into its own `viewModel.toc` field.

The bundled markdown extensions (always on when this renderer is used):

| Extension | What it adds | How you use it |
|-----------|--------------|----------------|
| **footnotes** | `[^label]` references with `[^label]: ...` definitions and linkable anchors. | Write footnotes in Markdown; customize markup under `markdownIt.uttori.footnotes`. |
| **toc** | A `[toc]` placeholder becomes a nested heading nav; headings get anchor IDs. | Put `[toc]` in your content; configure `markdownIt.uttori.toc`. |
| **wikilinks** | `[[Page Title]]` and `[[target\|Display Text]]` become internal links. | Just write them; slug rules via `markdownIt.uttori.wikilinks.slugify`. |
| **youtube** | `<youtube v="ID" width="560" height="315">` becomes a privacy-friendly embed. | Write the tag inline. |
| **video** | `<video src="...">` becomes a safe embed; external sources must be allow-listed. | Write the tag; allow hosts via `allowedExternalDomains`. |
| **uttori-inline** | Link/image post-processing: lazy loading, external `rel`/`target`, `baseUrl` prefixing, `color:#hex` pseudo-links. | Driven by the `uttori` options below. |
| **line-breaker** | Converts literal `<br>` in inline content to hard breaks. | Automatic. |

## What it doesn't do

- **It ships no default `events`** - you must wire them, or registration throws.
- **It doesn't run EJS or text replacements** - those are the [EJS](renderer-ejs.md) and [Replacer](renderer-replacer.md) renderers.
- **Raw HTML is off by default** (`html: false`). Turning it on (`html: true`) is on you, security-wise.
- **It doesn't verify wikilink targets exist** - they resolve to a slug href regardless.
- `disableValidation: true` switches off markdown-it's link validation; the source flags this as a security risk.

## How to use

```javascript
import { MarkdownItRenderer } from '@uttori/wiki';

const config = {
  plugins: [MarkdownItRenderer],

  [MarkdownItRenderer.configKey]: {
    events: {
      renderContent: ['render-content'],
      renderCollection: ['render-search-results'],
      validateConfig: ['validate-config'],
    },
    markdownIt: {
      html: false,
      linkify: true,
      uttori: {
        baseUrl: '',
        allowedExternalDomains: ['example.org'],
        openNewWindow: true,
        lazyImages: true,
        toc: { extract: true, slugify: { lower: true } },
      },
    },
  },
};
```

## Configuration

| Option | Default | What it does |
|--------|---------|--------------|
| `markdownIt.html` | `false` | Allow raw HTML tags in Markdown source. |
| `markdownIt.linkify` | `false` | Auto-link bare URLs. |
| `markdownIt.breaks` | `false` | Turn single newlines into `<br>`. |
| `markdownIt.uttori.baseUrl` | `''` | Prefix prepended to relative link hrefs (handy when mounted under a sub-path). |
| `markdownIt.uttori.allowedExternalDomains` | `[]` | Hosts that get `rel="external noopener noreferrer"` instead of `nofollow`. |
| `markdownIt.uttori.openNewWindow` | `true` | Add `target="_blank"` to external links. |
| `markdownIt.uttori.lazyImages` | `true` | Add `loading="lazy"` to images. |
| `markdownIt.uttori.disableValidation` | `false` | Bypass markdown-it link validation (risky). |
| `markdownIt.uttori.toc.extract` | `false` | Split the rendered TOC out into `viewModel.toc`. |
| `markdownIt.uttori.toc.openingTag` / `closingTag` | `<nav class="table-of-contents">` / `</nav>` | Markers used for TOC extraction. |
| `markdownIt.uttori.toc.slugify` | `{ lower: true }` | Slugify options for heading anchors. |
| `markdownIt.uttori.wikilinks.slugify` | `{ lower: true }` | Slugify options for `[[wikilink]]` targets. |
| `markdownIt.uttori.footnotes.*` | built-in helpers | Customize footnote markup. |

## Good to know

- Renderers run in pipeline order. List MarkdownIt before [Replacer](renderer-replacer.md) if you want "render Markdown, then swap text."
- Set `baseUrl` when the wiki is mounted somewhere other than `/` so relative links resolve correctly.
- `toc.extract: true` is great when you want the table of contents in a sidebar rather than inline.
