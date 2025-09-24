# Tag Routes Plugin

This plugin extracts tag functionality from the core Uttori Wiki into a separate plugin, providing tag index and individual tag pages.

## Installation

Add the plugin to your wiki configuration:

```javascript
import TagRoutesPlugin from './plugins/tag-routes.js';

const config = {
  plugins: [
    TagRoutesPlugin,
    // ... other plugins
  ],
  'uttori-plugin-tag-routes': {
    // plugin configuration
  }
};
```

## Configuration

The plugin accepts the following configuration options:

```javascript
{
  'uttori-plugin-tag-routes': {
    route: 'tags',                    // Route path for tag pages (default: 'tags')
    title: 'Tags',                    // Default title for tag pages (default: 'Tags')
    ignoreTags: [],                   // Tags to ignore when generating the tags page (default: [])
    limit: 1024,                      // Max documents per tag (default: 1024)
    titles: {},                       // Custom titles for specific tags (default: {})
    tagIndexRoute: undefined,         // Custom tag index route handler (default: undefined)
    tagRoute: undefined,              // Custom tag detail route handler (default: undefined)
    routeMiddleware: {                // Middleware for tag routes
      tagIndex: [],
      tag: []
    }
  }
}
```

## Required Hooks

The plugin uses the following hooks to maintain existing functionality:

### Core Hooks Used

1. **`bind-routes`** (dispatch)
   - **Purpose**: Registers tag routes with the Express server
   - **Usage**: Plugin listens to this hook to add its routes
   - **Implementation**: `context.hooks.on('bind-routes', TagRoutesPlugin.bindRoutes(plugin))`

2. **`storage-query`** (fetch)
   - **Purpose**: Queries the storage system for documents
   - **Usage**: Used in `getTaggedDocuments()` to find documents with specific tags
   - **Implementation**: `await this.context.hooks.fetch('storage-query', query, this.context)`

3. **`view-model-tag-index`** (filter)
   - **Purpose**: Allows modification of the tag index view model
   - **Usage**: Applied to the view model before rendering the tag index page
   - **Implementation**: `await this.context.hooks.filter('view-model-tag-index', viewModel, this.context)`

4. **`view-model-tag`** (filter)
   - **Purpose**: Allows modification of the individual tag view model
   - **Usage**: Applied to the view model before rendering individual tag pages
   - **Implementation**: `await this.context.hooks.filter('view-model-tag', viewModel, this.context)`

### Context Methods Used

The plugin relies on the following methods from the wiki context:

1. **`buildMetadata(document, path, robots)`**
   - **Purpose**: Builds metadata for view models
   - **Usage**: Creates metadata for tag index and tag detail pages

2. **`config.ignoreSlugs`**
   - **Purpose**: List of slugs to exclude from tag queries
   - **Usage**: Used in storage queries to filter out ignored documents

## Routes Provided

The plugin registers the following routes:

1. **`GET /{route}`** (default: `GET /tags`)
   - **Handler**: `tagIndex`
   - **Purpose**: Displays the tag index page with all available tags
   - **Template**: `tags`

2. **`GET /{route}/:tag`** (default: `GET /tags/:tag`)
   - **Handler**: `tag`
   - **Purpose**: Displays all documents with a specific tag
   - **Template**: `tag`

## Templates Required

The plugin expects the following templates to exist in your theme:

1. **`tags`** - Tag index page template
   - **Variables**: `title`, `config`, `session`, `taggedDocuments`, `meta`, `basePath`, `flash`

2. **`tag`** - Individual tag page template
   - **Variables**: `title`, `config`, `session`, `taggedDocuments`, `meta`, `basePath`, `flash`

## Migration from Core

When migrating from the core tag functionality:

1. **Remove from config.js**:
   - `ignoreTags` property
   - `routes.tags` property
   - `titles.tags` property
   - `tagIndexRoute` and `tagRoute` properties
   - `routeMiddleware.tagIndex` and `routeMiddleware.tag` properties

2. **Remove from wiki.js**:
   - `tagIndex` method
   - `tag` method
   - `getTaggedDocuments` method
   - Tag route binding in `bindRoutes`

3. **Add plugin to configuration**:
   - Import `TagRoutesPlugin`
   - Add to `plugins` array
   - Configure with `'uttori-plugin-tag-routes'` key

## Backward Compatibility

The plugin maintains full backward compatibility with existing functionality:

- All existing hooks continue to work
- Template variables remain the same
- Route structure is preserved (configurable)
- Custom route handlers are supported
- Middleware support is maintained

## Example Usage

```javascript
import UttoriWiki from './src/wiki.js';
import TagRoutesPlugin from './src/plugins/tag-routes.js';

const config = {
  plugins: [TagRoutesPlugin],
  'uttori-plugin-tag-routes': {
    route: 'categories',              // Use 'categories' instead of 'tags'
    title: 'Categories',              // Custom title
    ignoreTags: ['private', 'draft'], // Ignore these tags
    limit: 50,                        // Limit to 50 documents per tag
    titles: {                         // Custom titles for specific tags
      'javascript': 'JavaScript',
      'nodejs': 'Node.js'
    }
  }
};

const wiki = new UttoriWiki(config, server);
```

This will create routes at `/categories` and `/categories/:tag` with the specified configuration.
