import type { FilterIPAddressConfig } from '../types/plugins/filter-ip-address.js';
export type { FilterIPAddressConfig } from '../types/plugins/filter-ip-address.js';
/**
 * Uttori IP Address Filter
 * @example <caption>FilterIPAddress</caption>
 * const valid = await FilterIPAddress.validateIP(request, context);
 */
declare class FilterIPAddress {
    /**
     * The configuration key for plugin to look for in the provided configuration.
     *
     * @returns The configuration key.
     */
    static get configKey(): 'uttori-plugin-filter-ip-address';
    /**
     * The default configuration.
     * @returns The configuration.
     */
    static defaultConfig(): import('../custom.js').DefaultPluginConfig<FilterIPAddressConfig, 'events' | 'logPath' | 'blocklist' | 'trustProxy'>;
    /**
     * Validates the provided configuration for required entries.
     * @param config A configuration object.
     * @param _context Unused context object.
     */
    static validateConfig(config: Record<string, FilterIPAddressConfig>, _context: unknown): void;
    /**
     * Register the plugin with a provided set of events on a provided Hook system.
     * @param context A Uttori-like context.
     * @example <caption>FilterIPAddress.register(context)</caption>
     * const context = {
     *   hooks: {
     *     on: (event, callback) => { ... },
     *   },
     *   config: {
     *     [FilterIPAddress.configKey]: {
     *       ...,
     *       events: {
     *         'validate-save': ['validateIP'],
     *       },
     *     },
     *   },
     * };
     * FilterIPAddress.register(context);
     */
    static register(context: import('../custom.js').UttoriContextWithPluginConfig<'uttori-plugin-filter-ip-address', FilterIPAddressConfig>): void;
    /**
     * Gets the real IP address from the request, considering proxy headers if configured.
     * @param config The configuration object.
     * @param request The Express request object.
     * @returns The client's IP address.
     */
    static getClientIP(config: FilterIPAddressConfig, request: import('express').Request): string;
    /**
     * Logs the IP address and content to a file.
     * @param config The configuration object.
     * @param ip The IP address to log.
     * @param request The content being submitted.
     */
    static logIPActivity(config: FilterIPAddressConfig, ip: string, request: import('express').Request): void;
    /**
     * Validates the request IP against the blocklist and logs the activity.
     * @param request The Express request object.
     * @param context Unused context object.
     * @returns Returns `true` if the IP is blocklisted (invalid), `false` otherwise.
     */
    static validateIP(request: import('express').Request, context: import('../custom.js').UttoriContextWithPluginConfig<'uttori-plugin-filter-ip-address', FilterIPAddressConfig>): boolean;
}
export default FilterIPAddress;
//# sourceMappingURL=filter-ip-address.d.ts.map