const path = require('path');

const config = {
  // Your site title (format: page_title | site_title)
  site_title: 'Wiki',

  // Used in the navbar as your site title.
  site_header: 'Wiki',

  // Used as the footer text of your site.
  site_footer: 'Wiki',

  // Your site sections for homepage. For each section below, the home page
  // will display a section box that lists the document count for documents
  // that have a matching tag. Clicking the section link will list the documents.
  site_sections: [
    // {
    //     'title': 'Example',
    //     'description': 'Example description text.',
    //     'tag': 'example'
    // },
    // {
    //     'title': 'Team',
    //     'description': 'Team of Wiki Editors',
    //     'tag': 'team'
    // },
    // {
    //     'title': 'FAQ',
    //     'description': 'Frquently Asked Questions',
    //     'tag': 'faq'
    // }
  ],

  // Slug of the root `/` page document
  home_page: 'home-page',

  // Slugs to ignore in search, recent and popular items
  ignore_slugs: ['home-page'],

  // Excerpt length (used in search)
  excerpt_length: 400,

  // Application base url.
  // Site URL used for canonical URLs and Open Graph, no trailing slash.
  site_url: '',

  // Specify the theme to use, no trailing slash
  theme_dir: '',
  theme_name: 'default',

  // Path to the static file directory for themes, no trailing slash
  public_dir: '',

  // Enable hiding document deletion behind a private key
  use_delete_key: false,

  // Key used for verifying document deletion
  delete_key: '',

  // Use OpenGraph and Meta Data
  use_meta_data: true,

  // Open Graph: Site Description
  site_description: '',

  // Open Graph: Locale
  site_locale: 'en_US',

  // Open Graph: Twitter Site Handle
  site_twitter_site: '',

  // Open Graph: Twitter Creator Handle
  site_twitter_creator: '',

  // Open Graph: Image
  site_image: '',

  // Plugins
  plugins: [
    // Storage Plugins should come before other plugins
  ],

  // Middleware Configuration
  middleware: [
    ['disable', 'x-powered-by'],
    ['enable', 'view cache'],
    ['set', 'views', path.join(`${__dirname}/themes/`, 'default', 'templates')],
    ['set', 'view engine', 'html'],
  ],
};

module.exports = config;
