/**
 * Module-level in-memory map of IP addresses to edit timestamps.
 * Keyed by IP string. Values are arrays of `Date.now()` timestamps.
 * Entries are pruned on each access. No external store required.
 * @type {Map<string, number[]>}
 */
export const ipEditHistory: Map<string, number[]>;
export default FilterSpamEdit;
export type FilterSpamEditWeights = {
    /**
     * Jaccard distance weight for large content replacement. Set to 0 to disable.
     */
    contentSimilarity?: number;
    /**
     * Weight for net-new external URLs added. Set to 0 to disable.
     */
    externalLinksAdded?: number;
    /**
     * Weight for a high fraction of paragraphs replaced or removed. Set to 0 to disable.
     */
    paragraphRatio?: number;
    /**
     * Weight for hits from `suspiciousTermList`. Set to 0 to disable.
     */
    suspiciousTerms?: number;
    /**
     * Weight for an unusually high links-per-word ratio. Set to 0 to disable.
     */
    linkDensity?: number;
    /**
     * Weight applied when the submitting IP exceeds `ipMaxEdits` within `ipWindowMs`. Set to 0 to disable.
     */
    ipRateLimit?: number;
    /**
     * Weight for content that grows to an implausibly large multiple of the original. Set to 0 to disable.
     */
    contentGrowth?: number;
    /**
     * Weight for a high ratio of non-letter/number characters (obfuscation attempts). Set to 0 to disable.
     */
    unicodeObfuscation?: number;
    /**
     * Weight for external links added to a page that was previously short. Set to 0 to disable.
     */
    smallPageLinkSpam?: number;
};
export type FilterSpamEditConfig = {
    /**
     * Events to bind to.
     */
    events?: Record<string, string[]>;
    /**
     * Score (0–100 scale) at or above which the edit is blocked.
     */
    blockThreshold?: number;
    /**
     * Slugs known to be frequently targeted by spammers. Edits to these pages have their score multiplied by `targetedSlugMultiplier`.
     */
    targetedSlugs?: string[];
    /**
     * Score multiplier applied when the edited slug is in `targetedSlugs`. Must be >= 1.
     */
    targetedSlugMultiplier?: number;
    /**
     * Directory where blocked-edit JSON log files are written.
     */
    logPath?: string;
    /**
     * Rolling time window in milliseconds for IP-based rate limiting.
     */
    ipWindowMs?: number;
    /**
     * Maximum number of edits permitted from one IP within `ipWindowMs` before the `ipRateLimit` weight fires.
     */
    ipMaxEdits?: number;
    /**
     * Per-signal weight values. Set any to 0 to disable that signal entirely.
     */
    weights?: FilterSpamEditWeights;
    /**
     * Known spam keyword list used by the `suspiciousTerms` signal.
     */
    suspiciousTermList?: string[];
    /**
     * Word count below which the `smallPageLinkSpam` signal is active for old content.
     */
    smallPageWordThreshold?: number;
};
export type SpamSignals = {
    /**
     * Contribution (0–weight) from Jaccard content distance.
     */
    contentSimilarityScore: number;
    /**
     * Contribution from new external URLs.
     */
    externalLinksAddedScore: number;
    /**
     * Contribution from changed paragraph structure.
     */
    paragraphRatioScore: number;
    /**
     * Contribution from suspicious keyword matches.
     */
    suspiciousTermsScore: number;
    /**
     * Contribution from links-per-word ratio.
     */
    linkDensityScore: number;
    /**
     * Contribution from IP rate limit violation.
     */
    ipRateLimitScore: number;
    /**
     * Contribution from unexplained content size growth.
     */
    contentGrowthScore: number;
    /**
     * Contribution from non-word character ratio.
     */
    unicodeObfuscationScore: number;
    /**
     * Contribution from links added to a short page.
     */
    smallPageLinkSpamScore: number;
};
export type SpamScoreResult = {
    /**
     * The final weighted score (after any targeted-slug multiplier).
     */
    score: number;
    /**
     * Human-readable list of triggered signals for log output.
     */
    reasons: string[];
    /**
     * Individual signal contributions before aggregation.
     */
    signals: SpamSignals;
};
/**
 * @typedef {object} FilterSpamEditWeights
 * @property {number} [contentSimilarity=40] Jaccard distance weight for large content replacement. Set to 0 to disable.
 * @property {number} [externalLinksAdded=20] Weight for net-new external URLs added. Set to 0 to disable.
 * @property {number} [paragraphRatio=10] Weight for a high fraction of paragraphs replaced or removed. Set to 0 to disable.
 * @property {number} [suspiciousTerms=15] Weight for hits from `suspiciousTermList`. Set to 0 to disable.
 * @property {number} [linkDensity=10] Weight for an unusually high links-per-word ratio. Set to 0 to disable.
 * @property {number} [ipRateLimit=25] Weight applied when the submitting IP exceeds `ipMaxEdits` within `ipWindowMs`. Set to 0 to disable.
 * @property {number} [contentGrowth=5] Weight for content that grows to an implausibly large multiple of the original. Set to 0 to disable.
 * @property {number} [unicodeObfuscation=10] Weight for a high ratio of non-letter/number characters (obfuscation attempts). Set to 0 to disable.
 * @property {number} [smallPageLinkSpam=15] Weight for external links added to a page that was previously short. Set to 0 to disable.
 */
