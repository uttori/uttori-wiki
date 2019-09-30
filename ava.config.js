/* eslint-disable node/no-unsupported-features/es-syntax */
export default {
  files: [
    'test/**/*.test.js',
  ],
  sources: [
    'app/**/*.js',
  ],
  concurrency: 5,
  failFast: false,
  tap: false,
  babel: false,
  compileEnhancements: false,
  verbose: true,
};
