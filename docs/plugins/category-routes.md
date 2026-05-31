## Classes

<dl>
<dt><a href="#CategoryRoutesPlugin">CategoryRoutesPlugin</a></dt>
<dd><p>Category routes plugin for Uttori Wiki.
Provides category index and individual category pages functionality with hierarchy support.</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#DebugLogger">DebugLogger</a> ⇒ <code>void</code></dt>
<dd></dd>
<dt><a href="#CategoryRoutesPluginConfig">CategoryRoutesPluginConfig</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#CategoryDocument">CategoryDocument</a> : <code>UttoriWikiDocument</code></dt>
<dd></dd>
<dt><a href="#CategoryBreadcrumb">CategoryBreadcrumb</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#FlattenedCategory">FlattenedCategory</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#CategoryTreeNode">CategoryTreeNode</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#CategoryRoutesContext">CategoryRoutesContext</a> : <code>UttoriContextWithPluginConfig.&lt;&#x27;uttori-plugin-category-routes&#x27;, CategoryRoutesPluginConfig&gt;</code></dt>
<dd><p>Uttori context narrowed to this plugin&#39;s config shape.</p>
</dd>
<dt><a href="#CategoryRoutesRequestHandler">CategoryRoutesRequestHandler</a> ⇒ <code>module:express~RequestHandler</code></dt>
<dd><p>Builds an Express handler for a category route.</p>
</dd>
</dl>

<a name="CategoryRoutesPlugin"></a>

## CategoryRoutesPlugin
Category routes plugin for Uttori Wiki.
Provides category index and individual category pages functionality with hierarchy support.

