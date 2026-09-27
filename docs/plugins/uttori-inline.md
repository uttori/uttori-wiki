## Functions

<dl>
<dt><a href="#getValue">getValue(token, key)</a> ⇒</dt>
<dd></dd>
<dt><a href="#updateValue">updateValue(token, key, value)</a></dt>
<dd></dd>
<dt><a href="#uttoriInline">uttoriInline(state)</a> ⇒</dt>
<dd><p>Uttori specific rules for manipulating the markup.
External Domains are filtered for SEO and security.</p>
</dd>
</dl>

<a name="getValue"></a>

## getValue(token, key) ⇒
**Kind**: global function\
**Returns**: The read value or undefined.\

| Param | Description |
| --- | --- |
| token | The MarkdownIt token we are reading. |
| key | The key is the attribute name, like `src` or `href`. |

<a name="updateValue"></a>

## updateValue(token, key, value)
**Kind**: global function\

| Param | Description |
| --- | --- |
| token | The MarkdownIt token we are updating. |
| key | The key is the attribute name, like `src` or `href`. |
| value | The value we want to set to the provided key. |

<a name="uttoriInline"></a>

## uttoriInline(state) ⇒
Uttori specific rules for manipulating the markup.
External Domains are filtered for SEO and security.

**Kind**: global function\
**Returns**: Returns if parsing was successful or not.\

| Param | Description |
| --- | --- |
| state | State of MarkdownIt. |

## TypeScript declarations

<details>
<summary>View documented types and signatures</summary>

```typescript
/**
 * @param token The MarkdownIt token we are reading.
 * @param key The key is the attribute name, like `src` or `href`.
 * @returns The read value or undefined.
 */
export declare function getValue(token: import('markdown-it').Token, key: string): string | undefined;
/**
 * @param token The MarkdownIt token we are updating.
 * @param key The key is the attribute name, like `src` or `href`.
 * @param value The value we want to set to the provided key.
 */
export declare function updateValue(token: import('markdown-it').Token, key: string, value: string): void;
/**
 * Uttori specific rules for manipulating the markup.
 * External Domains are filtered for SEO and security.
 * @param state State of MarkdownIt.
 * @returns Returns if parsing was successful or not.
 */
export declare function uttoriInline(state: import('markdown-it').StateCore): boolean;
declare const _default: {
    getValue: typeof getValue;
    updateValue: typeof updateValue;
    uttoriInline: typeof uttoriInline;
};
export default _default;
```

</details>
