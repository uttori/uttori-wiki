import { footnoteDefinition, footnoteReferences, configFootnoteReference, configFootnoteOpen, configFootnoteClose } from './footnotes.js';
import { headingOpen, tocOpen, tocClose, tocBody, tocRule, collectHeaders } from './toc.js';
import { wikilinks } from './wikilinks.js';
import { youtube } from './youtube.js';
import { video } from './video.js';
import { uttoriInline } from './uttori-inline.js';
import { lineBreaker } from './line-breaker.js';

/**
 * Extend MarkdownIt with Uttori specific items:
 * - Table of Contents with `[toc]`
 * - External Links with Domain Filters
 * - Footnote Support with `[^label]` & `[^label]: Definition`
 * - Image Lazyloading
 * @param {import('markdown-it').default} md The MarkdownIt instance.
 * @returns {object} The instance of Plugin.
 */
function Plugin(md) {
  /**
   * Adds deep links to the opening of the heading tags with IDs.
   */
  md.renderer.rules.heading_open = headingOpen;

  /**
   * Creates the opening tag of the TOC.
   */
  md.renderer.rules.toc_open = tocOpen;

  /**
   * Creates the closing tag of the TOC.
   */
  md.renderer.rules.toc_close = tocClose;

  /**
   * Creates the contents of the TOC.
   */
  md.renderer.rules.toc_body = tocBody;

  /**
   * Find and replace the TOC tag with the TOC itself.
   * @see {@link https://markdown-it.github.io/markdown-it/#Ruler.after|Ruler.after}
   */
  md.inline.ruler.after('text', 'toc', tocRule);

  /**
   * Caches the headers for use in building the TOC body.
   */
  md.core.ruler.push('collect_headers', collectHeaders);

  /**
   * Converts WikiLinks to anchor tags.
   * @see {@link https://markdown-it.github.io/markdown-it/#Ruler.before|Ruler.before}
   */
  md.inline.ruler.before('link', 'wikilink', wikilinks);

  /**
   * Find and replace the <youtube> tags with safe iframes.
   * @see {@link https://markdown-it.github.io/markdown-it/#Ruler.after|Ruler.after}
   */
  md.core.ruler.after('block', 'youtube', youtube);

  /**
   * Find and replace the <video> tags with safe <video> tags.
   * @see {@link https://markdown-it.github.io/markdown-it/#Ruler.after|Ruler.after}
   */
  md.core.ruler.after('block', 'video', video);

  /**
   * Find and replace any <br /> tags in text with HTML line breaks.
   * @see {@link https://markdown-it.github.io/markdown-it/#Ruler.after|Ruler.after}
   */
  md.core.ruler.after('block', 'line-breaker', lineBreaker);

  /**
   * Uttori specific rules for manipulating the markup.
   * External Domains are filtered for SEO and security.
   */
  md.core.ruler.after('inline', 'uttori', uttoriInline);

  /**
   * Creates the tag for the Footnote reference.
   */
  md.renderer.rules.footnote_ref = configFootnoteReference;

  /**
   * Creates the opening tag of the Footnote items block.
   */
  md.renderer.rules.footnote_open = configFootnoteOpen;

  /**
   * Creates the closing tag of the Footnote items block.
   */
  md.renderer.rules.footnote_close = configFootnoteClose;

  /**
   * Converts Footnote definitions to linkable anchor tags.
   * @see {@link https://markdown-it.github.io/markdown-it/#Ruler.before|Ruler.before}
   */
  md.block.ruler.before('reference', 'footnote_def', footnoteDefinition, { alt: ['paragraph', 'reference'] });

  /**
   * Converts Footnote definitions to linkable anchor tags.
   * @see {@link https://markdown-it.github.io/markdown-it/#Ruler.after|Ruler.after}
   */
  md.inline.ruler.after('image', 'footnote_ref', footnoteReferences);

  return this;
}

export default Plugin;
