## Functions

<dl>
<dt><a href="#splitLines">splitLines(text)</a> ⇒ <code>Array.&lt;string&gt;</code></dt>
<dd><p>Splits text into lines, preserving newline characters</p>
</dd>
<dt><a href="#textHunks">textHunks(x, y, context)</a> ⇒ <code><a href="#TextHunk">Array.&lt;TextHunk&gt;</a></code></dt>
<dd><p>Hunks compares the lines in x and y and returns the changes necessary to convert from one to the other.
The output is a sequence of hunks that each describe a number of consecutive edits.
Hunks include a number of matching elements before and after the last delete or insert operation.
If x and y are identical, the output has length zero.</p>
</dd>
<dt><a href="#textEdits">textEdits(x, y)</a> ⇒ <code><a href="#TextEdit">Array.&lt;TextEdit&gt;</a></code></dt>
<dd><p>textEdits compares the lines in x and y and returns the changes necessary to convert from one to the other.
textEdits returns edits for every element in the input. If x and y are identical, the output will consist of a match edit for every input element.</p>
</dd>
<dt><a href="#unified">unified(x, y, context)</a> ⇒ <code>string</code></dt>
<dd><p>Unified compares the lines in x and y and returns the changes necessary to convert from one to the other in unified format.</p>
</dd>
<dt><a href="#createTextHunks">createTextHunks(x, y, rx, ry, context)</a> ⇒ <code><a href="#TextHunk">Array.&lt;TextHunk&gt;</a></code></dt>
<dd><p>Creates hunks with context support, based on Go&#39;s rvecs.Hunks implementation</p>
</dd>
<dt><a href="#createTextEditsForRange">createTextEditsForRange(x, y, rx, ry, startX, endX, startY, endY)</a> ⇒ <code><a href="#TextEdit">Array.&lt;TextEdit&gt;</a></code></dt>
<dd></dd>
<dt><a href="#createTextEdits">createTextEdits(x, y, rx, ry)</a> ⇒ <code><a href="#TextEdit">Array.&lt;TextEdit&gt;</a></code></dt>
<dd></dd>
<dt><a href="#escapeHtml">escapeHtml(str)</a> ⇒ <code>string</code></dt>
<dd><p>Escapes HTML special characters</p>
</dd>
<dt><a href="#htmlTable">htmlTable(x, y, context)</a> ⇒ <code>string</code></dt>
<dd><p>htmlTable compares the lines in x and y and returns an HTML table showing the differences.</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#TextEdit">TextEdit</a> : <code>object</code></dt>
<dd><p>Edit describes a single edit of a line-by-line diff.</p>
</dd>
<dt><a href="#TextHunk">TextHunk</a> : <code>object</code></dt>
<dd><p>Hunk describes a sequence of consecutive edits.</p>
</dd>
</dl>

<a name="splitLines"></a>

## splitLines(text) ⇒ <code>Array.&lt;string&gt;</code>
Splits text into lines, preserving newline characters

**Kind**: global function  
**Returns**: <code>Array.&lt;string&gt;</code> - Array of lines with newlines preserved  

| Param | Type | Description |
| --- | --- | --- |
| text | <code>string</code> | The text to split |

<a name="textHunks"></a>

## textHunks(x, y, context) ⇒ [<code>Array.&lt;TextHunk&gt;</code>](#TextHunk)
Hunks compares the lines in x and y and returns the changes necessary to convert from one to the other.
The output is a sequence of hunks that each describe a number of consecutive edits.
Hunks include a number of matching elements before and after the last delete or insert operation.
If x and y are identical, the output has length zero.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| x | <code>string</code> | The first text to compare |
| y | <code>string</code> | The second text to compare |
| context | <code>number</code> | Number of matching lines to include around changes (default: 3) |

<a name="textEdits"></a>

## textEdits(x, y) ⇒ [<code>Array.&lt;TextEdit&gt;</code>](#TextEdit)
textEdits compares the lines in x and y and returns the changes necessary to convert from one to the other.
textEdits returns edits for every element in the input. If x and y are identical, the output will consist of a match edit for every input element.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| x | <code>string</code> | The first text to compare |
| y | <code>string</code> | The second text to compare |

<a name="unified"></a>

## unified(x, y, context) ⇒ <code>string</code>
Unified compares the lines in x and y and returns the changes necessary to convert from one to the other in unified format.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| x | <code>string</code> | The first text to compare |
| y | <code>string</code> | The second text to compare |
| context | <code>number</code> | Number of matching lines to include around changes (default: 3) |

<a name="unified..hunks"></a>

