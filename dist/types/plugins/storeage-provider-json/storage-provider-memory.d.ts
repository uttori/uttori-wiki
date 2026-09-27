export interface StorageProviderConfig {
    /** Should update times be marked at the time of edit. */
    updateTimestamps?: boolean;
    /** Should history entries be created. */
    useHistory?: boolean;
    /** The events to listen for. */
    events?: Record<string, string[]>;
}
//# sourceMappingURL=storage-provider-memory.d.ts.map