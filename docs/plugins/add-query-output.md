## Classes

<dl>
<dt><a href="#AddQueryOutputToViewModel">AddQueryOutputToViewModel</a></dt>
<dd><p>Add tags to the view model.</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#AddQueryOutputToViewModelQuery">AddQueryOutputToViewModelQuery</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#AddQueryOutputToViewModelConfig">AddQueryOutputToViewModelConfig</a> : <code>object</code></dt>
<dd></dd>
</dl>

<a name="AddQueryOutputToViewModel"></a>

## AddQueryOutputToViewModel
Add tags to the view model.

**Kind**: global class  

* [AddQueryOutputToViewModel](#AddQueryOutputToViewModel)
    * [new AddQueryOutputToViewModel()](#new_AddQueryOutputToViewModel_new)
    * [.configKey](#AddQueryOutputToViewModel.configKey) ⇒ <code>string</code>
    * [.defaultConfig()](#AddQueryOutputToViewModel.defaultConfig) ⇒ [<code>Partial.&lt;AddQueryOutputToViewModelConfig&gt;</code>](#AddQueryOutputToViewModelConfig)
    * [.validateConfig(config, _context)](#AddQueryOutputToViewModel.validateConfig)
    * [.register(context)](#AddQueryOutputToViewModel.register)
    * [.callbackCurry(eventLabel, viewModel, context)](#AddQueryOutputToViewModel.callbackCurry) ⇒ <code>Promise.&lt;T&gt;</code>
    * [.callback(eventLabel)](#AddQueryOutputToViewModel.callback) ⇒ <code>AddQueryOutputToViewModelCallback</code>

<a name="new_AddQueryOutputToViewModel_new"></a>

### new AddQueryOutputToViewModel()
**Example** *(AddQueryOutputToViewModel)*  
```js
const viewModel = AddQueryOutputToViewModel.callback(viewModel, context);
```
<a name="AddQueryOutputToViewModel.configKey"></a>

### AddQueryOutputToViewModel.configKey ⇒ <code>string</code>
The configuration key for plugin to look for in the provided configuration.

**Kind**: static property of [<code>AddQueryOutputToViewModel</code>](#AddQueryOutputToViewModel)  
**Returns**: <code>string</code> - The configuration key.  
**Example** *(AddQueryOutputToViewModel.configKey)*  
```js
const config = { ...AddQueryOutputToViewModel.defaultConfig(), ...context.config[AddQueryOutputToViewModel.configKey] };
```
<a name="AddQueryOutputToViewModel.defaultConfig"></a>

### AddQueryOutputToViewModel.defaultConfig() ⇒ [<code>Partial.&lt;AddQueryOutputToViewModelConfig&gt;</code>](#AddQueryOutputToViewModelConfig)
The default configuration.

**Kind**: static method of [<code>AddQueryOutputToViewModel</code>](#AddQueryOutputToViewModel)  
**Returns**: [<code>Partial.&lt;AddQueryOutputToViewModelConfig&gt;</code>](#AddQueryOutputToViewModelConfig) - The configuration.  
**Example** *(AddQueryOutputToViewModel.defaultConfig())*  
```js
const config = { ...AddQueryOutputToViewModel.defaultConfig(), ...context.config[AddQueryOutputToViewModel.configKey] };
```
<a name="AddQueryOutputToViewModel.validateConfig"></a>

### AddQueryOutputToViewModel.validateConfig(config, _context)
Validates the provided configuration for required entries.

**Kind**: static method of [<code>AddQueryOutputToViewModel</code>](#AddQueryOutputToViewModel)  

| Param | Type | Description |
| --- | --- | --- |
| config | <code>Record.&lt;string, AddQueryOutputToViewModelConfig&gt;</code> | A configuration object. |
| _context | <code>object</code> | A Uttori-like context (unused). |

**Example** *(AddQueryOutputToViewModel.validateConfig(config, _context))*  
```js
AddQueryOutputToViewModel.validateConfig({ ... });
```
<a name="AddQueryOutputToViewModel.register"></a>

### AddQueryOutputToViewModel.register(context)
Register the plugin with a provided set of events on a provided Hook system.

**Kind**: static method of [<code>AddQueryOutputToViewModel</code>](#AddQueryOutputToViewModel)  

| Param | Type | Description |
| --- | --- | --- |
| context | <code>UttoriContext</code> | A Uttori-like context. |

**Example** *(AddQueryOutputToViewModel.register(context))*  
```js
const context = {
  hooks: {
    on: (event, callback) => { ... },
  },
  config: {
    [AddQueryOutputToViewModel.configKey]: {
      ...,
      events: {
        callback: ['document-save', 'document-delete'],
        validateConfig: ['validate-config'],
      },
      queries: [...],
    },
  },
};
AddQueryOutputToViewModel.register(context);
```
<a name="AddQueryOutputToViewModel.callbackCurry"></a>

### AddQueryOutputToViewModel.callbackCurry(eventLabel, viewModel, context) ⇒ <code>Promise.&lt;T&gt;</code>
Queries for related documents based on similar tags and searches the storage provider.

**Kind**: static method of [<code>AddQueryOutputToViewModel</code>](#AddQueryOutputToViewModel)  
**Returns**: <code>Promise.&lt;T&gt;</code> - The provided view-model document.  

| Param | Type | Description |
| --- | --- | --- |
| eventLabel | <code>string</code> | The event label to run queries for. |
| viewModel | <code>T</code> | A Uttori view-model object. |
| context | <code>UttoriContext</code> | A Uttori-like context. |

**Example** *(AddQueryOutputToViewModel.callback(viewModel, context))*  
```js
const context = {
  config: {
    [AddQueryOutputToViewModel.configKey]: {
      queries: [...],
    },
  },
  hooks: {
    on: (event) => { ... },
    fetch: (event, query) => { ... },
  },
};
AddQueryOutputToViewModel.callback(viewModel, context);
```
<a name="AddQueryOutputToViewModel.callback"></a>

### AddQueryOutputToViewModel.callback(eventLabel) ⇒ <code>AddQueryOutputToViewModelCallback</code>
Curry the hook function to take the current event label.

**Kind**: static method of [<code>AddQueryOutputToViewModel</code>](#AddQueryOutputToViewModel)  
**Returns**: <code>AddQueryOutputToViewModelCallback</code> - The provided view-model document.  

| Param | Type | Description |
| --- | --- | --- |
| eventLabel | <code>string</code> | The event label to run queries for. |

**Example** *(AddQueryOutputToViewModel.callback(eventLabel))*  
```js
```
<a name="AddQueryOutputToViewModelQuery"></a>

## AddQueryOutputToViewModelQuery : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| [query] | <code>string</code> | The query to be run. |
| key | <code>string</code> | The key to add the query output to. |
| fallback | <code>Array.&lt;object&gt;</code> | The fallback value to use if the query fails. |
| [format] | <code>AddQueryOutputToViewModelFormatFunction</code> | An optional function to format the query output. |
| [queryFunction] | <code>AddQueryOutputToViewModelQueryFunction</code> | An optional custom function to execut the query. |

**Example** *(Query with a custom function)*  
```js
{
  query: 'query',
  key: 'key',
  fallback: [],
  format: (results) => results.map((result) => result.slug),
  queryFunction: async (target, context) => {
    const ignoreSlugs = ['home-page'];
    const [popular] = await context.hooks.fetch('popular-documents', { limit: 5 }, context);
    const slugs = `"${popular.map(({ slug }) => slug).join('", "')}"`;
    const query = `SELECT 'slug', 'title' FROM documents WHERE slug NOT_IN (${ignoreSlugs}) AND slug IN (${slugs}) ORDER BY updateDate DESC LIMIT 5`;
    const [results] = await context.hooks.fetch('storage-query', query);
    return [results];
  },
}
```
**Example** *(Query with a formatting function)*  
```js
{
  key: 'tags',
  query: `SELECT tags FROM documents WHERE slug NOT_IN ("${ignoreSlugs.join('", "')}") ORDER BY id ASC LIMIT -1`,
  format: (tags) => [...new Set(tags.flatMap((t) => t.tags))].filter(Boolean).sort((a, b) => a.localeCompare(b)),
  fallback: [],
}
```
<a name="AddQueryOutputToViewModelConfig"></a>

## AddQueryOutputToViewModelConfig : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| queries | <code>Record.&lt;string, Array.&lt;AddQueryOutputToViewModelQuery&gt;&gt;</code> | The array of quieries to be run and returned that will be added to the passed in object and returned with the querie output added. |
| events | <code>Record.&lt;string, Array.&lt;string&gt;&gt;</code> | An object whose keys correspong to methods, and contents are events to listen for. |