### unified~hunks : [<code>Array.&lt;TextHunk&gt;</code>](#TextHunk)
**Kind**: inner constant of [<code>unified</code>](#unified)  
<a name="createTextHunks"></a>

## createTextHunks(x, y, rx, ry, context) ⇒ [<code>Array.&lt;TextHunk&gt;</code>](#TextHunk)
Creates hunks with context support, based on Go's rvecs.Hunks implementation

**Kind**: global function  

| Param | Type |
| --- | --- |
| x | <code>Array.&lt;string&gt;</code> | 
| y | <code>Array.&lt;string&gt;</code> | 
| rx | <code>Array.&lt;boolean&gt;</code> | 
| ry | <code>Array.&lt;boolean&gt;</code> | 
| context | <code>number</code> | 

<a name="createTextHunks..hunks"></a>

### createTextHunks~hunks : [<code>Array.&lt;TextHunk&gt;</code>](#TextHunk)
**Kind**: inner constant of [<code>createTextHunks</code>](#createTextHunks)  
<a name="createTextEditsForRange"></a>

## createTextEditsForRange(x, y, rx, ry, startX, endX, startY, endY) ⇒ [<code>Array.&lt;TextEdit&gt;</code>](#TextEdit)
**Kind**: global function  

| Param | Type |
| --- | --- |
| x | <code>Array.&lt;string&gt;</code> | 
| y | <code>Array.&lt;string&gt;</code> | 
| rx | <code>Array.&lt;boolean&gt;</code> | 
| ry | <code>Array.&lt;boolean&gt;</code> | 
| startX | <code>number</code> | 
| endX | <code>number</code> | 
| startY | <code>number</code> | 
| endY | <code>number</code> | 

<a name="createTextEditsForRange..edits"></a>

### createTextEditsForRange~edits : [<code>Array.&lt;TextEdit&gt;</code>](#TextEdit)
**Kind**: inner constant of [<code>createTextEditsForRange</code>](#createTextEditsForRange)  
<a name="createTextEdits"></a>

## createTextEdits(x, y, rx, ry) ⇒ [<code>Array.&lt;TextEdit&gt;</code>](#TextEdit)
**Kind**: global function  

| Param | Type |
| --- | --- |
| x | <code>Array.&lt;string&gt;</code> | 
| y | <code>Array.&lt;string&gt;</code> | 
| rx | <code>Array.&lt;boolean&gt;</code> | 
| ry | <code>Array.&lt;boolean&gt;</code> | 

<a name="createTextEdits..edits"></a>

### createTextEdits~edits : [<code>Array.&lt;TextEdit&gt;</code>](#TextEdit)
**Kind**: inner constant of [<code>createTextEdits</code>](#createTextEdits)  
<a name="escapeHtml"></a>

## escapeHtml(str) ⇒ <code>string</code>
Escapes HTML special characters

**Kind**: global function  

| Param | Type |
| --- | --- |
| str | <code>string</code> | 

<a name="htmlTable"></a>

## htmlTable(x, y, context) ⇒ <code>string</code>
htmlTable compares the lines in x and y and returns an HTML table showing the differences.

**Kind**: global function  
**Returns**: <code>string</code> - HTML table string  

| Param | Type | Description |
| --- | --- | --- |
| x | <code>string</code> | The first text to compare (old version) |
| y | <code>string</code> | The second text to compare (new version) |
| context | <code>number</code> | Number of matching lines to include around changes (default: 3) |


* [htmlTable(x, y, context)](#htmlTable) ⇒ <code>string</code>
    * [~hunks](#htmlTable..hunks) : [<code>Array.&lt;TextHunk&gt;</code>](#TextHunk)
    * [~edit](#htmlTable..edit) : [<code>TextEdit</code>](#TextEdit)

<a name="htmlTable..hunks"></a>

### htmlTable~hunks : [<code>Array.&lt;TextHunk&gt;</code>](#TextHunk)
**Kind**: inner constant of [<code>htmlTable</code>](#htmlTable)  
<a name="htmlTable..edit"></a>

### htmlTable~edit : [<code>TextEdit</code>](#TextEdit)
**Kind**: inner constant of [<code>htmlTable</code>](#htmlTable)  
<a name="TextEdit"></a>

## TextEdit : <code>object</code>
Edit describes a single edit of a line-by-line diff.

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| op | <code>number</code> | Edit operation |
| line | <code>string</code> | Line, including newline character (if any) |

<a name="TextHunk"></a>

## TextHunk : <code>object</code>
Hunk describes a sequence of consecutive edits.

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| posX | <code>number</code> | Start line in x (zero-based). |
| endX | <code>number</code> | End line in x (zero-based). |
| posY | <code>number</code> | Start line in y (zero-based). |
| endY | <code>number</code> | End line in y (zero-based). |
| edits | [<code>Array.&lt;TextEdit&gt;</code>](#TextEdit) | Edits to transform x lines PosX..EndX to y lines PosY..EndY |

