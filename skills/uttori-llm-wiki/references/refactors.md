# Rename or merge pages

A rename moves a page to a free slug and keeps its title and metadata. A merge keeps the destination's title and custom fields, appends the source Markdown after a divider, and combines tags and attachments. Both operations move the retiring slug and its aliases to the destination's redirects. Content-addressed source notes and system pages keep their canonical slugs.

The review rewrites rendered Markdown and Uttori wikilinks throughout the wiki. It preserves link labels, code, unrelated URLs, and verbatim blockquotes in source notes. It updates known heading fragments to their new IDs and covers inline links, reference definitions, and explicit autolinks that match the wiki's routes. Old URLs redirect with their query strings. A bookmark outside the wiki may need a new fragment when a heading ID moves. Review raw HTML links and custom route patterns separately. When the renderer cannot preserve link meaning, the preview fails so the markup can be fixed first.

Review each operation separately if you are doing a rename followed by a merge. A merge can leave multiple catalog entries pointing to the same destination because their original labels and descriptions are preserved. Consolidate those entries through an ordinary reviewed edit if needed.

## Local checkout

Run these from the project that installed Uttori. Save the review outside `content/` and inspect the before and after records before applying. Substitute `merge` when the destination already exists.

```sh
node node_modules/@uttori/wiki/skills/uttori-llm-wiki/scripts/refactor.mjs preview <wiki-root> rename <old-slug> <new-slug> > review.json
node node_modules/@uttori/wiki/skills/uttori-llm-wiki/scripts/refactor.mjs apply <wiki-root> < review.json
```

Pass an optional settings JSON file after the destination slug if the wiki uses a mount path, absolute same-wiki URLs, or nondefault heading IDs. Set `publicUrl` or `pathPrefix` and `renderer` to the settings used by Uttori, for example `{"publicUrl":"https://example.com/wiki","renderer":{"markdownIt":{"uttori":{"toc":{"stableIds":true}}}}}`.

Apply rechecks the exact sidecar bytes before replacing `content/`. Use an exclusive editing window and Git history to review or recover the old files. Run the local structural lint and inspect the Git diff. Rebuild the serving wiki after publishing the change. For a static-only deployment, configure the old URL redirects in the hosting layer.

## Hosted MCP

1. Read both slugs with `getDocumentForEdit`. Call `previewDocumentRefactor` with `mode`, `from`, `to`, `expectedSourceVersion`, and `expectedTargetVersion`. The target version is `null` for a rename.
2. Show the review, including which page will retire and where its aliases lead. Apply the approved ID with `applyDocumentChanges`. The server checks the entire corpus so a newly added backlink invalidates the review.
3. If the connection drops or the receipt reports pending work, retry the same ID. The source remains live until the destination and inbound links are stored. The final receipt includes the retired page's history revision.
4. If a partially applied preview goes stale after saving the destination, read both current versions. Pass the old ID as `resumePreviewId` on a new preview of the same operation. This keeps the saved destination and reviews newly affected links before retirement. If the preview expired or either endpoint changed, inspect the receipt and reconcile the saved pages with the operator before proceeding. A new merge of the same pages would append the source again.
