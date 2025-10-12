## Constants

<dl>
<dt><a href="#Op">Op</a></dt>
<dd><p>Op describes an edit operation.</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#hunks">hunks(x, y, eq, context)</a> ⇒ <code><a href="#Hunk">Array.&lt;Hunk&gt;</a></code></dt>
<dd><p>Compares the contents of x and y using the provided equality comparison and returns the
changes necessary to convert from one to the other.
The output is a sequence of hunks that each describe a number of consecutive edits.
Hunks include a number of matching elements before and after the last delete or insert operation.
If x and y are identical, the output has length zero.
Note that this function has generally worse performance than [Hunks] for diffs with many changes.</p>
</dd>
<dt><a href="#edits">edits(x, y, eq)</a> ⇒ <code><a href="#Edit">Array.&lt;Edit&gt;</a></code></dt>
<dd><p>Compares the contents of x and y using the provided equality comparison and returns the
changes necessary to convert from one to the other.
Returns edits for every element in the input.
If both x and y are identical, the output will consist of a match edit for every input element.
Note that this function has generally worse performance than [Edits] for diffs with many changes.</p>
</dd>
<dt><a href="#createHunks">createHunks(x, y, rx, ry, _context)</a> ⇒ <code><a href="#Hunk">Array.&lt;Hunk&gt;</a></code></dt>
<dd></dd>
<dt><a href="#createEdits">createEdits(x, y, rx, ry)</a> ⇒ <code><a href="#Edit">Array.&lt;Edit&gt;</a></code></dt>
<dd></dd>
<dt><a href="#findChangeBounds">findChangeBounds(x, y, eq)</a> ⇒ <code>InitResult</code></dt>
<dd><p>Simple implementation of findChangeBounds that strips common prefix and suffix.</p>
</dd>
<dt><a href="#diff">diff(x, y, eq)</a> ⇒ <code><a href="#DiffResult">DiffResult</a></code></dt>
<dd><p>Main diff function.</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#Edit">Edit</a> : <code>object</code></dt>
<dd><p>Edit describes a single edit of a diff.</p>
<ul>
<li>For Match, both X and Y contain the matching element.</li>
<li>For Delete, X contains the deleted element and Y is unset (zero value).</li>
<li>For Insert, Y contains the inserted element and X is unset (zero value).</li>
</ul>
</dd>
<dt><a href="#Hunk">Hunk</a> : <code>object</code></dt>
<dd><p>Hunk describes a sequence of consecutive edits.</p>
</dd>
<dt><a href="#EqualityFunction">EqualityFunction</a> ⇒ <code>boolean</code></dt>
<dd></dd>
<dt><a href="#DiffResult">DiffResult</a> : <code>object</code></dt>
<dd></dd>
</dl>

<a name="Op"></a>

## Op
Op describes an edit operation.

**Kind**: global constant  
<a name="hunks"></a>

