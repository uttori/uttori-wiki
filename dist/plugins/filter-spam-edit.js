import { getPluginMethod } from './utilities/plugin-method.js';
import { createDebug } from '../debug.js';
import fs from 'node:fs';
import path from 'node:path';
import * as url from 'url';
/** The directory name of the current file. */
const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const debug = createDebug('Uttori.Plugin.FilterSpamEdit');
/**
 * Module-level in-memory map of IP addresses to edit timestamps.
 * Keyed by IP string. Values are arrays of `Date.now()` timestamps.
 * Entries are pruned on each access. No external store required.
 *
 */
export const ipEditHistory = new Map();
/**
 * Timestamp of the last full sweep of `ipEditHistory`.
 * Used to avoid scanning the entire map on every edit request.
 *
 */
let lastIPHistorySweep = 0;
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
class FilterSpamEdit {
    /**
     * The configuration key used to look up this plugin's settings in the site config.
     *
     * @returns The configuration key.
     */
    static get configKey() {
        return 'uttori-plugin-filter-spam-edit';
    }
    /**
     * Returns the default configuration for the plugin.
     * @returns The default configuration.
     */
    static defaultConfig() {
        return {
            events: {
                validateEdit: ['validate-save'],
                validateConfig: ['validate-config'],
            },
            blockThreshold: 75,
            targetedSlugs: [],
            targetedSlugMultiplier: 1.5,
            logPath: path.join(__dirname, 'logs'),
            ipWindowMs: 60_000,
            ipMaxEdits: 5,
            weights: {
                contentSimilarity: 40,
                externalLinksAdded: 20,
                paragraphRatio: 10,
                suspiciousTerms: 15,
                linkDensity: 10,
                ipRateLimit: 25,
                contentGrowth: 5,
                unicodeObfuscation: 10,
                smallPageLinkSpam: 15,
            },
            suspiciousTermList: ['casino', 'poker', 'viagra', 'cialis', 'crypto', 'essay', 'loan', 'payday', 'seo'],
            smallPageWordThreshold: 50,
        };
    }
    /**
     * Resolves the plugin configuration by shallow-merging top-level settings and deep-merging nested `events` and `weights` entries with their defaults.
     * This allows site config to override only the settings it needs without replacing the full default nested objects.
     * @param context The Uttori wiki context with plugin configuration.
     * @returns The resolved plugin configuration.
     */
    static resolveConfig(context) {
        const defaults = FilterSpamEdit.defaultConfig();
        const userConfig = context.config?.[FilterSpamEdit.configKey] ?? {};
        return {
            ...defaults,
            ...userConfig,
            events: {
                ...defaults.events,
                ...userConfig.events,
            },
            weights: {
                ...defaults.weights,
                ...userConfig.weights,
            },
        };
    }
    /**
     * Validates the provided configuration for required entries and correct types.
     * @param config A Uttori-like context.
     * @param _context Unused context object.
     * @throws {Error} When any required config value is missing or invalid.
     */
    static validateConfig(config, _context) {
        debug('Validating config...');
        if (!config || !config[FilterSpamEdit.configKey]) {
            throw new Error(`Config missing '${FilterSpamEdit.configKey}' entry.`);
        }
        const pluginConfig = config[FilterSpamEdit.configKey];
        if (typeof pluginConfig.blockThreshold !== 'number' || pluginConfig.blockThreshold <= 0) {
            throw new Error(`Config '${FilterSpamEdit.configKey}.blockThreshold' must be a positive number.`);
        }
        if (typeof pluginConfig.targetedSlugMultiplier !== 'number' || pluginConfig.targetedSlugMultiplier < 1) {
            throw new Error(`Config '${FilterSpamEdit.configKey}.targetedSlugMultiplier' must be a number >= 1.`);
        }
        if (typeof pluginConfig.logPath !== 'string' || !pluginConfig.logPath) {
            throw new Error(`Config '${FilterSpamEdit.configKey}.logPath' must be a non-empty string.`);
        }
        if (typeof pluginConfig.ipWindowMs !== 'number' || !Number.isInteger(pluginConfig.ipWindowMs) || pluginConfig.ipWindowMs <= 0) {
            throw new Error(`Config '${FilterSpamEdit.configKey}.ipWindowMs' must be a positive integer.`);
        }
        if (typeof pluginConfig.ipMaxEdits !== 'number' || !Number.isInteger(pluginConfig.ipMaxEdits) || pluginConfig.ipMaxEdits <= 0) {
            throw new Error(`Config '${FilterSpamEdit.configKey}.ipMaxEdits' must be a positive integer.`);
        }
        if (!pluginConfig.weights || typeof pluginConfig.weights !== 'object') {
            throw new Error(`Config '${FilterSpamEdit.configKey}.weights' must be an object.`);
        }
        for (const [key, value] of Object.entries(pluginConfig.weights)) {
            if (typeof value !== 'number' || value < 0) {
                throw new Error(`Config '${FilterSpamEdit.configKey}.weights.${key}' must be a number >= 0.`);
            }
        }
    }
    /**
     * Registers the plugin with the provided hook system, binding configured events to static methods.
     * @param context A Uttori-like context.
     * @throws {Error} When the context or hook system is missing.
     */
    static register(context) {
        debug('Registering...');
        if (!context || !context.hooks || typeof context.hooks.on !== 'function') {
            throw new Error('Missing event dispatcher in \'context.hooks.on(event, callback)\' format.');
        }
        const config = FilterSpamEdit.resolveConfig(context);
        if (!config.events) {
            throw new Error('Missing events to register for in the FilterSpamEdit configuration');
        }
        for (const [method, eventNames] of Object.entries(config.events)) {
            const FilterSpamEditMethod = getPluginMethod(FilterSpamEdit, method);
            if (FilterSpamEditMethod) {
                for (const event of eventNames) {
                    const callback = FilterSpamEditMethod;
                    context.hooks.on(event, callback);
                }
            }
            else {
                debug(`Missing function "${method}"`);
            }
        }
    }
    /**
     * Normalizes wiki text for content-similarity comparison.
     * Strips markdown syntax, HTML tags, collapses whitespace, and lowercases.
     * @param text Raw wiki page content.
     * @returns Normalized text suitable for tokenization.
     */
    static normalizeText(text) {
        if (!text)
            return '';
        return text
            .normalize('NFKC')
            .toLowerCase()
            // Strip HTML tags
            .replace(/<[^>]*>/g, ' ')
            // Strip markdown fences, inline code, headings, emphasis, links, images
            .replace(/[`*_#[\]()!]/g, ' ')
            // Collapse whitespace
            .replace(/\s+/g, ' ')
            .trim();
    }
    /**
     * Splits normalized text into a set of unique word tokens.
     * @param text Already-normalized text.
     * @returns Unique word tokens.
     */
    static tokenize(text) {
        if (!text)
            return new Set();
        return new Set(text
            .replace(/[^\p{L}\p{N}\s]/gu, ' ')
            .split(/\s+/)
            .filter(Boolean));
    }
    /**
     * Computes Jaccard similarity between two strings using word tokens.
     * Returns 1 when both inputs are empty (identical by convention).
     * @param a First text (will be normalized internally).
     * @param b Second text (will be normalized internally).
     * @returns A value in [0, 1] where 1 is identical and 0 is completely different.
     */
    static jaccardSimilarity(a, b) {
        const aTokens = FilterSpamEdit.tokenize(FilterSpamEdit.normalizeText(a));
        const bTokens = FilterSpamEdit.tokenize(FilterSpamEdit.normalizeText(b));
        if (aTokens.size === 0 && bTokens.size === 0)
            return 1;
        let intersection = 0;
        const [smaller, larger] = aTokens.size < bTokens.size ? [aTokens, bTokens] : [bTokens, aTokens];
        for (const token of smaller) {
            if (larger.has(token)) {
                intersection += 1;
            }
        }
        const union = aTokens.size + bTokens.size - intersection;
        return intersection / union;
    }
    /**
     * Normalizes a URL before comparison so equivalent URLs with minor differences do not count as newly-added external links.
     * Removes hashes, common tracking parameters, lowercases hostnames, and normalizes root paths.
     * @param rawUrl Raw URL string to normalize.
     * @returns Normalized URL string, or a trimmed lowercase fallback when parsing fails.
     */
    static normalizeUrl(rawUrl) {
        try {
            const parsed = new URL(rawUrl);
            parsed.hash = '';
            parsed.hostname = parsed.hostname.toLowerCase();
            if (parsed.pathname === '/') {
                parsed.pathname = '';
            }
            return parsed.toString();
        }
        catch {
            return rawUrl.trim().toLowerCase();
        }
    }
    /**
     * Extracts all HTTP/HTTPS URLs from a block of text and normalizes them for stable old/new URL comparisons.
     * @param text Raw text to scan.
     * @returns Array of normalized URL strings.
     */
    static getUrls(text) {
        if (!text)
            return [];
        return [...text.matchAll(/https?:\/\/[^\s)"'>]+/g)].map(([rawUrl]) => FilterSpamEdit.normalizeUrl(rawUrl));
    }
    /**
     * Extracts a normalized hostname from a URL for domain-level analysis.
     * @param rawUrl URL string to parse.
     * @returns Lowercase hostname without a leading `www.`, or an empty string when parsing fails.
     */
    static getUrlHost(rawUrl) {
        try {
            return new URL(rawUrl).hostname.replace(/^www\./, '').toLowerCase();
        }
        catch {
            return '';
        }
    }
    /**
     * Counts the number of words in a string.
     * @param text Text to count.
     * @returns Word count.
     */
    static countWords(text) {
        if (!text || !text.trim())
            return 0;
        return text.trim().split(/\s+/).length;
    }
    /**
     * Splits text into normalized paragraphs on two or more consecutive newlines.
     * Paragraph normalization keeps harmless formatting and whitespace changes from being counted as full paragraph removals.
     * @param text Raw text to split.
     * @returns Non-empty normalized paragraph strings.
     */
    static splitParagraphs(text) {
        if (!text)
            return [];
        return text
            .split(/\n{2,}/)
            .map((paragraph) => FilterSpamEdit.normalizeText(paragraph))
            .filter(Boolean);
    }
    /**
     * Scores suspicious keyword density against a term list.
     * Returns a value in [0, 1]: 0 means no hits, 1 means saturated.
     * Each unique matched term contributes `1 / list.length` to the score, clamped to a maximum of 1.
     * @param text Text to scan (will be lowercased internally).
     * @param termList List of suspicious terms to look for.
     * @returns A value in [0, 1].
     */
    static scoreSuspiciousTerms(text, termList) {
        if (!text || !termList || termList.length === 0)
            return 0;
        const normalized = FilterSpamEdit.normalizeText(text);
        const tokens = FilterSpamEdit.tokenize(normalized);
        let hits = 0;
        for (const term of termList) {
            const normalizedTerm = FilterSpamEdit.normalizeText(term);
            if (!normalizedTerm) {
                continue;
            }
            if (normalizedTerm.includes(' ')) {
                hits += normalized.includes(normalizedTerm) ? 1 : 0;
            }
            else {
                hits += tokens.has(normalizedTerm) ? 1 : 0;
            }
        }
        return Math.min(hits / termList.length, 1);
    }
    /**
     * Periodically sweeps stale IP timestamp entries from the module-level `ipEditHistory` map so IPs that never edit again do not remain forever.
     * The sweep runs at most once per configured IP window.
     * @param config Plugin configuration.
     */
    static sweepIPHistory(config) {
        const now = Date.now();
        // If the last sweep was less than the IP window ago, return
        if (now - lastIPHistorySweep < config.ipWindowMs) {
            return;
        }
        lastIPHistorySweep = now;
        // Set the cutoff time for stale entries
        const cutoff = now - config.ipWindowMs;
        for (const [ip, times] of ipEditHistory) {
            const fresh = times.filter((time) => time >= cutoff);
            if (fresh.length === 0) {
                ipEditHistory.delete(ip);
            }
            else {
                // Keep fresh entries and update the map
                ipEditHistory.set(ip, fresh);
            }
        }
    }
    /**
     * Records a new edit attempt from an IP address and returns whether that edit exceeds the configured rolling-window rate limit.
     * Old entries outside `config.ipWindowMs` are pruned in-place on the same call.
     * @param ip Client IP address.
     * @param config Plugin configuration.
     * @returns `true` when the new attempt exceeds the IP limit, `false` otherwise.
     */
    static recordAndScoreIPRateLimit(ip, config) {
        const now = Date.now();
        const cutoff = now - config.ipWindowMs;
        const times = ipEditHistory.get(ip) ?? [];
        let writeIndex = 0;
        for (const time of times) {
            if (time >= cutoff) {
                times[writeIndex] = time;
                writeIndex += 1;
            }
        }
        times.length = writeIndex;
        times.push(now);
        ipEditHistory.set(ip, times);
        return times.length > config.ipMaxEdits;
    }
    /**
     * Scores likely unicode obfuscation by measuring the ratio of characters that are neither letters, numbers, punctuation, nor symbols after Unicode NFKC normalization.
     * Higher values suggest hidden / control / combining character abuse.
     * @param text Raw text to scan.
     * @returns A value in [0, 1].
     */
    static scoreUnicodeObfuscation(text) {
        if (!text)
            return 0;
        // Normalize the text to Unicode NFKC and filter out whitespace characters
        const chars = [...text.normalize('NFKC')].filter((char) => !/\s/u.test(char));
        if (chars.length === 0)
            return 0;
        // Count the number of characters that are neither letters, numbers, punctuation, nor symbols
        const suspicious = chars.filter((char) => !/[\p{L}\p{N}\p{P}\p{S}]/u.test(char)).length;
        // Return the ratio of suspicious characters to total characters
        return suspicious / chars.length;
    }
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
    static computeScore({ slug, contentDistance, newExternalLinks, oldUrls, paragraphsRemoved, suspiciousTermScore, unicodeObfuscationScore, newWordCount, oldWordCount, ipRateLimited, isNewPage, config, }) {
        const w = config.weights;
        const reasons = [];
        const signals = {
            contentSimilarityScore: 0,
            externalLinksAddedScore: 0,
            paragraphRatioScore: 0,
            suspiciousTermsScore: 0,
            linkDensityScore: 0,
            ipRateLimitScore: 0,
            contentGrowthScore: 0,
            unicodeObfuscationScore: 0,
            smallPageLinkSpamScore: 0,
        };
        if (!isNewPage) {
            // Content similarity - high Jaccard distance means most content was replaced
            if (w.contentSimilarity > 0 && contentDistance > 0.7) {
                const contribution = contentDistance * w.contentSimilarity;
                signals.contentSimilarityScore = contribution;
                reasons.push(`content_changed_${Math.round(contentDistance * 100)}_percent`);
            }
            // Paragraph replacement ratio
            if (w.paragraphRatio > 0 && paragraphsRemoved > 0.5) {
                const contribution = paragraphsRemoved * w.paragraphRatio;
                signals.paragraphRatioScore = contribution;
                reasons.push(`paragraphs_removed_${Math.round(paragraphsRemoved * 100)}_percent`);
            }
            // Unexplained content growth (new content is > 5× old content with low similarity)
            if (w.contentGrowth > 0 && oldWordCount > 0 && newWordCount > oldWordCount * 5 && contentDistance > 0.5) {
                signals.contentGrowthScore = w.contentGrowth;
                reasons.push('large_unexplained_content_growth');
            }
            // Small page link spam - links added to a page that was previously short
            if (w.smallPageLinkSpam > 0 && oldWordCount > 0 && oldWordCount < config.smallPageWordThreshold && newExternalLinks > 0) {
                signals.smallPageLinkSpamScore = w.smallPageLinkSpam;
                reasons.push(`links_added_to_short_page_old_words_${oldWordCount}`);
            }
        }
        // External links added (applies to new pages too)
        if (w.externalLinksAdded > 0 && newExternalLinks > 0) {
            // Contribution scales with how many links were added, capped at 2× weight
            const contribution = Math.min((newExternalLinks / Math.max(oldUrls + 1, 1)) * w.externalLinksAdded, w.externalLinksAdded * 2);
            signals.externalLinksAddedScore = contribution;
            reasons.push(`added_${newExternalLinks}_external_links`);
        }
        // Suspicious term density
        if (w.suspiciousTerms > 0 && suspiciousTermScore > 0) {
            const contribution = suspiciousTermScore * w.suspiciousTerms;
            signals.suspiciousTermsScore = contribution;
            reasons.push(`suspicious_term_density_${Math.round(suspiciousTermScore * 100)}_percent`);
        }
        // Link density (links per word)
        if (w.linkDensity > 0 && newWordCount > 0) {
            const allUrls = oldUrls + newExternalLinks;
            const density = allUrls / newWordCount;
            if (density > 0.05) {
                const contribution = Math.min(density * w.linkDensity * 10, w.linkDensity);
                signals.linkDensityScore = contribution;
                reasons.push(`high_link_density_${density.toFixed(3)}`);
            }
        }
        // Unicode obfuscation
        if (w.unicodeObfuscation > 0 && unicodeObfuscationScore > 0.15) {
            const contribution = Math.min(unicodeObfuscationScore * w.unicodeObfuscation * 4, w.unicodeObfuscation);
            signals.unicodeObfuscationScore = contribution;
            reasons.push(`unicode_obfuscation_${Math.round(unicodeObfuscationScore * 100)}_percent`);
        }
        // IP rate limit
        if (w.ipRateLimit > 0 && ipRateLimited) {
            signals.ipRateLimitScore = w.ipRateLimit;
            reasons.push('ip_rate_limited');
        }
        let score = Object.values(signals).reduce((sum, v) => sum + v, 0);
        // Apply targeted-slug multiplier
        if (config.targetedSlugs.includes(slug)) {
            score *= config.targetedSlugMultiplier;
            if (reasons.length > 0) {
                reasons.push(`targeted_slug_multiplier_${config.targetedSlugMultiplier}x`);
            }
        }
        return { score, reasons, signals };
    }
    /**
     * Appends a blocked-edit entry to the daily log file at `config.logPath`.
     * The entry is a single JSON line with timestamp, IP, slug, score, and reasons.
     * @param config Plugin configuration.
     * @param ip Client IP address.
     * @param slug The slug that was blocked.
     * @param score The final spam score.
     * @param reasons The list of triggered signal reasons.
     */
    static logBlockedEdit(config, ip, slug, score, reasons) {
        try {
            if (!fs.existsSync(config.logPath)) {
                fs.mkdirSync(config.logPath, { recursive: true });
            }
            const date = new Date();
            const logFile = path.join(config.logPath, `spam-block-${date.toISOString().slice(0, 10)}.log`);
            const entry = {
                timestamp: date.toISOString(),
                ip,
                slug,
                score,
                reasons,
            };
            fs.appendFileSync(logFile, `${JSON.stringify(entry)}\n`);
            debug(`Logged blocked edit for ${ip} on slug "${slug}" (score: ${score})`);
            /* c8 ignore next 3 */
        }
        catch (error) {
            debug(`Error logging blocked edit: ${String(error)}`);
        }
    }
    /**
     * Evaluates the incoming edit request and returns `true` to block it when the computed spam score meets or exceeds `config.blockThreshold`.
     * Called automatically on the `validate-save` hook for both `save` (existing documents) and `saveNew` (new documents).
     * Fetches the current version of the document from storage to enable content-comparison signals; if no prior document exists the comparison signals are skipped.
     * @param request The Express request object containing the submitted form body.
     * @param context The Uttori wiki context with `hooks` and `config`.
     * @returns Resolves to `true` to block the save, `false` to allow it.
     */
    static async validateEdit(request, context) {
        debug('Validating edit for spam...');
        const config = FilterSpamEdit.resolveConfig(context);
        const slug = String(request.params?.slug || request.body?.slug || '').toLowerCase().trim();
        const newContent = String(request.body?.content || '');
        // Resolve the client IP
        const ip = request.ip || request.socket?.remoteAddress || '0.0.0.0';
        // Record this edit attempt (for rate-limit tracking)
        FilterSpamEdit.sweepIPHistory(config);
        const ipRateLimited = FilterSpamEdit.recordAndScoreIPRateLimit(ip, config);
        // Fetch the existing document to compare against
        let oldContent = '';
        let isNewPage = true;
        try {
            const results = await context.hooks.fetch('storage-get', slug, context);
            const existing = Array.isArray(results) ? results[0] : results;
            if (existing?.content) {
                oldContent = String(existing.content);
                isNewPage = false;
            }
        }
        catch (error) {
            debug('Error fetching existing document for spam check:', error);
        }
        // Compute signals
        const contentDistance = isNewPage ? -1 : (1 - FilterSpamEdit.jaccardSimilarity(oldContent, newContent));
        const oldUrls = FilterSpamEdit.getUrls(oldContent);
        const newUrls = FilterSpamEdit.getUrls(newContent);
        const oldUrlSet = new Set(oldUrls);
        const newExternalLinks = newUrls.reduce((count, u) => count + (oldUrlSet.has(u) ? 0 : 1), 0);
        const oldParagraphs = FilterSpamEdit.splitParagraphs(oldContent);
        const newParagraphSet = new Set(FilterSpamEdit.splitParagraphs(newContent));
        const removedCount = oldParagraphs.reduce((count, paragraph) => count + (newParagraphSet.has(paragraph) ? 0 : 1), 0);
        const paragraphsRemoved = isNewPage || oldParagraphs.length === 0 ? 0 : removedCount / oldParagraphs.length;
        const suspiciousTermScore = FilterSpamEdit.scoreSuspiciousTerms(newContent, config.suspiciousTermList);
        const unicodeObfuscationScore = FilterSpamEdit.scoreUnicodeObfuscation(newContent);
        const oldWordCount = FilterSpamEdit.countWords(oldContent);
        const newWordCount = FilterSpamEdit.countWords(newContent);
        // Score
        const { score, reasons } = FilterSpamEdit.computeScore({
            slug,
            contentDistance,
            newExternalLinks,
            oldUrls: oldUrlSet.size,
            paragraphsRemoved,
            suspiciousTermScore,
            unicodeObfuscationScore,
            newWordCount,
            oldWordCount,
            ipRateLimited,
            isNewPage,
            config,
        });
        debug(`Spam score for "${slug}": ${score} (threshold: ${config.blockThreshold}) reasons: ${reasons.join(', ')}`);
        if (score >= config.blockThreshold) {
            debug(`Blocking edit to "${slug}" with score ${score}`);
            FilterSpamEdit.logBlockedEdit(config, ip, slug, score, reasons);
            return true;
        }
        return false;
    }
}
export default FilterSpamEdit;
//# sourceMappingURL=filter-spam-edit.js.map