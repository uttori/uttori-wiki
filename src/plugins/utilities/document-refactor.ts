import { randomUUID } from 'node:crypto';
import { isDeepStrictEqual } from 'node:util';
import slugify from 'slugify';
import { documentVersion } from '../../document-write.js';
import type { UttoriWikiDocument } from '../../wiki.js';
import { headingOpen } from '../markdown-it-plugin/toc.js';
import MarkdownItRenderer, { type MarkdownItRendererConfig } from '../renderer-markdown-it.js';

/** Canonical slugs are also safe filename stems and wiki route segments. */
export const refactorSlug = /^[a-z0-9][a-z0-9-]{0,127}$/;

/** One source page moves to a new slug or is appended to an existing destination. */
export interface RefactorRequest {
  mode: 'rename' | 'merge';
  from: string;
  to: string;
}

/** Route and renderer settings used to distinguish internal URLs and resolve heading IDs. */
export interface RefactorOptions {
  publicUrl?: string;
  pathPrefix?: string;
  renderer?: MarkdownItRendererConfig;
  reserved?: string[];
}

/** The source leaves active storage only after the destination and inbound edits are in place. */
interface RefactorPlan {
  retired: UttoriWikiDocument;
  changes: { before?: UttoriWikiDocument; after: UttoriWikiDocument }[];
  versions: Record<string, string | null>;
}

/**
 * @param value Existing list or legacy comma/newline-delimited field.
 * @returns Individual values in stored order.
 */
function items(value?: string[] | string): string[] {
  if (Array.isArray(value)) return value;
  return value?.split(/[,\n]/).map(item => item.trim()).filter(Boolean) ?? [];
}

/**
 * @param value A possible canonical page slug.
 * @returns Whether it can be a refactor endpoint.
 */
export function isRefactorSlug(value: unknown): value is string {
  return typeof value === 'string' && refactorSlug.test(value) && !Object.hasOwn(Object.prototype, value);
}

/**
 * @param value URL segment as written in Markdown or returned by the renderer.
 * @returns Decoded value, or the original when it has a malformed escape.
 */
