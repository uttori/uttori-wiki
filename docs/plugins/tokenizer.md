## Classes

<dl>
<dt><a href="#Tokenizer">Tokenizer</a></dt>
<dd><p>Parse a string into a token structure.
Create an instance of this class for each new string you wish to parse.</p>
</dd>
<dt><a href="#TokenizeThis">TokenizeThis</a></dt>
<dd><p>Takes in the config, processes it, and creates tokenizer instances based on that config.</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#sortTokenizableSubstrings">sortTokenizableSubstrings(a, b)</a> ⇒ <code>number</code></dt>
<dd><p>Sorts the tokenizable substrings by their length DESC.</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#TokenizeThisConfig">TokenizeThisConfig</a> : <code>object</code></dt>
<dd></dd>
</dl>

<a name="Tokenizer"></a>

## Tokenizer
Parse a string into a token structure.
Create an instance of this class for each new string you wish to parse.

**Kind**: global class  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| factory | [<code>TokenizeThis</code>](#TokenizeThis) | Holds the processed configuration. |
| str | <code>string</code> | The string to tokenize. |
| forEachToken | <code>function</code> | The function to call for teach token. |
| previousCharacter | <code>string</code> | The previous character consumed. |
| toMatch | <code>string</code> | The current quote to match. |
| currentToken | <code>string</code> | The current token being created. |
| modeStack | <code>Array.&lt;string&gt;</code> | Keeps track of the current "mode" of tokenization. The tokenization rules are different depending if you are tokenizing an explicit string (surrounded by quotes), versus a non-explicit string (not surrounded by quotes). |


* [Tokenizer](#Tokenizer)
    * [new Tokenizer(factory, str, forEachToken)](#new_Tokenizer_new)
    * [.factory](#Tokenizer+factory) : [<code>TokenizeThis</code>](#TokenizeThis)
    * [.str](#Tokenizer+str) : <code>string</code>
    * [.forEachToken](#Tokenizer+forEachToken) : <code>function</code>
    * [.previousCharacter](#Tokenizer+previousCharacter) : <code>string</code>
    * [.toMatch](#Tokenizer+toMatch) : <code>string</code>
    * [.currentToken](#Tokenizer+currentToken) : <code>string</code>
    * [.modeStack](#Tokenizer+modeStack) : <code>Array.&lt;(&#x27;modeNone&#x27;\|&#x27;modeDefault&#x27;\|&#x27;modeMatch&#x27;)&gt;</code>
    * [.getCurrentMode()](#Tokenizer+getCurrentMode) ⇒ <code>&#x27;modeNone&#x27;</code> \| <code>&#x27;modeDefault&#x27;</code> \| <code>&#x27;modeMatch&#x27;</code> \| <code>string</code>
    * [.setCurrentMode(mode)](#Tokenizer+setCurrentMode) ⇒ <code>number</code>
    * [.completeCurrentMode()](#Tokenizer+completeCurrentMode) ⇒ <code>string</code> \| <code>undefined</code>
    * [.push(token)](#Tokenizer+push)
    * [.convertToken(token)](#Tokenizer+convertToken) ⇒ <code>null</code> \| <code>true</code> \| <code>false</code> \| <code>number</code> \| <code>string</code>
    * [.tokenize()](#Tokenizer+tokenize)
    * [.consume(character)](#Tokenizer+consume)
    * [.MODE_NONE(character)](#Tokenizer+MODE_NONE)
    * [.MODE_DEFAULT(character)](#Tokenizer+MODE_DEFAULT) ⇒ <code>string</code> \| <code>undefined</code>
    * [.pushDefaultModeTokenizables()](#Tokenizer+pushDefaultModeTokenizables)
    * [.MODE_MATCH(character)](#Tokenizer+MODE_MATCH) ⇒ <code>string</code> \| <code>undefined</code>

<a name="new_Tokenizer_new"></a>

### new Tokenizer(factory, str, forEachToken)

| Param | Type | Description |
| --- | --- | --- |
| factory | [<code>TokenizeThis</code>](#TokenizeThis) | Holds the processed configuration. |
| str | <code>string</code> | The string to tokenize. |
| forEachToken | <code>function</code> | The function to call for teach token. |

**Example** *(Init Tokenizer)*  
```js
const tokenizerInstance = new Tokenizer(this, str, forEachToken);
return tokenizerInstance.tokenize();
```
<a name="Tokenizer+factory"></a>

### tokenizer.factory : [<code>TokenizeThis</code>](#TokenizeThis)
Holds the processed configuration.

**Kind**: instance property of [<code>Tokenizer</code>](#Tokenizer)  
<a name="Tokenizer+str"></a>

### tokenizer.str : <code>string</code>
The string to tokenize.

**Kind**: instance property of [<code>Tokenizer</code>](#Tokenizer)  
<a name="Tokenizer+forEachToken"></a>

### tokenizer.forEachToken : <code>function</code>
The function to call for teach token.

**Kind**: instance property of [<code>Tokenizer</code>](#Tokenizer)  
<a name="Tokenizer+previousCharacter"></a>

### tokenizer.previousCharacter : <code>string</code>
The previous character consumed.

**Kind**: instance property of [<code>Tokenizer</code>](#Tokenizer)  
<a name="Tokenizer+toMatch"></a>

### tokenizer.toMatch : <code>string</code>
The current quote to match.

**Kind**: instance property of [<code>Tokenizer</code>](#Tokenizer)  
<a name="Tokenizer+currentToken"></a>

### tokenizer.currentToken : <code>string</code>
The current token being created.

**Kind**: instance property of [<code>Tokenizer</code>](#Tokenizer)  
<a name="Tokenizer+modeStack"></a>

### tokenizer.modeStack : <code>Array.&lt;(&#x27;modeNone&#x27;\|&#x27;modeDefault&#x27;\|&#x27;modeMatch&#x27;)&gt;</code>
Keeps track of the current "mode" of tokenization. The tokenization rules are different depending if you are tokenizing an explicit string (surrounded by quotes), versus a non-explicit string (not surrounded by quotes).

**Kind**: instance property of [<code>Tokenizer</code>](#Tokenizer)  
<a name="Tokenizer+getCurrentMode"></a>

### tokenizer.getCurrentMode() ⇒ <code>&#x27;modeNone&#x27;</code> \| <code>&#x27;modeDefault&#x27;</code> \| <code>&#x27;modeMatch&#x27;</code> \| <code>string</code>
Get the current mode from the stack.

**Kind**: instance method of [<code>Tokenizer</code>](#Tokenizer)  
**Returns**: <code>&#x27;modeNone&#x27;</code> \| <code>&#x27;modeDefault&#x27;</code> \| <code>&#x27;modeMatch&#x27;</code> \| <code>string</code> - The current mode from the stack.  
<a name="Tokenizer+setCurrentMode"></a>

### tokenizer.setCurrentMode(mode) ⇒ <code>number</code>
Set the current mode on the stack.

**Kind**: instance method of [<code>Tokenizer</code>](#Tokenizer)  
**Returns**: <code>number</code> - The size of the mode stack.  

| Param | Type | Description |
| --- | --- | --- |
| mode | <code>&#x27;modeNone&#x27;</code> \| <code>&#x27;modeDefault&#x27;</code> \| <code>&#x27;modeMatch&#x27;</code> | The mode to set on the stack. |

<a name="Tokenizer+completeCurrentMode"></a>

### tokenizer.completeCurrentMode() ⇒ <code>string</code> \| <code>undefined</code>
Ends the current mode and removes it from the stack.

**Kind**: instance method of [<code>Tokenizer</code>](#Tokenizer)  
**Returns**: <code>string</code> \| <code>undefined</code> - The last mode of the stack.  
<a name="Tokenizer+push"></a>

### tokenizer.push(token)
Parse the provided token.

**Kind**: instance method of [<code>Tokenizer</code>](#Tokenizer)  

| Param | Type | Description |
| --- | --- | --- |
| token | <code>string</code> | The token to parse. |

<a name="Tokenizer+convertToken"></a>

### tokenizer.convertToken(token) ⇒ <code>null</code> \| <code>true</code> \| <code>false</code> \| <code>number</code> \| <code>string</code>
Convert the string version of literals into their literal types.

**Kind**: instance method of [<code>Tokenizer</code>](#Tokenizer)  
**Returns**: <code>null</code> \| <code>true</code> \| <code>false</code> \| <code>number</code> \| <code>string</code> - The converted token.  

| Param | Type | Description |
| --- | --- | --- |
| token | <code>string</code> | The token to convert. |

<a name="Tokenizer+tokenize"></a>

### tokenizer.tokenize()
Process the string.

**Kind**: instance method of [<code>Tokenizer</code>](#Tokenizer)  
<a name="Tokenizer+consume"></a>

### tokenizer.consume(character)
Adds a character with the current mode.

**Kind**: instance method of [<code>Tokenizer</code>](#Tokenizer)  

| Param | Type | Description |
| --- | --- | --- |
| character | <code>string</code> | The character to process. |

<a name="Tokenizer+MODE_NONE"></a>

### tokenizer.MODE\_NONE(character)
Changes the current mode depending on the character.

**Kind**: instance method of [<code>Tokenizer</code>](#Tokenizer)  

| Param | Type | Description |
| --- | --- | --- |
| character | <code>string</code> | The character to consider. |

<a name="Tokenizer+MODE_DEFAULT"></a>

### tokenizer.MODE\_DEFAULT(character) ⇒ <code>string</code> \| <code>undefined</code>
Checks the token for delimiter or quotes, else continue building token.

**Kind**: instance method of [<code>Tokenizer</code>](#Tokenizer)  
**Returns**: <code>string</code> \| <code>undefined</code> - The current token.  

| Param | Type | Description |
| --- | --- | --- |
| character | <code>string</code> | The character to consider. |

<a name="Tokenizer+pushDefaultModeTokenizables"></a>

### tokenizer.pushDefaultModeTokenizables()
Parse out potential tokenizable substrings out of the current token.

**Kind**: instance method of [<code>Tokenizer</code>](#Tokenizer)  
<a name="Tokenizer+MODE_MATCH"></a>

### tokenizer.MODE\_MATCH(character) ⇒ <code>string</code> \| <code>undefined</code>
Checks for a completed match between characters.

**Kind**: instance method of [<code>Tokenizer</code>](#Tokenizer)  
**Returns**: <code>string</code> \| <code>undefined</code> - The current token.  

| Param | Type | Description |
| --- | --- | --- |
| character | <code>string</code> | The character to match. |

<a name="sortTokenizableSubstrings"></a>

## sortTokenizableSubstrings(a, b) ⇒ <code>number</code>
Sorts the tokenizable substrings by their length DESC.

**Kind**: global function  
**Returns**: <code>number</code> - -1 if A is longer than B, 1 if B is longer than A, else 0.  

| Param | Type | Description |
| --- | --- | --- |
| a | <code>string</code> | Substring A |
| b | <code>string</code> | Substring B |

<a name="TokenizeThisConfig"></a>

## TokenizeThisConfig : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| [shouldTokenize] | <code>Array.&lt;string&gt;</code> | The list of tokenizable substrings. |
| [shouldMatch] | <code>Array.&lt;string&gt;</code> | The list of quotes to match explicit strings with. |
| [shouldDelimitBy] | <code>Array.&lt;string&gt;</code> | The list of delimiters. |
| convertLiterals | <code>boolean</code> | If literals should be converted or not, ie 'true' -> true. |
| escapeCharacter | <code>string</code> | Character to use as an escape in strings. |

