import type { UttoriContext } from '../custom.js';
export type { CaptureInboxConfig } from '../types/plugins/capture-inbox.js';
/** Opt-in, authenticated browser inbox for private URL and PDF captures. */
declare class CaptureInbox {
    /** @returns Configuration key used by Uttori. */
    static get configKey(): 'uttori-plugin-capture-inbox';
    /**
     * Register the browser routes after storage and search hooks are available.
     * @param context The active wiki and its inbox configuration.
     */
    static register(context: UttoriContext): void;
    /**
     * Build the private inbox and use Uttori's session CSRF protection on each mutation.
     * @param context The active wiki.
     * @param config Validated inbox settings.
     * @param origins Exact HTTP(S) capture origins.
     * @returns Mounted browser router.
     */
    private static router;
}
export default CaptureInbox;
//# sourceMappingURL=capture-inbox.d.ts.map