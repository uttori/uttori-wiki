/**
 * Flash messages are stored in the session.
 * First, use `wikiFlash(key, value)` to set a flash message.
 * Then, on subsequent requests, you can retrieve the message with `wikiFlash(key)`.
 * @param {string} [key] The key to get or set flash data under.
 * @param {*} [value] The value to store as flash data.
 * @returns {object|Array|boolean} Returns
 */
export function wikiFlash(key?: string, value?: any): object | any[] | boolean;
export function middleware(req: import("express-serve-static-core").Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>, res: import("express-serve-static-core").Response<any, Record<string, any>, number>, next: import("express-serve-static-core").NextFunction): void;
declare namespace _default {
    export { wikiFlash };
    export { middleware };
}
export default _default;
//# sourceMappingURL=wiki-flash.d.ts.map