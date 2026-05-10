# TypeScript Plugin Extensions for UttoriWiki

This document explains how to properly extend the `UttoriWikiDocument` type when creating plugins that add new fields to documents.

## The Problem

When plugins like `CategoryRoutesPlugin` add new fields to documents (like `categories`), TypeScript doesn't know about these fields, leading to type errors and missing IntelliSense.

## The Solution: Module Augmentation

UttoriWiki provides a clean, hassle-free way for plugin developers to extend document types using TypeScript's module augmentation feature.

## How It Works

### 1. Base Extension Interface

The core system provides a base interface that plugins can extend:

```typescript
// In custom.d.ts
export interface UttoriWikiDocumentExtensions {}

export type UttoriWikiDocumentExtended = UttoriWikiDocument & UttoriWikiDocumentExtensions;
```

### 2. Plugin Extension Pattern

Plugins extend this interface using module augmentation:

```typescript
// In your-plugin-extensions.d.ts
declare module '../custom.d.ts' {
  interface UttoriWikiDocumentExtensions {
    categories?: string[];
    customField?: number;
  }
}
```

### 3. Automatic Type Merging

When your plugin is imported, TypeScript automatically merges the extensions, making the fields available throughout the codebase.

## Implementation Examples

### CategoryRoutesPlugin Example

```typescript
// category-routes-extensions.d.ts
declare module '../custom.d.ts' {
  interface UttoriWikiDocumentExtensions {
    /**
     * Array of category strings for hierarchical categorization.
     * Used by CategoryRoutesPlugin to organize documents into categories.
     */
    categories?: string[];
  }
}

export type UttoriWikiDocumentWithCategories = UttoriWikiDocumentExtended;
```

### Usage in Plugin Code

```typescript
// In your plugin
import { UttoriWikiDocumentExtended } from '../custom.d.ts';

function processDocument(document: UttoriWikiDocumentExtended) {
  // TypeScript now knows about categories!
  if (document.categories) {
    console.log('Categories:', document.categories);
  }
}
```

### Usage in Application Code

```typescript
// In your application
import { UttoriWikiDocumentExtended } from 'uttori-wiki/dist/custom.d.ts';
import CategoryRoutesPlugin from 'uttori-wiki/dist/plugins/category-routes.js';
// Import the extensions to enable the categories field
import 'uttori-wiki/dist/plugins/category-routes-extensions.d.ts';

// Documents now have categories field available
const document: UttoriWikiDocumentExtended = {
  slug: 'my-doc',
  title: 'My Document',
  content: 'Content here',
  categories: ['tech', 'tutorial'] // ✅ TypeScript knows this field exists
};
```

## Alternative Approaches

### Plugin-Specific Types

For more explicit control, create plugin-specific types:

```typescript
export interface MyPluginDocument extends UttoriWikiDocumentExtended {
  categories: string[]; // Required field
  pluginVersion?: string; // Optional field
}
```

### Generic Helper Type

For reusable patterns:

```typescript
export type PluginDocument<T extends Record<string, any> = {}> =
  UttoriWikiDocumentExtended & T;

export type MyPluginDocument = PluginDocument<{
  categories: string[];
  customField: number;
}>;
```

## Best Practices

### ✅ Do

- **Use module augmentation** for automatic type extension
- **Make fields optional** unless they're truly required
- **Provide clear JSDoc comments** for your fields
- **Export convenience types** for your users
- **Test your types** with real usage examples
- **Use descriptive field names** that won't conflict with other plugins

### ❌ Don't

- **Override the base UttoriWikiDocument type** directly
- **Make breaking changes** to existing fields
- **Forget to handle undefined cases** for optional fields
- **Use generic field names** that might conflict with other plugins
- **Assume your fields will always be present** in existing documents

## Migration Guide

### For Existing Plugins

1. Create an extension file: `your-plugin-extensions.d.ts`
2. Add module augmentation for your fields
3. Update your plugin to use `UttoriWikiDocumentExtended`
4. Update documentation and examples

### For Applications Using Plugins

1. Import the plugin's extension types
2. Use `UttoriWikiDocumentExtended` instead of `UttoriWikiDocument`
3. Enjoy full TypeScript support for plugin fields

## Troubleshooting

### Type Not Recognized

- Ensure you're importing the extension file
- Check that module augmentation is properly declared
- Verify the module path in the declaration

### Conflicts Between Plugins

- Use descriptive, plugin-specific field names
- Consider namespacing fields: `myPlugin_categories`
- Document field naming conventions

### Optional vs Required Fields

- Default to optional fields (`field?: type`)
- Only make fields required if they're essential for the plugin to function
- Always handle undefined cases in your code

## Advanced Usage

### Conditional Types

```typescript
type DocumentWithCategories<T> = T extends { categories: any }
  ? UttoriWikiDocumentExtended
  : UttoriWikiDocument;
```

### Plugin Detection

```typescript
function hasCategories(document: UttoriWikiDocumentExtended): document is UttoriWikiDocumentExtended & { categories: string[] } {
  return 'categories' in document && Array.isArray(document.categories);
}
```

This pattern provides a clean, scalable way for plugin developers to extend UttoriWiki's document types without breaking existing code or creating type conflicts.
