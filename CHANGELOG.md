# Change Log

All notable changes to this project will be documented in this file. This project adheres to [Semantic Versioning](http://semver.org/).

## [4.2.1](https://github.com/uttori/uttori-wiki/compare/v4.2.0...v4.2.1) - 2021-11-28

- 🧰 Add Support for Open Graph images

## [4.2.0](https://github.com/uttori/uttori-wiki/compare/v4.1.1...v4.2.0) - 2021-11-27

- 🧰 Add Support for previewing content
- 🛠 Use `cors` to help prevent spam
- 🛠 Use `flatMap` rather than `.map().flat()`
- 🎁 Update dev dependencies

## [4.1.1](https://github.com/uttori/uttori-wiki/compare/v4.1.0...v4.1.1) - 2021-01-30

- 🛠 Empty searches were missing the `searchResults` view model key rather than the expected array.

## [4.1.0](https://github.com/uttori/uttori-wiki/compare/v4.0.0...v4.1.0) - 2021-01-21

- 🛠 Metadata was not being filtered without a document.
- 🛠 Remove unused proxy check.

## [4.0.0](https://github.com/uttori/uttori-wiki/compare/v3.4.2...v4.0.0) - 2021-01-17

- 🧰 Add ESM Support
- 🧰 Add explicit exports
- 🧰 Remove EJS dependencies
- 🧰 Remove Ramda dependencies
- 🧰 Add support for `edit_key` and `public_history` configuration for a blog like use case
- 🧰 Add support for only saving defiend keys with `allowedDocumentKeys`
- 🧰 Move cache times to config
- 🧹 Clean up some methods to be inline
- 🧹 Many small cleanup tasks around not using the root as the URL
- 🛠 Express Middleware configuration is now in the config
- 🛠 Use `COUNT(*)` for counts rather than fetches
- 🎁 Update dev dependencies

## [3.4.2](https://github.com/uttori/uttori-wiki/compare/v3.4.1...v3.4.2) - 2020-12-31

- 🧰 ESLint cleanup
- 🧰 Make `debug` an optional package
- 🎁 Update dev dependencies

## [3.4.1](https://github.com/uttori/uttori-wiki/compare/v3.4.0...v3.4.1) - 2020-11-15

- 🎁 Update dev dependencies
- 🎁 Update README badge URLs
- 🧰 Change how types are made and rebuild types
- 🧰 Created this file
