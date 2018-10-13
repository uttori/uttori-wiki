const debug = require('debug')('Uttori.MarkdownHelpers');
const slugify = require('slugify');

// Handles fetching the missing links from the markdown
const fetchMissingLinksFromMarkdown = (content) => {
  if (!content || !content.length === 0) {
    debug('No missing links found.');
    return [];
  }

  return content.match(/\[(.*)\]\(\)/g) || [];
};

const prepare = (config, content) => {
  if (!config.markdown) {
    debug('Not markdown content.');
    return content || '';
  }
  const missingLinks = fetchMissingLinksFromMarkdown(content);
  if (missingLinks && missingLinks.length > 0) {
    debug(`Fixing ${missingLinks.length} missing links.`);
    missingLinks.forEach((link) => {
      const title = link.substr(1).slice(0, -3);
      const slug = slugify(title, { lower: true });
      content = content.replace(link, `[${title}](/${slug})`);
    });
  }

  return content || '';
};

module.exports = { prepare };
