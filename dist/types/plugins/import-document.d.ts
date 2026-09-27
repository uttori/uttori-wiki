import type { UttoriWikiDocument as ImportDocumentFields } from '../../wiki.js';
export interface ImportDocumentConfigPage {
    /** The URL of the page. */
    url: string;
    /** The name of the page. */
    name: string;
    /** The type of the page. */
    type: string;
}
export interface ImportDocumentDownload {
    /** The URL of the page. */
    url: string;
    /** The name of the file. */
    fileName: string;
    /** The type of the page. */
    type: string;
}
/** Downloads an imported page. */
export type ImportDocumentDownloadFile = (download: ImportDocumentDownload) => Promise<void>;
/** Configuration passed to page processors after upload paths and the downloader are resolved. */
export type ImportDocumentProcessConfig = ImportDocumentConfig & Required<Pick<ImportDocumentConfig, 'uploadDirectory' | 'uploadPath' | 'downloadFile'>>;
/** Processes an imported page after download. */
export type ImportDocumentProcessPageFunction = (config: ImportDocumentProcessConfig, content: string, page: ImportDocumentConfigPage) => Promise<ImportDocumentProcessPage>;
export interface ImportDocumentProcessPage {
    /** The content of the page. */
    content: string;
    /** The attachments of the page. */
    attachments: import('../../wiki.js').UttoriWikiDocumentAttachment[];
}
export interface ImportDocumentApiPayload {
    /** The title of the document. */
    title: string;
    /** The image of the document. */
    image: string;
    /** The excerpt of the document. */
    excerpt: string;
    /** The pages of the document. */
    pages: ImportDocumentConfigPage[];
    /** The tags of the document. */
    tags: string[];
    /** The slug of the document. */
    slug: string;
    /** The redirects of the document. */
    redirects: string[];
}
export type ImportDocumentContext = import('../../custom.js').UttoriContextWithPluginConfig<'uttori-plugin-import-document', ImportDocumentConfig>;
/** Builds an Express request handler from plugin context. */
export type ImportDocumentRequestHandlerFactory = (ctx: ImportDocumentContext) => import('express').RequestHandler;
export interface ImportDocumentConfig {
    /** An object whose keys correspond to methods, and contents are events to listen for. */
    events?: Record<string, string[]>;
    /** The API route for importing documents. */
    apiRoute?: string;
    /** Server route to show the import interface. */
    publicRoute?: string;
    /** The path to reference uploaded files by. */
    uploadPath?: string;
    /** The directory to upload files to. */
    uploadDirectory?: string;
    /**
     * When not an empty attay, check to see if the current referrer starts with any of the items in this list. When an empty array don't check at all.
     */
    allowedReferrers?: string[];
    /** A request handler for the interface route. */
    interfaceRequestHandler?: ImportDocumentRequestHandlerFactory;
    /** A request handler for the API route. */
    apiRequestHandler?: ImportDocumentRequestHandlerFactory;
    /** Custom Middleware for the API route. */
    middlewareApi?: import('express').RequestHandler[];
    /** Custom Middleware for the public route. */
    middlewarePublic?: import('express').RequestHandler[];
    /** Downloads an imported page. */
    downloadFile?: ImportDocumentDownloadFile;
    /** Processes an imported page. */
    processPage?: ImportDocumentProcessPageFunction;
}
/** JSON fields accepted by the document-import route before its existing validation runs. */
export interface ImportDocumentPayload extends Partial<ImportDocumentFields> {
    /** Tags submitted by the import form; an empty array selects no tags. */
    tags: ImportDocumentFields['tags'];
    /** Remote pages appended to the new document. */
    pages?: ImportDocumentConfigPage[];
}
//# sourceMappingURL=import-document.d.ts.map