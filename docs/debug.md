<a name="createDebug"></a>

## createDebug(namespace) ⇒
Create a namespaced debug logger.

**Kind**: global function\
**Returns**: The debug logger, or a noop logger when debug is unavailable.\

| Param | Description |
| --- | --- |
| namespace | The debug namespace. |

## TypeScript declarations

<details>
<summary>View documented types and signatures</summary>

```typescript
import type { DebugLogger } from './types/debug.js';
export type { DebugLogger, CreateDebugLogger } from './types/debug.js';
/**
 * Create a namespaced debug logger.
 * @param namespace The debug namespace.
 * @returns The debug logger, or a noop logger when debug is unavailable.
 */
export declare function createDebug(namespace: string): DebugLogger;

export type DebugLogger = (...args: unknown[]) => void;
export type CreateDebugLogger = (namespace: string) => DebugLogger;
```

</details>
