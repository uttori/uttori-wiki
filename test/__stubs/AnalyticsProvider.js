/* eslint-disable no-unused-vars, no-empty-function, class-methods-use-this */
class AnalyticsProvider {
  constructor(config = {}) {
    this.config = {
      name: 'visits',
      extension: 'json',
      directory: 'test/site/data',
      ...config,
    };
  }

  update(slug) {}

  get(slug) {}

  async getPopularDocuments(limit) {}
}

module.exports = AnalyticsProvider;
