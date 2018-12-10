class UploadProvider {
  constructor(config = {}) {
    this.config = {
      uploads_dir: 'test/site/uploads',
      ...config,
    };
  }

  all() {}

  deleteFile(fileName) {}

  readFile(fileName) {}

  storeFile(req, res, callback) {}
}

module.exports = UploadProvider;
