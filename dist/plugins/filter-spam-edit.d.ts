import type { FilterSpamEditWeights, FilterSpamEditConfig, SpamScoreResult } from '../types/plugins/filter-spam-edit.js';
export type { FilterSpamEditWeights, FilterSpamEditConfig, SpamSignals, SpamScoreResult, } from '../types/plugins/filter-spam-edit.js';
/**
 * Module-level in-memory map of IP addresses to edit timestamps.
 * Keyed by IP string. Values are arrays of `Date.now()` timestamps.
 * Entries are pruned on each access. No external store required.
 *
 */
export declare const ipEditHistory: Map<string, number[]>;
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
 */
declare class FilterSpamEdit {
    /**
     * The configuration key used to look up this plugin's settings in the site config.
     *
     * @returns The configuration key.
     */
    static get configKey(): 'uttori-plugin-filter-spam-edit';
    /**
     * Returns the default configuration for the plugin.
     * @returns The default configuration.
     */
    static defaultConfig(): import('../custom.js').DefaultPluginConfig<FilterSpamEditConfig, 'events' | 'blockThreshold' | 'targetedSlugs' | 'targetedSlugMultiplier' | 'logPath' | 'ipWindowMs' | 'ipMaxEdits' | 'weights' | 'suspiciousTermList' | 'smallPageWordThreshold'> & {
        weights: Required<FilterSpamEditWeights>;
    };
    /**
     * Resolves the plugin configuration by shallow-merging top-level settings and deep-merging nested `events` and `weights` entries with their defaults.
     * This allows site config to override only the settings it needs without replacing the full default nested objects.
     * @param context The Uttori wiki context with plugin configuration.
     * @returns The resolved plugin configuration.
     */
    static resolveConfig(context: import('../custom.js').UttoriContextWithPluginConfig<'uttori-plugin-filter-spam-edit', FilterSpamEditConfig>): {
        blockThreshold: number;
        targetedSlugs: string[];
        targetedSlugMultiplier: number;
        logPath: string;
        ipWindowMs: number;
        ipMaxEdits: number;
        suspiciousTermList: string[];
        smallPageWordThreshold: number;
        events: {
            [x: string]: string[];
        };
        weights: {
            contentSimilarity: number;
            externalLinksAdded: number;
            paragraphRatio: number;
            suspiciousTerms: number;
            linkDensity: number;
            ipRateLimit: number;
            contentGrowth: number;
            unicodeObfuscation: number;
            smallPageLinkSpam: number;
        };
    };
    /**
     * Validates the provided configuration for required entries and correct types.
     * @param config A Uttori-like context.
     * @param _context Unused context object.
     * @throws {Error} When any required config value is missing or invalid.
     */
    static validateConfig(config: Record<string, FilterSpamEditConfig>, _context: unknown): void;
    /**
     * Registers the plugin with the provided hook system, binding configured events to static methods.
     * @param context A Uttori-like context.
     * @throws {Error} When the context or hook system is missing.
     */
    static register(context: import('../custom.js').UttoriContextWithPluginConfig<'uttori-plugin-filter-spam-edit', FilterSpamEditConfig>): void;
    /**
     * Normalizes wiki text for content-similarity comparison.
     * Strips markdown syntax, HTML tags, collapses whitespace, and lowercases.
     * @param text Raw wiki page content.
     * @returns Normalized text suitable for tokenization.
     */
    static normalizeText(text: string): string;
    /**
     * Splits normalized text into a set of unique word tokens.
     * @param text Already-normalized text.
     * @returns Unique word tokens.
     */
    static tokenize(text: string): Set<string>;
    /**
     * Computes Jaccard similarity between two strings using word tokens.
     * Returns 1 when both inputs are empty (identical by convention).
     * @param a First text (will be normalized internally).
     * @param b Second text (will be normalized internally).
     * @returns A value in [0, 1] where 1 is identical and 0 is completely different.
     */
    static jaccardSimilarity(a: string, b: string): number;
    /**
     * Normalizes a URL before comparison so equivalent URLs with minor differences do not count as newly-added external links.
     * Removes hashes, common tracking parameters, lowercases hostnames, and normalizes root paths.
     * @param rawUrl Raw URL string to normalize.
     * @returns Normalized URL string, or a trimmed lowercase fallback when parsing fails.
     */
    static normalizeUrl(rawUrl: string): string;
    /**
     * Extracts all HTTP/HTTPS URLs from a block of text and normalizes them for stable old/new URL comparisons.
     * @param text Raw text to scan.
     * @returns Array of normalized URL strings.
     */
    static getUrls(text: string): string[];
    /**
     * Extracts a normalized hostname from a URL for domain-level analysis.
     * @param rawUrl URL string to parse.
     * @returns Lowercase hostname without a leading `www.`, or an empty string when parsing fails.
     */
    static getUrlHost(rawUrl: string): string;
    /**
     * Counts the number of words in a string.
     * @param text Text to count.
     * @returns Word count.
     */
    static countWords(text: string): number;
    /**
     * Splits text into normalized paragraphs on two or more consecutive newlines.
     * Paragraph normalization keeps harmless formatting and whitespace changes from being counted as full paragraph removals.
     * @param text Raw text to split.
     * @returns Non-empty normalized paragraph strings.
     */
    static splitParagraphs(text: string): string[];
    /**
     * Scores suspicious keyword density against a term list.
     * Returns a value in [0, 1]: 0 means no hits, 1 means saturated.
     * Each unique matched term contributes `1 / list.length` to the score, clamped to a maximum of 1.
     * @param text Text to scan (will be lowercased internally).
     * @param termList List of suspicious terms to look for.
     * @returns A value in [0, 1].
     */
    static scoreSuspiciousTerms(text: string, termList: string[]): number;
    /**
     * Periodically sweeps stale IP timestamp entries from the module-level `ipEditHistory` map so IPs that never edit again do not remain forever.
     * The sweep runs at most once per configured IP window.
     * @param config Plugin configuration.
     */
    static sweepIPHistory(config: ReturnType<typeof FilterSpamEdit.resolveConfig>): void;
    /**
     * Records a new edit attempt from an IP address and returns whether that edit exceeds the configured rolling-window rate limit.
     * Old entries outside `config.ipWindowMs` are pruned in-place on the same call.
     * @param ip Client IP address.
     * @param config Plugin configuration.
     * @returns `true` when the new attempt exceeds the IP limit, `false` otherwise.
     */
    static recordAndScoreIPRateLimit(ip: string, config: ReturnType<typeof FilterSpamEdit.resolveConfig>): boolean;
    /**
     * Scores likely unicode obfuscation by measuring the ratio of characters that are neither letters, numbers, punctuation, nor symbols after Unicode NFKC normalization.
     * Higher values suggest hidden / control / combining character abuse.
     * @param text Raw text to scan.
     * @returns A value in [0, 1].
     */
    static scoreUnicodeObfuscation(text: string): number;
    /**
     * Computes a spam risk score from pre-calculated signal values.
     * Each signal contributes its configured weight when triggered (signal value > 0).
     * For signals that return a continuous value in [0, 1], the contribution is `signal * weight` (proportional). For boolean signals the full weight is added.
     * The targeted-slug multiplier is applied after summation when the edited slug appears in `config.targetedSlugs`.
     * @param params Signal parameters.
     * @param params.slug The slug being edited.
     * @param params.contentDistance Jaccard distance (0 = identical, 1 = completely different). Pass -1 to skip (new page).
     * @param params.newExternalLinks Number of net-new external URLs added.
     * @param params.oldUrls Number of URLs in the old content.
     * @param params.paragraphsRemoved Fraction of old paragraphs removed.
     * @param params.suspiciousTermScore Suspicious term density (0–1).
     * @param params.unicodeObfuscationScore Unicode obfuscation ratio (0–1).
     * @param params.newWordCount Word count of the new content.
     * @param params.oldWordCount Word count of the old content. Pass 0 to skip (new page).
     * @param params.ipRateLimited Whether the submitting IP is rate-limited.
     * @param params.isNewPage Whether this is a brand-new page (no baseline).
     * @param params.config Plugin configuration.
     * @returns The computed score, reasons, and individual signal values.
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
        config: ReturnType<typeof FilterSpamEdit.resolveConfig>;
    }): SpamScoreResult;
    /**
     * Appends a blocked-edit entry to the daily log file at `config.logPath`.
     * The entry is a single JSON line with timestamp, IP, slug, score, and reasons.
     * @param config Plugin configuration.
     * @param ip Client IP address.
     * @param slug The slug that was blocked.
     * @param score The final spam score.
     * @param reasons The list of triggered signal reasons.
     */
    static logBlockedEdit(config: ReturnType<typeof FilterSpamEdit.resolveConfig>, ip: string, slug: string, score: number, reasons: string[]): void;
    /**
     * Evaluates the incoming edit request and returns `true` to block it when the computed spam score meets or exceeds `config.blockThreshold`.
     * Called automatically on the `validate-save` hook for both `save` (existing documents) and `saveNew` (new documents).
     * Fetches the current version of the document from storage to enable content-comparison signals; if no prior document exists the comparison signals are skipped.
     * @param request The Express request object containing the submitted form body.
     * @param context The Uttori wiki context with `hooks` and `config`.
     * @returns Resolves to `true` to block the save, `false` to allow it.
     */
    static validateEdit(request: import('express').Request<{
        slug: string;
    }, Record<string, never>, import('../wiki.js').UttoriWikiDocument>, context: import('../custom.js').UttoriContextWithPluginConfig<'uttori-plugin-filter-spam-edit', FilterSpamEditConfig>): Promise<boolean>;
}
export default FilterSpamEdit;
//# sourceMappingURL=filter-spam-edit.d.ts.map