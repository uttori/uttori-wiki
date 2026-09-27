export interface FilterSpamEditWeights {
  /** Jaccard distance weight for large content replacement. Set to 0 to disable. */
  contentSimilarity?: number;
  /** Weight for net-new external URLs added. Set to 0 to disable. */
  externalLinksAdded?: number;
  /** Weight for a high fraction of paragraphs replaced or removed. Set to 0 to disable. */
  paragraphRatio?: number;
  /** Weight for hits from `suspiciousTermList`. Set to 0 to disable. */
  suspiciousTerms?: number;
  /** Weight for an unusually high links-per-word ratio. Set to 0 to disable. */
  linkDensity?: number;
  /** Weight applied when the submitting IP exceeds `ipMaxEdits` within `ipWindowMs`. Set to 0 to disable. */
  ipRateLimit?: number;
  /** Weight for content that grows to an implausibly large multiple of the original. Set to 0 to disable. */
  contentGrowth?: number;
  /** Weight for a high ratio of non-letter/number characters (obfuscation attempts). Set to 0 to disable. */
  unicodeObfuscation?: number;
  /** Weight for external links added to a page that was previously short. Set to 0 to disable. */
  smallPageLinkSpam?: number;
}

export interface FilterSpamEditConfig {
  /** Events to bind to. */
  events?: Record<string, string[]>;
  /** Score (0–100 scale) at or above which the edit is blocked. */
  blockThreshold?: number;
  /**
   * Slugs known to be frequently targeted by spammers. Edits to these pages have their score multiplied by `targetedSlugMultiplier`.
   */
  targetedSlugs?: string[];
  /** Score multiplier applied when the edited slug is in `targetedSlugs`. Must be >= 1. */
  targetedSlugMultiplier?: number;
  /** Directory where blocked-edit JSON log files are written. */
  logPath?: string;
  /** Rolling time window in milliseconds for IP-based rate limiting. */
  ipWindowMs?: number;
  /** Maximum number of edits permitted from one IP within `ipWindowMs` before the `ipRateLimit` weight fires. */
  ipMaxEdits?: number;
  /** Per-signal weight values. Set any to 0 to disable that signal entirely. */
  weights?: FilterSpamEditWeights;
  /** Known spam keyword list used by the `suspiciousTerms` signal. */
  suspiciousTermList?: string[];
  /** Word count below which the `smallPageLinkSpam` signal is active for old content. */
  smallPageWordThreshold?: number;
}

export interface SpamSignals {
  /** Contribution (0–weight) from Jaccard content distance. */
  contentSimilarityScore: number;
  /** Contribution from new external URLs. */
  externalLinksAddedScore: number;
  /** Contribution from changed paragraph structure. */
  paragraphRatioScore: number;
  /** Contribution from suspicious keyword matches. */
  suspiciousTermsScore: number;
  /** Contribution from links-per-word ratio. */
  linkDensityScore: number;
  /** Contribution from IP rate limit violation. */
  ipRateLimitScore: number;
  /** Contribution from unexplained content size growth. */
  contentGrowthScore: number;
  /** Contribution from non-word character ratio. */
  unicodeObfuscationScore: number;
  /** Contribution from links added to a short page. */
  smallPageLinkSpamScore: number;
}

export interface SpamScoreResult {
  /** The final weighted score (after any targeted-slug multiplier). */
  score: number;
  /** Human-readable list of triggered signals for log output. */
  reasons: string[];
  /** Individual signal contributions before aggregation. */
  signals: SpamSignals;
}
