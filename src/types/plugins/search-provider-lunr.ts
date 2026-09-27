export type LunrLocale = ((lunrModule: typeof import('lunr')) => void);

export interface SearchLunrConfig {
  /** A list of locales to add support for from lunr-languages. */
  lunr_locales?: string[];
  /** A list of locales to add support for from lunr-languages. */
  lunrLocaleFunctions?: LunrLocale[];
  /** A list of slugs to not consider when indexing documents. */
  ignoreSlugs?: string[];
  /** The events to listen for. */
  events?: Record<string, string[]>;
}
