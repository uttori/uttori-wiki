# Capture Inbox

Capture Inbox gives authenticated maintainers a browser queue at `/capture-inbox`. They can upload a PDF or queue an allowed URL, prepare an editable Markdown draft, compare it with the destination page, and approve publication. The inbox saves originals, draft reviews, and publication checkpoints on disk so the workflow can resume after a request or server interruption.

## Configure

Install the plugin on a wiki with mutable JSON-file storage, history enabled, and Lunr search. Mount an Express session middleware and your existing maintainer authentication before Uttori's routes. The inbox uses Uttori's session CSRF protection. Set its directory to a private, persistent location outside public assets. Use a single wiki process for the inbox and content directories.

```js
import { CaptureInbox, SearchProviderLunr, StorageProviderJsonFile } from '@uttori/wiki';

const config = {
  plugins: [StorageProviderJsonFile, SearchProviderLunr, CaptureInbox],
  [StorageProviderJsonFile.configKey]: {
    contentDirectory: '/srv/wiki/content',
    historyDirectory: '/srv/wiki/history',
  },
  [SearchProviderLunr.configKey]: {},
  [CaptureInbox.configKey]: {
    directory: '/srv/wiki-private/capture-inbox',
    allowedOrigins: ['https://docs.example.com'],
    authorize: request => request.user?.canMaintainWiki === true,
  },
};
```

`authorize` must check identity and permission established by your application. Set optional `middleware` on the inbox config if it should run additional authentication middleware before that check. Install the optional `multer` and `pdfreader` packages for PDF uploads and extraction. URL captures of HTML use the existing importer’s Pandoc conversion and require `pandoc` on the server's PATH. Enabling the inbox uses importer code directly and leaves the importer’s legacy routes disabled unless you separately enable them.

## Capture and review

1. Upload a PDF or queue a URL from an exact origin in `allowedOrigins`. An empty list enables uploads only. Each capture accepts up to 10 MiB. Remote capture fetches a single HTML document or PDF. It rejects redirects and does not fetch page assets.
2. Open the queue entry and choose **Prepare draft**. A retry after conversion fails uses the saved original. The PDF importer extracts a text layer with page numbers. For a scanned PDF, enter the draft text during review. Maintainers can download the private original from the entry.
3. Edit the title, page slug, and Markdown, then choose **Review draft**. The review displays the current destination and proposed replacement. An unused slug creates a page. An existing slug updates its title and Markdown and keeps its other metadata. Review again if the destination changed before approval.
4. Choose **Approve and publish**. Uttori runs its save filters, writes the approved page and history, then updates search. If the request or server stops, reopen the entry and choose **Resume publication**. The saved revision ID prevents duplicate history. If someone changed the destination before storage was confirmed, the inbox blocks the stale write and lets you review the draft against the current page.

Only the reviewed page is published. Original PDFs and HTML, draft records, and publication checkpoints remain in the private inbox directory.

## Publish to `uttori-llm-wiki` sidecars

For a Git-managed wiki, initialize `raw/`, `content/`, and the `wiki-index` and `wiki-log` pairs using the [skill’s sidecar contract](../skills/uttori-llm-wiki/references/sidecars.md). Set `sidecarIngest: true` on Capture Inbox. Use this storage configuration in place of the mutable storage settings above.

```js
const config = {
  plugins: [StorageProviderJsonFile, SearchProviderLunr, CaptureInbox],
  allowCRUDRoutes: false,
  publicHistory: false,
  [StorageProviderJsonFile.configKey]: {
    contentDirectory: '/srv/wiki-checkout/content',
    sidecarContentExtension: 'md',
    useCache: false,
    useHistory: false,
  },
  [SearchProviderLunr.configKey]: {},
  [CaptureInbox.configKey]: {
    directory: '/srv/wiki-private/capture-inbox',
    sidecarIngest: true,
    allowedOrigins: ['https://docs.example.com'],
    authorize: request => request.user?.canMaintainWiki === true,
  },
};
```

Create the private inbox directory before starting the server. Keep it outside the wiki checkout and public assets. Configure it as `citationVerification.captureDirectory` on the MCP provider if authorized clients should be able to verify capture citations. The inbox stores the original and its pinned importer text together. Back up both with the private inbox. Git tracks the approved topic, the digest-based source note, the catalog, and the log.

The approval screen shows the exact sidecar edits, including the generated citation links. Review excerpts, links, and attachments before approval. If files change before approval, review again. If interrupted after approval, resume the saved changes before approving another capture. Publication stages a complete sibling directory. During the switch and after a server interruption, Uttori serves the complete old or new checkout. Allow disk space for a second copy of `content/`. A stopped switch can leave the old tree at `content.uttori-previous` until you resume. Keep external Git operations and editors out of the checkout while applying or resuming a capture. Review and commit the working-tree diff in Git after publishing.
