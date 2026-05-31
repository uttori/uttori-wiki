# Spam Edit Filter

> Heuristic spam scoring for edits - link spam, churn, suspicious terms, rate limits - with a tunable block threshold.

```javascript
import { FilterSpamEdit, ipEditHistory } from '@uttori/wiki';
// or: import FilterSpamEdit from '@uttori/wiki/plugins/filter-spam-edit';
```

**configKey:** `uttori-plugin-filter-spam-edit`

## What it does

Scores every incoming edit using a bundle of weighted heuristics - content similarity, newly added external links, paragraph churn, suspicious keywords, link density, IP rate limits, content growth, unicode obfuscation, and short-page link spam - then blocks any save that scores at or above your threshold. Known spam-magnet pages (`targetedSlugs`) get a score multiplier. Blocked edits are logged as JSON. No database, no user accounts: IP rate-limiting uses an in-memory map (exported as `ipEditHistory` if you want to inspect it).

## What it doesn't do

- **It's heuristics, not ML or CAPTCHA** - tunable, but it can false-positive on big legitimate rewrites or link-heavy pages.
- **IP state is in-memory** - lost on restart, not shared across processes.
- **It uses `request.ip` only** (no `trustProxy` option - unlike the [IP filter](filter-ip-address.md)).
- **It only guards saves**, not uploads or forms.

## How to use

```javascript
import { FilterSpamEdit } from '@uttori/wiki';

const config = {
  plugins: [FilterSpamEdit],

  [FilterSpamEdit.configKey]: {
    ...FilterSpamEdit.defaultConfig(),
    blockThreshold: 70,
    targetedSlugs: ['home', 'about'],
    ipMaxEdits: 5,
    ipWindowMs: 60_000,
  },
};
```

## Configuration

| Option | Default | What it does |
|--------|---------|--------------|
| `blockThreshold` | `75` | Score at/above this blocks the save (0–100 scale). |
| `targetedSlugs` | `[]` | Slugs that get the `targetedSlugMultiplier`. |
| `targetedSlugMultiplier` | `1.5` | Score multiplier for targeted pages (≥ 1). |
| `logPath` | `<plugin-dir>/logs` | Folder for daily `spam-block-YYYY-MM-DD.log` files. |
| `ipWindowMs` | `60000` | Rolling window for IP rate limiting (ms). |
| `ipMaxEdits` | `5` | Max edits per IP in that window before a penalty. |
| `weights` | see below | Per-signal weights; set any to `0` to disable that signal. |
| `suspiciousTermList` | casino, poker, viagra, etc. | Keywords for the suspicious-terms signal. |
| `smallPageWordThreshold` | `50` | Word count below which short-page link spam applies. |

**Default weights:** `contentSimilarity: 40`, `externalLinksAdded: 20`, `paragraphRatio: 10`, `suspiciousTerms: 15`, `linkDensity: 10`, `ipRateLimit: 25`, `contentGrowth: 5`, `unicodeObfuscation: 10`, `smallPageLinkSpam: 15`.

## Good to know

- The `validate-save` listener returns `true` to **block**, so it composes with [CSRF](csrf.md) and the [IP filter](filter-ip-address.md) - any one of them can veto a save.
- Start with a higher `blockThreshold` and tighten it as you watch the block logs, to avoid frustrating real editors.
- Tune individual `weights` to fit your wiki - a docs site and a public community wiki want very different sensitivities.
