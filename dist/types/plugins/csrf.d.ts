export interface CsrfProtectionConfig {
    /**
     * An object whose keys correspond to plugin methods, and whose values are arrays of hook event names to listen for.
     */
    events?: Record<string, string[]>;
    /** The hidden form field name that themes should render and that is read from the POST body on save. */
    fieldName?: string;
    /** The HTTP request header name that JavaScript clients can use to submit the token instead of a form field. */
    headerName?: string;
    /**
     * The key used to store the CSRF token on `request.session`. Change this if it collides with another session value.
     */
    sessionKey?: string;
    /**
     * Number of random bytes to generate. Each byte becomes two hex characters, so the default produces a 64-character token.
     */
    tokenBytes?: number;
    /**
     * Ordered list of sources to search for the submitted token. The first source that contains a non-empty value is used.
     */
    sources?: ('body' | 'header')[];
    /**
     * When `true`, a missing or unavailable `request.session` causes the token to be skipped on injection and the request to be blocked on validation. Set to `false` only if your setup guarantees cookies can never be forged (e.g. purely API clients with custom headers).
     */
    requireSession?: boolean;
    /**
     * When `true`, a fresh token is written to the session every time a valid save request completes. This limits replay-window but will break any browser tabs that still hold the old token. Leave `false` for typical wikis where multiple tabs are common.
     */
    rotateOnValidation?: boolean;
    /**
     * When `true`, the `Sec-Fetch-Site` header is also checked as a defense-in-depth measure. Requests that arrive as `cross-site` are rejected even if the CSRF token matches. Has no effect on browsers that do not send Fetch Metadata headers (e.g. some older browsers), so this is supplemental, not a replacement for token checks.
     */
    checkFetchMetadata?: boolean;
}
export interface CsrfViewModel {
    /** The raw CSRF token value. Read this in JavaScript clients to set the `x-csrf-token` request header. */
    token: string;
    /** The form field name that the token should be submitted under. */
    fieldName: string;
    /** The HTTP header name that JavaScript clients should use. */
    headerName: string;
    /**
     * A ready-to-render hidden `<input>` element. Use `<%- csrf?.input || '' -%>` inside the edit form in EJS templates.
     */
    input: string;
}
//# sourceMappingURL=csrf.d.ts.map