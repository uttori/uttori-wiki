class UploadProvider {
  constructor(config = {}) {
    this.config = {
      uploads_dir: '',
      ...config,
    };
  }

  all() {}

  deleteFile(fileName) {}

  readFile(fileName) {}

  storeFile(req, res, callback) {}
}

module.exports = UploadProvider;
