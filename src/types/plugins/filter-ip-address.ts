export interface FilterIPAddressConfig {
  /** Events to bind to. */
  events?: Record<string, string[]>;
  /** Directory where IP logs will be stored. */
  logPath?: string;
  /** List of IP addresses to block. */
  blocklist?: string[];
  /** Whether to trust the X-Forwarded-For header. */
  trustProxy?: boolean;
}