function decodeSegment(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

/**
 * Return the href of each rendered Markdown link, including resolved reference links.
 * @param tokens Parsed blocks from the same renderer used by the wiki.
 * @param type Whether to inspect links or images that could share a reference definition.
 * @param quotes Which blockquote scope to include in the scan.
 * @returns Destinations in render order.
 */
function destinations(tokens: import('markdown-it').Token[], type: 'link_open' | 'image' = 'link_open', quotes: 'all' | 'outside' | 'inside' = 'all'): string[] {
  let quoteDepth = 0;
  const links = [];
  for (const block of tokens) {
    if (block.type === 'blockquote_open') quoteDepth++;
    if (block.type === 'blockquote_close') quoteDepth--;
    if ((quotes === 'outside' && quoteDepth) || (quotes === 'inside' && !quoteDepth)) continue;
    for (const token of block.children ?? []) {
      if (token.type !== type) continue;
      const target = token.attrGet(type === 'image' ? 'src' : 'href');
      if (typeof target === 'string' && target) links.push(target);
    }
  }
  return links;
}

/**
 * Reuse Uttori's heading renderer to get both legacy line-based and stable IDs.
 * @param tokens Parsed page blocks.
 * @param renderer The wiki's Markdown renderer configuration.
 * @returns IDs in heading order, with empty slots for headings that have no ID.
 */
function headingIds(tokens: import('markdown-it').Token[], renderer: ReturnType<typeof MarkdownItRenderer.extendConfig>): string[] {
  return tokens.flatMap((token, index) => token.type === 'heading_open'
    ? [headingOpen(tokens, index, renderer.markdownIt).match(/ id="([^"]+)"/)?.[1] ?? '']
    : []);
}

/**
 * Compare optional titles as well as hrefs when two pages may share reference definitions.
 * @param tokens Parsed page blocks.
 * @returns Link and image titles in render order.
 */
function linkTitles(tokens: import('markdown-it').Token[]) {
  return tokens.flatMap(block => (block.children ?? []).filter(token => token.type === 'link_open' || token.type === 'image')
    .map(token => token.attrGet('title')));
}

/** A replacement span in the original Markdown, never a re-rendered paragraph. */
interface LinkEdit {
  start: number;
  original: string;
  marker: string;
  replacement: string;
}

/**
 * Rewrite destinations while leaving labels, whitespace, code, and unrelated links alone.
 * @param content The original Markdown.
 * @param renderer The wiki's Markdown renderer configuration.
 * @param rewrite Maps a destination to its new href, or returns the original unchanged.
 * @param protectQuotes Whether blockquotes are verbatim source evidence.
 * @returns The patched Markdown, or throws if a rendered inbound link cannot be edited safely.
 */
function rewriteLinks(content: string, renderer: MarkdownItRendererConfig, rewrite: (href: string) => string, protectQuotes: boolean): string {
  const parse = (markdown: string) => MarkdownItRenderer.parse(markdown, renderer);
  const before = parse(content);
  const scope = protectQuotes ? 'outside' : 'all';
  const hrefs = destinations(before, 'link_open', scope);
  const expected = hrefs.map(rewrite);
  if (isDeepStrictEqual(hrefs, expected)) return content;

  // MarkdownIt has no inline source spans. Mark candidate destinations and keep only those
  // the renderer recognizes as links, so identical strings in code, images and prose stay intact.
  const prefix = `uttori-link-${randomUUID()}-`;
  const edits = new Map<number, LinkEdit>();
  for (const match of content.matchAll(/(?:\]\([\s]*<?|\]:[\s]*<?)([^\s<>()]+)|<(https?:\/\/[^\s<>]+)>/g)) {
    const original = match[1] ?? match[2];
    const replacement = rewrite(original);
    if (replacement === original) continue;
    const start = match.index + match[0].indexOf(original);
    const id = `${prefix}${edits.size}-end`;
    const marker = match[2] ? `https://${id}.invalid` : id;
    edits.set(start, { start, original, marker, replacement });
  }
  for (const match of content.matchAll(/\[\[([^\[\]|\r\n]+)(?=\||\]\])/g)) {
    const original = match[1];
    const href = slugify(original, renderer.markdownIt.uttori?.wikilinks?.slugify);
    const replacement = rewrite(href);
    if (replacement === href) continue;
    const start = match.index + 2;
    const marker = `${prefix}${edits.size}-end`;
    // Unpiped wikilinks use the target as their label. Preserve that text when the slug moves.
    const label = content[start + original.length] === '|' ? '' : `|${original}`;
    edits.set(start, { start, original, marker, replacement: replacement + label });
  }

  const ordered = [...edits.values()].sort((a, b) => b.start - a.start);
  const patch = (choose: (edit: LinkEdit) => string) => ordered.reduce((markdown, edit) => (
    markdown.slice(0, edit.start) + choose(edit) + markdown.slice(edit.start + edit.original.length)
  ), content);
  const marked = destinations(parse(patch(edit => edit.marker)), 'link_open', scope);
  const rewritten = patch(edit => marked.some(href => href.includes(edit.marker)) ? edit.replacement : edit.original);
  const after = parse(rewritten);
  // A shared link/image reference or an unsupported URL spelling must fail review, not silently change meaning.
  if (!isDeepStrictEqual(destinations(after, 'link_open', scope), expected)
    || !isDeepStrictEqual(destinations(after, 'image'), destinations(before, 'image'))
    || (protectQuotes && !isDeepStrictEqual(destinations(after, 'link_open', 'inside'), destinations(before, 'link_open', 'inside')))) {
    throw new Error('An inbound link could not be rewritten safely. Normalize its Markdown destination and retry.');
  }
  return rewritten;
}

/**
 * Plan a refactor from a complete corpus snapshot, with no storage side effects.
 * @param documents Every live document, including unmanaged pages that might link inward.
 * @param request The requested mode and source/destination slugs.
 * @param options Wiki routing and Markdown settings.
 * @returns The reviewed page replacements, retired source, and the whole-corpus optimistic guard.
 */
