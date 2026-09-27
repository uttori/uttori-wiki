# TypeScript plugin extensions

Import public types from `@uttori/wiki`. The package exports JavaScript for execution and generated `.d.ts` files for TypeScript. JSDoc on source interfaces, fields, and methods is preserved in those declarations.

## Extend documents

Augment `UttoriWikiDocumentExtensions` in a module that your application includes. The initial import makes this an augmentation of the existing package instead of a replacement module declaration.

```typescript
import type { UttoriWikiDocumentExtended } from '@uttori/wiki';

declare module '@uttori/wiki' {
  interface UttoriWikiDocumentExtensions {
    /** External catalog identifier; absent on documents created before import. */
    catalogId?: string;
  }
}

export function catalogLink(document: UttoriWikiDocumentExtended): string | undefined {
  if (document.catalogId) {
    return `/catalog/${encodeURIComponent(document.catalogId)}`;
  }
  return undefined;
}
```

`UttoriWikiDocumentExtended` combines the core document fields with the extension interface. Built-in category fields are already declared by the category plugin. Use optional fields for values that may be absent from existing documents, and include custom fields in the wiki's `allowedDocumentKeys` when saving them through edit forms.

A plugin can place its augmentation in its main TypeScript module or import a separate augmentation module from its entry point. Consumers then receive the extension when they import the plugin. Avoid importing private `dist/` paths or declaration files as runtime modules.

## Type plugin configuration

Use `UttoriContextWithPluginConfig` to describe the configuration a plugin receives:

```typescript
import type { UttoriContextWithPluginConfig } from '@uttori/wiki';

interface CatalogConfig {
  /** URL prefix used when linking imported catalog entries. */
  baseUrl: string;
}

type CatalogContext = UttoriContextWithPluginConfig<'catalog', CatalogConfig>;

export function catalogUrl(context: CatalogContext, id: string): string {
  return `${context.config.catalog.baseUrl}/${encodeURIComponent(id)}`;
}
```

A custom plugin must apply and validate its own defaults before calling helpers that require them. For built-in plugins, the context helper marks fields supplied by `defaultConfig()` as required while preserving their declared value types. Optional settings without defaults remain optional.

## Verify extensions

`npm run test:types` compiles a consumer fixture against the package exports. It checks built-in plugin constructors, document augmentation, custom context fields, and declaration dependencies with `skipLibCheck` disabled. Add consumer examples there when changing the public type contract.