**Kind**: global class  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| config | [<code>CategoryRoutesPluginConfig</code>](#CategoryRoutesPluginConfig) | The configuration object. |


* [CategoryRoutesPlugin](#CategoryRoutesPlugin)
    * [new CategoryRoutesPlugin()](#new_CategoryRoutesPlugin_new)
    * [.configKey](#CategoryRoutesPlugin.configKey) ⇒ <code>string</code>
    * [.allowedDocumentKeys](#CategoryRoutesPlugin.allowedDocumentKeys) ⇒ <code>Array.&lt;string&gt;</code>
    * [.getDocumentCategories(document, categoryField)](#CategoryRoutesPlugin.getDocumentCategories) ⇒ <code>Array.&lt;string&gt;</code>
    * [.defaultConfig()](#CategoryRoutesPlugin.defaultConfig) ⇒ [<code>CategoryRoutesPluginConfig</code>](#CategoryRoutesPluginConfig)
    * [.extendConfig(config)](#CategoryRoutesPlugin.extendConfig) ⇒ [<code>CategoryRoutesPluginConfig</code>](#CategoryRoutesPluginConfig)
    * [.validateConfig(config, _context)](#CategoryRoutesPlugin.validateConfig)
    * [.register(context)](#CategoryRoutesPlugin.register)
    * [.bindRoutes(server, context)](#CategoryRoutesPlugin.bindRoutes)
    * [.getCategorizedDocuments(context, category)](#CategoryRoutesPlugin.getCategorizedDocuments) ⇒ <code>Promise.&lt;Array.&lt;CategoryDocument&gt;&gt;</code>
    * [.buildCategoryTree(categories, separator)](#CategoryRoutesPlugin.buildCategoryTree) ⇒ <code>Record.&lt;string, CategoryTreeNode&gt;</code>
    * [.flattenCategoryTree(tree, separator)](#CategoryRoutesPlugin.flattenCategoryTree) ⇒ [<code>Array.&lt;FlattenedCategory&gt;</code>](#FlattenedCategory)
    * [.categoryIndexRequestHandler(context)](#CategoryRoutesPlugin.categoryIndexRequestHandler) ⇒ <code>module:express~RequestHandler</code>
    * [.categoryRequestHandler(context)](#CategoryRoutesPlugin.categoryRequestHandler) ⇒ <code>module:express~RequestHandler</code>
    * [.getAllCategories(context)](#CategoryRoutesPlugin.getAllCategories) ⇒ <code>Promise.&lt;Array.&lt;string&gt;&gt;</code>
    * [.categoryApiRequestHandler(context)](#CategoryRoutesPlugin.categoryApiRequestHandler) ⇒ <code>module:express~RequestHandler</code>

<a name="new_CategoryRoutesPlugin_new"></a>

### new CategoryRoutesPlugin()
**Example** *(Init CategoryRoutesPlugin)*  
```js
const categoryPlugin = new CategoryRoutesPlugin();
```
<a name="CategoryRoutesPlugin.configKey"></a>

### CategoryRoutesPlugin.configKey ⇒ <code>string</code>
The configuration key for plugin to look for in the provided configuration.

**Kind**: static property of [<code>CategoryRoutesPlugin</code>](#CategoryRoutesPlugin)  
**Returns**: <code>string</code> - The configuration key.  
**Example** *(CategoryRoutesPlugin.configKey)*  
```js
const config = { ...CategoryRoutesPlugin.defaultConfig(), ...context.config[CategoryRoutesPlugin.configKey] };
```
<a name="CategoryRoutesPlugin.allowedDocumentKeys"></a>

### CategoryRoutesPlugin.allowedDocumentKeys ⇒ <code>Array.&lt;string&gt;</code>
The keys that are allowed to be set on a document.

**Kind**: static property of [<code>CategoryRoutesPlugin</code>](#CategoryRoutesPlugin)  
**Returns**: <code>Array.&lt;string&gt;</code> - The allowed document keys.  
<a name="CategoryRoutesPlugin.getDocumentCategories"></a>

### CategoryRoutesPlugin.getDocumentCategories(document, categoryField) ⇒ <code>Array.&lt;string&gt;</code>
Normalize a storage row category field into an array of category names.

**Kind**: static method of [<code>CategoryRoutesPlugin</code>](#CategoryRoutesPlugin)  
**Returns**: <code>Array.&lt;string&gt;</code> - The category names.  

| Param | Type | Description |
| --- | --- | --- |
| document | <code>Record.&lt;string, (string\|Array.&lt;string&gt;)&gt;</code> | The storage row. |
| categoryField | <code>string</code> | The field containing categories. |

<a name="CategoryRoutesPlugin.defaultConfig"></a>

### CategoryRoutesPlugin.defaultConfig() ⇒ [<code>CategoryRoutesPluginConfig</code>](#CategoryRoutesPluginConfig)
The default configuration for the plugin.

**Kind**: static method of [<code>CategoryRoutesPlugin</code>](#CategoryRoutesPlugin)  
**Returns**: [<code>CategoryRoutesPluginConfig</code>](#CategoryRoutesPluginConfig) - The default configuration.  
<a name="CategoryRoutesPlugin.extendConfig"></a>

### CategoryRoutesPlugin.extendConfig(config) ⇒ [<code>CategoryRoutesPluginConfig</code>](#CategoryRoutesPluginConfig)
Create a config that is extended from the default config.

**Kind**: static method of [<code>CategoryRoutesPlugin</code>](#CategoryRoutesPlugin)  
**Returns**: [<code>CategoryRoutesPluginConfig</code>](#CategoryRoutesPluginConfig) - The new configration.  

| Param | Type | Description |
| --- | --- | --- |
| config | [<code>CategoryRoutesPluginConfig</code>](#CategoryRoutesPluginConfig) | The user provided configuration. |

<a name="CategoryRoutesPlugin.validateConfig"></a>

### CategoryRoutesPlugin.validateConfig(config, _context)
Validates the provided configuration for required entries.

**Kind**: static method of [<code>CategoryRoutesPlugin</code>](#CategoryRoutesPlugin)  

| Param | Type | Description |
| --- | --- | --- |
| config | <code>Record.&lt;string, CategoryRoutesPluginConfig&gt;</code> | A configuration object. |
| _context | [<code>CategoryRoutesContext</code>](#CategoryRoutesContext) | A Uttori-like context (unused). |

**Example** *(CategoryRoutesPlugin.validateConfig(config, _context))*  
```js
CategoryRoutesPlugin.validateConfig({ ... });
```
<a name="CategoryRoutesPlugin.register"></a>

### CategoryRoutesPlugin.register(context)
Register the plugin with a provided set of events on a provided Hook system.

**Kind**: static method of [<code>CategoryRoutesPlugin</code>](#CategoryRoutesPlugin)  

| Param | Type | Description |
| --- | --- | --- |
| context | [<code>CategoryRoutesContext</code>](#CategoryRoutesContext) | A Uttori-like context. |

**Example** *(CategoryRoutesPlugin.register(context))*  
```js
const context = {
  hooks: {
    on: (event, callback) => { ... },
  },
  config: {
    [CategoryRoutesPlugin.configKey]: {
      ...,
    },
  },
};
CategoryRoutesPlugin.register(context);
```
<a name="CategoryRoutesPlugin.bindRoutes"></a>

### CategoryRoutesPlugin.bindRoutes(server, context)
Wrapper function for binding category routes.

**Kind**: static method of [<code>CategoryRoutesPlugin</code>](#CategoryRoutesPlugin)  

| Param | Type | Description |
| --- | --- | --- |
| server | <code>module:express~Application</code> | An Express server instance. |
| context | [<code>CategoryRoutesContext</code>](#CategoryRoutesContext) | A Uttori-like context. |

**Example** *(CategoryRoutesPlugin.bindRoutes(plugin))*  
```js
const context = {
  config: {
    [CategoryRoutesPlugin.configKey]: {
      ...,
    },
  },
};
CategoryRoutesPlugin.bindRoutes(plugin);
```
<a name="CategoryRoutesPlugin.getCategorizedDocuments"></a>

### CategoryRoutesPlugin.getCategorizedDocuments(context, category) ⇒ <code>Promise.&lt;Array.&lt;CategoryDocument&gt;&gt;</code>
Returns the documents with the provided category, up to the provided limit.
This will exclude any documents that have slugs in the `config.ignoreSlugs` array.
Hooks:
- `fetch` - `storage-query` - Searched for the categorized documents.

**Kind**: static method of [<code>CategoryRoutesPlugin</code>](#CategoryRoutesPlugin)  
**Returns**: <code>Promise.&lt;Array.&lt;CategoryDocument&gt;&gt;</code> - Promise object that resolves to the array of the documents.  

| Param | Type | Description |
| --- | --- | --- |
| context | [<code>CategoryRoutesContext</code>](#CategoryRoutesContext) | A Uttori-like context. |
| category | <code>string</code> | The category to look for in documents. |

**Example**  
```js
CategoryRoutesPlugin.getCategorizedDocuments('example', 10);
➜ [{ slug: 'example', title: 'Example', content: 'Example content.', categories: ['example'] }]
```
<a name="CategoryRoutesPlugin.buildCategoryTree"></a>

### CategoryRoutesPlugin.buildCategoryTree(categories, separator) ⇒ <code>Record.&lt;string, CategoryTreeNode&gt;</code>
Builds a hierarchical category tree from flat category paths.

**Kind**: static method of [<code>CategoryRoutesPlugin</code>](#CategoryRoutesPlugin)  
**Returns**: <code>Record.&lt;string, CategoryTreeNode&gt;</code> - Hierarchical category tree  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| categories | <code>Array.&lt;string&gt;</code> |  | Array of category paths (e.g., ['parent/child', 'parent/other']) |
| separator | <code>string</code> | <code>&quot;/&quot;</code> | The separator used in hierarchical categories |

<a name="CategoryRoutesPlugin.flattenCategoryTree"></a>

### CategoryRoutesPlugin.flattenCategoryTree(tree, separator) ⇒ [<code>Array.&lt;FlattenedCategory&gt;</code>](#FlattenedCategory)
Flattens a hierarchical category tree into a sorted array.

**Kind**: static method of [<code>CategoryRoutesPlugin</code>](#CategoryRoutesPlugin)  
**Returns**: [<code>Array.&lt;FlattenedCategory&gt;</code>](#FlattenedCategory) - Flattened category array  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| tree | <code>Record.&lt;string, CategoryTreeNode&gt;</code> |  | The category tree |
| separator | <code>string</code> | <code>&quot;/&quot;</code> | The separator used in hierarchical categories |

<a name="CategoryRoutesPlugin.categoryIndexRequestHandler"></a>

### CategoryRoutesPlugin.categoryIndexRequestHandler(context) ⇒ <code>module:express~RequestHandler</code>
Renders the category index page with the `categories` template.
Hooks:
- `filter` - `view-model-category-index` - Passes in the viewModel.

**Kind**: static method of [<code>CategoryRoutesPlugin</code>](#CategoryRoutesPlugin)  
**Returns**: <code>module:express~RequestHandler</code> - The function to pass to Express.  

| Param | Type | Description |
| --- | --- | --- |
| context | [<code>CategoryRoutesContext</code>](#CategoryRoutesContext) | A Uttori-like context. |

<a name="CategoryRoutesPlugin.categoryRequestHandler"></a>

### CategoryRoutesPlugin.categoryRequestHandler(context) ⇒ <code>module:express~RequestHandler</code>
Renders the category detail page with `category` template.
Sets the `X-Robots-Tag` header to `noindex`.
Attempts to pull in the relevant site section for the category if defined in the config site sections.

Hooks:
- `filter` - `view-model-category` - Passes in the viewModel.

**Kind**: static method of [<code>CategoryRoutesPlugin</code>](#CategoryRoutesPlugin)  
**Returns**: <code>module:express~RequestHandler</code> - The function to pass to Express.  

| Param | Type | Description |
| --- | --- | --- |
| context | [<code>CategoryRoutesContext</code>](#CategoryRoutesContext) | A Uttori-like context. |

<a name="CategoryRoutesPlugin.getAllCategories"></a>

### CategoryRoutesPlugin.getAllCategories(context) ⇒ <code>Promise.&lt;Array.&lt;string&gt;&gt;</code>
Returns all available categories from documents.
This is used for auto-completion and category listing.

**Kind**: static method of [<code>CategoryRoutesPlugin</code>](#CategoryRoutesPlugin)  
**Returns**: <code>Promise.&lt;Array.&lt;string&gt;&gt;</code> - Promise object that resolves to the array of all categories.  

| Param | Type | Description |
| --- | --- | --- |
| context | [<code>CategoryRoutesContext</code>](#CategoryRoutesContext) | A Uttori-like context. |

<a name="CategoryRoutesPlugin.categoryApiRequestHandler"></a>

### CategoryRoutesPlugin.categoryApiRequestHandler(context) ⇒ <code>module:express~RequestHandler</code>
Renders the category API that returns all available categories.

**Kind**: static method of [<code>CategoryRoutesPlugin</code>](#CategoryRoutesPlugin)  
**Returns**: <code>module:express~RequestHandler</code> - The function to pass to Express.  

| Param | Type | Description |
| --- | --- | --- |
| context | [<code>CategoryRoutesContext</code>](#CategoryRoutesContext) | A Uttori-like context. |

<a name="DebugLogger"></a>

## DebugLogger ⇒ <code>void</code>
**Kind**: global typedef  

| Param | Type | Description |
| --- | --- | --- |
| ...args | <code>unknown</code> | Debug arguments. |

<a name="CategoryRoutesPluginConfig"></a>

## CategoryRoutesPluginConfig : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| [events] | <code>Record.&lt;string, Array.&lt;string&gt;&gt;</code> | An object whose keys correspond to methods, and contents are events to listen for. |
| [title] | <code>string</code> | The default title for category pages. |
| [limit] | <code>number</code> | The maximum number of documents to return for a category. |
| [middleware] | <code>Record.&lt;string, Array.&lt;module:express~RequestHandler&gt;&gt;</code> | Middleware for category routes. |
| [categoryIndexRoute] | <code>string</code> | A replacement route for the category index route. |
| [categoryRoute] | <code>string</code> | A replacement route for the category show route. |
| [apiRoute] | <code>string</code> | A replacement route for the category index route. |
| [categoryIndexRequestHandler] | [<code>CategoryRoutesRequestHandler</code>](#CategoryRoutesRequestHandler) | A replacement route handler for the category index route. |
| [categoryRequestHandler] | [<code>CategoryRoutesRequestHandler</code>](#CategoryRoutesRequestHandler) | A replacement route handler for the category show route. |
| [apiRequestHandler] | [<code>CategoryRoutesRequestHandler</code>](#CategoryRoutesRequestHandler) | A request handler for the API route that returns all available categories. |
| [categoryField] | <code>string</code> | The document field to use for categories (default: 'categories'). |
| [separator] | <code>string</code> | The separator used in hierarchical categories (default: '/'). |

<a name="CategoryDocument"></a>

## CategoryDocument : <code>UttoriWikiDocument</code>
**Kind**: global typedef  
<a name="CategoryBreadcrumb"></a>

## CategoryBreadcrumb : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | The name of the breadcrumb. |
| path | <code>string</code> | The path to the breadcrumb. |
| isLast | <code>boolean</code> | Whether the breadcrumb is the last in the chain. |

<a name="FlattenedCategory"></a>

## FlattenedCategory : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | The name of the category. |
| fullPath | <code>string</code> | The full path of the category. |
| level | <code>number</code> | The nesting level of the category. |

<a name="CategoryTreeNode"></a>

## CategoryTreeNode : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | The name of the category. |
| fullPath | <code>string</code> | The full path of the category. |
| children | <code>Record.&lt;string, CategoryTreeNode&gt;</code> | The child categories. |
| documents | [<code>Array.&lt;CategoryDocument&gt;</code>](#CategoryDocument) | The documents in the category. |

<a name="CategoryRoutesContext"></a>

## CategoryRoutesContext : <code>UttoriContextWithPluginConfig.&lt;&#x27;uttori-plugin-category-routes&#x27;, CategoryRoutesPluginConfig&gt;</code>
Uttori context narrowed to this plugin's config shape.

**Kind**: global typedef  
<a name="CategoryRoutesRequestHandler"></a>

## CategoryRoutesRequestHandler ⇒ <code>module:express~RequestHandler</code>
Builds an Express handler for a category route.

**Kind**: global typedef  
**Returns**: <code>module:express~RequestHandler</code> - The Express request handler.  

| Param | Type | Description |
| --- | --- | --- |
| context | [<code>CategoryRoutesContext</code>](#CategoryRoutesContext) | A Uttori-like context. |

