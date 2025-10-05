## Functions

<dl>
<dt><a href="#parsePath">parsePath(path)</a> ⇒ <code>Array.&lt;(ParsedPathKey|string)&gt;</code></dt>
<dd><p>Parse an Express compatible path into an array containing literal path segments and ParsedPathKey objects.</p>
</dd>
<dt><a href="#prepareTarget">prepareTarget(route, target)</a> ⇒ <code>Array.&lt;(ParsedPathKey|string)&gt;</code></dt>
<dd><p>The function iterates over the parsed segments of the target.
For each segment, if it&#39;s an object representing a key, it checks against the routeKeyMap to see if the key is present in the route.
If the key is not in the route, it checks if the key is optional or has a default value.
String segments (path elements) are returned as is, while key objects are returned with their modifications (if any).</p>
</dd>
<dt><a href="#buildPath">buildPath(params, route, target)</a> ⇒ <code>string</code></dt>
<dd><p>The buildPath function constructs the final path string.
It iterates over the combined segments, assembling the path segment-by-segment.
This function handles the inclusion of parameters and defaults and concatenates the final path.</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#ParsedPathKey">ParsedPathKey</a> : <code>object</code></dt>
<dd></dd>
</dl>

<a name="parsePath"></a>

## parsePath(path) ⇒ <code>Array.&lt;(ParsedPathKey\|string)&gt;</code>
Parse an Express compatible path into an array containing literal path segments and ParsedPathKey objects.

**Kind**: global function  
**Returns**: <code>Array.&lt;(ParsedPathKey\|string)&gt;</code> - The parsed path segments.  

| Param | Type | Description |
| --- | --- | --- |
| path | <code>string</code> | The path to parse. |

<a name="parsePath..processVariable"></a>

### parsePath~processVariable(innerVariableBuffer)
Processes the collected variable buffer into a key object.

**Kind**: inner method of [<code>parsePath</code>](#parsePath)  

| Param | Type | Description |
| --- | --- | --- |
| innerVariableBuffer | <code>string</code> | Variable buffer to process. |

<a name="prepareTarget"></a>

## prepareTarget(route, target) ⇒ <code>Array.&lt;(ParsedPathKey\|string)&gt;</code>
The function iterates over the parsed segments of the target.
For each segment, if it's an object representing a key, it checks against the routeKeyMap to see if the key is present in the route.
If the key is not in the route, it checks if the key is optional or has a default value.
String segments (path elements) are returned as is, while key objects are returned with their modifications (if any).

**Kind**: global function  
**Returns**: <code>Array.&lt;(ParsedPathKey\|string)&gt;</code> - The processed segments, ready to be used for path construction.  

| Param | Type | Description |
| --- | --- | --- |
| route | <code>string</code> | The route to process. |
| target | <code>string</code> | The target to process. |

<a name="prepareTarget..routeKeyMap"></a>

### prepareTarget~routeKeyMap : <code>Map.&lt;string, ParsedPathKey&gt;</code>
**Kind**: inner constant of [<code>prepareTarget</code>](#prepareTarget)  
<a name="buildPath"></a>

## buildPath(params, route, target) ⇒ <code>string</code>
The buildPath function constructs the final path string.
It iterates over the combined segments, assembling the path segment-by-segment.
This function handles the inclusion of parameters and defaults and concatenates the final path.

**Kind**: global function  
**Returns**: <code>string</code> - The compiled path.  

| Param | Type | Description |
| --- | --- | --- |
| params | <code>Record.&lt;string, (string\|undefined)&gt;</code> | The key/value pairs to compile. |
| route | <code>string</code> | The route to. |
| target | <code>string</code> | The target to compile. |

<a name="ParsedPathKey"></a>

## ParsedPathKey : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | The name of the segment variable. |
| optional | <code>boolean</code> | When true, the segment is optional. |
| [def] | <code>string</code> | The default value of the segment, if set. |