export function planDocumentRefactor(documents: UttoriWikiDocument[], request: RefactorRequest, options: RefactorOptions = {}): RefactorPlan {
  const { mode, from, to } = request;
  if ((mode !== 'rename' && mode !== 'merge') || !isRefactorSlug(from) || !isRefactorSlug(to) || from === to) {
    throw new Error('Supply a rename or merge with distinct canonical source and destination slugs.');
  }
  const pages = new Map(documents.map(page => [page.slug, page]));
  const source = pages.get(from);
  const target = pages.get(to);
  if (documents.some(page => typeof page.content !== 'string')) throw new Error('A live page has no Markdown content. Repair it before reviewing links.');
  const reserved = ['wiki-index', 'wiki-log', 'home-page', 'new', 'preview', '404', 'search', ...(options.reserved ?? [])];
  if (!source || (mode === 'rename' && target) || (mode === 'merge' && !target)) {
    throw new Error('Rename requires a free destination. Merge requires an existing destination.');
  }
  if (reserved.includes(from) || reserved.includes(to) || source.wikiKind === 'source' || target?.wikiKind === 'source'
    || /^source-[a-f0-9]{16}$/.test(from) || /^source-[a-f0-9]{16}$/.test(to)) {
    throw new Error('System pages and content-addressed source notes cannot be moved or merged.');
  }

  const retiredAliases = new Set([from, ...items(source.redirects)]);
  // An existing canonical destination wins over a duplicate alias on the source.
  if (target) retiredAliases.delete(to);
  const redirects = [...new Set([...items(target?.redirects), ...retiredAliases])].filter(slug => slug !== to).sort();
  const claimed = new Set([to, ...redirects]);
  for (const page of documents) {
    if (page.slug !== from && page.slug !== to && [page.slug, ...items(page.redirects)].some(slug => claimed.has(slug))) {
      throw new Error(`Redirect or destination collision with ${page.slug}.`);
    }
  }
  const renderer = MarkdownItRenderer.extendConfig(options.renderer);
  const parse = (markdown: string) => MarkdownItRenderer.parse(markdown, renderer);
  const separator = '\n\n---\n\n';
  const originalTarget = target?.content ?? '';
  const combined = target ? originalTarget + separator + source.content : source.content;
  const sourceTokens = parse(source.content);
  const targetTokens = parse(originalTarget);
  const combinedTokens = parse(combined);
  const sourceIds = headingIds(sourceTokens, renderer);
  const targetIds = headingIds(targetTokens, renderer);
  const combinedIds = headingIds(combinedTokens, renderer);
  const shape = (tokens: typeof combinedTokens) => tokens.map(token => [token.type, token.tag, token.content]);
  // A fence or reference definition must not absorb or reinterpret the other page on concatenation.
  if (target && (!isDeepStrictEqual(shape(combinedTokens), [...shape(targetTokens), ['hr', 'hr', ''], ...shape(sourceTokens)])
    || combinedIds.length !== sourceIds.length + targetIds.length
    || !isDeepStrictEqual(destinations(combinedTokens), [...destinations(targetTokens), ...destinations(sourceTokens)])
    || !isDeepStrictEqual(linkTitles(combinedTokens), [...linkTitles(targetTokens), ...linkTitles(sourceTokens)])
    || !isDeepStrictEqual(destinations(combinedTokens, 'image'), [...destinations(targetTokens, 'image'), ...destinations(sourceTokens, 'image')]))) {
    throw new Error('The pages have incompatible Markdown structure or shared reference definitions.');
  }
  const sourceAnchors = new Map(sourceIds.map((id, index) => [id, combinedIds[targetIds.length + index]]));
  const targetAnchors = new Map(targetIds.map((id, index) => [id, combinedIds[index]]));
  const root = options.publicUrl || options.pathPrefix || renderer.markdownIt.uttori?.baseUrl || '/';
  const base = new URL(root, 'https://uttori.invalid');
  const mount = base.pathname.replace(/\/+$/, '') + '/';
  const prefixes = new Set(['', './']);
  const mounts = new Set([mount, ...[options.pathPrefix, renderer.markdownIt.uttori?.baseUrl].flatMap(value => value
    ? [new URL(value, base).pathname.replace(/\/+$/, '') + '/'] : [])]);
  for (const pathname of mounts) {
    prefixes.add(pathname);
    prefixes.add(pathname + './');
    if (/^https?:\/\//i.test(root)) prefixes.add(base.origin + pathname);
  }

  /**
   * Preserve the original path style and query while mapping known heading anchors.
   * @param href Link destination as written or parsed.
   * @param owner Original page whose fragment-only links are being rewritten.
   * @returns Updated destination when this link belongs to the move or merge.
   */
  function destination(href: string, owner: string): string {
    const match = /^((?:[^?#]*\/)?)([^/?#]+)(\/?)(\?[^#]*)?(#.*)?$/.exec(href);
    if (href.startsWith('#')) {
      let anchors: Map<string, string> | undefined;
      if (owner === from) anchors = sourceAnchors;
      if (owner === to) anchors = targetAnchors;
      const id = decodeSegment(href.slice(1));
      const anchor = anchors?.get(id);
      return anchor && anchor !== id ? `#${encodeURIComponent(anchor)}` : href;
    }
    if (!match || !prefixes.has(match[1])) return href;
    const [, prefix, segment, slash, query = '', fragment = ''] = match;
    const slug = decodeSegment(segment);
    const moved = retiredAliases.has(slug);
    if (!moved && slug !== to) return href;
    const anchors = moved ? sourceAnchors : targetAnchors;
    const id = decodeSegment(fragment.slice(1));
    const anchor = anchors.get(id);
    const nextFragment = anchor && anchor !== id ? `#${encodeURIComponent(anchor)}` : fragment;
    return `${prefix}${moved ? to : segment}${slash}${query}${nextFragment}`;
  }

  const rewrite = (page: UttoriWikiDocument) => {
    try {
      // A source excerpt must continue matching the archived quotation. Its old path still redirects.
      return rewriteLinks(page.content, renderer, href => destination(href, page.slug), page.wikiKind === 'source');
    } catch (error) {
      throw new Error(`${page.slug}: ${(error as Error).message}`, { cause: error });
    }
  };
  const sourceContent = rewrite(source);
  const targetContent = target ? rewrite(target) : '';
  const content = target ? targetContent + separator + sourceContent : sourceContent;
  const finalTokens = parse(content);
  if (!isDeepStrictEqual(headingIds(finalTokens, renderer), combinedIds)) {
    throw new Error('The rewrite changes a rendered heading ID. Normalize links in the headings and retry.');
  }
  if (target && !isDeepStrictEqual(destinations(finalTokens), [...destinations(parse(targetContent)), ...destinations(parse(sourceContent))])) {
    throw new Error('The merged Markdown would change the meaning of a link.');
  }

  const { html: _html, ...basePage } = target ?? source;
  const after = { ...basePage, slug: to, redirects, content };
  if (target) {
    after.tags = [...new Set([...items(target.tags), ...items(source.tags)])];
    if (source.attachments?.length) {
      const attachments = new Map((target.attachments ?? []).map(item => [item.id, item]));
      for (const item of source.attachments) {
        if (attachments.has(item.id) && !isDeepStrictEqual(attachments.get(item.id), item)) {
          throw new Error(`Conflicting attachment ID ${item.id}.`);
        }
        attachments.set(item.id, item);
      }
      after.attachments = [...attachments.values()];
      after.image ??= source.image;
    }
  }
  const changes: RefactorPlan['changes'] = [{ before: target, after }];
  for (const page of documents) {
    if (page.slug === from || page.slug === to) continue;
    const next = rewrite(page);
    if (next !== page.content) {
      const { html: _rendered, ...record } = page;
      changes.push({ before: page, after: { ...record, content: next } });
    }
  }
  return { retired: source, changes, versions: Object.fromEntries(documents.map(page => [page.slug, documentVersion(page)])) };
}
