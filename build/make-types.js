import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

// Configuration
const CUSTOM_EXPORT = 'export * from "./custom.d.ts";';
const INDEX_DTS_PATH = 'dist/index.d.ts';
const DIST_PATH = 'dist';
const PRESERVED_DECLARATIONS = new Set(['custom.d.ts']);

/**
 * Recursively removes generated declaration files while preserving custom type declarations.
 * @param {string} directory The directory to clean.
 */
const cleanGeneratedDeclarations = (directory) => {
  if (!fs.existsSync(directory)) {
    return;
  }

  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      cleanGeneratedDeclarations(fullPath);
      continue;
    }

    const relativePath = path.relative(DIST_PATH, fullPath);
    const isDeclaration = entry.name.endsWith('.d.ts') || entry.name.endsWith('.d.ts.map');
    const isPreserved = PRESERVED_DECLARATIONS.has(relativePath);
    if (isDeclaration && !isPreserved) {
      fs.unlinkSync(fullPath);
      console.log(`Removed ${fullPath}`);
    }
  }
};

// Ensure custom export is at the bottom of index.d.ts
const ensureCustomExport = () => {
  if (!fs.existsSync(INDEX_DTS_PATH)) {
    console.error(`Error: ${INDEX_DTS_PATH} not found`);
    process.exit(1);
  }

  const content = fs.readFileSync(INDEX_DTS_PATH, 'utf8');

  // Check if custom export already exists
  if (content.includes(CUSTOM_EXPORT)) {
    console.log('Custom export already exists in index.d.ts');
    return;
  }

  // Add custom export to the bottom, before source map comment if it exists
  let newContent = content.trim();

  // Remove trailing source map comment if it exists
  const sourceMapRegex = /\n\/\/# sourceMappingURL=.*$/;
  const hasSourceMap = sourceMapRegex.test(newContent);

  if (hasSourceMap) {
    newContent = newContent.replace(sourceMapRegex, '');
  }

  // Add custom export
  newContent += `\n\n${CUSTOM_EXPORT}`;

  // Re-add source map comment if it existed
  if (hasSourceMap) {
    newContent += '\n//# sourceMappingURL=index.d.ts.map';
  }

  fs.writeFileSync(INDEX_DTS_PATH, newContent);
  console.log('Added custom export to index.d.ts');
};

// Compile TypeScript types programmatically
const compileTypes = async () => {
  // Read tsconfig.json
  const configPath = 'tsconfig.json';
  const configFile = ts.readConfigFile(configPath, ts.sys.readFile);

  if (configFile.error) {
    throw new Error(`Failed to read tsconfig.json: ${configFile.error.messageText}`);
  }

  const config = ts.parseJsonConfigFileContent(
    configFile.config,
    ts.sys,
    process.cwd()
  );

  if (config.errors.length > 0) {
    throw new Error(`TypeScript config errors: ${config.errors.map(e => e.messageText).join(', ')}`);
  }

  // Override module to nodenext
  const compilerOptions = {
    ...config.options,
    module: ts.ModuleKind.NodeNext,
    declaration: true,
    emitDeclarationOnly: true,
    outDir: 'dist',
    noEmit: false,
  };

  // Create program
  const program = ts.createProgram(config.fileNames, compilerOptions);

  // Get all source files
  const sourceFiles = program.getSourceFiles();

  // Find wiki.js first (it should be compiled first)
  const wikiFile = sourceFiles.find(file => file.fileName.includes('src/wiki.js'));
  // Compile wiki.js first
  if (wikiFile) {
    console.log('Compiling wiki.js first...');
    const wikiResult = program.emit(wikiFile, undefined, undefined, true);
    if (wikiResult.emitSkipped) {
      console.warn('Wiki compilation was skipped');
    }
  }

  // Then compile all other files
  console.log('Compiling remaining files...');
  const result = program.emit(undefined, undefined, undefined, true);

  if (result.emitSkipped) {
    console.warn('Some files were skipped during compilation');
  }

  // Report any diagnostics
  const diagnostics = ts.getPreEmitDiagnostics(program).concat(result.diagnostics);
  if (diagnostics.length > 0) {
    console.log('TypeScript diagnostics:');
    diagnostics.forEach(diagnostic => {
      const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
      if (diagnostic.file) {
        const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start ?? 0);
        console.log(`${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`);
      } else {
        console.log(message);
      }
    });
  }

  console.log('TypeScript compilation complete');
};

// Main execution
const main = async () => {
  console.log('Starting type generation...');

  try {
    // Clean up existing type files
    console.log('Cleaning up existing type files...');
    cleanGeneratedDeclarations(DIST_PATH);

    // Run TypeScript compilation programmatically
    console.log('Running TypeScript compilation...');
    await compileTypes();

    // Ensure custom export is added
    console.log('Ensuring custom export is present...');
    ensureCustomExport();

    console.log('Type generation complete!');
  } catch (error) {
    console.error('Error during type generation:', error.message);
    process.exit(1);
  }
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { main };
