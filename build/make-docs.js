import fs from 'fs';
import path from 'node:path';
import { execSync } from 'child_process';
import { glob } from 'glob';

// Configuration
// jsdoc-api stores its cache under the user's home directory, which may be read-only in build environments.
const config = '--no-cache --configure ./jsdoc.conf.json --private --example-lang js';
// const template = '--template rm.hbs';

// Ensure docs directories exist
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Generate documentation for a single file
const generateDoc = (file, outputPath, useTemplate = false) => {
  // const cmd = `jsdoc2md ${config} ${useTemplate ? '' : 'template rm.hbs' } ${file} > ${outputPath}`;
  const cmd = `jsdoc2md ${config} ${file} > ${outputPath}`;
  console.log(`Generating docs for ${file} -> ${outputPath}`);
  execSync(cmd, { stdio: 'inherit' });
};

// Main execution
const main = async () => {
  console.log('Starting documentation generation...');

  // Ensure docs directories exist
  ensureDir('docs');
  ensureDir('docs/plugins');

  // Find all JavaScript files, excluding utilities
  const files = await glob('src/**/*.js', {
    ignore: ['src/plugins/utilities/**']
  });

  // Separate main files from plugin files
  const mainFiles = files.filter(f => !f.includes('/plugins/'));
  const pluginFiles = files.filter(f => f.includes('/plugins/') && !f.includes('/utilities/'));

  // Generate documentation for main files
  mainFiles.forEach(file => {
    const baseName = path.basename(file, '.js');
    const outputPath = `docs/${baseName}.md`;
    // const useTemplate = file === 'src/wiki.js' ? true : false;
    generateDoc(file, outputPath, false);
  });

  // Generate documentation for plugin files
  pluginFiles.forEach(file => {
    const baseName = path.basename(file, '.js');
    const outputPath = `docs/plugins/${baseName}.md`;
    generateDoc(file, outputPath, false);
  });

  console.log('Documentation generation complete!');
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error(error);
    // Propagate JSDoc failures to `npm run make` so broken generated docs cannot pass a build.
    process.exitCode = 1;
  });
}

export { main };
