# Static Site Generator

`StaticSiteGenerator.build()` exports a configured Uttori Wiki Express app as a deployable directory. It renders a finite route list through the normal wiki templates, copies explicit assets, writes a Lunr search index, and writes a sitemap when a production origin is supplied.

```javascript
import { StaticSiteGenerator } from '@uttori/wiki';

await StaticSiteGenerator.build({
  app,
  routes: [{ url: '/' }, { url: '/docs/' }, { url: '/404', status: 404, output: '404.html' }],
  outputDirectory: './dist',
  assets: [{ source: './public', target: 'assets' }],
  searchDocuments: publicDocuments,
  canonicalOrigin: 'https://example.org',
});
```

HTML routes use trailing slashes and become directory indexes. The 404 route needs an explicit output path. The exporter rejects duplicate or unsafe destinations, redirects, unexpected statuses, broken local links, and missing same-page fragments. It replaces the output directory only after the whole export validates, leaving the last complete artifact at `dist.previous` for rollback. The temporary HTTP listener binds to loopback and closes after the build.

Set `canonicalOrigin` to the production HTTP(S) origin to emit `sitemap.xml`. Local builds can omit it. The public server needs only the output directory; it does not run Uttori Wiki or expose edit routes.
