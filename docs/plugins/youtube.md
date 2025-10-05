## Functions

<dl>
<dt><a href="#youtube">youtube(state)</a></dt>
<dd><p>Find and replace the <youtube> tags with safe iframes.</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#YoutubeTagAttributes">YoutubeTagAttributes</a> : <code>object</code></dt>
<dd></dd>
</dl>

<a name="youtube"></a>

## youtube(state)
Find and replace the <youtube> tags with safe iframes.

**Kind**: global function  
**See**: [Ruler.after](https://markdown-it.github.io/markdown-it/#Ruler.after)  

| Param | Type | Description |
| --- | --- | --- |
| state | <code>module:markdown-it/index.js~StateCore</code> | State of MarkdownIt. |

<a name="youtube..keys"></a>

### youtube~keys : [<code>YoutubeTagAttributes</code>](#YoutubeTagAttributes)
**Kind**: inner constant of [<code>youtube</code>](#youtube)  
<a name="YoutubeTagAttributes"></a>

## YoutubeTagAttributes : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| v | <code>string</code> | Video ID |
| width | <code>string</code> | Iframe width attribute |
| height | <code>string</code> | Iframe height attribute |
| title | <code>string</code> | Iframe title attribute |
| start | <code>string</code> | Video start offset time in seconds |