/**
 * @typedef {object} FilterSpamEditConfig
 * @property {Record<string, string[]>} [events] Events to bind to.
 * @property {number} [blockThreshold=75] Score (0–100 scale) at or above which the edit is blocked.
 * @property {string[]} [targetedSlugs=[]] Slugs known to be frequently targeted by spammers. Edits to these pages have their score multiplied by `targetedSlugMultiplier`.
 * @property {number} [targetedSlugMultiplier=1.5] Score multiplier applied when the edited slug is in `targetedSlugs`. Must be >= 1.
 * @property {string} [logPath='./logs'] Directory where blocked-edit JSON log files are written.
 * @property {number} [ipWindowMs=60000] Rolling time window in milliseconds for IP-based rate limiting.
 * @property {number} [ipMaxEdits=5] Maximum number of edits permitted from one IP within `ipWindowMs` before the `ipRateLimit` weight fires.
 * @property {FilterSpamEditWeights} [weights] Per-signal weight values. Set any to 0 to disable that signal entirely.
 * @property {string[]} [suspiciousTermList] Known spam keyword list used by the `suspiciousTerms` signal.
 * @property {number} [smallPageWordThreshold=50] Word count below which the `smallPageLinkSpam` signal is active for old content.
 */
/**
 * @typedef {object} SpamSignals
 * @property {number} contentSimilarityScore Contribution (0–weight) from Jaccard content distance.
 * @property {number} externalLinksAddedScore Contribution from new external URLs.
 * @property {number} paragraphRatioScore Contribution from changed paragraph structure.
 * @property {number} suspiciousTermsScore Contribution from suspicious keyword matches.
 * @property {number} linkDensityScore Contribution from links-per-word ratio.
 * @property {number} ipRateLimitScore Contribution from IP rate limit violation.
 * @property {number} contentGrowthScore Contribution from unexplained content size growth.
 * @property {number} unicodeObfuscationScore Contribution from non-word character ratio.
 * @property {number} smallPageLinkSpamScore Contribution from links added to a short page.
 */
/**
 * @typedef {object} SpamScoreResult
 * @property {number} score The final weighted score (after any targeted-slug multiplier).
 * @property {string[]} reasons Human-readable list of triggered signals for log output.
 * @property {SpamSignals} signals Individual signal contributions before aggregation.
 */
/**
 * Uttori Wiki Spam Edit Filter
 *
 * Scores each incoming edit using a set of configurable weighted signals and blocks high-risk saves via the `validate-save` hook.
 * Requires no user accounts, no external database, and no heavy dependencies
 * Suitable for resource-constrained servers.
 * All signal weights are independently configurable. Set any weight to `0` to disable that signal entirely.
 * Pages listed in `targetedSlugs` receive a score multiplier so that known high-value targets are harder for spammers to edit.
 * @example <caption>FilterSpamEdit - register in site config</caption>
 * import { FilterSpamEdit } from '@uttori/wiki';
 * const config = {
 *   plugins: [FilterSpamEdit],
 *   [FilterSpamEdit.configKey]: {
 *     ...FilterSpamEdit.defaultConfig(),
 *     blockThreshold: 70,
 *     targetedSlugs: ['home', 'about'],
 *   },
 * };
 * @class
 */
