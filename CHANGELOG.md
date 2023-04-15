# Change Log

All notable changes to this project will be documented in this file. This project adheres to [Semantic Versioning](http://semver.org/).

## [5.2.2](https://github.com/uttori/uttori-wiki/compare/v5.2.1...v5.2.2) - 2023-04-14

- 🛠 Overhaul types and fix some type related warnings.

## [5.2.1](https://github.com/uttori/uttori-wiki/compare/v5.2.0...v5.2.1) - 2023-04-13

- 🧹 Regenerate docs and readme with new updates.
- 🛠 Clean up some types that were outdated.
- 🛠 Clean up a `forEach` use that should have been `for of`.
- 🛠 Clean up an uneeded check of `document`.

## [5.2.0](https://github.com/uttori/uttori-wiki/compare/v5.1.0...v5.2.0) - 2023-04-12

- 🧰 Add support for per route middleware through the configuration.
- 🎁 Update dependencies

## [5.1.0](https://github.com/uttori/uttori-wiki/compare/v5.0.3...v5.1.0) - 2023-04-05

- 🧰 Add support for overriding route handlers.
- 🧰 Do not allow saving without content.
- 🧰 Expose session data to view models.
- 🎁 Update dependencies

## [5.0.3](https://github.com/uttori/uttori-wiki/compare/v5.0.2...v5.0.3) - 2022-11-22

- 🪲 Creating new documents was not correctly checking for existing documents and showing an `undefined` flash message.
- 🛠 Clean up some types that weren't as specific as they could be.
- 🎁 Update dependencies

## [5.0.2](https://github.com/uttori/uttori-wiki/compare/v5.0.1...v5.0.2) - 2022-05-30

- 🧰 Add `production` configuration object, useful for development.
- 🛠 Restoring history correctly renders the edit page.
- 🎁 Update dependencies

## [5.0.1](https://github.com/uttori/uttori-wiki/compare/v5.0.0...v5.0.1) - 2022-05-22

- 🛠 Redirects will correctly handle line breaks when submitting form a form.
- 🎁 Update dependencies

## [5.0.0](https://github.com/uttori/uttori-wiki/compare/v4.2.2...v5.0.0) - 2021-12-26

- 🧰 Change `POST` / `PUT` routes to separate routes to separate creation from modification.
- 🧰 Add flash message support when used with Express Session through `request.wikiFlash(key, value)`.
- 🧰 Added `redirects` document option. Allows adding URLs to redirect to the current page.
- 🛠 Added `use_cache` configuration option. Enables `Cache-control` headers reducing server load, but breaks sessions. Cache is always disabled on the `/edit` and `/new` routes. Defaults to `true`.
- 🛠 Added `handle_not_found` configuration option. Allows the middleware to capture fall through routes as a `404 not found` handler when enabled. Defaults to `true`.
- 🎁 Update dependencies

## [4.2.2](https://github.com/uttori/uttori-wiki/compare/v4.2.1...v4.2.2) - 2021-11-28

- 🧰 Add Support for Open Graph images on documents

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
