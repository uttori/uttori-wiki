## Typedefs

<dl>
<dt><a href="#Turn">Turn</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#Memory">Memory</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#Memories">Memories</a> : <code>object</code></dt>
<dd></dd>
</dl>

<a name="Turn"></a>

## Turn : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| user | <code>string</code> | The user's message. |
| [assistant] | <code>string</code> | The assistant's message. |
| ts | <code>number</code> | The timestamp of the turn. |

<a name="Memory"></a>

## Memory : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| summary | <code>string</code> | The summary of the memory, rolling 1 to 3 sentences. |
| last | [<code>Array.&lt;Turn&gt;</code>](#Turn) | The last N turns. |
| [entities] | <code>Record.&lt;string, string&gt;</code> | The optional entities. |

<a name="Memories"></a>

## Memories : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| mem | [<code>Memory</code>](#Memory) | The memory. |
| expires | <code>number</code> | The expiration time. |

