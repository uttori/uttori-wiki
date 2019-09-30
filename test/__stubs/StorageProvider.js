/* eslint-disable no-unused-vars, no-empty-function, class-methods-use-this */
class StorageProvider {
  constructor(config = {}) {
    this.config = {
      uploads_dir: 'test/site/uploads',
      ...config,
    };
  }

  getQuery(query) {}
}

module.exports = StorageProvider;
