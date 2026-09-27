export interface MarkdownItExample {
  /** Editable input shown in the rendered block. */
  source: string;
  /** Output visible before client-side enhancement. */
  expectedOutput: string;
  /** Input field label; defaults to "Input". */
  inputLabel?: string;
  /** Output field label; defaults to "Output". */
  outputLabel?: string;
}

export interface MarkdownItRendererOptionsUttori {
  /** Prefix for relative URLs, useful when the Express app is not at URI root. */
  baseUrl: string;
  /**
   * Allowed External Domains, if a domain is not in this list, it is set to 'nofollow'. Values should be strings of the hostname portion of the URL object (like example.org).
   */
  allowedExternalDomains: string[];
  /**
   * Optionally disable the built in Markdown-It link validation, large security risks when link validation is disabled.
   */
  disableValidation: boolean;
  /** Open external domains in a new window. */
  openNewWindow: boolean;
  /** Add lazy loading params to image tags. */
  lazyImages: boolean;
  /**
   * Defaults to true.Emit escaped Mermaid fences as `pre.mermaid` for client-side rendering, false keeps ordinary code blocks.
   */
  mermaid?: boolean;
  /** Registered editable input and expected output for `[example:id]` blocks. */
  examples?: Record<string, MarkdownItExample>;
  /** Footnote settings. */
  footnotes: {
    referenceTag: typeof import('../../plugins/markdown-it-plugin/footnotes.js').referenceTag;
    definitionOpenTag: typeof import('../../plugins/markdown-it-plugin/footnotes.js').definitionOpenTag;
    definitionCloseTag: string;
  };
  /** Table of Contents settings. */
  toc: {
    extract: boolean;
    openingTag: string;
    closingTag: string;
    slugify: object;
    stableIds?: boolean;
  };
  /** WikiLinks settings. */
  wikilinks: {
    slugify: object;
  };
}

export interface MarkdownItRendererOptions {
  /** Enable HTML tags in source. */
  html?: boolean;
  /** Use '/' to close single tags. */
  xhtmlOut?: boolean;
  /** Convert '\n' in paragraphs into <br>. */
  breaks?: boolean;
  /** CSS language prefix for fenced blocks. */
  langPrefix?: string;
  /** Autoconvert URL-like text to links. */
  linkify?: boolean;
  /** Enable some language-neutral replacement + quotes beautification. */
  typographer?: boolean;
  /** Double + single quotes replacement pairs. */
  quotes?: string | string[];
  /** The Uttori specific configuration. */
  uttori: MarkdownItRendererOptionsUttori;
}

export interface MarkdownItRendererConfig {
  /** An object whose keys correspond to methods, and contents are events to listen for. */
  events?: Record<string, string[]>;
  /** The MarkdownIt configuration. */
  markdownIt: MarkdownItRendererInputOptions;
}

/** Partial caller settings; extendConfig fills nested renderer defaults before parsing. */
export type MarkdownItRendererInputOptions = Omit<MarkdownItRendererOptions, 'uttori'> & {
  uttori?: Partial<Omit<MarkdownItRendererOptionsUttori, 'footnotes' | 'toc' | 'wikilinks'>> & {
    footnotes?: Partial<MarkdownItRendererOptionsUttori['footnotes']>;
    toc?: Partial<MarkdownItRendererOptionsUttori['toc']>;
    wikilinks?: Partial<MarkdownItRendererOptionsUttori['wikilinks']>;
  };
};

/** MarkdownIt passes these plugin-owned values between its parsing and rendering stages. */
declare module 'markdown-it' {
  interface MarkdownItOptions {
    /** Uttori options are populated by the renderer before rules execute. */
    uttori?: MarkdownItRendererOptionsUttori;
  }
  interface Env {
    /** Footnote state shared by block and inline rules. */
    footnotes?: import('../../plugins/markdown-it-plugin/footnotes.js').MarkdownItFootnotesEnv;
    /** Headings collected before table-of-contents rendering. */
    toc_headings?: import('../../plugins/markdown-it-plugin/toc.js').MarkdownItTocHeading[];
  }
}
