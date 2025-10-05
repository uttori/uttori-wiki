## Functions

<dl>
<dt><a href="#debug">debug()</a> : <code>function</code></dt>
<dd></dd>
<dt><a href="#wikiFlash">wikiFlash([key], [value])</a> ⇒ <code>Record.&lt;string, Array.&lt;string&gt;&gt;</code> | <code>Array</code> | <code>boolean</code></dt>
<dd><p>Flash messages are stored in the session.
First, use <code>wikiFlash(key, value)</code> to set a flash message.
Then, on subsequent requests, you can retrieve the message with <code>wikiFlash(key)</code>.</p>
</dd>
<dt><a href="#middleware">middleware(request, _response, next)</a> : <code>module:express~RequestHandler</code></dt>
<dd><p>Return the middleware that adds <code>wikiFlash</code>.</p>
</dd>
</dl>

<a name="debug"></a>

## debug() : <code>function</code>
**Kind**: global function  
<a name="wikiFlash"></a>

## wikiFlash([key], [value]) ⇒ <code>Record.&lt;string, Array.&lt;string&gt;&gt;</code> \| <code>Array</code> \| <code>boolean</code>
Flash messages are stored in the session.
First, use `wikiFlash(key, value)` to set a flash message.
Then, on subsequent requests, you can retrieve the message with `wikiFlash(key)`.

**Kind**: global function  
**Returns**: <code>Record.&lt;string, Array.&lt;string&gt;&gt;</code> \| <code>Array</code> \| <code>boolean</code> - Returns the current flash data, or the data for the given key, or false if no data is found.  
**this**: <code>{{</code>  

| Param | Type | Description |
| --- | --- | --- |
| [key] | <code>string</code> | The key to get or set flash data under. |
| [value] | <code>string</code> | The value to store as flash data. |

<a name="wikiFlash..current"></a>

### wikiFlash~current : <code>Record.&lt;string, Array.&lt;string&gt;&gt;</code>
**Kind**: inner constant of [<code>wikiFlash</code>](#wikiFlash)  
<a name="middleware"></a>

## middleware(request, _response, next) : <code>module:express~RequestHandler</code>
Return the middleware that adds `wikiFlash`.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| request | <code>module:express~Request</code> | The Express Request object. |
| _response | <code>module:express~Response</code> | The Express Response object. |
| next | <code>module:express~NextFunction</code> | The Express Next function. |

