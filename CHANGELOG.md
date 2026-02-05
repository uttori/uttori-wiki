# Change Log

All notable changes to this project will be documented in this file. This project adheres to [Semantic Versioning](http://semver.org/).

## [7.2.0](https://github.com/uttori/uttori-wiki/compare/v7.1.0...v7.2.0) - 2026-02-05)

- 💥 BREAKING CHANGES!
- 💥 New `history_detail` theme is expected to exist
- 🪲 Fix analytics plugin validation function
- 🪲 Fix some embedding retruns could fail due to different than expected keys
- 🪲 Fix case where if embedding errored we would not add full text search (FTS) to the database
- 🛠 Add `id`, `size` and `metadata` to attachments
- 🛠 Update indexing to always include FTS even when embedding fails
- 🛠 Clean up many types
- 🛠 Add `tableToCSV`, `tableMaxRowsPerChunk`, `tableMaxTokensPerChunk` for more table indexing control to use CSV or Markdown
- 🛠 Added `chunkTable` utility to split large tables by row or chunk size
- 🛠 Added `toMarkdown` utility to convert AST table back to Markdown text
- 🛠 Indexing documents debugging logs greatly improved for detecting issues
- 🛠 Add error checking for inserting bad vectors to the database
- 🛠 Update `consolidateNestedItems` to split large tables
- 🛠 Use `@uttori/data-tools` for text diffing
- 🛠 Harden `ImportDocument` fetching
- 🛠 Harden upload path checking in `UploadMulter` uploading
- 🛠 Harden `slug` processing
- 🎁 Update dependencies
- 🎁 Update dev dependencies
- 🧰 Added embedding helper to test embeddings that cause errors
- 🧰 Add `CategoryRoutesPlugin` plugin for adding category data to documents that supports  sub-categories

## [7.1.0](https://github.com/uttori/uttori-wiki/compare/v7.0.2...v7.1.0) - 2025-10-10)

- 💥 BREAKING CHANGES!
- 💥 Remove `middleware`, server setup becomes so much more flexible
- 🛠 Convert `AIChatBot` to use WebSockets, use `tools`, added custom embedding prompts, removed `entities`, `rewriter` and `rerank` options.
- 🛠 Clean up many types
- 🎁 Update dependencies
- 🎁 Update dev dependencies

## [7.0.2](https://github.com/uttori/uttori-wiki/compare/v7.0.0...v7.0.2) - 2025-10-05)

- 🪲 Fix analytics plugin with popular documents not working with limit
- 🛠 New type & docs build system
- 🛠 Clean up many types
- 🎁 Update dependencies
- 🎁 Update dev dependencies
- 🦤 Test failed during 7.0.1, thus this version

## [7.0.0](https://github.com/uttori/uttori-wiki/compare/v6.1.3...v7.0.0) - 2025-10-04)

- 💥 BREAKING CHANGES!
- 💥 Upgrade to Express v5
- 💥 Expecting Node v22 or higher (I have not tested to see if it works on older versions)
- 💥 Migrated all first party plugins to be included with the main wiki package to simplify development
- 🪓 Removed now unused `asyncHandler`
- 🛠 New type & docs build system
- 🛠 Clean up many types
- 🛠 Rebuilt ESLint configuration
- 🎁 Update dependencies
- 🎁 Update dev dependencies
- 🧰 Add `ImportDocument` plugin for importing documents & files (HTML, Markdown, PDF, etc.)
- 🧰 Add `AIChatBot` plugin for chatting with the documents with LLM (Ollama locally)
- 🧰 Add `FormHandler` plugin for defining forms and allowing basic handling and routing to Nodemailer and Google Sheets
- 🧰 Extracted `TagRoutesPlugin` plugin for rendering tag pages to its own plugin
- 🧰 Added explicit `attachments` to document type for better file management

## [6.1.3](https://github.com/uttori/uttori-wiki/compare/v6.1.2...v6.1.3) - 2025-08-25

- 🪲 Search should not include quotes from JSON.stringify

## [6.1.3](https://github.com/uttori/uttori-wiki/compare/v6.1.2...v6.1.3) - 2025-08-25

- 🛠 Export custom types
- 🎁 Update dev dependencies

## [6.1.2](https://github.com/uttori/uttori-wiki/compare/v6.1.1...v6.1.2) - 2025-08-23

- 🎁 Update dependencies
- 🎁 Update dev dependencies

## [6.1.1](https://github.com/uttori/uttori-wiki/compare/v6.1.0...v6.1.1) - 2025-05-25

- 🪲 `FilterIPAddress` default log directory was set incorrectly to `./logs`
- 🪲 `FilterIPAddress` incorrect default method was set for the `validate-save` event of `callback` rather than `validateIP`
- 🛠 Update Express v4 redirects `res.redirect('back')` to Express v5 supported redirects
- 🎁 Update dev dependencies

## [6.1.0](https://github.com/uttori/uttori-wiki/compare/v6.0.4...v6.1.0) - 2025-05-13

- 🧰 Add support for redirecting via Express route syntax to help migrate away from Jekyll or other platforms
- 🧰 Export `asyncHandler` for use in plugins or other projects
- 🧰 Add `FilterIPAddress` plugin for an IP blocklist for blocking saving from certain IP addresses
- 🛠 Remove need for `bind(this)` with class methods
- 🛠 Clean up many types
- 🛠 Update ESLint configuration to v9
- 🎁 Update dependencies
- 🎁 Update dev dependencies

## [6.0.4](https://github.com/uttori/uttori-wiki/compare/v6.0.3...v6.0.4) - 2023-12-25

- 🛠 Ensure `tags` are always sorted

## [6.0.3](https://github.com/uttori/uttori-wiki/compare/v6.0.2...v6.0.3) - 2023-12-25

- 🛠 Fix types

## [6.0.2](https://github.com/uttori/uttori-wiki/compare/v6.0.1...v6.0.2) - 2023-12-25

- 🛠 Fix lack of exports of `EJSRenderer` & `DownloadRouter`

## [6.0.1](https://github.com/uttori/uttori-wiki/compare/v6.0.0...v6.0.1) - 2023-12-25

- 🧰 Add support for setting the `layout` on documents to determine the layout to render with
- 🧰 Add `EJSRenderer` plugin for rendering EJS content in posts
- 🧰 Add `DownloadRouter` plugin for allowing downloads with `Referrer` checking
- 🛠 Fix `AddQueryOutputToViewModel` plugin types

## [6.0.0](https://github.com/uttori/uttori-wiki/compare/v5.2.2...v6.0.0) - 2023-12-22

- 💥 BREAKING CHANGES!
- 💥 Rename config key: `home_page` to `homePage`
- 💥 Rename config key: `ignore_slugs` to `ignoreSlugs`
- 💥 Rename config key: `home_page` to `excerptLength`
- 💥 Rename config key: `excerpt_length` to `homePage`
- 💥 Rename config key: `site_url` to `publicUrl`
- 💥 Rename config key: `theme_dir` to `themePath`
- 💥 Rename config key: `public_dir` to `publicPath`
- 💥 Rename config key: `use_delete_key` to `useDeleteKey`
- 💥 Rename config key: `delete_key` to `deleteKey`
- 💥 Rename config key: `use_edit_key` to `useEditKey`
- 💥 Rename config key: `edit_key` to `editKey`
- 💥 Rename config key: `public_history` to `publicHistory`
- 💥 Rename config key: `handle_not_found` to `handleNotFound`
- 💥 Rename config key: `use_cache` to `useCache`
- 💥 Rename config key: `cache_short` to `cacheShort`
- 💥 Rename config key: `cache_long` to `cacheLong`
- 💥 Removed many configuration options that were not being used or items that should be theme specific: `site_title`, `site_header`, `site_footer`, `site_sections`, `site_locale`, `site_twitter_site`, `site_twitter_creator`, `site_image`
- 🧰 Add support for setting the `routes` for search & tags
- 🧰 Add support for setting the `titles` for search & tags
- 🧰 Added support for `allowCRUDRoutes` to disable the CRUD routes for a read-only wiki
- 🧰 Added support for `ignoreTags` to ignore documents with specific tags
- 🧰 Remove support for CommonJS, now requires ESM support
- Change the `detailRoute` route path matcher to `/:slug*?` to allow for nested routes with the use of overriding `detailRoute` and handling the `request.params.slug` value accordingly`
- 🎁 Update dependencies
- 🛠 Standardize types
- 🛠 Update ESLint configuration
- 🛠 Update documentation

## [5.2.2](https://github.com/uttori/uttori-wiki/compare/v5.2.1...v5.2.2) - 2023-04-14

- 🛠 Overhaul types and fix some type related warnings.
- 🎁 Update dependencies

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
