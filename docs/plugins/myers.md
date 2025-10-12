## Classes

<dl>
<dt><a href="#Myers">Myers</a></dt>
<dd><p>Myers algorithm implementation for diff computation.
This is a full implementation based on &quot;An O(ND) Difference Algorithm and its Variations&quot;
by Eugene W. Myers.</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#SplitResult">SplitResult</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#InitResult">InitResult</a> : <code>object</code></dt>
<dd></dd>
</dl>

<a name="Myers"></a>

## Myers
Myers algorithm implementation for diff computation.
This is a full implementation based on "An O(ND) Difference Algorithm and its Variations"
by Eugene W. Myers.

**Kind**: global class  

* [Myers](#Myers)
    * [new Myers(xidx, yidx, x, y)](#new_Myers_new)
    * [.x](#Myers+x) : <code>Array.&lt;T&gt;</code>
    * [.y](#Myers+y) : <code>Array.&lt;T&gt;</code>
    * [.vf](#Myers+vf) : <code>Array.&lt;number&gt;</code>
    * [.vb](#Myers+vb) : <code>Array.&lt;number&gt;</code>
    * [.v0](#Myers+v0) : <code>number</code>
    * [.costLimit](#Myers+costLimit) : <code>number</code>
    * [.xidx](#Myers+xidx) : <code>Array.&lt;number&gt;</code>
    * [.yidx](#Myers+yidx) : <code>Array.&lt;number&gt;</code>
    * [.resultVectorX](#Myers+resultVectorX) : <code>Array.&lt;boolean&gt;</code>
    * [.resultVectorY](#Myers+resultVectorY) : <code>Array.&lt;boolean&gt;</code>
    * [.init(x0, y0, eq)](#Myers+init) ⇒ [<code>InitResult</code>](#InitResult)
    * [.compare(smin, smax, tmin, tmax, optimal, eq)](#Myers+compare)
    * [.split(smin, smax, tmin, tmax, optimal, eq)](#Myers+split) ⇒ [<code>SplitResult</code>](#SplitResult)

<a name="new_Myers_new"></a>

### new Myers(xidx, yidx, x, y)

| Param | Type |
| --- | --- |
| xidx | <code>Array.&lt;number&gt;</code> | 
| yidx | <code>Array.&lt;number&gt;</code> | 
| x | <code>Array.&lt;T&gt;</code> | 
| y | <code>Array.&lt;T&gt;</code> | 

<a name="Myers+x"></a>

### myers.x : <code>Array.&lt;T&gt;</code>
**Kind**: instance property of [<code>Myers</code>](#Myers)  
<a name="Myers+y"></a>

### myers.y : <code>Array.&lt;T&gt;</code>
**Kind**: instance property of [<code>Myers</code>](#Myers)  
<a name="Myers+vf"></a>

### myers.vf : <code>Array.&lt;number&gt;</code>
**Kind**: instance property of [<code>Myers</code>](#Myers)  
<a name="Myers+vb"></a>

### myers.vb : <code>Array.&lt;number&gt;</code>
**Kind**: instance property of [<code>Myers</code>](#Myers)  
<a name="Myers+v0"></a>

### myers.v0 : <code>number</code>
**Kind**: instance property of [<code>Myers</code>](#Myers)  
<a name="Myers+costLimit"></a>

### myers.costLimit : <code>number</code>
**Kind**: instance property of [<code>Myers</code>](#Myers)  
<a name="Myers+xidx"></a>

### myers.xidx : <code>Array.&lt;number&gt;</code>
**Kind**: instance property of [<code>Myers</code>](#Myers)  
<a name="Myers+yidx"></a>

### myers.yidx : <code>Array.&lt;number&gt;</code>
**Kind**: instance property of [<code>Myers</code>](#Myers)  
<a name="Myers+resultVectorX"></a>

### myers.resultVectorX : <code>Array.&lt;boolean&gt;</code>
**Kind**: instance property of [<code>Myers</code>](#Myers)  
<a name="Myers+resultVectorY"></a>

### myers.resultVectorY : <code>Array.&lt;boolean&gt;</code>
**Kind**: instance property of [<code>Myers</code>](#Myers)  
<a name="Myers+init"></a>

### myers.init(x0, y0, eq) ⇒ [<code>InitResult</code>](#InitResult)
**Kind**: instance method of [<code>Myers</code>](#Myers)  

| Param | Type | Description |
| --- | --- | --- |
| x0 | <code>Array.&lt;T&gt;</code> | The first array to compare |
| y0 | <code>Array.&lt;T&gt;</code> | The second array to compare |
| eq | <code>function</code> | Equality function to compare elements |

<a name="Myers+compare"></a>

### myers.compare(smin, smax, tmin, tmax, optimal, eq)
compare finds an optimal d-path from (smin, tmin) to (smax, tmax).
Important: x[smin:smax] and y[tmin:tmax] must not have a common prefix or a common suffix.

**Kind**: instance method of [<code>Myers</code>](#Myers)  

| Param | Type | Description |
| --- | --- | --- |
| smin | <code>number</code> |  |
| smax | <code>number</code> |  |
| tmin | <code>number</code> |  |
| tmax | <code>number</code> |  |
| optimal | <code>boolean</code> |  |
| eq | <code>function</code> | Equality function to compare elements |

<a name="Myers+split"></a>

### myers.split(smin, smax, tmin, tmax, optimal, eq) ⇒ [<code>SplitResult</code>](#SplitResult)
split finds the endpoints of a, potentially empty, sequence of diagonals in the middle of an
optimal path from (smin, tmin) to (smax, tmax).

Important: x[smin:smax] and y[tmin:tmax] must not have a common prefix or a common suffix and
they may not both be empty.

**Kind**: instance method of [<code>Myers</code>](#Myers)  

| Param | Type | Description |
| --- | --- | --- |
| smin | <code>number</code> |  |
| smax | <code>number</code> |  |
| tmin | <code>number</code> |  |
| tmax | <code>number</code> |  |
| optimal | <code>boolean</code> |  |
| eq | <code>function</code> | Equality function to compare elements |

<a name="SplitResult"></a>

## SplitResult : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type |
| --- | --- |
| s0 | <code>number</code> | 
| s1 | <code>number</code> | 
| t0 | <code>number</code> | 
| t1 | <code>number</code> | 
| opt0 | <code>boolean</code> | 
| opt1 | <code>boolean</code> | 

<a name="InitResult"></a>

## InitResult : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type |
| --- | --- |
| smin | <code>number</code> | 
| smax | <code>number</code> | 
| tmin | <code>number</code> | 
| tmax | <code>number</code> | 

