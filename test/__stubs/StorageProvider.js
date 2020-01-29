/* eslint-disable no-unused-vars, no-empty-function, class-methods-use-this */
class StorageProvider {
  constructor(config = {}) {
    this.config = {
      ...config,
    };
  }

  async getQuery(query) {}

  async get(slug) {}

  async update(document, originalSlug) {}

  async delete(originalSlug) {}
}

module.exports = StorageProvider;
