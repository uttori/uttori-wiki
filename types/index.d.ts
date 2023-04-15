import express = require('express');

export type UttoriWikiSiteSection = {
    /** Site section header text. */
    title: string;
    /** Site section description text. */
    description: string;
    /** Site section related tag. */
    tag: string;
}

export type UttoriWikiConfig = {
    production?: boolean;
    site_title?: string;
    site_header?: string;
    site_footer?: string;
    site_sections: UttoriWikiSiteSection[];
    home_page?: string;
    ignore_slugs: string[];
    excerpt_length?: number;
    site_url?: string;
    theme_dir?: string;
    public_dir?: string;
    use_delete_key?: boolean;
    delete_key: string | undefined;
    use_edit_key?: boolean;
    edit_key?: string | undefined;
    public_history?: boolean;
    handle_not_found?: boolean;
    allowedDocumentKeys: string[];
    use_meta_data?: boolean;
    site_locale?: string;
    site_twitter_site?: string;
    site_twitter_creator?: string;
    site_image?: string;
    use_cache?: boolean;
    cache_short?: number;
    cache_long?: number;
    homeRoute?: Function;
    tagIndexRoute?: Function;
    tagRoute?: Function;
    searchRoute?: Function;
    editRoute?: Function;
    deleteRoute?: Function;
    saveRoute?: Function;
    saveNewRoute?: Function;
    newRoute?: Function;
    detailRoute?: Function;
    previewRoute?: Function;
    historyIndexRoute?: Function;
    historyDetailRoute?: Function;
    historyRestoreRoute?: Function;
    notFoundRoute?: Function;
    saveValidRoute?: Function;
    routeMiddleware?: {
        home: express.RequestHandler[];
        tagIndex: express.RequestHandler[];
        tag: express.RequestHandler[];
        search: express.RequestHandler[];
        notFound: express.RequestHandler[];
        create: express.RequestHandler[];
        saveNew: express.RequestHandler[];
        preview: express.RequestHandler[];
        edit: express.RequestHandler[];
        delete: express.RequestHandler[];
        historyIndex: express.RequestHandler[];
        historyDetail: express.RequestHandler[];
        historyRestore: express.RequestHandler[];
        save: express.RequestHandler[];
        detail: express.RequestHandler[];
    };
    plugins: any[];
    middleware?: any[];
};

export class UttoriWiki {
    constructor(config: UttoriWikiConfig, server: express.Application);
    config: UttoriWikiConfig;
    hooks: any;
    registerPlugins(config: UttoriWikiConfig): void;
    validateConfig(config: UttoriWikiConfig): void;
    buildMetadata(document: UttoriWikiDocument | object, path?: string, robots?: string): Promise<object>;
    bindRoutes(server: express.Application): void;
    home(request: express.Request, response: express.Response, next: express.NextFunction): Promise<express.RequestHandler>;
    homepageRedirect(request: express.Request, response: express.Response, _next: express.NextFunction): express.RequestHandler;
    tagIndex(request: express.Request, response: express.Response, next: express.NextFunction): Promise<express.RequestHandler>;
    tag(request: express.Request, response: express.Response, next: express.NextFunction): Promise<express.RequestHandler>;
    search(request: express.Request, response: express.Response, next: express.NextFunction): Promise<express.RequestHandler>;
    edit(request: express.Request, response: express.Response, next: express.NextFunction): Promise<express.RequestHandler>;
    delete(request: express.Request, response: express.Response, next: express.NextFunction): Promise<express.RequestHandler>;
    save(request: express.Request, response: express.Response, next: express.NextFunction): Promise<express.RequestHandler>;
    saveNew(request: express.Request, response: express.Response, next: express.NextFunction): Promise<express.RequestHandler>;
    create(request: express.Request, response: express.Response, next: express.NextFunction): Promise<express.RequestHandler>;
    detail(request: express.Request, response: express.Response, next: express.NextFunction): Promise<express.RequestHandler>;
    preview(request: express.Request, response: express.Response, next: express.NextFunction): Promise<express.RequestHandler>;
    historyIndex(request: express.Request, response: express.Response, next: express.NextFunction): Promise<express.RequestHandler>;
    historyDetail(request: express.Request, response: express.Response, next: express.NextFunction): Promise<express.RequestHandler>;
    historyRestore(request: express.Request, response: express.Response, next: express.NextFunction): Promise<express.RequestHandler>;
    notFound(request: express.Request, response: express.Response, next: express.NextFunction): Promise<express.RequestHandler>;
    saveValid(request: express.Request, response: express.Response, next: express.NextFunction): Promise<express.RequestHandler>;
    getTaggedDocuments(tag: string, limit?: number): Promise<any[]>;
}

export type UttoriWikiDocument = {
    slug: string;
    title: string;
    image?: string;
    excerpt: string;
    content: string;
    html?: string;
    createDate: number;
    updateDate: number;
    tags: string[];
    redirects?: string[];
};

declare module "wiki-flash" {
    export function wikiFlash(key?: string, value?: any): object | any[] | boolean;
    export function middleware(request: express.Request, _response: express.Response, next: express.NextFunction): void;
}

/** Add wikiFlash to the Request type. */
declare global {
    namespace Express {
        export interface Request {
            wikiFlash(key?: string, value?: any): object | any[] | boolean;
        }
    }
}

declare module "middleware" {
    function _exports(config: UttoriWikiConfig): express.Application;
    export = _exports;
}

declare module '@uttori/wiki' {
    export const config: UttoriWikiConfig;
    export const wiki: (config: UttoriWikiConfig) => express.Application;
    export const UttoriWiki: UttoriWiki;
}
