import type { PluginMethod } from '../../types/plugins/utilities/plugin-method.js';
export type { PluginMethod } from '../../types/plugins/utilities/plugin-method.js';
/**
 * Resolve a configured method after checking it is callable.
 * Event payloads belong to each plugin's hook contract; this lookup does not invoke the method.
 */
export declare function getPluginMethod<T extends PluginMethod>(plugin: object, name: string): T | undefined;
//# sourceMappingURL=plugin-method.d.ts.map