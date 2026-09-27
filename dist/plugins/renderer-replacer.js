import { getPluginMethod } from './utilities/plugin-method.js';
import { createDebug } from '../debug.js';
const debug = createDebug('Uttori.Plugin.Render.Replacer');
/**
 * Uttori Replacer Renderer
 * @example <caption>ReplacerRenderer</caption>
 * const content = ReplacerRenderer.render("...");
 */
class ReplacerRenderer {
    /**
     * The configuration key for plugin to look for in the provided configuration.
     *
     * @returns The configuration key.
     * @example <caption>ReplacerRenderer.configKey</caption>
     * const config = { ...ReplacerRenderer.defaultConfig(), ...context.config[ReplacerRenderer.configKey] };
     */
    static get configKey() {
        return 'uttori-plugin-renderer-replacer';
    }
    /**
     * The default configuration.
     * @returns The configuration.
     * @example <caption>ReplacerRenderer.defaultConfig()</caption>
     * const config = { ...ReplacerRenderer.defaultConfig(), ...context.config[ReplacerRenderer.configKey] };
     */
    static defaultConfig() {
        return {
            rules: [],
        };
    }
    /**
     * Validates the provided configuration for required entries.
     * @param config A configuration object.
     * @param [_context] Unused.
     * @example <caption>ReplacerRenderer.validateConfig(config, _context)</caption>
     * ReplacerRenderer.validateConfig({ ... });
     */
    static validateConfig(config, _context) {
        debug('Validating config...');
        if (!config || !config[ReplacerRenderer.configKey]) {
            throw new Error(`ReplacerRenderer Config Warning: '${ReplacerRenderer.configKey}' configuration key is missing.`);
        }
        if (!config[ReplacerRenderer.configKey].rules || !Array.isArray(config[ReplacerRenderer.configKey].rules)) {
            throw new Error('ReplacerRenderer Config Warning: \'rules\' configuration key is missing or not an array.');
        }
        debug('Validated config.');
    }
    /**
     * Register the plugin with a provided set of events on a provided Hook system.
     * @param context A Uttori-like context.
     * @example <caption>ReplacerRenderer.register(context)</caption>
     * const context = {
     *   hooks: {
     *     on: (event, callback) => { ... },
     *   },
     *   config: {
     *     [ReplacerRenderer.configKey]: {
     *       ...,
     *       events: {
     *         renderContent: ['render-content', 'render-meta-description'],
     *         renderCollection: ['render-search-results'],
     *         validateConfig: ['validate-config'],
     *       },
     *     },
     *   },
     * };
     * ReplacerRenderer.register(context);
     */
    static register(context) {
        if (!context || !context.hooks || typeof context.hooks.on !== 'function') {
            throw new Error('Missing event dispatcher in \'context.hooks.on(event, callback)\' format.');
        }
        const config = { ...ReplacerRenderer.defaultConfig(), ...context.config[ReplacerRenderer.configKey] };
        if (!config.events) {
            throw new Error('Missing events to listen to for in \'config.events\'.');
        }
        // Bind events
        for (const [method, eventNames] of Object.entries(config.events)) {
            const ReplacerRendererMethod = getPluginMethod(ReplacerRenderer, method);
            if (ReplacerRendererMethod) {
                for (const event of eventNames) {
                    const callback = ReplacerRendererMethod;
                    context.hooks.on(event, callback);
                }
            }
            else {
                debug(`Missing function "${method}"`);
            }
        }
    }
    /**
     * Replace content in a provided string with a provided context.
     * @param content Content to be converted to HTML.
     * @param context A Uttori-like context.
     * @returns The rendered content.
     * @example <caption>ReplacerRenderer.renderContent(content, context)</caption>
     * const context = {
     *   config: {
     *     [ReplacerRenderer.configKey]: {
     *       ...,
     *     },
     *   },
     * };
     * ReplacerRenderer.renderContent(content, context);
     */
    static renderContent(content, context) {
        debug('renderContent');
        if (!context || !context.config || !context.config[ReplacerRenderer.configKey]) {
            throw new Error('Missing configuration.');
        }
        const config = { ...ReplacerRenderer.defaultConfig(), ...context.config[ReplacerRenderer.configKey] };
        return ReplacerRenderer.render(content, config);
    }
    /**
     * Replace content in a collection of Uttori documents with a provided context.
     * @param collection A collection of Uttori documents.
     * @param context A Uttori-like context.
     * @returns The rendered documents.
     * @example <caption>ReplacerRenderer.renderCollection(collection, context)</caption>
     * const context = {
     *   config: {
     *     [ReplacerRenderer.configKey]: {
     *       ...,
     *     },
     *   },
     * };
     * ReplacerRenderer.renderCollection(collection, context);
     */
    static renderCollection(collection, context) {
        debug('renderCollection:', collection.length);
        if (!context || !context.config || !context.config[ReplacerRenderer.configKey]) {
            throw new Error('Missing configuration.');
        }
        const config = { ...ReplacerRenderer.defaultConfig(), ...context.config[ReplacerRenderer.configKey] };
        return collection.map((document) => {
            const html = ReplacerRenderer.render(document.html ?? '', config);
            return { ...document, html };
        });
    }
    /**
     * Replace content in a provided string with a provided set of rules.
     * @param content Content to be searched through to make replacements.
     * @param config A provided configuration to use.
     * @returns The rendered content.
     * @example <caption>ReplacerRenderer.render(content, config)</caption>
     * const html = ReplacerRenderer.render(content, config);
     */
    static render(content, config) {
        if (!content) {
            debug('No input provided, returning a blank string.');
            return '';
        }
        let output = content;
        for (const rule of config.rules) {
            let search;
            if (typeof rule.test === 'string') {
                search = new RegExp(rule.test, 'g');
            }
            else if (rule.test instanceof RegExp) {
                search = rule.test;
            }
            else {
                debug('Invalid Rule:', rule);
                continue;
            }
            output = output.replace(search, rule.output);
        }
        return output;
    }
}
export default ReplacerRenderer;
//# sourceMappingURL=renderer-replacer.js.map