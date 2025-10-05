export default FilterIPAddress;
export type FilterIPAddressConfig = {
    /**
     * Events to bind to.
     */
    events?: Record<string, string[]>;
    /**
     * Directory where IP logs will be stored.
     */
    logPath?: string;
    /**
     * List of IP addresses to block.
     */
    blocklist?: string[];
    /**
     * Whether to trust the X-Forwarded-For header.
     */
    trustProxy?: boolean;
};
/**
 * @typedef {object} FilterIPAddressConfig
 * @property {Record<string, string[]>} [events] Events to bind to.
 * @property {string} [logPath='./logs'] Directory where IP logs will be stored.
 * @property {string[]} [blocklist=[]] List of IP addresses to block.
 * @property {boolean} [trustProxy=false] Whether to trust the X-Forwarded-For header.
 */
/**
 * Uttori IP Address Filter
 * @example <caption>FilterIPAddress</caption>
 * const valid = await FilterIPAddress.validateIP(request, context);
 * @class
 */
declare class FilterIPAddress {
    /**
     * The configuration key for plugin to look for in the provided configuration.
     * @type {string}
     * @returns {string} The configuration key.
     * @static
     */
    static get configKey(): string;
    /**
     * The default configuration.
     * @returns {FilterIPAddressConfig} The configuration.
     * @static
     */
    static defaultConfig(): FilterIPAddressConfig;
    /**
     * Validates the provided configuration for required entries.
     * @param {Record<string, FilterIPAddressConfig>} config A configuration object.
     * @param {object} _context Unused context object.
     * @static
     */
    static validateConfig(config: Record<string, FilterIPAddressConfig>, _context: object): void;
    /**
     * Register the plugin with a provided set of events on a provided Hook system.
     * @param {import('../../dist/custom.js').UttoriContextWithPluginConfig<'uttori-plugin-filter-ip-address', FilterIPAddressConfig>} context A Uttori-like context.
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
     * @static
     */
    static register(context: import("../../dist/custom.js").UttoriContextWithPluginConfig<"uttori-plugin-filter-ip-address", FilterIPAddressConfig>): void;
    /**
     * Gets the real IP address from the request, considering proxy headers if configured.
     * @param {FilterIPAddressConfig} config The configuration object.
     * @param {import('express').Request} request The Express request object.
     * @returns {string} The client's IP address.
     * @static
     */
    static getClientIP(config: FilterIPAddressConfig, request: import("express").Request): string;
    /**
     * Logs the IP address and content to a file.
     * @param {FilterIPAddressConfig} config The configuration object.
     * @param {string} ip The IP address to log.
     * @param {import('express').Request} request The content being submitted.
     * @static
     */
    static logIPActivity(config: FilterIPAddressConfig, ip: string, request: import("express").Request): void;
    /**
     * Validates the request IP against the blocklist and logs the activity.
     * @param {import('express').Request} request The Express request object.
     * @param {import('../../dist/custom.js').UttoriContextWithPluginConfig<'uttori-plugin-filter-ip-address', FilterIPAddressConfig>} context Unused context object.
     * @returns {boolean} Returns `true` if the IP is blocklisted (invalid), `false` otherwise.
     * @static
     */
    static validateIP(request: import("express").Request, context: import("../../dist/custom.js").UttoriContextWithPluginConfig<"uttori-plugin-filter-ip-address", FilterIPAddressConfig>): boolean;
}
//# sourceMappingURL=filter-ip-address.d.ts.map