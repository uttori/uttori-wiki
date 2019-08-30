const debug = require('debug')('Uttori.Wiki.Sitemap');
const R = require('ramda');
const fs = require('fs-extra');

class UttoriSitemap {
  static generateSitemapXML(config, documents = []) {
    debug('Generating Sitemap XML');
    const {
      sitemap, sitemap_url, sitemap_url_filter, sitemap_page_priority, sitemap_header, sitemap_footer,
    } = config;

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
        priority: sitemap_page_priority,
      });
    });

    let urlFilter = R.identity;
    /* istanbul ignore else */
    if (Array.isArray(sitemap_url_filter) && sitemap_url_filter.length > 0) {
      urlFilter = (route) => {
        let pass = true;
        sitemap_url_filter.forEach((url_filter) => {
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
        accumulator += `<url><loc>${sitemap_url}${route.url}</loc>`;
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

    return `${sitemap_header}${data}${sitemap_footer}`;
  }

  static async generateSitemap(config, documents = []) {
    debug('Generating Sitemap');
    try {
      const { public_dir, sitemap_filename } = config;
      const sitemap = UttoriSitemap.generateSitemapXML(config, documents);
      await fs.outputFile(`${public_dir}/${sitemap_filename}`, sitemap);
    } catch (error) {
      /* istanbul ignore next */
      debug('Error Generating Sitemap:', error);
    }
  }
}

module.exports = UttoriSitemap;
