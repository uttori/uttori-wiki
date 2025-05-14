import { defineConfig, globalIgnores } from "eslint/config";
import { fixupConfigRules, fixupPluginRules } from "@eslint/compat";
import antiTrojanSource from "eslint-plugin-anti-trojan-source";
import ava from "eslint-plugin-ava";
import _import from "eslint-plugin-import";
import noInferredMethodName from "eslint-plugin-no-inferred-method-name";
import n from "eslint-plugin-n";
import optimizeRegex from "eslint-plugin-optimize-regex";
import security from "eslint-plugin-security";
import xss from "eslint-plugin-xss";
import globals from "globals";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default defineConfig([globalIgnores([
    "**/.nyc_output",
    "**/coverage",
    "site/themes/*",
    "**/convert",
    "**/node_modules",
    "dist/*",
    "eslint.config.js",
]), {
    extends: fixupConfigRules(compat.extends(
        "plugin:ava/recommended",
        "plugin:import/recommended",
        "plugin:jsdoc/recommended",
        "plugin:n/recommended",
        "plugin:optimize-regex/all",
        "plugin:security/recommended-legacy",
        "plugin:@typescript-eslint/recommended-type-checked",
    )),

    plugins: {
        "anti-trojan-source": antiTrojanSource,
        ava: fixupPluginRules(ava),
        import: fixupPluginRules(_import),
        "no-inferred-method-name": noInferredMethodName,
        n: fixupPluginRules(n),
        "optimize-regex": fixupPluginRules(optimizeRegex),
        security: fixupPluginRules(security),
        xss,
    },

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

    settings: {
        jsdoc: {
            mode: "typescript",
        },

        react: {
            version: "detect",
        },
    },

    rules: {
        "@typescript-eslint/no-unsafe-argument": "warn",
        "@typescript-eslint/no-unsafe-assignment": "off",
        "@typescript-eslint/no-unsafe-call": "off",
        "@typescript-eslint/no-unsafe-member-access": "warn",
        "@typescript-eslint/no-unsafe-return": "warn",
        "anti-trojan-source/no-bidi": "error",
        "ava/no-only-test": "warn",
        camelcase: 0,

        "consistent-return": ["warn", {
            treatUndefinedAsUnspecified: false,
        }],

        "import/no-commonjs": 0,
        "import/no-dynamic-require": 0,

        "import/no-extraneous-dependencies": ["error", {
            devDependencies: ["**/*.test.js", "**/test/**/*.js", "eslint.config.js"],
            optionalDependencies: true,
            peerDependencies: true,
        }],

        "import/extensions": ["warn", "ignorePackages"],
        "import/no-unresolved": 0,
        "max-len": 0,
        "no-continue": 0,

        "no-empty": ["error", {
            allowEmptyCatch: true,
        }],

        "no-param-reassign": 0,
        "no-plusplus": 0,

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

        "no-return-await": 0,
        "no-underscore-dangle": 0,
        "no-unused-vars": 0,

        "@typescript-eslint/no-unused-vars": ["error", {
            varsIgnorePattern: "^_",
            argsIgnorePattern: "^_",
            caughtErrors: "none",
        }],

        "object-curly-newline": 0,
        "optimize-regex/optimize-regex": "warn",
        "security/detect-non-literal-fs-filename": 0,
        "security/detect-non-literal-require": 0,
        "security/detect-object-injection": 0,
    },
}, {
    files: ["**/*.test.js", "test/_helpers/*.*"],

    languageOptions: {
        ecmaVersion: 5,
        sourceType: "script",

        parserOptions: {
            project: "./test/tsconfig.json",
        },
    },

    rules: {
        "@typescript-eslint/no-unsafe-member-access": 0,
        "@typescript-eslint/no-unsafe-return": 0,
        "@typescript-eslint/unbound-method": 0,
        "import/no-named-as-default-member": 0,
    },
}]);
