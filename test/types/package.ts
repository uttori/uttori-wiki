import express from 'express';
import {
  config, UttoriWiki, MarkdownItRenderer, StorageProviderJsonMemory,
  CategoryRoutesPlugin, CsrfProtection, type UttoriWikiConfig,
  type UttoriWikiDocumentExtended, type UttoriContextWithPluginConfig,
  AddQueryOutputToViewModel, AnalyticsPlugin, AuthSimple, DownloadRouter,
  EJSRenderer, FilterIPAddress, FilterSpamEdit, ImportDocument, MulterUpload,
  ReplacerRenderer, McpProvider, SearchProviderLunr, SearchProviderSQLite,
  SitemapGenerator, StaticSiteGenerator, StorageProviderJsonFile, AIChatBot,
  TagRoutesPlugin, FormHandler,
} from '@uttori/wiki';
import { middleware } from '@uttori/wiki/wiki-flash';
import { MemoryStore } from '@uttori/wiki/plugins/chat-bot/memory';

// Consumers must resolve the published declarations and plugin constructors.
const settings: UttoriWikiConfig = {
  ...config,
  plugins: [
    StorageProviderJsonMemory, MarkdownItRenderer, CategoryRoutesPlugin, CsrfProtection,
    AddQueryOutputToViewModel, AnalyticsPlugin, AuthSimple, DownloadRouter, EJSRenderer, FilterIPAddress, FilterSpamEdit, ImportDocument, MulterUpload, ReplacerRenderer, McpProvider, SearchProviderLunr, SearchProviderSQLite, SitemapGenerator, StaticSiteGenerator, StorageProviderJsonFile, AIChatBot, TagRoutesPlugin, FormHandler,
  ],
};
const app = express();
app.use(middleware);
new UttoriWiki(settings, app);
new MemoryStore(60_000, 5);

// The extension point must survive declaration generation and root re-exports.
declare module '@uttori/wiki' {
  interface UttoriWikiDocumentExtensions {
    /** Example plugin-owned field. */
    testCategory?: string;
  }
}
const document: UttoriWikiDocumentExtended = {
  slug: 'example', title: 'Example', content: '', tags: [],
  createDate: 0, updateDate: 0, testCategory: 'typed',
};
const category: string | undefined = document.testCategory;
void category;

type ExampleContext = UttoriContextWithPluginConfig<'example-plugin', { enabled: boolean }>;
declare const context: ExampleContext;
const enabled: boolean = context.config['example-plugin'].enabled;
void enabled;
// @ts-expect-error The custom plugin configuration must retain its own value type.
const invalid: string = context.config['example-plugin'].enabled;
void invalid;

// Defaults must stay configurable instead of exposing never[] or literal-only booleans.
const replacements = ReplacerRenderer.defaultConfig();
replacements.rules.push({ test: /example/g, output: 'replacement' });
const markdown = MarkdownItRenderer.defaultConfig();
markdown.markdownIt.html = true;
markdown.markdownIt.uttori.allowedExternalDomains.push('example.com');
markdown.markdownIt.uttori.toc.extract = true;
const csrf = CsrfProtection.defaultConfig();
csrf.rotateOnValidation = true;
csrf.sources.push('header');
