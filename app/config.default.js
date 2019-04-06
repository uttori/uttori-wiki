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

  // Slug of the root `/` page
  home_page: 'home-page',

  // Excerpt length (used in search)
  excerpt_length: 400,

  // Application base url.
  // Site URL used for canonical URLs and Open Graph, no trailing slash.
  site_url: '',

  // Specify the theme to use, no trailing slash
  theme_dir: '',
  theme_name: 'default',

  // Path in which to store uploads (images etc.), no trailing slash
  uploads_dir: '',

  // Path in which to store content (markdown files, etc.), no trailing slash
  content_dir: '',

  // Path in which to store content history (markdown files, etc.), no trailing slash
  history_dir: '',

  // Path in which to store data (analytics, etc.), no trailing slash
  data_dir: '',

  // Path to the static file directory for themes, no trailing slash
  public_dir: '',

  // Optional Lunr locales
  lunr_locales: [],

  // Flat file storageProvider config
  extension: 'json',

  // Enable hiding document deletion behind a private key
  use_delete_key: false,

  // Key used for verifying document deletion
  delete_key: '',

  // Enable reCaptcha on Creation & Document Editing
  use_recaptcha: false,

  // reCaptcha Site key
  recaptcha_site_key: '',

  // reCaptcha Secret key
  recaptcha_secret_key: '',

  // Enable Google Analytics
  use_google_analytics: false,

  // Google Analytics UA ID
  google_analytics_id: '',

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

  // Sitemap URL (ie https://sfc.fm)
  sitemap_url: '',

  // Sitemap URL Filter
  sitemap_url_filter: [],

  // Sitemap XML Header
  sitemap_header: '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">',

  // Sitemap XML Footer
  sitemap_footer: '</urlset>',

  // Sitemap Filename
  sitemap_filename: 'sitemap.xml',
};

module.exports = config;
