## Functions

<dl>
<dt><a href="#wikiFlash">wikiFlash([key], [value])</a> ⇒</dt>
<dd><p>Flash messages are stored in the session.
First, use <code>wikiFlash(key, value)</code> to set a flash message.
Then, on subsequent requests, you can retrieve the message with <code>wikiFlash(key)</code>.</p>
</dd>
<dt><a href="#middleware">middleware(request, _response, next)</a></dt>
<dd><p>Return the middleware that adds <code>wikiFlash</code>.</p>
</dd>
</dl>

<a name="wikiFlash"></a>

## wikiFlash([key], [value]) ⇒
Flash messages are stored in the session.
First, use `wikiFlash(key, value)` to set a flash message.
Then, on subsequent requests, you can retrieve the message with `wikiFlash(key)`.

**Kind**: global function\
**Returns**: Returns the current flash data, or the data for the given key, or false if no data is found.\

| Param | Description |
| --- | --- |
| [key] | The key to get or set flash data under. |
| [value] | The value to store as flash data. |

<a name="middleware"></a>

## middleware(request, _response, next)
Return the middleware that adds `wikiFlash`.

**Kind**: global function\

| Param | Description |
| --- | --- |
| request | The Express Request object. |
| _response | The Express Response object. |
| next | The Express Next function. |

## TypeScript declarations

<details>
<summary>View documented types and signatures</summary>

```typescript
/**
 * Flash messages are stored in the session.
 * First, use `wikiFlash(key, value)` to set a flash message.
 * Then, on subsequent requests, you can retrieve the message with `wikiFlash(key)`.
 * @param [key] The key to get or set flash data under.
 * @param [value] The value to store as flash data.
 * @returns Returns the current flash data, or the data for the given key, or false if no data is found.
 */
export declare function wikiFlash(this: {
    session?: {
        wikiFlash?: Record<string, string[]>;
    };
}, key?: string, value?: string): Record<string, string[]> | unknown[] | boolean;
/**
 * Return the middleware that adds `wikiFlash`.
 *
 * @param request The Express Request object.
 * @param _response The Express Response object.
 * @param next The Express Next function.
 */
export declare function middleware(request: import('express').Request, _response: import('express').Response, next: import('express').NextFunction): void;
declare const _default: {
    wikiFlash: typeof wikiFlash;
    middleware: typeof middleware;
};
export default _default;
```

</details>
