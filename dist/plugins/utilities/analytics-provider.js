import { createDebug } from '../../debug.js';
import * as fs from 'node:fs';
import path from 'node:path';
const debug = createDebug('Uttori.Utilities.AnalyticsProvider');
/**
 * Page view analytics for Uttori documents using JSON files stored on the local file system.
 * @example <caption>Init AnalyticsProvider</caption>
 * const analyticsProvider = new AnalyticsProvider({ directory: 'data' });
 */
class AnalyticsProvider {
    /**
     * Creates an instance of AnalyticsProvider.
     * @param config A configuration object.
     */
    constructor(config) {
        debug('constructor');
        if (!config) {
            debug('No config provided.');
            throw new Error('No config provided.');
        }
        if (!config.directory) {
            debug('No directory provided.');
            throw new Error('No directory provided.');
        }
        this.config = {
            name: 'visits',
            extension: 'json',
            ...config,
        };
        fs.mkdirSync(this.config.directory, { recursive: true });
        this.pageVisits = JSON.parse(fs.readFileSync(path.join(this.config.directory, `${this.config.name}.${this.config.extension}`), 'utf8'));
    }
    /**
     * Updates the view count for a given document slug.
     * @param slug The slug of the document to be updated.
     * @param [value] An optional value to set the count to exactly.
     * @returns The number of hits for a given slug after updating.
     */
    update(slug, value) {
        debug('update:', slug, value);
        if (!slug) {
            debug('Missing:', slug, value);
            return 0;
        }
        if (Number.isInteger(this.pageVisits[slug])) {
            debug('Existing');
            this.pageVisits[slug] += 1;
        }
        else {
            debug('New');
            this.pageVisits[slug] = 1;
        }
        if (Number.isInteger(value)) {
            this.pageVisits[slug] = Number(value);
        }
        fs.writeFileSync(path.join(this.config.directory, `${this.config.name}.${this.config.extension}`), JSON.stringify(this.pageVisits), 'utf8');
        debug('Updated:', slug, this.pageVisits[slug]);
        return this.pageVisits[slug];
    }
    /**
     * Returns the view count for a given document slug.
     * @param slug The slug of the document to be looked up.
     * @returns View count for the given slug.
     * @example
     * analyticsProvider.get('faq');
     * ➜ 10
     */
    get(slug) {
        debug('get:', slug);
        if (!slug || !Number.isInteger(this.pageVisits[slug])) {
            debug('Missing:', slug, this.pageVisits[slug]);
            return 0;
        }
        debug('Got:', slug, this.pageVisits[slug]);
        return this.pageVisits[slug];
    }
    /**
     * Returns the most popular documents.
     * @param limit The number of documents to return.
     * @returns View count for the given slug.
     * @example
     * analyticsProvider.getPopularDocuments(10);
     * ➜ [ { slug: 'faq', count: 10 } ]
     */
    getPopularDocuments(limit) {
        debug('getPopularDocuments:', limit);
        if (!limit || !Number.isInteger(limit)) {
            debug('Missing or invalid limit.', limit);
            throw new Error('Missing or invalid limit.');
        }
        const popular = Object.entries(this.pageVisits)
            .map(([slug, count]) => ({ slug, count: Number(count) }))
            .sort((a, b) => Number(b.count) - Number(a.count))
            .slice(0, limit);
        debug('Found:', popular);
        return popular;
    }
}
export default AnalyticsProvider;
//# sourceMappingURL=analytics-provider.js.map