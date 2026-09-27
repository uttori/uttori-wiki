/**
 * Flash messages are stored in the session.
 * First, use `wikiFlash(key, value)` to set a flash message.
 * Then, on subsequent requests, you can retrieve the message with `wikiFlash(key)`.
 * @param [key] The key to get or set flash data under.
 * @param [value] The value to store as flash data.
 * @returns Returns the current flash data, or the data for the given key, or false if no data is found.
 */
export declare function wikiFlash(this: {
    session?: {
        wikiFlash?: Record<string, string[]>;
    };
}, key?: string, value?: string): Record<string, string[]> | unknown[] | boolean;
/**
 * Return the middleware that adds `wikiFlash`.
 *
 * @param request The Express Request object.
 * @param _response The Express Response object.
 * @param next The Express Next function.
 */
export declare function middleware(request: import('express').Request, _response: import('express').Response, next: import('express').NextFunction): void;
declare const _default: {
    wikiFlash: typeof wikiFlash;
    middleware: typeof middleware;
};
export default _default;
//# sourceMappingURL=wiki-flash.d.ts.map