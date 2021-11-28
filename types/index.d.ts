declare module '@uttori/wiki';

declare module "config" {
    export = config;
    const config: UttoriWikiConfig;
    namespace config {
        export { UttoriWikiConfig };
    }
    type UttoriWikiConfig = {
        site_title?: string;
        site_header?: string;
        site_footer?: string;
        site_sections?: {
            title: string;
            description: string;
            tag: string;
        };
        home_page?: string;
        ignore_slugs?: string[];
        excerpt_length?: number;
        site_url?: string;
        theme_dir?: string;
        public_dir?: string;
        use_delete_key?: boolean;
        delete_key: string;
        use_edit_key?: boolean;
        edit_key: string;
        public_history?: boolean;
        allowedDocumentKeys?: string[];
        use_meta_data?: boolean;
        site_locale?: string;
        site_twitter_site?: string;
        site_twitter_creator?: string;
        plugins: any[];
        middleware?: any[];
        cache_short?: number;
        cache_long?: number;
    };
}
declare module "wiki" {
    export = UttoriWiki;
    class UttoriWiki {
        constructor(config: UttoriWikiConfig, server: Application);
        config: {
            site_title?: string;
            site_header?: string;
            site_footer?: string;
            site_sections?: {
                title: string;
                description: string;
                tag: string;
            }[];
            home_page?: string;
            ignore_slugs?: string[];
            excerpt_length?: number;
            site_url?: string;
            theme_dir?: string;
            public_dir?: string;
            use_delete_key?: boolean;
            delete_key: string;
            use_edit_key?: boolean;
            edit_key: string;
            public_history?: boolean;
            allowedDocumentKeys?: string[];
            use_meta_data?: boolean;
            site_locale?: string;
            site_twitter_site?: string;
            site_twitter_creator?: string;
            plugins: any[];
            middleware?: any[];
            cache_short?: number;
            cache_long?: number;
        };
        hooks: any;
        registerPlugins(config: UttoriWikiConfig): void;
        validateConfig(config: UttoriWikiConfig): void;
        buildMetadata(document: UttoriWikiDocument | object, path?: string, robots?: string): Promise<object>;
        bindRoutes(server: Application): void;
        home(request: Request, response: Response, next: Function): Promise<void>;
        homepageRedirect(request: Request, response: Response, _next: Function): void;
        tagIndex(request: Request, response: Response, _next: Function): Promise<void>;
        tag(request: Request, response: Response, next: Function): Promise<void>;
        search(request: Request, response: Response, _next: Function): Promise<void>;
        edit(request: Request, response: Response, next: Function): Promise<void>;
        delete(request: Request, response: Response, next: Function): Promise<void>;
        save(request: Request, response: Response, next: Function): Promise<void>;
        new(request: Request, response: Response, next: Function): Promise<void>;
        detail(request: Request, response: Response, next: Function): Promise<void>;
        preview(request: Request, response: Response, next: Function): Promise<void>;
        historyIndex(request: Request, response: Response, next: Function): Promise<void>;
        historyDetail(request: Request, response: Response, next: Function): Promise<void>;
        historyRestore(request: Request, response: Response, next: Function): Promise<void>;
        notFound(request: Request, response: Response, _next: Function): Promise<void>;
        saveValid(request: Request, response: Response, _next: Function): Promise<void>;
        getTaggedDocuments(tag: string, limit?: number): Promise<any[]>;
    }
    namespace UttoriWiki {
        export { UttoriWikiDocument };
    }
    import { UttoriWikiConfig } from "config";
    type UttoriWikiDocument = {
        slug: string;
        title: string;
        excerpt: string;
        content: string;
        html?: string;
        createDate: number;
        updateDate: number;
        redirects?: string[];
    };
}
declare module "middleware" {
    function _exports(config: any): any;
    export = _exports;
}
declare module "index" {
    export const config: import("config").UttoriWikiConfig;
    export const wiki: (config: any) => any;
    export const UttoriWiki: typeof import("wiki");
}
