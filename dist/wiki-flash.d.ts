/**
 * Flash messages are stored in the session.
 * First, use `wikiFlash(key, value)` to set a flash message.
 * Then, on subsequent requests, you can retrieve the message with `wikiFlash(key)`.
 * @this {{ session: { wikiFlash: Record<string, string[]> } }}
 * @param {string} [key] The key to get or set flash data under.
 * @param {string} [value] The value to store as flash data.
 * @returns {Record<string, string[]>|Array|boolean} Returns the current flash data, or the data for the given key, or false if no data is found.
 */
export function wikiFlash(this: {
    session: {
        wikiFlash: Record<string, string[]>;
    };
}, key?: string, value?: string): Record<string, string[]> | any[] | boolean;
export function middleware(req: import("express-serve-static-core").Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>, res: import("express-serve-static-core").Response<any, Record<string, any>, number>, next: import("express-serve-static-core").NextFunction): unknown;
declare namespace _default {
    export { wikiFlash };
    export { middleware };
}
export default _default;
//# sourceMappingURL=wiki-flash.d.ts.map