## Functions

<dl>
<dt><a href="#parsePath">parsePath(path)</a> ⇒</dt>
<dd><p>Parse an Express compatible path into an array containing literal path segments and ParsedPathKey objects.</p>
</dd>
<dt><a href="#prepareTarget">prepareTarget(route, target)</a> ⇒</dt>
<dd><p>The function iterates over the parsed segments of the target.
For each segment, if it&#39;s an object representing a key, it checks against the routeKeyMap to see if the key is present in the route.
If the key is not in the route, it checks if the key is optional or has a default value.
String segments (path elements) are returned as is, while key objects are returned with their modifications (if any).</p>
</dd>
<dt><a href="#buildPath">buildPath(params, route, target)</a> ⇒</dt>
<dd><p>The buildPath function constructs the final path string.
It iterates over the combined segments, assembling the path segment-by-segment.
This function handles the inclusion of parameters and defaults and concatenates the final path.</p>
</dd>
</dl>

<a name="parsePath"></a>

## parsePath(path) ⇒
Parse an Express compatible path into an array containing literal path segments and ParsedPathKey objects.

**Kind**: global function\
**Returns**: The parsed path segments.\

| Param | Description |
| --- | --- |
| path | The path to parse. |

<a name="parsePath..processVariable"></a>

### parsePath~processVariable(innerVariableBuffer)
Processes the collected variable buffer into a key object.

**Kind**: inner method of [<code>parsePath</code>](#parsePath)\

| Param | Description |
| --- | --- |
| innerVariableBuffer | Variable buffer to process. |

<a name="prepareTarget"></a>

## prepareTarget(route, target) ⇒
The function iterates over the parsed segments of the target.
For each segment, if it's an object representing a key, it checks against the routeKeyMap to see if the key is present in the route.
If the key is not in the route, it checks if the key is optional or has a default value.
String segments (path elements) are returned as is, while key objects are returned with their modifications (if any).

**Kind**: global function\
**Returns**: The processed segments, ready to be used for path construction.\

| Param | Description |
| --- | --- |
| route | The route to process. |
| target | The target to process. |

<a name="buildPath"></a>

## buildPath(params, route, target) ⇒
The buildPath function constructs the final path string.
It iterates over the combined segments, assembling the path segment-by-segment.
This function handles the inclusion of parameters and defaults and concatenates the final path.

**Kind**: global function\
**Returns**: The compiled path.\

| Param | Description |
| --- | --- |
| params | The key/value pairs to compile. |
| route | The route to. |
| target | The target to compile. |

## TypeScript declarations

<details>
<summary>View documented types and signatures</summary>

```typescript
import type { ParsedPathKey } from './types/redirect.js';
export type { ParsedPathKey } from './types/redirect.js';
/**
 * Parse an Express compatible path into an array containing literal path segments and ParsedPathKey objects.
 * @param path The path to parse.
 * @returns The parsed path segments.
 */
export declare function parsePath(path: string): (ParsedPathKey | string)[];
/**
 * The function iterates over the parsed segments of the target.
 * For each segment, if it's an object representing a key, it checks against the routeKeyMap to see if the key is present in the route.
 * If the key is not in the route, it checks if the key is optional or has a default value.
 * String segments (path elements) are returned as is, while key objects are returned with their modifications (if any).
 * @param route The route to process.
 * @param target The target to process.
 * @returns The processed segments, ready to be used for path construction.
 */
export declare function prepareTarget(route: string, target: string): (ParsedPathKey | string)[];
/**
 * The buildPath function constructs the final path string.
 * It iterates over the combined segments, assembling the path segment-by-segment.
 * This function handles the inclusion of parameters and defaults and concatenates the final path.
 * @param params The key/value pairs to compile.
 * @param route The route to.
 * @param target The target to compile.
 * @returns The compiled path.
 */
export declare function buildPath(params: Record<string, string | undefined>, route: string, target: string): string;

export interface ParsedPathKey {
    /** The name of the segment variable. */
    name: string;
    /** When true, the segment is optional. */
    optional: boolean;
    /** The default value of the segment, if set. */
    def?: string;
}
```

</details>
