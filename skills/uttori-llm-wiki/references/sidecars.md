# Sidecar contract

The wiki root is a directory in a Git checkout. It contains a maintainer-owned `WIKI.md`, a private `raw/` archive for curated `.md` snapshots, and `content/` for derived pages. Keep both directories within the checkout and keep the archive out of public assets, search indexes, and public remotes. Only the maintainer adds originals. Store a new edition at a new archive path and preserve the earlier bytes. Give archive files public-safe names because source-note metadata can be read through MCP.

Every page has matching `content/<slug>.md` and `content/<slug>.json` files. Use lowercase letters, digits, and hyphens in slugs, starting with a letter or digit. The JSON stores `slug`, `title`, and optional `excerpt` and `tags`. Add `wikiKind` with value `source` or `topic` for managed pages other than the index and log. Leave existing unmanaged pages outside that convention.

## Source notes and citations

Name the source note `source-` followed by the first 16 lowercase hex digits of the original file's SHA-256. Record the full digest and path relative to `raw/` in its JSON. For example, a note for `raw/reports/baseline.md` has `source.path` set to `reports/baseline.md` and `source.sha256` set to the full 64-digit digest. Reuse the existing note when identical bytes arrive again. A changed source is new evidence, even when it covers the same subject.

Write a short source summary with headings or original line ranges that locate the evidence. Topic pages link to source notes near the claims they support. Use a link such as `[Baseline report, lines 12–16](source-a3f5b65d70c49e11)`. Where publication rules permit, include short verbatim excerpts with line ranges so a hosted reader has text to check. Verify excerpts with [the citation verifier](citations.md). Use bare document slugs for wiki links, optionally followed by a fragment, or use Uttori wikilinks. Bare slug links resolve within the mounted wiki when the Markdown renderer's `uttori.baseUrl` is set to the mount path.

## Catalog and operation log

- `wiki-index` lists every managed source and topic page with a link and a one-line description. Group entries by kind or topic. The index and log themselves need no `wikiKind`.
- `wiki-log` records completed writes in chronological order. For an ingest, append a heading of the form `## YYYY-MM-DD ingest | source-<digest-prefix>` followed by a short summary and links to changed pages. Use the same source slug in the heading across retries. For other requested writes, use `query` or `lint` in place of `ingest` and a descriptive title.
- Git holds the history of the sidecars. Review the working-tree diff before publishing a complete set, and rebuild the serving instance's search index after external file edits.

## Capture Inbox

On a wiki configured with `sidecarIngest: true` on Capture Inbox, a maintainer can prepare a PDF or URL in `/capture-inbox`, edit the draft, and approve the exact topic, source note, catalog, and log changes. Use the source note already created by the inbox. Its `source.sha256` pins the original PDF or HTML, `source.format` selects the capture archive, and `source.textSha256` pins the importer text used for quote matching. The archive path is relative to the private inbox. Keep both files there and out of Git. Repeated approvals for the same original bytes reuse the source note.

## Structural check

Run from the project that installed Uttori, passing the wiki root. Use the script in the npm package so it can load Uttori's compiled parser and sidecar loader.

```sh
node node_modules/@uttori/wiki/skills/uttori-llm-wiki/scripts/lint.mjs <wiki-root>
```

For a wiki with approved captures, add the private inbox path after `<wiki-root>`. The checker validates sidecar pairs, the catalog and log, page kinds, source paths and digests, topic citations, missing page targets, and managed pages with no inbound links from another managed page. Links from the catalog and log do not count as inbound content links. It checks page targets for bare slug links and Uttori wikilinks. Review fragments, links to other site routes, and factual claims separately.
