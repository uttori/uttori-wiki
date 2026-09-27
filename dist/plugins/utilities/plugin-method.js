/**
 * Resolve a configured method after checking it is callable.
 * Event payloads belong to each plugin's hook contract; this lookup does not invoke the method.
 */
export function getPluginMethod(plugin, name) {
    const value = Reflect.get(plugin, name);
    // Configuration names are runtime strings, so narrow at this shared dispatch boundary.
    return typeof value === 'function' ? value : undefined;
}
//# sourceMappingURL=plugin-method.js.map