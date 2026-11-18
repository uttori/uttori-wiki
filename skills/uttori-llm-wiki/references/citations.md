# Verify a quotation

Use the source note's slug and full `source.sha256` from its JSON metadata or the full `getDocument` record. The digest identifies the original archived bytes. A locator or the note's summary alone cannot verify a quotation.

Pass `sourceSlug`, `sha256`, and the exact `quote`. Add both `startLine` and `endLine` to check a claimed line range. Line numbers are one-based and inclusive. Preserve the original spelling, whitespace, punctuation, and line endings. Submit the words inside the quotation marks unless the original includes the marks. When only a heading is known, omit the line bounds and use the lines returned by the verifier.

- **Local sidecars.** From the project that installed Uttori, run the command below. Supply the citation as a JSON object on stdin. The script loads the source note from `content/` and the original from `raw/`. It prints a JSON verdict. Exit code 0 means verified, 1 means mismatch or unavailable, and 2 means the request could not be checked.
- **Hosted wiki.** Call the read-only `verifyCitation` MCP tool with the same fields. It requires explicit permission to check the server's private archive. Use candidate text from an authorized copy or a published excerpt. The tool returns a verdict and line numbers without returning archived text. If the available notes contain only a paraphrase, cite that paraphrase and say the exact wording could not be checked.

```sh
node node_modules/@uttori/wiki/skills/uttori-llm-wiki/scripts/verify-citation.mjs <wiki-root> [capture-directory] < citation.json
```

For a captured PDF or HTML page, pass the private inbox path as `capture-directory` or use an MCP server configured with `citationVerification.captureDirectory`. The verifier checks the original bytes and the importer text against their pinned digests before looking for the quote. Returned line numbers refer to the importer text. For PDFs, use the `[Page n]` markers in an authorized copy of that text to locate the passage in the original. HTML lines refer to the converted Markdown, including its whitespace and escaping.

For `verified`, cite the source note and the returned lines. Verification covers the literal wording at the stated revision. Evaluate the passage's relevance and any inference separately. For `mismatch`, correct the quote or locator against the original when possible, or omit the quote. For `unavailable`, say that the original revision could not be checked and distinguish any summary of the derived note from original evidence. A changed file with a different digest is unavailable for the cited revision even when it contains the same wording. If the hosted tool and an authorized local archive are both unavailable, report the same limitation.
