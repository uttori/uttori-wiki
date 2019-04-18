const debug = require('debug')('Uttori.Wiki.Sitemap');
const R = require('ramda');
const fs = require('fs-extra');

class UttoriSitemap {
  static generateSitemapXML(config, documents) {
    debug('generateSitemapXML', config, documents.length);
    const sitemap = [
      {
        url: '/',
        lastmod: new Date().toISOString(),
        priority: '1.00',
      },
      {
        url: '/tags',
        lastmod: new Date().toISOString(),
        priority: '0.90',
      },
      {
        url: '/new',
        lastmod: new Date().toISOString(),
        priority: '0.90',
      },
    ];

    // Add all documents to the sitemap
    documents.forEach((document) => {
      /* istanbul ignore next */
      let lastmod = document.updateDate ? new Date(document.updateDate).toISOString() : '';
      /* istanbul ignore next */
      if (!lastmod) {
        lastmod = document.createDate ? new Date(document.createDate).toISOString() : '';
      }
      sitemap.push({
        url: `/${document.slug}`,
        lastmod,
        priority: '0.80',
      });
    });

    let urlFilter = R.identity;
    /* istanbul ignore else */
    if (Array.isArray(config.sitemap_url_filter) && config.sitemap_url_filter.length > 0) {
      urlFilter = (route) => {
        let pass = true;
        config.sitemap_url_filter.forEach((url_filter) => {
          try {
            if (url_filter.test(route.url)) {
              pass = false;
            }
          } catch (error) {
            /* istanbul ignore next */
            debug('Sitemap Filter Error:', error, url_filter, route.url);
          }
        });
        return pass;
      };
    }

    const data = sitemap.reduce((accumulator, route) => {
      if (urlFilter(route)) {
        accumulator += `<url><loc>${config.sitemap_url}${route.url}</loc>`;
        /* istanbul ignore else */
        if (route.lastmod) {
          accumulator += `<lastmod>${route.lastmod}</lastmod>`;
        }
        /* istanbul ignore else */
        if (route.priority) {
          accumulator += `<priority>${route.priority}</priority>`;
        }
        /* istanbul ignore next */
        if (route.changefreq) {
          accumulator += `<changefreq>${route.changefreq}</changefreq>`;
        }
        accumulator += '</url>';
      }
      return accumulator;
    }, '');

    return `${config.sitemap_header}${data}${config.sitemap_footer}`;
  }

  static generateSitemap(config, documents) {
    debug('generateSitemap', config, documents.length);
    try {
      const sitemap = UttoriSitemap.generateSitemapXML(config, documents);
      fs.outputFileSync(`${config.public_dir}/${config.sitemap_filename}`, sitemap);
    } catch (error) {
      /* istanbul ignore next */
      debug('Error Generating Sitemap:', error);
    }
  }
}

module.exports = UttoriSitemap;
