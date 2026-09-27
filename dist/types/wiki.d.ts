export interface UttoriWikiViewModel {
    /** The document title to be used anywhere a title may be needed. */
    title: string;
    /** The configuration object. */
    config: import('../config.js').UttoriWikiConfig;
    /** The metadata object. */
    meta?: UttoriWikiDocumentMetaData;
    /** The base path of the request. */
    basePath: string;
    /** The document object. */
    document?: UttoriWikiDocument;
    /** The Express session object. */
    session?: import('express-session').Session & Partial<import('express-session').SessionData>;
    /** The flash object. */
    flash?: (boolean | object | string[]);
    /** Tag Routes Plugin: documents grouped by tag, or documents for a tag detail route. */
    taggedDocuments?: UttoriWikiDocument[] | Record<string, UttoriWikiDocument[]>;
    /** Category Routes Plugin: documents grouped by category, or documents for a category detail route. */
    categorizedDocuments?: UttoriWikiDocument[] | Record<string, UttoriWikiDocument[]>;
    /** Category Routes Plugin: hierarchical category data for the category index. */
    categoryTree?: Record<string, object>;
    /** Category Routes Plugin: flattened category data for the category index. */
    flattenedCategories?: object[];
    /** Category Routes Plugin: the active category path for a category detail route. */
    categoryPath?: string;
    /** Category Routes Plugin: breadcrumb data for a category detail route. */
    breadcrumbs?: object[];
    /** The search term to be used in the search results. */
    searchTerm?: string;
    /** An array of search results. */
    searchResults?: UttoriWikiDocument[];
    /** The slug of the document. */
    slug?: string;
    /** The action to be used in the form. */
    action?: string;
    /** The revision of the document. */
    revision?: string;
    /** An object of history by day. */
    historyByDay?: Record<string, string[]>;
    /** The current version of the document for comparison. */
    currentDocument?: UttoriWikiDocument;
    /** An object containing HTML table diffs for changed fields. */
    diffs?: Record<string, string>;
}
export interface UttoriWikiBuildViewModelBaseOptions {
    /** The title for the view model. */
    title?: string;
    /** The metadata for the view model. */
    meta?: UttoriWikiDocumentMetaData;
    /** The slug for the view model. */
    slug?: string;
}
export interface UttoriWikiBaseViewModel {
    /** The document title to be used anywhere a title may be needed. */
    title: string;
    /** The configuration object. */
    config: import('../config.js').UttoriWikiConfig;
    /** The Express session object. */
    session?: import('express-session').Session & Partial<import('express-session').SessionData>;
    /** The metadata object. */
    meta?: UttoriWikiDocumentMetaData;
    /** The base path of the request. */
    basePath: string;
    /** The flash object. */
    flash?: (boolean | object | string[]);
    /** The slug of the document. */
    slug?: string;
}
export interface UttoriWikiDocument {
    /** Plugin-defined document fields preserved by storage and allowedDocumentKeys. */
    [key: string]: unknown;
    /** The document slug to be used in the URL and as a unique ID. */
    slug: string;
    /** The document title to be used anywhere a title may be needed. */
    title: string;
    /**
     * An ID reference to an attachment in the attachments array that represents the document in Open Graph or elsewhere.
     */
    image?: string | null;
    /** A succinct deescription of the document, think meta description. */
    excerpt?: string;
    /** All text content for the doucment. */
    content: string;
    /** All rendered HTML content for the doucment that will be presented to the user. */
    html?: string;
    /** Milliseconds since the Unix epoch when the document was created. */
    createDate: number;
    /** Milliseconds since the Unix epoch when the document was last updated. */
    updateDate: number;
    /** A collection of tags that represent the document. */
    tags: string | string[];
    /**
     * An array of slug like strings that will redirect to this document. Useful for renaming and keeping links valid or for short form WikiLinks.
     */
    redirects?: string | string[];
    /** The layout to use when rendering the document. */
    layout?: string;
    /**
     * An array of attachments to the document with name being a display name, path being the path to the file, and type being the MIME type of the file. Useful for storing files like PDFs, images, etc.
     */
    attachments?: UttoriWikiDocumentAttachment[];
}
export interface UttoriWikiDocumentAttachment {
    /** The unique identifier of the attachment. */
    id: string;
    /** The display name of the attachment. */
    name: string;
    /** The path to the attachment. */
    path: string;
    /** The MIME type of the attachment. */
    type: string;
    /** The size of the attachment in bytes. */
    size: number;
    /** The metadata of the attachment. */
    metadata: {
        gps?: string;
    };
    /** The latitude of the GPS coordinates. */
    lat?: number;
    /** The longitude of the GPS coordinates. */
    lon?: number;
    /** Whether to skip the attachment. Used to control whether to index the attachment. */
    skip?: boolean;
}
export interface UttoriWikiDocumentMetaData {
    /** `${this.config.publicUrl}/private-document-path` */
    canonical: string;
    /** 'no-index' */
    robots: string;
    /** document.title */
    title: string;
    /** document.excerpt || document.content.slice(0, 160) */
    description: string;
    /** new Date(document.updateDate).toISOString() */
    modified: string;
    /** new Date(document.createDate).toISOString() */
    published: string;
    /** OpenGraph Image */
    image: string;
}
//# sourceMappingURL=wiki.d.ts.map