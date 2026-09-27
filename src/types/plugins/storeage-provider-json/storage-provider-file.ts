export interface StorageProviderJsonFileConfig {
  /** The directory to store documents. */
  contentDirectory: string;
  /** The directory to store document histories. */
  historyDirectory: string;
  /** The file extension to use for file. */
  extension?: string;
  /**
   * When set, load Markdown content from a matching sidecar file and reject writes. For example, `md` pairs `page.json` with `page.md`.
   */
  sidecarContentExtension?: string;
  /** Should update times be marked at the time of edit. */
  updateTimestamps?: boolean;
  /** Should history entries be created. */
  useHistory?: boolean;
  /** Should we cache files in memory? */
  useCache?: boolean;
  /** The spaces parameter for JSON stringifying documents. */
  spacesDocument?: number;
  /** The spaces parameter for JSON stringifying history. */
  spacesHistory?: number;
  /** The events to listen for. */
  events?: Record<string, string[]>;
}

/** Metadata stored beside a Markdown sidecar. Body text stays in the paired file. */
export interface SidecarMetadata {
  /** Document slug; must match the metadata filename. */
  slug: string;
  /** Document title. */
  title: string;
  /** Optional summary. */
  excerpt?: string;
  /** Optional tag list. */
  tags?: unknown[];
  /** Optional creation time in Unix milliseconds. */
  createDate?: number;
  /** Optional update time in Unix milliseconds. */
  updateDate?: number;
}
