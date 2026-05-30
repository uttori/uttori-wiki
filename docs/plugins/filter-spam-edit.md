## Classes

<dl>
<dt><a href="#FilterSpamEdit">FilterSpamEdit</a></dt>
<dd><p>Uttori Wiki Spam Edit Filter</p>
<p>Scores each incoming edit using a set of configurable weighted signals and blocks high-risk saves via the <code>validate-save</code> hook.
Requires no user accounts, no external database, and no heavy dependencies
Suitable for resource-constrained servers.
All signal weights are independently configurable. Set any weight to <code>0</code> to disable that signal entirely.
Pages listed in <code>targetedSlugs</code> receive a score multiplier so that known high-value targets are harder for spammers to edit.</p>
</dd>
</dl>

## Members

<dl>
<dt><a href="#lastIPHistorySweep">lastIPHistorySweep</a> : <code>number</code></dt>
<dd><p>Timestamp of the last full sweep of <code>ipEditHistory</code>.
Used to avoid scanning the entire map on every edit request.</p>
</dd>
</dl>

## Constants

<dl>
<dt><a href="#__dirname">__dirname</a> : <code>string</code></dt>
<dd><p>The directory name of the current file.</p>
</dd>
<dt><a href="#ipEditHistory">ipEditHistory</a> : <code>Map.&lt;string, Array.&lt;number&gt;&gt;</code></dt>
<dd><p>Module-level in-memory map of IP addresses to edit timestamps.
Keyed by IP string. Values are arrays of <code>Date.now()</code> timestamps.
Entries are pruned on each access. No external store required.</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#FilterSpamEditWeights">FilterSpamEditWeights</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#FilterSpamEditConfig">FilterSpamEditConfig</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#SpamSignals">SpamSignals</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#SpamScoreResult">SpamScoreResult</a> : <code>object</code></dt>
<dd></dd>
</dl>

<a name="FilterSpamEdit"></a>

## FilterSpamEdit
Uttori Wiki Spam Edit FilterScores each incoming edit using a set of configurable weighted signals and blocks high-risk saves via the `validate-save` hook.Requires no user accounts, no external database, and no heavy dependenciesSuitable for resource-constrained servers.All signal weights are independently configurable. Set any weight to `0` to disable that signal entirely.Pages listed in `targetedSlugs` receive a score multiplier so that known high-value targets are harder for spammers to edit.

**Kind**: global class  

