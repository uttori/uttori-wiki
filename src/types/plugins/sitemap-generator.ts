export interface SitemapGeneratorUrl {
  /** The URL of the document. */
  url: string;
  /** The last modified date of the document. */
  lastmod?: string;
  /** The priority of the document. */
  priority?: string;
  /** The change frequency of the document. */
  changefreq?: string;
}

export type SitemapUrlFilter = (route: SitemapGeneratorUrl) => boolean;

export interface SitemapGeneratorConfig {
  /** An object whose keys correspond to methods, and contents are events to listen for. */
  events?: Record<string, string[]>;
  /** A collection of Uttori documents. */
  urls: SitemapGeneratorUrl[];
  /** A collection of Regular Expression URL filters to exclude documents. */
  url_filters?: RegExp[];
  /** The base URL (ie https://domain.tld) for all documents. */
  base_url: string;
  /** The path to the location you want the sitemap file to be written to. */
  directory: string;
  /** The file name to use for the generated file. */
  filename?: string;
  /** The file extension to use for the generated file. */
  extension?: string;
  /** Sitemap default page priority. */
  page_priority?: string;
  /** Sitemap XML Header, standard XML sitemap header is the default. */
  xml_header?: string;
  /** Sitemap XML Footer, standard XML sitemap closing tag is the default. */
  xml_footer?: string;
}
