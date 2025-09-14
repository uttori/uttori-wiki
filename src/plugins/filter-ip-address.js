// const invalid = await this.hooks.validate('validate-save', request, this);
import fs from 'fs';
import path from 'node:path';
import * as url from 'url';

/** @type {string} The directory name of the current file. */
const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

let debug = (..._) => {};
/* c8 ignore next */
try { const { default: d } = await import('debug'); debug = d('Uttori.Plugin.FilterIPAddress'); } catch {}

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
class FilterIPAddress {
  /**
   * The configuration key for plugin to look for in the provided configuration.
   * @type {string}
   * @returns {string} The configuration key.
   * @static
   */
  static get configKey() {
    return 'uttori-plugin-filter-ip-address';
  }

  /**
   * The default configuration.
   * @returns {FilterIPAddressConfig} The configuration.
   * @static
   */
  static defaultConfig() {
    return {
      events: {
        validateIP: ['validate-save'],
        validateConfig: ['validate-config'],
      },
      logPath: path.join(__dirname, 'logs'),
      blocklist: [],
      trustProxy: false,
    };
  }

  /**
   * Validates the provided configuration for required entries.
   * @param {Record<string, FilterIPAddressConfig>} config A configuration object.
   * @param {object} _context Unused context object.
   * @static
   */
  static validateConfig(config, _context) {
    debug('Validating config...');
    if (!config[FilterIPAddress.configKey]) {
      throw new Error(`Config missing '${FilterIPAddress.configKey}' entry.`);
    }
    if (!config[FilterIPAddress.configKey].blocklist) {
      throw new Error(`Config missing '${FilterIPAddress.configKey}.blocklist' entry.`);
    }
    if (!Array.isArray(config[FilterIPAddress.configKey].blocklist)) {
      throw new Error(`Config '${FilterIPAddress.configKey}.blocklist' must be an array.`);
    }
    if (typeof config[FilterIPAddress.configKey].logPath !== 'string') {
      throw new Error(`Config '${FilterIPAddress.configKey}.logPath' must be a string.`);
    }
    if (!config[FilterIPAddress.configKey].logPath) {
      throw new Error(`Config missing '${FilterIPAddress.configKey}.logPath' entry.`);
    }
    if (typeof config[FilterIPAddress.configKey].trustProxy !== 'boolean') {
      throw new Error(`Config '${FilterIPAddress.configKey}.trustProxy' must be a boolean.`);
    }
  }

  /**
   * Register the plugin with a provided set of events on a provided Hook system.
   * @param {import('../../dist/custom.js').UttoriContext} context A Uttori-like context.
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
  static register(context) {
    debug('Registering...');
    if (!context || !context.hooks || typeof context.hooks.on !== 'function') {
      throw new Error("Missing event dispatcher in 'context.hooks.on(event, callback)' format.");
    }

    const config = { ...FilterIPAddress.defaultConfig(), ...context.config[FilterIPAddress.configKey] };
    if (!config.events) {
      throw new Error('Missing events to register for in the FilterIPAddress configuration');
    }

    // Bind events
    for (const [method, eventNames] of Object.entries(config.events)) {
      if (typeof FilterIPAddress[method] === 'function') {
        for (const event of eventNames) {
          /** @type {import('@uttori/event-dispatcher').UttoriEventCallback} */
          const callback = FilterIPAddress[method];
          context.hooks.on(event, callback);
        }
      } else {
        debug(`Missing function "${method}"`);
      }
    }
  }

  /**
   * Gets the real IP address from the request, considering proxy headers if configured.
   * @param {FilterIPAddressConfig} config The configuration object.
   * @param {import('express').Request} request The Express request object.
   * @returns {string} The client's IP address.
   * @static
   */
  static getClientIP(config, request) {
    debug('Getting client IP...');
    if (config.trustProxy && request.headers['x-forwarded-for']) {
      // Get the IPs in the X-Forwarded-For header (client's original IP)
      return JSON.stringify(request.headers['x-forwarded-for']);
    }
    return request?.ip || request?.socket?.remoteAddress || '0.0.0.0';
  }

  /**
   * Logs the IP address and content to a file.
   * @param {FilterIPAddressConfig} config The configuration object.
   * @param {string} ip The IP address to log.
   * @param {import('express').Request} request The content being submitted.
   * @static
   */
  static logIPActivity(config, ip, request) {
    const content = request?.body || {};
    const url = request?.originalUrl || '';
    try {
      const logDir = config.logPath;
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }

      const date = new Date();
      const logFile = path.join(logDir, `ip-activity-${date.toISOString().slice(0, 10)}.log`);

      const logEntry = {
        timestamp: date.toISOString(),
        ip,
        url,
        content,
      };

      fs.appendFileSync(logFile, `${JSON.stringify(logEntry)}\n`);
      debug(`Logged IP activity for ${ip}`);
      /* c8 ignore next 3 */
    } catch (error) {
      debug(`Error logging IP activity: ${error}`);
    }
  }

  /**
   * Validates the request IP against the blocklist and logs the activity.
   * @param {import('express').Request} request The Express request object.
   * @param {import('../../dist/custom.js').UttoriContext} context Unused context object.
   * @returns {boolean} Returns `true` if the IP is blocklisted (invalid), `false` otherwise.
   * @static
   */
  static validateIP(request, context) {
    debug('Validating IP address...');
    /** @type {FilterIPAddressConfig} */
    const config = { ...FilterIPAddress.defaultConfig(), ...context.config[FilterIPAddress.configKey] };

    const ip = FilterIPAddress.getClientIP(config, request);
    debug(`Client IP: ${ip}`);

    // Log the IP and content
    FilterIPAddress.logIPActivity(config, ip, request);

    // Check if IP is blocklisted
    if (config.blocklist.includes(ip)) {
      debug(`Blocked request from blocklisted IP: ${ip}`);
      return true; // Invalid request
    }

    return false; // Valid request
  }
}

export default FilterIPAddress;
