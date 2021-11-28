/**
 * @typedef UttoriWikiConfig
 * @type {object}
 * @property {string} [site_title='Wiki'] The website title, HTML <title> format: page_title | site_title
 * @property {string} [site_header='Wiki'] Used in the navbar as your site title.
 * @property {string} [site_footer='Wiki'] Used as the footer text of your site.
 * @property {object[]} [site_sections=[]] Your site sections for homepage & tag pages. For each section, the home page & tag pages will display a section box that lists the document count for documents that have a matching tag. Clicking the section link will list the tagged documents.
 * @property {string} site_sections.title Your site section header text.
 * @property {string} site_sections.description Your site section description text.
 * @property {string} site_sections.tag Your site section related tag.
 * @property {string} [home_page='home-page'] Slug of the root `/` page document.
 * @property {string[]} [ignore_slugs] Slugs to ignore in search & filtered documents, default is 'home-page';
 * @property {number} [excerpt_length=400] Excerpt length, used in search result previews.
 * @property {string} [site_url=''] Application base URL. Used for canonical URLs and Open Graph, no trailing slash.
 * @property {string} [theme_dir=''] Specify the path to the theme directory, no trailing slash.
 * @property {string} [public_dir=''] Path to the static file directory for themes, no trailing slash
 * @property {boolean} [use_delete_key=false] Enable hiding document deletion behind a private key.
 * @property {string} delete_key Key used for verifying document deletion.
 * @property {boolean} [use_edit_key=false] Enable hiding document modification behind a private key.
 * @property {string} edit_key Key used for verifying document modification.
 * @property {boolean} [public_history=true] Allow access to history URLs.
 * @property {string[]} [allowedDocumentKeys] List of allowed custom values to set on a document. `title`, `excerpt`, `content`, `slug`, and `tags` are always allowed.
 * @property {boolean} [use_meta_data=true] Theme specific, use OpenGraph and neta data.
 * @property {string} [site_locale='en_US'] Theme specific, Open Graph: Locale
 * @property {string} [site_twitter_site=''] Theme specific, Open Graph: Twitter Site Handle
 * @property {string} [site_twitter_creator=''] Theme specific, Open Graph: Twitter Creator Handle
 * @property {string} [site_image=''] Theme specific, Used as Open Graph: Image
 * @property {Array} plugins Collection of Uttori Plugins. Storage Plugins should come before other plugins.
 * @property {Array} [middleware] Middleware Configuration to be passed along to Express in the format of ['use', layouts], ['set', 'layout extractScripts', true], ['engine', 'html', ejs.renderFile].
 * @property {number} [cache_short=(60 * 24)] Used as the max-age for Cache-control'headers on frequently updated routes: home, tag index, tag details, details & history index
 * @property {number} [cache_long=(60 * 60 * 24 * 365)] Used as the max-age for Cache-control'headers on seldom updated routes: history details, history restore
 */

/** @type {UttoriWikiConfig} */
const config = {
  site_title: 'Wiki',
  site_header: 'Wiki',
  site_footer: 'Wiki',
  site_sections: [],
  home_page: 'home-page',
  ignore_slugs: ['home-page'],
  excerpt_length: 400,
  site_url: '',
  theme_dir: '',
  public_dir: '',
  use_delete_key: false,
  delete_key: undefined,
  use_edit_key: false,
  edit_key: undefined,
  public_history: true,
  allowedDocumentKeys: [],
  use_meta_data: true,
  site_locale: 'en_US',
  site_twitter_site: '',
  site_twitter_creator: '',
  site_image: '',
  plugins: [],
  middleware: [],
  cache_short: 60 * 24,
  cache_long: 60 * 60 * 24 * 365,
};

module.exports = config;
