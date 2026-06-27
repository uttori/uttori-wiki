<a name="processQuery"></a>

## processQuery(query, objects) ⇒ <code>Array.&lt;UttoriWikiDocument&gt;</code> \| <code>number</code>
Processes a query string.

**Kind**: global function  
**Returns**: <code>Array.&lt;UttoriWikiDocument&gt;</code> \| <code>number</code> - Returns an array of all matched documents, or a count.  

| Param | Type | Description |
| --- | --- | --- |
| query | <code>string</code> | The SQL-like query to parse. |
| objects | <code>Array.&lt;UttoriWikiDocument&gt;</code> | An array of object to search within. |

**Example**  
```js
processQuery('SELECT name FROM table WHERE age > 1 ORDER BY RANDOM LIMIT 3', [{ ... }, ...]);
➜ [{ ... }, ...]
```

* [processQuery(query, objects)](#processQuery) ⇒ <code>Array.&lt;UttoriWikiDocument&gt;</code> \| <code>number</code>
    * [~output](#processQuery..output) : <code>Array.&lt;UttoriWikiDocument&gt;</code>
    * [~filtered](#processQuery..filtered) : <code>Array.&lt;UttoriWikiDocument&gt;</code>

<a name="processQuery..output"></a>

### processQuery~output : <code>Array.&lt;UttoriWikiDocument&gt;</code>
**Kind**: inner property of [<code>processQuery</code>](#processQuery)  
<a name="processQuery..filtered"></a>

### processQuery~filtered : <code>Array.&lt;UttoriWikiDocument&gt;</code>
**Kind**: inner constant of [<code>processQuery</code>](#processQuery)  
