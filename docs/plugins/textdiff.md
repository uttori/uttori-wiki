## Functions

<dl>
<dt><a href="#textHunks">textHunks(x, y, context)</a> ⇒ <code>Array.&lt;TextHunk&gt;</code></dt>
<dd><p>Hunks compares the lines in x and y and returns the changes necessary to convert from one to the
other.
The output is a sequence of hunks that each describe a number of consecutive edits. Hunks include
a number of matching elements before and after the last delete or insert operation.
If x and y are identical, the output has length zero.</p>
</dd>
<dt><a href="#textEdits">textEdits(x, y)</a> ⇒ <code>Array.&lt;TextEdit&gt;</code></dt>
<dd><p>textEdits compares the lines in x and y and returns the changes necessary to convert from one to the
other.
textEdits returns edits for every element in the input. If x and y are identical, the output will
consist of a match edit for every input element.</p>
</dd>
<dt><a href="#unified">unified(x, y, context)</a> ⇒ <code>string</code> | <code>Uint8Array</code></dt>
<dd><p>Unified compares the lines in x and y and returns the changes necessary to convert from one to the other in unified format.</p>
</dd>
<dt><a href="#createTextHunks">createTextHunks(x, y, rx, ry, context)</a> ⇒ <code>Array.&lt;TextHunk&gt;</code></dt>
<dd><p>Creates hunks with context support, based on Go&#39;s rvecs.Hunks implementation</p>
</dd>
<dt><a href="#createTextEditsForRange">createTextEditsForRange(x, y, rx, ry, startX, endX, startY, endY)</a> ⇒ <code>Array.&lt;TextEdit&gt;</code></dt>
<dd></dd>
<dt><a href="#createTextEdits">createTextEdits(x, y, rx, ry)</a> ⇒ <code>Array.&lt;TextEdit&gt;</code></dt>
<dd></dd>
<dt><a href="#numDigits">numDigits(v)</a> ⇒ <code>number</code></dt>
<dd></dd>
</dl>

<a name="textHunks"></a>

## textHunks(x, y, context) ⇒ <code>Array.&lt;TextHunk&gt;</code>
Hunks compares the lines in x and y and returns the changes necessary to convert from one to the
other.
The output is a sequence of hunks that each describe a number of consecutive edits. Hunks include
a number of matching elements before and after the last delete or insert operation.
If x and y are identical, the output has length zero.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| x | <code>string</code> \| <code>Uint8Array</code> | The first text to compare |
| y | <code>string</code> \| <code>Uint8Array</code> | The second text to compare |
| context | <code>number</code> | Number of matching lines to include around changes (default: 3) |

<a name="textHunks..eq"></a>

### textHunks~eq(a, b) ⇒ <code>boolean</code>
**Kind**: inner method of [<code>textHunks</code>](#textHunks)  

| Param | Type |
| --- | --- |
| a | <code>ByteView</code> | 
| b | <code>ByteView</code> | 

<a name="textEdits"></a>

## textEdits(x, y) ⇒ <code>Array.&lt;TextEdit&gt;</code>
textEdits compares the lines in x and y and returns the changes necessary to convert from one to the
other.
textEdits returns edits for every element in the input. If x and y are identical, the output will
consist of a match edit for every input element.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| x | <code>string</code> \| <code>Uint8Array</code> | The first text to compare |
| y | <code>string</code> \| <code>Uint8Array</code> | The second text to compare |

<a name="textEdits..eq"></a>

### textEdits~eq(a, b) ⇒ <code>boolean</code>
**Kind**: inner method of [<code>textEdits</code>](#textEdits)  

| Param | Type |
| --- | --- |
| a | <code>ByteView</code> | 
| b | <code>ByteView</code> | 

<a name="unified"></a>

## unified(x, y, context) ⇒ <code>string</code> \| <code>Uint8Array</code>
Unified compares the lines in x and y and returns the changes necessary to convert from one to the other in unified format.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| x | <code>string</code> \| <code>Uint8Array</code> | The first text to compare |
| y | <code>string</code> \| <code>Uint8Array</code> | The second text to compare |
| context | <code>number</code> | Number of matching lines to include around changes (default: 3) |


* [unified(x, y, context)](#unified) ⇒ <code>string</code> \| <code>Uint8Array</code>
    * [~hunks](#unified..hunks) : <code>Array.&lt;TextHunk&gt;</code>
    * [~eq(a, b)](#unified..eq) ⇒ <code>boolean</code>

<a name="unified..hunks"></a>

### unified~hunks : <code>Array.&lt;TextHunk&gt;</code>
**Kind**: inner constant of [<code>unified</code>](#unified)  
<a name="unified..eq"></a>

### unified~eq(a, b) ⇒ <code>boolean</code>
**Kind**: inner method of [<code>unified</code>](#unified)  

| Param | Type |
| --- | --- |
| a | <code>ByteView</code> | 
| b | <code>ByteView</code> | 

<a name="createTextHunks"></a>

## createTextHunks(x, y, rx, ry, context) ⇒ <code>Array.&lt;TextHunk&gt;</code>
Creates hunks with context support, based on Go's rvecs.Hunks implementation

**Kind**: global function  

| Param | Type |
| --- | --- |
| x | <code>Array.&lt;ByteView&gt;</code> | 
| y | <code>Array.&lt;ByteView&gt;</code> | 
| rx | <code>Array.&lt;boolean&gt;</code> | 
| ry | <code>Array.&lt;boolean&gt;</code> | 
| context | <code>number</code> | 

<a name="createTextHunks..hunks"></a>

### createTextHunks~hunks : <code>Array.&lt;TextHunk&gt;</code>
**Kind**: inner constant of [<code>createTextHunks</code>](#createTextHunks)  
<a name="createTextEditsForRange"></a>

## createTextEditsForRange(x, y, rx, ry, startX, endX, startY, endY) ⇒ <code>Array.&lt;TextEdit&gt;</code>
**Kind**: global function  

| Param | Type |
| --- | --- |
| x | <code>Array.&lt;ByteView&gt;</code> | 
| y | <code>Array.&lt;ByteView&gt;</code> | 
| rx | <code>Array.&lt;boolean&gt;</code> | 
| ry | <code>Array.&lt;boolean&gt;</code> | 
| startX | <code>number</code> | 
| endX | <code>number</code> | 
| startY | <code>number</code> | 
| endY | <code>number</code> | 

<a name="createTextEditsForRange..edits"></a>

### createTextEditsForRange~edits : <code>Array.&lt;TextEdit&gt;</code>
**Kind**: inner constant of [<code>createTextEditsForRange</code>](#createTextEditsForRange)  
<a name="createTextEdits"></a>

## createTextEdits(x, y, rx, ry) ⇒ <code>Array.&lt;TextEdit&gt;</code>
**Kind**: global function  

| Param | Type |
| --- | --- |
| x | <code>Array.&lt;ByteView&gt;</code> | 
| y | <code>Array.&lt;ByteView&gt;</code> | 
| rx | <code>Array.&lt;boolean&gt;</code> | 
| ry | <code>Array.&lt;boolean&gt;</code> | 

<a name="createTextEdits..edits"></a>

### createTextEdits~edits : <code>Array.&lt;TextEdit&gt;</code>
**Kind**: inner constant of [<code>createTextEdits</code>](#createTextEdits)  
<a name="numDigits"></a>

## numDigits(v) ⇒ <code>number</code>
**Kind**: global function  

| Param | Type |
| --- | --- |
| v | <code>number</code> | 