declare class FilterSpamEdit {
    /**
     * The configuration key used to look up this plugin's settings in the site config.
     * @type {string}
     * @returns {string} The configuration key.
     * @static
     */
    static get configKey(): string;
    /**
     * Returns the default configuration for the plugin.
     * @returns {FilterSpamEditConfig} The default configuration.
     * @static
     */
    static defaultConfig(): FilterSpamEditConfig;
    /**
     * Resolves the plugin configuration by shallow-merging top-level settings and deep-merging nested `events` and `weights` entries with their defaults.
     * This allows site config to override only the settings it needs without replacing the full default nested objects.
     * @param {import('../../dist/custom.js').UttoriContextWithPluginConfig<'uttori-plugin-filter-spam-edit', FilterSpamEditConfig>} context The Uttori wiki context with plugin configuration.
     * @returns {FilterSpamEditConfig} The resolved plugin configuration.
     * @static
     */
    static resolveConfig(context: import("../../dist/custom.js").UttoriContextWithPluginConfig<"uttori-plugin-filter-spam-edit", FilterSpamEditConfig>): FilterSpamEditConfig;
    /**
     * Validates the provided configuration for required entries and correct types.
     * @param {Record<string, FilterSpamEditConfig>} config A Uttori-like context.
     * @param {import('../../dist/custom.js').UttoriContextWithPluginConfig<'uttori-plugin-filter-spam-edit', FilterSpamEditConfig>} _context Unused context object.
     * @throws {Error} When any required config value is missing or invalid.
     * @static
     */
    static validateConfig(config: Record<string, FilterSpamEditConfig>, _context: import("../../dist/custom.js").UttoriContextWithPluginConfig<"uttori-plugin-filter-spam-edit", FilterSpamEditConfig>): void;
    /**
     * Registers the plugin with the provided hook system, binding configured events to static methods.
     * @param {import('../../dist/custom.js').UttoriContextWithPluginConfig<'uttori-plugin-filter-spam-edit', FilterSpamEditConfig>} context A Uttori-like context.
     * @throws {Error} When the context or hook system is missing.
     * @static
     */
    static register(context: import("../../dist/custom.js").UttoriContextWithPluginConfig<"uttori-plugin-filter-spam-edit", FilterSpamEditConfig>): void;
    /**
     * Normalizes wiki text for content-similarity comparison.
     * Strips markdown syntax, HTML tags, collapses whitespace, and lowercases.
     * @param {string} text Raw wiki page content.
     * @returns {string} Normalized text suitable for tokenization.
     * @static
     */
    static normalizeText(text: string): string;
    /**
     * Splits normalized text into a set of unique word tokens.
     * @param {string} text Already-normalized text.
     * @returns {Set<string>} Unique word tokens.
     * @static
     */
    static tokenize(text: string): Set<string>;
    /**
     * Computes Jaccard similarity between two strings using word tokens.
     * Returns 1 when both inputs are empty (identical by convention).
     * @param {string} a First text (will be normalized internally).
     * @param {string} b Second text (will be normalized internally).
     * @returns {number} A value in [0, 1] where 1 is identical and 0 is completely different.
     * @static
     */
    static jaccardSimilarity(a: string, b: string): number;
    /**
     * Normalizes a URL before comparison so equivalent URLs with minor differences do not count as newly-added external links.
     * Removes hashes, common tracking parameters, lowercases hostnames, and normalizes root paths.
     * @param {string} rawUrl Raw URL string to normalize.
     * @returns {string} Normalized URL string, or a trimmed lowercase fallback when parsing fails.
     * @static
     */
    static normalizeUrl(rawUrl: string): string;
    /**
     * Extracts all HTTP/HTTPS URLs from a block of text and normalizes them for stable old/new URL comparisons.
     * @param {string} text Raw text to scan.
     * @returns {string[]} Array of normalized URL strings.
     * @static
     */
    static getUrls(text: string): string[];
    /**
     * Extracts a normalized hostname from a URL for domain-level analysis.
     * @param {string} rawUrl URL string to parse.
     * @returns {string} Lowercase hostname without a leading `www.`, or an empty string when parsing fails.
     * @static
     */
    static getUrlHost(rawUrl: string): string;
    /**
     * Counts the number of words in a string.
     * @param {string} text Text to count.
     * @returns {number} Word count.
     * @static
     */
    static countWords(text: string): number;
    /**
     * Splits text into normalized paragraphs on two or more consecutive newlines.
     * Paragraph normalization keeps harmless formatting and whitespace changes from being counted as full paragraph removals.
     * @param {string} text Raw text to split.
     * @returns {string[]} Non-empty normalized paragraph strings.
     * @static
     */
    static splitParagraphs(text: string): string[];
    /**
     * Scores suspicious keyword density against a term list.
     * Returns a value in [0, 1]: 0 means no hits, 1 means saturated.
     * Each unique matched term contributes `1 / list.length` to the score, clamped to a maximum of 1.
     * @param {string} text Text to scan (will be lowercased internally).
     * @param {string[]} termList List of suspicious terms to look for.
     * @returns {number} A value in [0, 1].
     * @static
     */
    static scoreSuspiciousTerms(text: string, termList: string[]): number;
    /**
     * Periodically sweeps stale IP timestamp entries from the module-level `ipEditHistory` map so IPs that never edit again do not remain forever.
     * The sweep runs at most once per configured IP window.
     * @param {FilterSpamEditConfig} config Plugin configuration.
     * @static
     */
    static sweepIPHistory(config: FilterSpamEditConfig): void;
    /**
     * Records a new edit attempt from an IP address and returns whether that edit exceeds the configured rolling-window rate limit.
     * Old entries outside `config.ipWindowMs` are pruned in-place on the same call.
     * @param {string} ip Client IP address.
     * @param {FilterSpamEditConfig} config Plugin configuration.
     * @returns {boolean} `true` when the new attempt exceeds the IP limit, `false` otherwise.
     * @static
     */
    static recordAndScoreIPRateLimit(ip: string, config: FilterSpamEditConfig): boolean;
    /**
     * Scores likely unicode obfuscation by measuring the ratio of characters that are neither letters, numbers, punctuation, nor symbols after Unicode NFKC normalization.
     * Higher values suggest hidden / control / combining character abuse.
     * @param {string} text Raw text to scan.
     * @returns {number} A value in [0, 1].
     * @static
     */
    static scoreUnicodeObfuscation(text: string): number;
    /**
     * Computes a spam risk score from pre-calculated signal values.
     * Each signal contributes its configured weight when triggered (signal value > 0).
     * For signals that return a continuous value in [0, 1], the contribution is `signal * weight` (proportional). For boolean signals the full weight is added.
     * The targeted-slug multiplier is applied after summation when the edited slug appears in `config.targetedSlugs`.
     * @param {object} params Signal parameters.
     * @param {string} params.slug The slug being edited.
     * @param {number} params.contentDistance Jaccard distance (0 = identical, 1 = completely different). Pass -1 to skip (new page).
     * @param {number} params.newExternalLinks Number of net-new external URLs added.
     * @param {number} params.oldUrls Number of URLs in the old content.
     * @param {number} params.paragraphsRemoved Fraction of old paragraphs removed.
     * @param {number} params.suspiciousTermScore Suspicious term density (0–1).
     * @param {number} params.unicodeObfuscationScore Unicode obfuscation ratio (0–1).
     * @param {number} params.newWordCount Word count of the new content.
     * @param {number} params.oldWordCount Word count of the old content. Pass 0 to skip (new page).
     * @param {boolean} params.ipRateLimited Whether the submitting IP is rate-limited.
     * @param {boolean} params.isNewPage Whether this is a brand-new page (no baseline).
     * @param {FilterSpamEditConfig} params.config Plugin configuration.
     * @returns {SpamScoreResult} The computed score, reasons, and individual signal values.
     * @static
     */
    static computeScore({ slug, contentDistance, newExternalLinks, oldUrls, paragraphsRemoved, suspiciousTermScore, unicodeObfuscationScore, newWordCount, oldWordCount, ipRateLimited, isNewPage, config, }: {
        slug: string;
        contentDistance: number;
        newExternalLinks: number;
        oldUrls: number;
        paragraphsRemoved: number;
        suspiciousTermScore: number;
        unicodeObfuscationScore: number;
        newWordCount: number;
        oldWordCount: number;
        ipRateLimited: boolean;
        isNewPage: boolean;
        config: FilterSpamEditConfig;
    }): SpamScoreResult;
    /**
     * Appends a blocked-edit entry to the daily log file at `config.logPath`.
     * The entry is a single JSON line with timestamp, IP, slug, score, and reasons.
     * @param {FilterSpamEditConfig} config Plugin configuration.
     * @param {string} ip Client IP address.
     * @param {string} slug The slug that was blocked.
     * @param {number} score The final spam score.
     * @param {string[]} reasons The list of triggered signal reasons.
     * @static
     */
    static logBlockedEdit(config: FilterSpamEditConfig, ip: string, slug: string, score: number, reasons: string[]): void;
    /**
     * Evaluates the incoming edit request and returns `true` to block it when the computed spam score meets or exceeds `config.blockThreshold`.
     * Called automatically on the `validate-save` hook for both `save` (existing documents) and `saveNew` (new documents).
     * Fetches the current version of the document from storage to enable content-comparison signals; if no prior document exists the comparison signals are skipped.
     * @param {import('express').Request<{ slug: string }, {}, import('../wiki.js').UttoriWikiDocument>} request The Express request object containing the submitted form body.
     * @param {import('../../dist/custom.js').UttoriContextWithPluginConfig<'uttori-plugin-filter-spam-edit', FilterSpamEditConfig>} context The Uttori wiki context with `hooks` and `config`.
     * @returns {Promise<boolean>} Resolves to `true` to block the save, `false` to allow it.
     * @static
     */
    static validateEdit(request: import("express").Request<{
        slug: string;
    }, {}, import("../wiki.js").UttoriWikiDocument>, context: import("../../dist/custom.js").UttoriContextWithPluginConfig<"uttori-plugin-filter-spam-edit", FilterSpamEditConfig>): Promise<boolean>;
}
//# sourceMappingURL=filter-spam-edit.d.ts.map