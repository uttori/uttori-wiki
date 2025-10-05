#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  oneLine,
  markdownItAST,
  stripImagesFromMarkdown,
  countWords,
} from '../src/plugins/chat-bot/utilities.js';
import MarkdownItRenderer from '../src/plugins/renderer-markdown-it.js';

/**
 * Display help information
 */
function showHelp() {
  console.log(`
Usage: node test-utilities.js [options] <json-file>

Test utilities functions with a JSON document containing markdown content.

Options:
  -h, --help          Show this help message
  -f, --function      Test specific function (default: all)
  --no-color          Disable colored output

Functions available:
  - oneLine
  - markdownItAST
  - stripImagesFromMarkdown
  - countWords

JSON File Format:
  {
    "content": "# Your markdown content here...",
    "title": "Document Title (optional)"
  }

Examples:
  node test-utilities.js document.json
  node test-utilities.js -f markdownItAST document.json
  node test-utilities.js -v -f countWords document.json
`);
}

/**
 * Color codes for terminal output
 */
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

/**
 * Apply color if enabled
 */
function colorize(text, color, noColor = false) {
  return noColor ? text : `${colors[color]}${text}${colors.reset}`;
}

/**
 * Format output based on type
 */
function formatOutput(data, noColor = false) {
  if (typeof data === 'string') {
    return data;
  }
  if (Array.isArray(data)) {
    return data.map((item, index) =>
      `${colorize(`[${index}]`, 'cyan', noColor)} ${JSON.stringify(item, null, 2)}`
    ).join('\n\n');
  }
  return JSON.stringify(data, null, 2);
}

/**
 * Test a specific function
 */
function testFunction(functionName, document, options) {
  try {
    let result;

    switch (functionName) {
      case 'oneLine':
        result = oneLine(document.content);
        break;

      case 'markdownItAST':
        const tokens = MarkdownItRenderer.parse(document.content);
        result = markdownItAST(tokens, document.title);
        break;

      case 'stripImagesFromMarkdown':
        result = stripImagesFromMarkdown(document.content);
        break;

      case 'countWords':
        result = countWords(document.content);
        break;

      default:
        throw new Error(`Unknown function: ${functionName}`);
    }

    return {
      function: functionName,
      input: document.content,
      result: result,
      success: true
    };

  } catch (error) {
    return {
      function: functionName,
      input: document.content,
      error: error.message,
      success: false
    };
  }
}

/**
 * Main function
 */
function main() {
  const args = process.argv.slice(2);
  let jsonFile = null;
  let functionName = null;
  let noColor = false;

  // Parse arguments
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case '-h':
      case '--help':
        showHelp();
        process.exit(0);

      case '-f':
      case '--function':
        functionName = args[++i];
        break;

      case '--no-color':
        noColor = true;
        break;

      default:
        if (!arg.startsWith('-') && !jsonFile) {
          jsonFile = arg;
        }
        break;
    }
  }

  // Validate arguments
  if (!jsonFile) {
    console.error(colorize('Error: JSON file is required', 'red', noColor));
    showHelp();
    process.exit(1);
  }

  if (!fs.existsSync(jsonFile)) {
    console.error(colorize(`Error: File not found: ${jsonFile}`, 'red', noColor));
    process.exit(1);
  }

  // Read and parse JSON file
  let input;
  try {
    const fileContent = fs.readFileSync(jsonFile, 'utf8');
    input = JSON.parse(fileContent);
  } catch (error) {
    console.error(colorize(`Error parsing JSON file: ${error.message}`, 'red', noColor));
    process.exit(1);
  }

  // Validate input structure
  if (!input.content || typeof input.content !== 'string') {
    console.error(colorize('Error: JSON file must contain a "content" key with string value', 'red', noColor));
    process.exit(1);
  }

  const options = { noColor };

  const functions = functionName ? [functionName] : [
    'oneLine',
    'markdownItAST',
    'stripImagesFromMarkdown',
    'countWords',
  ];

  console.log(colorize(`\n🧪 Testing utilities functions with: ${jsonFile}`, 'bright', noColor));
  console.log(colorize(Array(60).fill('=').join(''), 'dim', noColor));

  const results = [];

  for (const func of functions) {
    console.log(colorize(`\n📋 Testing ${func}...`, 'blue', noColor));
    console.log(colorize(input.content.substring(0, 100) + '...', 'dim', noColor));

    const result = testFunction(func, input, options);
    results.push(result);

    if (result.success) {
      console.log(colorize('✅ Success', 'green', noColor));
      console.log(formatOutput(result.result, noColor));
    } else {
      console.log(colorize('❌ Error', 'red', noColor));
      console.log(colorize(result.error, 'red', noColor));
    }
  }

  // Summary
  const successCount = results.filter(r => r.success).length;
  const totalCount = results.length;

  console.log(colorize(`\n📊 Summary: ${successCount}/${totalCount} functions succeeded`,
    successCount === totalCount ? 'green' : 'yellow', noColor));
}

// Run the script
main();
