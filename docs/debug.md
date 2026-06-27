## Functions

<dl>
<dt><a href="#createDebugLogger">createDebugLogger()</a> : <code><a href="#CreateDebugLogger">CreateDebugLogger</a></code></dt>
<dd></dd>
<dt><a href="#createDebug">createDebug(namespace)</a> ⇒ <code><a href="#DebugLogger">DebugLogger</a></code></dt>
<dd><p>Create a namespaced debug logger.</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#DebugLogger">DebugLogger</a> ⇒ <code>void</code></dt>
<dd></dd>
<dt><a href="#CreateDebugLogger">CreateDebugLogger</a> ⇒ <code><a href="#DebugLogger">DebugLogger</a></code></dt>
<dd></dd>
</dl>

<a name="createDebugLogger"></a>

## createDebugLogger() : [<code>CreateDebugLogger</code>](#CreateDebugLogger)
**Kind**: global function  
<a name="createDebug"></a>

## createDebug(namespace) ⇒ [<code>DebugLogger</code>](#DebugLogger)
Create a namespaced debug logger.

**Kind**: global function  
**Returns**: [<code>DebugLogger</code>](#DebugLogger) - The debug logger, or a noop logger when debug is unavailable.  

| Param | Type | Description |
| --- | --- | --- |
| namespace | <code>string</code> | The debug namespace. |

<a name="DebugLogger"></a>

## DebugLogger ⇒ <code>void</code>
**Kind**: global typedef  

| Param | Type | Description |
| --- | --- | --- |
| ...args | <code>unknown</code> | Debug arguments. |

<a name="CreateDebugLogger"></a>

## CreateDebugLogger ⇒ [<code>DebugLogger</code>](#DebugLogger)
**Kind**: global typedef  

| Param | Type | Description |
| --- | --- | --- |
| namespace | <code>string</code> | The debug namespace. |