* [FilterSpamEdit](#FilterSpamEdit)
    * [new FilterSpamEdit()](#new_FilterSpamEdit_new)
    * [.configKey](#FilterSpamEdit.configKey) ⇒ <code>string</code>
    * [.defaultConfig()](#FilterSpamEdit.defaultConfig) ⇒ [<code>FilterSpamEditConfig</code>](#FilterSpamEditConfig)
    * [.resolveConfig(context)](#FilterSpamEdit.resolveConfig) ⇒ [<code>FilterSpamEditConfig</code>](#FilterSpamEditConfig)
    * [.validateConfig(config, _context)](#FilterSpamEdit.validateConfig)
    * [.register(context)](#FilterSpamEdit.register)
    * [.normalizeText(text)](#FilterSpamEdit.normalizeText) ⇒ <code>string</code>
    * [.tokenize(text)](#FilterSpamEdit.tokenize) ⇒ <code>Set.&lt;string&gt;</code>
    * [.jaccardSimilarity(a, b)](#FilterSpamEdit.jaccardSimilarity) ⇒ <code>number</code>
    * [.normalizeUrl(rawUrl)](#FilterSpamEdit.normalizeUrl) ⇒ <code>string</code>
    * [.getUrls(text)](#FilterSpamEdit.getUrls) ⇒ <code>Array.&lt;string&gt;</code>
    * [.getUrlHost(rawUrl)](#FilterSpamEdit.getUrlHost) ⇒ <code>string</code>
    * [.countWords(text)](#FilterSpamEdit.countWords) ⇒ <code>number</code>
    * [.splitParagraphs(text)](#FilterSpamEdit.splitParagraphs) ⇒ <code>Array.&lt;string&gt;</code>
    * [.scoreSuspiciousTerms(text, termList)](#FilterSpamEdit.scoreSuspiciousTerms) ⇒ <code>number</code>
    * [.sweepIPHistory(config)](#FilterSpamEdit.sweepIPHistory)
    * [.recordAndScoreIPRateLimit(ip, config)](#FilterSpamEdit.recordAndScoreIPRateLimit) ⇒ <code>boolean</code>
    * [.scoreUnicodeObfuscation(text)](#FilterSpamEdit.scoreUnicodeObfuscation) ⇒ <code>number</code>
    * [.computeScore(params)](#FilterSpamEdit.computeScore) ⇒ [<code>SpamScoreResult</code>](#SpamScoreResult)
    * [.logBlockedEdit(config, ip, slug, score, reasons)](#FilterSpamEdit.logBlockedEdit)
    * [.validateEdit(request, context)](#FilterSpamEdit.validateEdit) ⇒ <code>Promise.&lt;boolean&gt;</code>

<a name="new_FilterSpamEdit_new"></a>

### new FilterSpamEdit()
**Example** *(FilterSpamEdit - register in site config)*  
```js
import { FilterSpamEdit } from '@uttori/wiki';
const config = {
  plugins: [FilterSpamEdit],
  [FilterSpamEdit.configKey]: {
    ...FilterSpamEdit.defaultConfig(),
    blockThreshold: 70,
    targetedSlugs: ['home', 'about'],
  },
};
```
<a name="FilterSpamEdit.configKey"></a>

### FilterSpamEdit.configKey ⇒ <code>string</code>
The configuration key used to look up this plugin's settings in the site config.

**Kind**: static property of [<code>FilterSpamEdit</code>](#FilterSpamEdit)  
**Returns**: <code>string</code> - The configuration key.  
<a name="FilterSpamEdit.defaultConfig"></a>

### FilterSpamEdit.defaultConfig() ⇒ [<code>FilterSpamEditConfig</code>](#FilterSpamEditConfig)
Returns the default configuration for the plugin.

**Kind**: static method of [<code>FilterSpamEdit</code>](#FilterSpamEdit)  
**Returns**: [<code>FilterSpamEditConfig</code>](#FilterSpamEditConfig) - The default configuration.  
<a name="FilterSpamEdit.resolveConfig"></a>

### FilterSpamEdit.resolveConfig(context) ⇒ [<code>FilterSpamEditConfig</code>](#FilterSpamEditConfig)
Resolves the plugin configuration by shallow-merging top-level settings and deep-merging nested `events` and `weights` entries with their defaults.This allows site config to override only the settings it needs without replacing the full default nested objects.

**Kind**: static method of [<code>FilterSpamEdit</code>](#FilterSpamEdit)  
**Returns**: [<code>FilterSpamEditConfig</code>](#FilterSpamEditConfig) - The resolved plugin configuration.  

| Param | Type | Description |
| --- | --- | --- |
| context | <code>UttoriContextWithPluginConfig.&lt;&#x27;uttori-plugin-filter-spam-edit&#x27;, FilterSpamEditConfig&gt;</code> | The Uttori wiki context with plugin configuration. |

<a name="FilterSpamEdit.validateConfig"></a>

### FilterSpamEdit.validateConfig(config, _context)
Validates the provided configuration for required entries and correct types.

**Kind**: static method of [<code>FilterSpamEdit</code>](#FilterSpamEdit)  
**Throws**:

- <code>Error</code> When any required config value is missing or invalid.


| Param | Type | Description |
| --- | --- | --- |
| config | <code>Record.&lt;string, FilterSpamEditConfig&gt;</code> | A Uttori-like context. |
| _context | <code>UttoriContextWithPluginConfig.&lt;&#x27;uttori-plugin-filter-spam-edit&#x27;, FilterSpamEditConfig&gt;</code> | Unused context object. |

<a name="FilterSpamEdit.register"></a>

### FilterSpamEdit.register(context)
Registers the plugin with the provided hook system, binding configured events to static methods.

**Kind**: static method of [<code>FilterSpamEdit</code>](#FilterSpamEdit)  
**Throws**:

- <code>Error</code> When the context or hook system is missing.


| Param | Type | Description |
| --- | --- | --- |
| context | <code>UttoriContextWithPluginConfig.&lt;&#x27;uttori-plugin-filter-spam-edit&#x27;, FilterSpamEditConfig&gt;</code> | A Uttori-like context. |

<a name="FilterSpamEdit.normalizeText"></a>

### FilterSpamEdit.normalizeText(text) ⇒ <code>string</code>
Normalizes wiki text for content-similarity comparison.Strips markdown syntax, HTML tags, collapses whitespace, and lowercases.

**Kind**: static method of [<code>FilterSpamEdit</code>](#FilterSpamEdit)  
**Returns**: <code>string</code> - Normalized text suitable for tokenization.  

| Param | Type | Description |
| --- | --- | --- |
| text | <code>string</code> | Raw wiki page content. |

<a name="FilterSpamEdit.tokenize"></a>

### FilterSpamEdit.tokenize(text) ⇒ <code>Set.&lt;string&gt;</code>
Splits normalized text into a set of unique word tokens.

**Kind**: static method of [<code>FilterSpamEdit</code>](#FilterSpamEdit)  
**Returns**: <code>Set.&lt;string&gt;</code> - Unique word tokens.  

| Param | Type | Description |
| --- | --- | --- |
| text | <code>string</code> | Already-normalized text. |

<a name="FilterSpamEdit.jaccardSimilarity"></a>

### FilterSpamEdit.jaccardSimilarity(a, b) ⇒ <code>number</code>
Computes Jaccard similarity between two strings using word tokens.Returns 1 when both inputs are empty (identical by convention).

**Kind**: static method of [<code>FilterSpamEdit</code>](#FilterSpamEdit)  
**Returns**: <code>number</code> - A value in [0, 1] where 1 is identical and 0 is completely different.  

| Param | Type | Description |
| --- | --- | --- |
| a | <code>string</code> | First text (will be normalized internally). |
| b | <code>string</code> | Second text (will be normalized internally). |

<a name="FilterSpamEdit.normalizeUrl"></a>

### FilterSpamEdit.normalizeUrl(rawUrl) ⇒ <code>string</code>
Normalizes a URL before comparison so equivalent URLs with minor differences do not count as newly-added external links.Removes hashes, common tracking parameters, lowercases hostnames, and normalizes root paths.

**Kind**: static method of [<code>FilterSpamEdit</code>](#FilterSpamEdit)  
**Returns**: <code>string</code> - Normalized URL string, or a trimmed lowercase fallback when parsing fails.  

| Param | Type | Description |
| --- | --- | --- |
| rawUrl | <code>string</code> | Raw URL string to normalize. |

<a name="FilterSpamEdit.getUrls"></a>

### FilterSpamEdit.getUrls(text) ⇒ <code>Array.&lt;string&gt;</code>
Extracts all HTTP/HTTPS URLs from a block of text and normalizes them for stable old/new URL comparisons.

**Kind**: static method of [<code>FilterSpamEdit</code>](#FilterSpamEdit)  
**Returns**: <code>Array.&lt;string&gt;</code> - Array of normalized URL strings.  

| Param | Type | Description |
| --- | --- | --- |
| text | <code>string</code> | Raw text to scan. |

<a name="FilterSpamEdit.getUrlHost"></a>

### FilterSpamEdit.getUrlHost(rawUrl) ⇒ <code>string</code>
Extracts a normalized hostname from a URL for domain-level analysis.

**Kind**: static method of [<code>FilterSpamEdit</code>](#FilterSpamEdit)  
**Returns**: <code>string</code> - Lowercase hostname without a leading `www.`, or an empty string when parsing fails.  

| Param | Type | Description |
| --- | --- | --- |
| rawUrl | <code>string</code> | URL string to parse. |

<a name="FilterSpamEdit.countWords"></a>

### FilterSpamEdit.countWords(text) ⇒ <code>number</code>
Counts the number of words in a string.

**Kind**: static method of [<code>FilterSpamEdit</code>](#FilterSpamEdit)  
**Returns**: <code>number</code> - Word count.  

| Param | Type | Description |
| --- | --- | --- |
| text | <code>string</code> | Text to count. |

<a name="FilterSpamEdit.splitParagraphs"></a>

### FilterSpamEdit.splitParagraphs(text) ⇒ <code>Array.&lt;string&gt;</code>
Splits text into normalized paragraphs on two or more consecutive newlines.Paragraph normalization keeps harmless formatting and whitespace changes from being counted as full paragraph removals.

**Kind**: static method of [<code>FilterSpamEdit</code>](#FilterSpamEdit)  
**Returns**: <code>Array.&lt;string&gt;</code> - Non-empty normalized paragraph strings.  

| Param | Type | Description |
| --- | --- | --- |
| text | <code>string</code> | Raw text to split. |

<a name="FilterSpamEdit.scoreSuspiciousTerms"></a>

### FilterSpamEdit.scoreSuspiciousTerms(text, termList) ⇒ <code>number</code>
Scores suspicious keyword density against a term list.Returns a value in [0, 1]: 0 means no hits, 1 means saturated.Each unique matched term contributes `1 / list.length` to the score, clamped to a maximum of 1.

**Kind**: static method of [<code>FilterSpamEdit</code>](#FilterSpamEdit)  
**Returns**: <code>number</code> - A value in [0, 1].  

| Param | Type | Description |
| --- | --- | --- |
| text | <code>string</code> | Text to scan (will be lowercased internally). |
| termList | <code>Array.&lt;string&gt;</code> | List of suspicious terms to look for. |

<a name="FilterSpamEdit.sweepIPHistory"></a>

### FilterSpamEdit.sweepIPHistory(config)
Periodically sweeps stale IP timestamp entries from the module-level `ipEditHistory` map so IPs that never edit again do not remain forever.The sweep runs at most once per configured IP window.

**Kind**: static method of [<code>FilterSpamEdit</code>](#FilterSpamEdit)  

| Param | Type | Description |
| --- | --- | --- |
| config | [<code>FilterSpamEditConfig</code>](#FilterSpamEditConfig) | Plugin configuration. |

<a name="FilterSpamEdit.recordAndScoreIPRateLimit"></a>

### FilterSpamEdit.recordAndScoreIPRateLimit(ip, config) ⇒ <code>boolean</code>
Records a new edit attempt from an IP address and returns whether that edit exceeds the configured rolling-window rate limit.Old entries outside `config.ipWindowMs` are pruned in-place on the same call.

**Kind**: static method of [<code>FilterSpamEdit</code>](#FilterSpamEdit)  
**Returns**: <code>boolean</code> - `true` when the new attempt exceeds the IP limit, `false` otherwise.  

| Param | Type | Description |
| --- | --- | --- |
| ip | <code>string</code> | Client IP address. |
| config | [<code>FilterSpamEditConfig</code>](#FilterSpamEditConfig) | Plugin configuration. |

<a name="FilterSpamEdit.scoreUnicodeObfuscation"></a>

### FilterSpamEdit.scoreUnicodeObfuscation(text) ⇒ <code>number</code>
Scores likely unicode obfuscation by measuring the ratio of characters that are neither letters, numbers, punctuation, nor symbols after Unicode NFKC normalization.Higher values suggest hidden / control / combining character abuse.

**Kind**: static method of [<code>FilterSpamEdit</code>](#FilterSpamEdit)  
**Returns**: <code>number</code> - A value in [0, 1].  

| Param | Type | Description |
| --- | --- | --- |
| text | <code>string</code> | Raw text to scan. |

<a name="FilterSpamEdit.computeScore"></a>

### FilterSpamEdit.computeScore(params) ⇒ [<code>SpamScoreResult</code>](#SpamScoreResult)
Computes a spam risk score from pre-calculated signal values.Each signal contributes its configured weight when triggered (signal value > 0).For signals that return a continuous value in [0, 1], the contribution is `signal * weight` (proportional). For boolean signals the full weight is added.The targeted-slug multiplier is applied after summation when the edited slug appears in `config.targetedSlugs`.

**Kind**: static method of [<code>FilterSpamEdit</code>](#FilterSpamEdit)  
**Returns**: [<code>SpamScoreResult</code>](#SpamScoreResult) - The computed score, reasons, and individual signal values.  

| Param | Type | Description |
| --- | --- | --- |
| params | <code>object</code> | Signal parameters. |
| params.slug | <code>string</code> | The slug being edited. |
| params.contentDistance | <code>number</code> | Jaccard distance (0 = identical, 1 = completely different). Pass -1 to skip (new page). |
| params.newExternalLinks | <code>number</code> | Number of net-new external URLs added. |
| params.oldUrls | <code>number</code> | Number of URLs in the old content. |
| params.paragraphsRemoved | <code>number</code> | Fraction of old paragraphs removed. |
| params.suspiciousTermScore | <code>number</code> | Suspicious term density (0–1). |
| params.unicodeObfuscationScore | <code>number</code> | Unicode obfuscation ratio (0–1). |
| params.newWordCount | <code>number</code> | Word count of the new content. |
| params.oldWordCount | <code>number</code> | Word count of the old content. Pass 0 to skip (new page). |
| params.ipRateLimited | <code>boolean</code> | Whether the submitting IP is rate-limited. |
| params.isNewPage | <code>boolean</code> | Whether this is a brand-new page (no baseline). |
| params.config | [<code>FilterSpamEditConfig</code>](#FilterSpamEditConfig) | Plugin configuration. |

<a name="FilterSpamEdit.logBlockedEdit"></a>

### FilterSpamEdit.logBlockedEdit(config, ip, slug, score, reasons)
Appends a blocked-edit entry to the daily log file at `config.logPath`.The entry is a single JSON line with timestamp, IP, slug, score, and reasons.

**Kind**: static method of [<code>FilterSpamEdit</code>](#FilterSpamEdit)  

| Param | Type | Description |
| --- | --- | --- |
| config | [<code>FilterSpamEditConfig</code>](#FilterSpamEditConfig) | Plugin configuration. |
| ip | <code>string</code> | Client IP address. |
| slug | <code>string</code> | The slug that was blocked. |
| score | <code>number</code> | The final spam score. |
| reasons | <code>Array.&lt;string&gt;</code> | The list of triggered signal reasons. |

<a name="FilterSpamEdit.validateEdit"></a>

### FilterSpamEdit.validateEdit(request, context) ⇒ <code>Promise.&lt;boolean&gt;</code>
Evaluates the incoming edit request and returns `true` to block it when the computed spam score meets or exceeds `config.blockThreshold`.Called automatically on the `validate-save` hook for both `save` (existing documents) and `saveNew` (new documents).Fetches the current version of the document from storage to enable content-comparison signals; if no prior document exists the comparison signals are skipped.

**Kind**: static method of [<code>FilterSpamEdit</code>](#FilterSpamEdit)  
**Returns**: <code>Promise.&lt;boolean&gt;</code> - Resolves to `true` to block the save, `false` to allow it.  

| Param | Type | Description |
| --- | --- | --- |
| request | <code>module:express~Request.&lt;{slug: string}, {}, UttoriWikiDocument&gt;</code> | The Express request object containing the submitted form body. |
| context | <code>UttoriContextWithPluginConfig.&lt;&#x27;uttori-plugin-filter-spam-edit&#x27;, FilterSpamEditConfig&gt;</code> | The Uttori wiki context with `hooks` and `config`. |

<a name="lastIPHistorySweep"></a>

## lastIPHistorySweep : <code>number</code>
Timestamp of the last full sweep of `ipEditHistory`.Used to avoid scanning the entire map on every edit request.

**Kind**: global variable  
<a name="__dirname"></a>

## \_\_dirname : <code>string</code>
The directory name of the current file.

**Kind**: global constant  
<a name="ipEditHistory"></a>

## ipEditHistory : <code>Map.&lt;string, Array.&lt;number&gt;&gt;</code>
Module-level in-memory map of IP addresses to edit timestamps.Keyed by IP string. Values are arrays of `Date.now()` timestamps.Entries are pruned on each access. No external store required.

**Kind**: global constant  
<a name="FilterSpamEditWeights"></a>

## FilterSpamEditWeights : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| [contentSimilarity] | <code>number</code> | <code>40</code> | Jaccard distance weight for large content replacement. Set to 0 to disable. |
| [externalLinksAdded] | <code>number</code> | <code>20</code> | Weight for net-new external URLs added. Set to 0 to disable. |
| [paragraphRatio] | <code>number</code> | <code>10</code> | Weight for a high fraction of paragraphs replaced or removed. Set to 0 to disable. |
| [suspiciousTerms] | <code>number</code> | <code>15</code> | Weight for hits from `suspiciousTermList`. Set to 0 to disable. |
| [linkDensity] | <code>number</code> | <code>10</code> | Weight for an unusually high links-per-word ratio. Set to 0 to disable. |
| [ipRateLimit] | <code>number</code> | <code>25</code> | Weight applied when the submitting IP exceeds `ipMaxEdits` within `ipWindowMs`. Set to 0 to disable. |
| [contentGrowth] | <code>number</code> | <code>5</code> | Weight for content that grows to an implausibly large multiple of the original. Set to 0 to disable. |
| [unicodeObfuscation] | <code>number</code> | <code>10</code> | Weight for a high ratio of non-letter/number characters (obfuscation attempts). Set to 0 to disable. |
| [smallPageLinkSpam] | <code>number</code> | <code>15</code> | Weight for external links added to a page that was previously short. Set to 0 to disable. |

<a name="FilterSpamEditConfig"></a>

## FilterSpamEditConfig : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| [events] | <code>Record.&lt;string, Array.&lt;string&gt;&gt;</code> |  | Events to bind to. |
| [blockThreshold] | <code>number</code> | <code>75</code> | Score (0–100 scale) at or above which the edit is blocked. |
| [targetedSlugs] | <code>Array.&lt;string&gt;</code> | <code>[]</code> | Slugs known to be frequently targeted by spammers. Edits to these pages have their score multiplied by `targetedSlugMultiplier`. |
| [targetedSlugMultiplier] | <code>number</code> | <code>1.5</code> | Score multiplier applied when the edited slug is in `targetedSlugs`. Must be >= 1. |
| [logPath] | <code>string</code> | <code>&quot;&#x27;./logs&#x27;&quot;</code> | Directory where blocked-edit JSON log files are written. |
| [ipWindowMs] | <code>number</code> | <code>60000</code> | Rolling time window in milliseconds for IP-based rate limiting. |
| [ipMaxEdits] | <code>number</code> | <code>5</code> | Maximum number of edits permitted from one IP within `ipWindowMs` before the `ipRateLimit` weight fires. |
| [weights] | [<code>FilterSpamEditWeights</code>](#FilterSpamEditWeights) |  | Per-signal weight values. Set any to 0 to disable that signal entirely. |
| [suspiciousTermList] | <code>Array.&lt;string&gt;</code> |  | Known spam keyword list used by the `suspiciousTerms` signal. |
| [smallPageWordThreshold] | <code>number</code> | <code>50</code> | Word count below which the `smallPageLinkSpam` signal is active for old content. |

<a name="SpamSignals"></a>

## SpamSignals : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| contentSimilarityScore | <code>number</code> | Contribution (0–weight) from Jaccard content distance. |
| externalLinksAddedScore | <code>number</code> | Contribution from new external URLs. |
| paragraphRatioScore | <code>number</code> | Contribution from changed paragraph structure. |
| suspiciousTermsScore | <code>number</code> | Contribution from suspicious keyword matches. |
| linkDensityScore | <code>number</code> | Contribution from links-per-word ratio. |
| ipRateLimitScore | <code>number</code> | Contribution from IP rate limit violation. |
| contentGrowthScore | <code>number</code> | Contribution from unexplained content size growth. |
| unicodeObfuscationScore | <code>number</code> | Contribution from non-word character ratio. |
| smallPageLinkSpamScore | <code>number</code> | Contribution from links added to a short page. |

<a name="SpamScoreResult"></a>

## SpamScoreResult : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| score | <code>number</code> | The final weighted score (after any targeted-slug multiplier). |
| reasons | <code>Array.&lt;string&gt;</code> | Human-readable list of triggered signals for log output. |
| signals | [<code>SpamSignals</code>](#SpamSignals) | Individual signal contributions before aggregation. |

