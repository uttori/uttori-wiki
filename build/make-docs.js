import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { glob } from 'glob';

// jsdoc-api stores its cache under the user's home directory, which may be read-only in build environments.
const config = ['--no-cache', '--configure', './jsdoc.conf.json', '--private', '--example-lang', 'js'];

// Ensure docs directories exist
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

/** Generate runtime API prose and include native signatures and field JSDoc from declarations. */
const generateDoc = (file, outputPath) => {
  console.log(`Generating docs for ${file} -> ${outputPath}`);
  const prose = execFileSync('node_modules/.bin/jsdoc2md', [...config, file], { encoding: 'utf8' })
    .replace(/ {2,}$/gm, '\\').trim();
  const typeFile = file.replace(/^dist\//, 'dist/types/').replace(/\.js$/, '.d.ts');
  const declarationFiles = [file.replace(/\.js$/, '.d.ts')];
  if (fs.existsSync(typeFile)) {
    declarationFiles.push(typeFile);
  }
  // Runtime modules re-export their types; include the adjacent type module so the field JSDoc
  // remains visible in generated docs as well as in the published declarations.
  const declarations = declarationFiles.map((declarationFile) => fs.readFileSync(declarationFile, 'utf8')
    .replace(/^\/\/# sourceMappingURL=.*$/m, '').trim()).join('\n\n');
  const api = `## TypeScript declarations\n\n<details>\n<summary>View documented types and signatures</summary>\n\n\`\`\`typescript\n${declarations}\n\`\`\`\n\n</details>`;
  // Write only after generation succeeds, preserving the previous page on a JSDoc error.
  fs.writeFileSync(outputPath, `${prose}\n\n${api}\n`.trimStart());
};

// Main execution
const main = async () => {
  console.log('Starting documentation generation...');

  // Ensure docs directories exist
  ensureDir('docs');
  ensureDir('docs/plugins');

  // Read the same compiled JavaScript and declarations that package consumers receive.
  const files = await glob('dist/**/*.js', {
    ignore: ['dist/plugins/utilities/**', 'dist/types/**', 'dist/custom.js'],
  });

  // Separate main files from plugin files
  const mainFiles = files.filter(f => !f.includes('/plugins/'));
  const pluginFiles = files.filter(f => f.includes('/plugins/') && !f.includes('/utilities/'));

  // Generate documentation for main files
  mainFiles.forEach(file => {
    const baseName = path.basename(file, '.js');
    const outputPath = `docs/${baseName}.md`;
    generateDoc(file, outputPath);
  });

  // Generate documentation for plugin files
  pluginFiles.forEach(file => {
    const baseName = path.basename(file, '.js');
    const outputPath = `docs/plugins/${baseName}.md`;
    generateDoc(file, outputPath);
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
