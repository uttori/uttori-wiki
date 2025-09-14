import fs from 'fs';
import path from 'node:path';
import { execSync } from 'child_process';
import { glob } from 'glob';

// Configuration
const config = '--configure ./jsdoc.conf.json --private --example-lang js';
const template = '--template rm.hbs';

// Ensure docs directories exist
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Generate documentation for a single file
const generateDoc = (file, outputPath, useTemplate = false) => {
  const cmd = `jsdoc2md ${config} ${useTemplate ? template : ''} ${file} > ${outputPath}`;
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
    const outputPath = file === 'src/wiki.js' ? 'README.md' : `docs/${baseName}.md`;
    const useTemplate = file === 'src/wiki.js';
    generateDoc(file, outputPath, useTemplate);
  });

  // Generate documentation for plugin files
  pluginFiles.forEach(file => {
    const baseName = path.basename(file, '.js');
    const outputPath = `docs/plugins/${baseName}.md`;
    try {
      generateDoc(file, outputPath, false);
    } catch (error) {
      console.error(`File ${file}`, error);
    }
  });

  console.log('Documentation generation complete!');
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { main };
