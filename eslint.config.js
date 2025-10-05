/*
 * Modern ESLint v9 Configuration
 *
 * PLUGINS NOT COMPATIBLE WITH ESLINT V9:
 * - eslint-plugin-optimize-regex: Not compatible with flat config
 * - eslint-plugin-no-inferred-method-name: Not compatible with flat config
 * - eslint-plugin-anti-trojan-source: Not compatible with flat config
 * - eslint-plugin-xss: Not compatible with flat config
 *
 * WORKING PLUGINS:
 * - @typescript-eslint/*: Full v9 support
 * - @stylistic/eslint-plugin: Full v9 support
 * - eslint-plugin-ava: Full v9 support
 * - eslint-plugin-n: Full v9 support
 * - eslint-plugin-import: Full v9 support
 * - eslint-plugin-jsdoc: Full v9 support
 * - eslint-plugin-security: Full v9 support
 */

import importPlugin from 'eslint-plugin-import';
import { defineConfig, globalIgnores } from "eslint/config";
import antiTrojanSource from "eslint-plugin-anti-trojan-source";
import ava from "eslint-plugin-ava";
import globals from "globals";
import js from "@eslint/js";
import jsdoc from "eslint-plugin-jsdoc";
import n from "eslint-plugin-n";
import noInferredMethodName from "eslint-plugin-no-inferred-method-name";
import optimizeRegex from "eslint-plugin-optimize-regex";
import security from "eslint-plugin-security";
import stylistic from '@stylistic/eslint-plugin';
import tsParser from "@typescript-eslint/parser";
import tseslint from 'typescript-eslint';
import xss from "eslint-plugin-xss";

export default defineConfig([
  globalIgnores([
      "**/.nyc_output",
      "**/convert",
      "**/coverage",
      "**/node_modules",
      "build/**/*",
      "dist/*",
      "eslint.config.js",
      "site/themes/*",
      "src/**/*.png",
  ]),

  security.configs.recommended,
  tseslint.configs.strict,
  tseslint.configs.stylistic,

  // Base configuration
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        sinon: false,
        expect: true,
      },
      parser: tsParser,
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
          project: "./tsconfig.json",
          requireConfigFile: false,
      },
    },
    plugins: {
      "@stylistic": stylistic,
      "anti-trojan-source": antiTrojanSource,
      ava,
      import: importPlugin,
      js,
      jsdoc,
      n,
      "no-inferred-method-name": noInferredMethodName,
      "optimize-regex": optimizeRegex,
      security,
      xss,
    },
    settings: {
      jsdoc: {
        mode: "typescript",
      },
      react: {
        version: "detect",
      },
    },
    rules: {
      // TypeScript rules
      "@typescript-eslint/class-literal-property-style": "off",
      "@typescript-eslint/no-extraneous-class": "off",
      "@typescript-eslint/no-dynamic-delete": "off",
      "@typescript-eslint/no-empty-function": "off",
      "@typescript-eslint/no-unsafe-argument": "warn",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-member-access": "warn",
      "@typescript-eslint/no-unsafe-return": "warn",
      "@typescript-eslint/no-unused-vars": ["error", {
        varsIgnorePattern: "^_",
        argsIgnorePattern: "^_",
        caughtErrors: "none",
      }],


      // Core ESLint rules
      "camelcase": "off",
      "consistent-return": ["warn", {
        treatUndefinedAsUnspecified: false,
      }],
      "max-len": "off",
      "no-continue": "off",
      "no-empty": ["error", {
        allowEmptyCatch: true,
      }],
      "no-param-reassign": "off",
      "no-plusplus": "off",
      "no-return-await": "off",
      "no-underscore-dangle": "off",
      "no-unused-vars": "off",

      "no-restricted-syntax": ["error", {
        selector: "ForInStatement",
        message: "for..in loops iterate over the entire prototype chain, which is virtually never what you want. Use Object.{keys,values,entries}, and iterate over the resulting array.",
      }, {
        selector: "LabeledStatement",
        message: "Labels are a form of GOTO; using them makes code confusing and hard to maintain and understand.",
      }, {
        selector: "WithStatement",
        message: "`with` is disallowed in strict mode because it makes code impossible to predict and optimize.",
      }],

      // Import rules
      "import/no-commonjs": "off",
      "import/no-dynamic-require": "off",
      "import/no-extraneous-dependencies": ["error", {
        devDependencies: ["**/*.test.js", "**/test/**/*.js", "eslint.config.js"],
        optionalDependencies: true,
        peerDependencies: true,
      }],
      "import/extensions": ["warn", "ignorePackages"],
      "import/no-unresolved": "off",

      // Security rules
      "security/detect-non-literal-fs-filename": "off",
      "security/detect-non-literal-require": "off",
      "security/detect-object-injection": "off",

      // Stylistic rules
      "@stylistic/object-curly-newline": "off",
      "@stylistic/indent": ["error", 2],
      "@stylistic/quotes": ["error", "single"],
      "@stylistic/semi": ["error", "always"],
      "@stylistic/comma-dangle": ["error", "always-multiline"],
      "@stylistic/no-trailing-spaces": "error",
      "@stylistic/eol-last": "error",
    },
  },

  // Test files configuration
  {
    files: ["**/*.test.js", "test/_helpers/*.js"],
    languageOptions: {
      ecmaVersion: 5,
      sourceType: "script",
      parserOptions: {
        project: "./test/tsconfig.json",
      },
    },
    rules: {
      "@typescript-eslint/no-empty-function": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/unbound-method": "off",
      "import/no-named-as-default-member": "off",
    },
  },

  // AVA test files
  {
    files: ["**/*.test.js"],
    rules: {
      "ava/no-only-test": "warn",
      "jsdoc/no-undefined-types": "off",
    },
  },
]);
