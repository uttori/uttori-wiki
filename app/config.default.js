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

  // Excerpt length (used in search)
  excerpt_length: 400,

  // Application base url.
  // Site URL used for canonical URLs and Open Graph, no trailing slash.
  site_url: '',

  // Specify the theme to use
  theme_dir: `${__dirname}/themes/`,
  theme_name: 'default',

  // Path in which to store uploads (images etc.)
  uploads_dir: `${__dirname}/uploads/`,

  // Path in which to store content (markdown files, etc.)
  content_dir: `${__dirname}/content/`,

  // Path in which to store content history (markdown files, etc.)
  history_dir: `${__dirname}/content/history`,

  // Path in which to store data (analytics, etc.)
  data_dir: `${__dirname}/data/`,

  // Path to the static file directory for themes
  public_dir: `${__dirname}/themes/default/public/`,

  // Optional Lunr locales
  lunr_locales: [],

  // Secret key used to sync two servers
  sync_key: '',

  // Flat file storageProvider config
  extension: 'json',

  // Content is in the Markdown language
  markdown: true,

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
};

module.exports = config;