## hunks(x, y, eq, context) ⇒ [<code>Array.&lt;Hunk&gt;</code>](#Hunk)
Compares the contents of x and y using the provided equality comparison and returns the
changes necessary to convert from one to the other.
The output is a sequence of hunks that each describe a number of consecutive edits.
Hunks include a number of matching elements before and after the last delete or insert operation.
If x and y are identical, the output has length zero.
Note that this function has generally worse performance than [Hunks] for diffs with many changes.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| x | <code>string</code> \| <code>Array.&lt;Uint8Array&gt;</code> | The first array to compare |
| y | <code>string</code> \| <code>Array.&lt;Uint8Array&gt;</code> | The second array to compare |
| eq | [<code>EqualityFunction</code>](#EqualityFunction) | Equality function to compare elements |
| context | <code>number</code> | Number of matching elements to include around changes (default: 3) |

<a name="edits"></a>

## edits(x, y, eq) ⇒ [<code>Array.&lt;Edit&gt;</code>](#Edit)
Compares the contents of x and y using the provided equality comparison and returns the
changes necessary to convert from one to the other.
Returns edits for every element in the input.
If both x and y are identical, the output will consist of a match edit for every input element.
Note that this function has generally worse performance than [Edits] for diffs with many changes.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| x | <code>string</code> \| <code>Array.&lt;Uint8Array&gt;</code> | The first array to compare |
| y | <code>string</code> \| <code>Array.&lt;Uint8Array&gt;</code> | The second array to compare |
| eq | [<code>EqualityFunction</code>](#EqualityFunction) | Equality function to compare elements |

<a name="createHunks"></a>

## createHunks(x, y, rx, ry, _context) ⇒ [<code>Array.&lt;Hunk&gt;</code>](#Hunk)
**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| x | <code>string</code> \| <code>Array.&lt;Uint8Array&gt;</code> | The first array to compare |
| y | <code>string</code> \| <code>Array.&lt;Uint8Array&gt;</code> | The second array to compare |
| rx | <code>Array.&lt;boolean&gt;</code> | The first array of booleans |
| ry | <code>Array.&lt;boolean&gt;</code> | The second array of booleans |
| _context | <code>number</code> | The context |


* [createHunks(x, y, rx, ry, _context)](#createHunks) ⇒ [<code>Array.&lt;Hunk&gt;</code>](#Hunk)
    * [~hunks](#createHunks..hunks) : [<code>Array.&lt;Hunk&gt;</code>](#Hunk)
    * [~edits](#createHunks..edits) : [<code>Array.&lt;Edit&gt;</code>](#Edit)
    * [~edits](#createHunks..edits) : [<code>Array.&lt;Edit&gt;</code>](#Edit)

<a name="createHunks..hunks"></a>

### createHunks~hunks : [<code>Array.&lt;Hunk&gt;</code>](#Hunk)
**Kind**: inner constant of [<code>createHunks</code>](#createHunks)  
<a name="createHunks..edits"></a>

### createHunks~edits : [<code>Array.&lt;Edit&gt;</code>](#Edit)
**Kind**: inner constant of [<code>createHunks</code>](#createHunks)  
<a name="createHunks..edits"></a>

### createHunks~edits : [<code>Array.&lt;Edit&gt;</code>](#Edit)
**Kind**: inner constant of [<code>createHunks</code>](#createHunks)  
<a name="createEdits"></a>

## createEdits(x, y, rx, ry) ⇒ [<code>Array.&lt;Edit&gt;</code>](#Edit)
**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| x | <code>string</code> \| <code>Array.&lt;Uint8Array&gt;</code> | The first array to compare |
| y | <code>string</code> \| <code>Array.&lt;Uint8Array&gt;</code> | The second array to compare |
| rx | <code>Array.&lt;boolean&gt;</code> | The first array of booleans |
| ry | <code>Array.&lt;boolean&gt;</code> | The second array of booleans |

<a name="createEdits..edits"></a>

### createEdits~edits : [<code>Array.&lt;Edit&gt;</code>](#Edit)
**Kind**: inner constant of [<code>createEdits</code>](#createEdits)  
<a name="findChangeBounds"></a>

## findChangeBounds(x, y, eq) ⇒ <code>InitResult</code>
Simple implementation of findChangeBounds that strips common prefix and suffix.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| x | <code>string</code> \| <code>Array.&lt;Uint8Array&gt;</code> | The first array to compare |
| y | <code>string</code> \| <code>Array.&lt;Uint8Array&gt;</code> | The second array to compare |
| eq | [<code>EqualityFunction</code>](#EqualityFunction) | Equality function to compare elements |

<a name="diff"></a>

## diff(x, y, eq) ⇒ [<code>DiffResult</code>](#DiffResult)
Main diff function.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| x | <code>Array.&lt;string&gt;</code> \| <code>Array.&lt;Uint8Array&gt;</code> | The first array to compare |
| y | <code>Array.&lt;string&gt;</code> \| <code>Array.&lt;Uint8Array&gt;</code> | The second array to compare |
| eq | [<code>EqualityFunction</code>](#EqualityFunction) | Equality function to compare elements |


* [diff(x, y, eq)](#diff) ⇒ [<code>DiffResult</code>](#DiffResult)
    * [~x0](#diff..x0) : <code>Array.&lt;number&gt;</code>
    * [~y0](#diff..y0) : <code>Array.&lt;number&gt;</code>
    * [~xidx](#diff..xidx) : <code>Array.&lt;number&gt;</code>
    * [~yidx](#diff..yidx) : <code>Array.&lt;number&gt;</code>
    * [~counts](#diff..counts) : <code>Array.&lt;number&gt;</code>
    * [~elements](#diff..elements) : <code>Array.&lt;Uint8Array&gt;</code>
    * [~m](#diff..m) : <code>Myers.&lt;(string\|Uint8Array)&gt;</code>
    * [~findId(e)](#diff..findId) ⇒ <code>number</code>

<a name="diff..x0"></a>

### diff~x0 : <code>Array.&lt;number&gt;</code>
**Kind**: inner constant of [<code>diff</code>](#diff)  
<a name="diff..y0"></a>

### diff~y0 : <code>Array.&lt;number&gt;</code>
**Kind**: inner constant of [<code>diff</code>](#diff)  
<a name="diff..xidx"></a>

### diff~xidx : <code>Array.&lt;number&gt;</code>
**Kind**: inner constant of [<code>diff</code>](#diff)  
<a name="diff..yidx"></a>

### diff~yidx : <code>Array.&lt;number&gt;</code>
**Kind**: inner constant of [<code>diff</code>](#diff)  
<a name="diff..counts"></a>

### diff~counts : <code>Array.&lt;number&gt;</code>
**Kind**: inner constant of [<code>diff</code>](#diff)  
<a name="diff..elements"></a>

### diff~elements : <code>Array.&lt;Uint8Array&gt;</code>
**Kind**: inner constant of [<code>diff</code>](#diff)  
<a name="diff..m"></a>

### diff~m : <code>Myers.&lt;(string\|Uint8Array)&gt;</code>
**Kind**: inner constant of [<code>diff</code>](#diff)  
<a name="diff..findId"></a>

### diff~findId(e) ⇒ <code>number</code>
**Kind**: inner method of [<code>diff</code>](#diff)  

| Param | Type |
| --- | --- |
| e | <code>string</code> \| <code>Uint8Array</code> | 

<a name="Edit"></a>

## Edit : <code>object</code>
Edit describes a single edit of a diff.
- For Match, both X and Y contain the matching element.
- For Delete, X contains the deleted element and Y is unset (zero value).
- For Insert, Y contains the inserted element and X is unset (zero value).

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| op | <code>number</code> | The edit operation: Match = 0, Delete = 1, Insert = 2. |
| x | <code>string</code> \| <code>Uint8Array</code> | The element from the left slice. |
| y | <code>string</code> \| <code>Uint8Array</code> | The element from the right slice. |

<a name="Hunk"></a>

## Hunk : <code>object</code>
Hunk describes a sequence of consecutive edits.

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| posX | <code>number</code> | The start position in x. |
| endX | <code>number</code> | The end position in x. |
| posY | <code>number</code> | The start position in y. |
| endY | <code>number</code> | The end position in y. |
| edits | [<code>Array.&lt;Edit&gt;</code>](#Edit) | The edits to transform x[PosX:EndX] to y[PosY:EndY]. |

<a name="EqualityFunction"></a>

## EqualityFunction ⇒ <code>boolean</code>
**Kind**: global typedef  
**Returns**: <code>boolean</code> - Whether the two elements are equal  

| Param | Type | Description |
| --- | --- | --- |
| a | <code>string</code> \| <code>Uint8Array</code> | The first element to compare |
| b | <code>string</code> \| <code>Uint8Array</code> | The second element to compare |

<a name="DiffResult"></a>

## DiffResult : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| rx | <code>Array.&lt;boolean&gt;</code> | The first array of booleans |
| ry | <code>Array.&lt;boolean&gt;</code> | The second array of booleans |

