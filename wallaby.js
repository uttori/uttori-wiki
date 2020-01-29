module.exports = () => ({
  files: [
    'src/**/*.js',
    { pattern: 'test/__stubs/*.js', instrument: false },
    { pattern: 'test/_helpers/*.js', instrument: false },
    { pattern: 'test/site/favicon.gif', binary: true },
    { pattern: 'test/site/**/*.json', binary: true },
    { pattern: 'test/site/**/*.html', binary: true },
  ],
  tests: [
    'test/*.test.js',
  ],
  env: {
    type: 'node',
  },
  testFramework: 'ava',
  debug: true,
});
