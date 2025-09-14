/**
 * @typedef {object} ParsedPathKey
 * @property {string} name The name of the segment variable.
 * @property {boolean} optional When true, the segment is optional.
 * @property {string} [def] The default value of the segment, if set.
 */
/**
 * Parse an Express compatible path into an array containing literal path segments and ParsedPathKey objects.
 * @param {string} path The path to parse.
 * @returns {Array<ParsedPathKey | string>} The parsed path segments.
 */
export function parsePath(path: string): Array<ParsedPathKey | string>;
/**
 * The function iterates over the parsed segments of the target.
 * For each segment, if it's an object representing a key, it checks against the routeKeyMap to see if the key is present in the route.
 * If the key is not in the route, it checks if the key is optional or has a default value.
 * String segments (path elements) are returned as is, while key objects are returned with their modifications (if any).
 * @param {string} route The route to process.
 * @param {string} target The target to process.
 * @returns {Array<ParsedPathKey | string>} The processed segments, ready to be used for path construction.
 */
export function prepareTarget(route: string, target: string): Array<ParsedPathKey | string>;
/**
 * The buildPath function constructs the final path string.
 * It iterates over the combined segments, assembling the path segment-by-segment.
 * This function handles the inclusion of parameters and defaults and concatenates the final path.
 * @param {Record<string, string | undefined>} params The key/value pairs to compile.
 * @param {string} route The route to.
 * @param {string} target The target to compile.
 * @returns {string} The compiled path.
 */
export function buildPath(params: Record<string, string | undefined>, route: string, target: string): string;
export type ParsedPathKey = {
    /**
     * The name of the segment variable.
     */
    name: string;
    /**
     * When true, the segment is optional.
     */
    optional: boolean;
    /**
     * The default value of the segment, if set.
     */
    def?: string;
};
//# sourceMappingURL=redirect.d.ts.map