<a name="fyShuffle"></a>

## fyShuffle(array) ⇒ <code>Array.&lt;T&gt;</code>
Fisher-Yates Shuffle (aka Knuth Shuffle)
The algorithm continually determines the next element by randomly drawing an element from the array until no elements remain.
This modifies the passed in array, clone the array being passed in to return a new array.

**Kind**: global function  
**Returns**: <code>Array.&lt;T&gt;</code> - The same array, randomized.  
**See**

- [Fisher-Yates Shuffle (aka Knuth Shuffle)](https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle)
- [Fisher–Yates Shuffle](https://bost.ocks.org/mike/shuffle/)


| Param | Type | Description |
| --- | --- | --- |
| array | <code>Array.&lt;T&gt;</code> | The array to randomize. |

**Example** *(fyShuffle(array))*  
```js
const shuffled_array = fyShuffle(sorted_array.slice(0));
```
