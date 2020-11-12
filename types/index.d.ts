declare module "config" {
    export const site_title: string;
    export const site_header: string;
    export const site_footer: string;
    export const site_sections: any[];
    export const home_page: string;
    export const ignore_slugs: string[];
    export const excerpt_length: number;
    export const site_url: string;
    export const theme_dir: string;
    export const theme_name: string;
    export const public_dir: string;
    export const use_delete_key: boolean;
    export const delete_key: string;
    export const use_meta_data: boolean;
    export const site_description: string;
    export const site_locale: string;
    export const site_twitter_site: string;
    export const site_twitter_creator: string;
    export const site_image: string;
    export const plugins: any[];
}
declare module "wiki" {
    export = UttoriWiki;
    class UttoriWiki {
        constructor(config: object, server: object);
        config: any;
        hooks: any;
        server: any;
        registerPlugins(config: {
            plugins: object[];
        }): void;
        validateConfig(config: {
            theme_dir: string;
            public_dir: string;
        }): void;
        buildMetadata(document?: {
            excerpt: string;
            content: string;
            updateDate: number;
            createDate: number;
            title: string;
        }, path?: string, robots?: string): Promise<object>;
        bindRoutes(server: object): void;
        home(request: Request, response: Response, next: Function): Promise<void>;
        homepageRedirect(request: object, response: object, _next: Function): void;
        tagIndex(request: object, response: object, _next: Function): Promise<void>;
        tag(request: object, response: object, next: Function): Promise<void>;
        search(request: object, response: object, _next: Function): Promise<void>;
        edit(request: object, response: object, next: Function): Promise<void>;
        delete(request: object, response: object, next: Function): Promise<void>;
        save(request: object, response: object, next: Function): Promise<void>;
        new(request: object, response: object, _next: Function): Promise<void>;
        detail(request: object, response: object, next: Function): Promise<void>;
        historyIndex(request: object, response: object, next: Function): Promise<void>;
        historyDetail(request: object, response: object, next: Function): Promise<void>;
        historyRestore(request: object, response: object, next: Function): Promise<void>;
        notFound(request: object, response: object, _next: Function): Promise<void>;
        saveValid(request: object, response: object, _next: Function): Promise<void>;
        getSiteSections(): Promise<any[]>;
        getTaggedDocuments(tag: string, limit?: number): Promise<any[]>;
        getSearchResults(query: string, limit: number): Promise<any[]>;
    }
}
declare module "middleware" {
    function _exports(config: any): any;
    export = _exports;
}
declare module "index" {
    export const config: {
        site_title: string;
        site_header: string;
        site_footer: string;
        site_sections: any[];
        home_page: string;
        ignore_slugs: string[];
        excerpt_length: number;
        site_url: string;
        theme_dir: string;
        theme_name: string;
        public_dir: string;
        use_delete_key: boolean;
        delete_key: string;
        use_meta_data: boolean;
        site_description: string;
        site_locale: string;
        site_twitter_site: string;
        site_twitter_creator: string;
        site_image: string;
        plugins: any[];
    };
    export const wiki: (config: any) => any;
    export const UttoriWiki: typeof import("wiki");
}
