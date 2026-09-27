export interface MulterUploadConfig {
    /** An object whose keys correspond to methods, and contents are events to listen for. */
    events?: Record<string, string[]>;
    /** Directory files will be uploaded to. The default is 'uploads'. */
    directory?: string;
    /** Server route to POST uploads to. The default is '/upload'. */
    route?: string;
    /** Server route to GET uploads from. The default is '/uploads'. */
    publicRoute?: string;
    /** Custom Middleware for the Upload route */
    middleware?: import('express').RequestHandler[];
    /** Array of allowed MIME types (e.g., ['image/jpeg', 'image/png']). Empty array allows all. */
    allowedMimeTypes?: string[];
    /** Maximum file size in bytes. Default: 10MB (10485760). */
    maxFileSize?: number;
}
//# sourceMappingURL=upload-multer.d.ts.map