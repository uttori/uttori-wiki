import test from 'ava';
import sinon from 'sinon';
import fs from 'node:fs';
import FilterSpamEdit, { ipEditHistory } from '../../src/plugins/filter-spam-edit.js';

/**
 * Builds a minimal valid plugin config for use in tests.
 * @param {object} [overrides]
 * @returns {Record<string, object>}
 */
const makeConfig = (overrides = {}) => ({
  [FilterSpamEdit.configKey]: {
    ...FilterSpamEdit.defaultConfig(),
    logPath: '/tmp/test-spam-logs',
    ...overrides,
  },
});

/**
 * Builds a minimal Uttori context object for `validateEdit` tests.
 * @param {object} [opts]
 * @param {object|null} [opts.existingDoc] Document returned by storage-get (null = new page).
 * @param {object} [opts.configOverrides]
 * @returns {{ hooks: { fetch: sinon.SinonStub }, config: object }}
 */
const makeContext = ({ existingDoc = null, configOverrides = {} } = {}) => ({
  hooks: {
    fetch: sinon.stub().resolves([existingDoc]),
  },
  config: makeConfig(configOverrides),
});

/**
 * Builds a minimal Express-like request object.
 * @param {object} [opts]
 * @param {string} [opts.slug]
 * @param {string} [opts.content]
 * @param {string} [opts.ip]
 * @returns {{ params: object, body: object, ip: string }}
 */
const makeRequest = ({ slug = 'test-page', content = 'Hello world.', ip = '1.2.3.4' } = {}) => ({
  params: { slug },
  body: { content },
  ip,
});

let sandbox;

test.beforeEach(() => {
  sandbox = sinon.createSandbox();
  // Reset IP history between tests so rate-limit state doesn't bleed across tests
  ipEditHistory.clear();
});

test.afterEach(() => {
  sandbox.restore();
});

test('configKey: returns the correct configuration key', (t) => {
  t.is(FilterSpamEdit.configKey, 'uttori-plugin-filter-spam-edit');
});

test('defaultConfig: returns expected defaults', (t) => {
  const cfg = FilterSpamEdit.defaultConfig();

  t.deepEqual(cfg.events, {
    validateEdit: ['validate-save'],
    validateConfig: ['validate-config'],
  });
  t.is(cfg.blockThreshold, 75);
  t.deepEqual(cfg.targetedSlugs, []);
  t.is(cfg.targetedSlugMultiplier, 1.5);
  t.is(typeof cfg.logPath, 'string');
  t.is(cfg.ipWindowMs, 60_000);
  t.is(cfg.ipMaxEdits, 5);
  t.is(cfg.weights.contentSimilarity, 40);
  t.is(cfg.weights.externalLinksAdded, 20);
  t.is(cfg.weights.paragraphRatio, 10);
  t.is(cfg.weights.suspiciousTerms, 15);
  t.is(cfg.weights.linkDensity, 10);
  t.is(cfg.weights.ipRateLimit, 25);
  t.is(cfg.weights.contentGrowth, 5);
  t.is(cfg.weights.unicodeObfuscation, 10);
  t.is(cfg.weights.smallPageLinkSpam, 15);
  t.true(Array.isArray(cfg.suspiciousTermList));
  t.true(cfg.suspiciousTermList.includes('casino'));
  t.is(cfg.smallPageWordThreshold, 50);
});

test('validateConfig: throws when config key is missing', (t) => {
  t.throws(() => FilterSpamEdit.validateConfig({}), {
    message: `Config missing '${FilterSpamEdit.configKey}' entry.`,
  });
});

test('validateConfig: throws when blockThreshold is not a positive number', (t) => {
  t.throws(() => FilterSpamEdit.validateConfig(makeConfig({ blockThreshold: 0 })), {
    message: `Config '${FilterSpamEdit.configKey}.blockThreshold' must be a positive number.`,
  });
  t.throws(() => FilterSpamEdit.validateConfig(makeConfig({ blockThreshold: 'high' })), {
    message: `Config '${FilterSpamEdit.configKey}.blockThreshold' must be a positive number.`,
  });
});

test('validateConfig: throws when targetedSlugMultiplier is less than 1', (t) => {
  t.throws(() => FilterSpamEdit.validateConfig(makeConfig({ targetedSlugMultiplier: 0.5 })), {
    message: `Config '${FilterSpamEdit.configKey}.targetedSlugMultiplier' must be a number >= 1.`,
  });
});

test('validateConfig: throws when logPath is empty or missing', (t) => {
  t.throws(() => FilterSpamEdit.validateConfig(makeConfig({ logPath: '' })), {
    message: `Config '${FilterSpamEdit.configKey}.logPath' must be a non-empty string.`,
  });
  t.throws(() => FilterSpamEdit.validateConfig(makeConfig({ logPath: 42 })), {
    message: `Config '${FilterSpamEdit.configKey}.logPath' must be a non-empty string.`,
  });
});

test('validateConfig: throws when ipWindowMs is not a positive integer', (t) => {
  t.throws(() => FilterSpamEdit.validateConfig(makeConfig({ ipWindowMs: 0 })), {
    message: `Config '${FilterSpamEdit.configKey}.ipWindowMs' must be a positive integer.`,
  });
  t.throws(() => FilterSpamEdit.validateConfig(makeConfig({ ipWindowMs: 1.5 })), {
    message: `Config '${FilterSpamEdit.configKey}.ipWindowMs' must be a positive integer.`,
  });
});

test('validateConfig: throws when ipMaxEdits is not a positive integer', (t) => {
  t.throws(() => FilterSpamEdit.validateConfig(makeConfig({ ipMaxEdits: 0 })), {
    message: `Config '${FilterSpamEdit.configKey}.ipMaxEdits' must be a positive integer.`,
  });
  t.throws(() => FilterSpamEdit.validateConfig(makeConfig({ ipMaxEdits: -1 })), {
    message: `Config '${FilterSpamEdit.configKey}.ipMaxEdits' must be a positive integer.`,
  });
});

test('validateConfig: throws when a weight is negative', (t) => {
  t.throws(
    () => FilterSpamEdit.validateConfig(makeConfig({ weights: { ...FilterSpamEdit.defaultConfig().weights, contentSimilarity: -1 } })),
    { message: `Config '${FilterSpamEdit.configKey}.weights.contentSimilarity' must be a number >= 0.` },
  );
});

test('validateConfig: throws when weights is missing or not an object', (t) => {
  t.throws(() => FilterSpamEdit.validateConfig(makeConfig({ weights: null })), {
    message: `Config '${FilterSpamEdit.configKey}.weights' must be an object.`,
  });
});

test('validateConfig: does not throw on a valid config', (t) => {
  t.notThrows(() => FilterSpamEdit.validateConfig(makeConfig()));
});

test('validateConfig: accepts weight of 0 (disabled signal)', (t) => {
  t.notThrows(() => FilterSpamEdit.validateConfig(makeConfig({
    weights: { ...FilterSpamEdit.defaultConfig().weights, contentSimilarity: 0 },
  })));
});

test('register: throws when context is missing', (t) => {
  t.throws(() => FilterSpamEdit.register(null), {
    message: 'Missing event dispatcher in \'context.hooks.on(event, callback)\' format.',
  });
  t.throws(() => FilterSpamEdit.register({}), {
    message: 'Missing event dispatcher in \'context.hooks.on(event, callback)\' format.',
  });
});

test('register: throws when context.hooks.on is not a function', (t) => {
  t.throws(() => FilterSpamEdit.register({ hooks: { on: 'nope' } }), {
    message: 'Missing event dispatcher in \'context.hooks.on(event, callback)\' format.',
  });
});

test('register: throws when config.events is missing', (t) => {
  const context = {
    hooks: { on: sandbox.spy() },
    config: {
      [FilterSpamEdit.configKey]: {
        ...FilterSpamEdit.defaultConfig(),
        events: null,
      },
    },
  };
  t.throws(() => FilterSpamEdit.register(context), {
    message: 'Missing events to register for in the FilterSpamEdit configuration',
  });
});

test('register: binds validateEdit to validate-save', (t) => {
  const onSpy = sandbox.spy();
  const context = {
    hooks: { on: onSpy },
    config: makeConfig(),
  };
  FilterSpamEdit.register(context);
  t.true(onSpy.calledWith('validate-save', FilterSpamEdit.validateEdit));
});

test('register: binds validateConfig to validate-config', (t) => {
  const onSpy = sandbox.spy();
  const context = {
    hooks: { on: onSpy },
    config: makeConfig(),
  };
  FilterSpamEdit.register(context);
  t.true(onSpy.calledWith('validate-config', FilterSpamEdit.validateConfig));
});

test('register: skips unknown method names gracefully', (t) => {
  const onSpy = sandbox.spy();
  const context = {
    hooks: { on: onSpy },
    config: {
      [FilterSpamEdit.configKey]: {
        ...FilterSpamEdit.defaultConfig(),
        events: {
          validateEdit: ['validate-save'],
          nonExistentMethod: ['some-event'],
        },
      },
    },
  };
  t.notThrows(() => FilterSpamEdit.register(context));
  t.false(onSpy.calledWith('some-event'));
});

test('normalizeText: lowercases text', (t) => {
  t.is(FilterSpamEdit.normalizeText('Hello WORLD'), 'hello world');
});

test('normalizeText: strips markdown syntax characters', (t) => {
  const result = FilterSpamEdit.normalizeText('# Heading **bold** `code` [link](url)');
  t.false(result.includes('#'));
  t.false(result.includes('*'));
  t.false(result.includes('`'));
  t.false(result.includes('['));
});

test('normalizeText: strips HTML tags', (t) => {
  t.false(FilterSpamEdit.normalizeText('<p>hello</p>').includes('<'));
});

test('normalizeText: collapses whitespace', (t) => {
  t.is(FilterSpamEdit.normalizeText('  hello   world  '), 'hello world');
});

test('normalizeText: returns empty string for empty input', (t) => {
  t.is(FilterSpamEdit.normalizeText(''), '');
  t.is(FilterSpamEdit.normalizeText(null), '');
  t.is(FilterSpamEdit.normalizeText(undefined), '');
});

test('tokenize: returns a Set of words', (t) => {
  const result = FilterSpamEdit.tokenize('hello world hello');
  t.true(result instanceof Set);
  t.true(result.has('hello'));
  t.true(result.has('world'));
  // Set deduplicates
  t.is(result.size, 2);
});

test('tokenize: filters empty tokens', (t) => {
  const result = FilterSpamEdit.tokenize('  hello   ');
  t.false(result.has(''));
  t.is(result.size, 1);
});

test('tokenize: returns empty Set for empty input', (t) => {
  t.is(FilterSpamEdit.tokenize('').size, 0);
  t.is(FilterSpamEdit.tokenize(null).size, 0);
});

test('jaccardSimilarity: returns 1 for identical texts', (t) => {
  t.is(FilterSpamEdit.jaccardSimilarity('hello world', 'hello world'), 1);
});

test('jaccardSimilarity: returns 0 for completely different texts', (t) => {
  t.is(FilterSpamEdit.jaccardSimilarity('hello world', 'foo bar baz'), 0);
});

test('jaccardSimilarity: returns a fractional value for partial overlap', (t) => {
  // 'hello' in common; union = {hello, world, foo} = 3, intersection = 1
  const result = FilterSpamEdit.jaccardSimilarity('hello world', 'hello foo');
  t.true(result > 0 && result < 1);
});

test('jaccardSimilarity: returns 1 for two empty strings (zero-union edge case)', (t) => {
  t.is(FilterSpamEdit.jaccardSimilarity('', ''), 1);
});

test('getUrls: extracts http and https URLs', (t) => {
  const text = 'Visit http://example.com and https://foo.org for more.';
  const urls = FilterSpamEdit.getUrls(text);
  t.true(urls.some((u) => u.includes('example.com')));
  t.true(urls.some((u) => u.includes('foo.org')));
});

test('getUrls: returns empty array for text with no URLs', (t) => {
  t.deepEqual(FilterSpamEdit.getUrls('no links here'), []);
});

test('getUrls: returns empty array for empty input', (t) => {
  t.deepEqual(FilterSpamEdit.getUrls(''), []);
  t.deepEqual(FilterSpamEdit.getUrls(null), []);
});

test('countWords: returns correct word count', (t) => {
  t.is(FilterSpamEdit.countWords('hello world foo'), 3);
});

test('countWords: returns 0 for empty or whitespace-only input', (t) => {
  t.is(FilterSpamEdit.countWords(''), 0);
  t.is(FilterSpamEdit.countWords('   '), 0);
  t.is(FilterSpamEdit.countWords(null), 0);
});

test('splitParagraphs: splits on double newlines', (t) => {
  const result = FilterSpamEdit.splitParagraphs('First paragraph.\n\nSecond paragraph.');
  t.is(result.length, 2);
});

test('splitParagraphs: returns single-element array for single paragraph', (t) => {
  t.is(FilterSpamEdit.splitParagraphs('Only one paragraph.').length, 1);
});

test('splitParagraphs: returns empty array for empty input', (t) => {
  t.deepEqual(FilterSpamEdit.splitParagraphs(''), []);
  t.deepEqual(FilterSpamEdit.splitParagraphs(null), []);
});

test('scoreSuspiciousTerms: returns 0 when no terms match', (t) => {
  t.is(FilterSpamEdit.scoreSuspiciousTerms('hello world', ['casino', 'poker']), 0);
});

test('scoreSuspiciousTerms: returns > 0 when a term matches', (t) => {
  t.true(FilterSpamEdit.scoreSuspiciousTerms('buy casino chips', ['casino', 'poker']) > 0);
});

test('scoreSuspiciousTerms: clamps to 1 when all terms match', (t) => {
  const terms = ['a', 'b', 'c'];
  t.is(FilterSpamEdit.scoreSuspiciousTerms('a b c', terms), 1);
});

test('scoreSuspiciousTerms: returns 0 for empty inputs', (t) => {
  t.is(FilterSpamEdit.scoreSuspiciousTerms('', ['casino']), 0);
  t.is(FilterSpamEdit.scoreSuspiciousTerms('casino', []), 0);
  t.is(FilterSpamEdit.scoreSuspiciousTerms(null, ['casino']), 0);
});

test('scoreIPRateLimit: returns false when under ipMaxEdits', (t) => {
  const config = FilterSpamEdit.defaultConfig();
  config.ipMaxEdits = 5;
  config.ipWindowMs = 60_000;

  for (let i = 0; i < 4; i++) FilterSpamEdit.recordIPEdit('10.0.0.1', config);
  t.false(FilterSpamEdit.scoreIPRateLimit('10.0.0.1', config));
});

test('scoreIPRateLimit: returns true when at or over ipMaxEdits', (t) => {
  const config = FilterSpamEdit.defaultConfig();
  config.ipMaxEdits = 3;
  config.ipWindowMs = 60_000;

  for (let i = 0; i < 3; i++) FilterSpamEdit.recordIPEdit('10.0.0.2', config);
  t.true(FilterSpamEdit.scoreIPRateLimit('10.0.0.2', config));
});

test('scoreIPRateLimit: handles first-time IP without error', (t) => {
  const config = FilterSpamEdit.defaultConfig();
  t.notThrows(() => FilterSpamEdit.scoreIPRateLimit('brand-new-ip', config));
  t.false(FilterSpamEdit.scoreIPRateLimit('brand-new-ip', config));
});

test('scoreIPRateLimit: prunes timestamps outside the window', (t) => {
  const config = FilterSpamEdit.defaultConfig();
  config.ipMaxEdits = 2;
  config.ipWindowMs = 100; // very small window

  // Manually inject old timestamps that will be pruned
  ipEditHistory.set('10.0.0.3', [Date.now() - 200, Date.now() - 150]);
  t.false(FilterSpamEdit.scoreIPRateLimit('10.0.0.3', config));
});

test('computeScore: returns 0 when all signals are zero / clean edit', (t) => {
  const config = FilterSpamEdit.defaultConfig();
  const { score } = FilterSpamEdit.computeScore({
    slug: 'test',
    contentDistance: 0,
    newExternalLinks: 0,
    oldUrls: 0,
    paragraphsRemoved: 0,
    suspiciousTermScore: 0,
    newWordCount: 100,
    oldWordCount: 90,
    ipRateLimited: false,
    isNewPage: false,
    config,
  });
  t.is(score, 0);
});

test('computeScore: weights suspicious term signal correctly', (t) => {
  const config = FilterSpamEdit.defaultConfig();
  const { score, reasons } = FilterSpamEdit.computeScore({
    slug: 'test',
    contentDistance: 0,
    newExternalLinks: 0,
    oldUrls: 0,
    paragraphsRemoved: 0,
    suspiciousTermScore: 1,
    newWordCount: 100,
    oldWordCount: 100,
    ipRateLimited: false,
    isNewPage: false,
    config,
  });
  t.true(score > 0);
  t.true(reasons.some((r) => r.includes('suspicious_term')));
});

test('computeScore: applies targetedSlugMultiplier for targeted slugs', (t) => {
  const config = { ...FilterSpamEdit.defaultConfig(), targetedSlugs: ['home'], targetedSlugMultiplier: 2 };
  const base = FilterSpamEdit.computeScore({
    slug: 'other',
    contentDistance: 0.9,
    newExternalLinks: 0,
    oldUrls: 0,
    paragraphsRemoved: 0,
    suspiciousTermScore: 0,
    newWordCount: 100,
    oldWordCount: 100,
    ipRateLimited: false,
    isNewPage: false,
    config,
  });
  const targeted = FilterSpamEdit.computeScore({
    slug: 'home',
    contentDistance: 0.9,
    newExternalLinks: 0,
    oldUrls: 0,
    paragraphsRemoved: 0,
    suspiciousTermScore: 0,
    newWordCount: 100,
    oldWordCount: 100,
    ipRateLimited: false,
    isNewPage: false,
    config,
  });
  t.true(targeted.score > base.score);
  t.true(targeted.reasons.some((r) => r.includes('targeted_slug_multiplier')));
});

test('computeScore: disabled weight (0) contributes nothing', (t) => {
  const config = {
    ...FilterSpamEdit.defaultConfig(),
    weights: {
      ...FilterSpamEdit.defaultConfig().weights,
      contentSimilarity: 0,
    },
  };
  const { score } = FilterSpamEdit.computeScore({
    slug: 'test',
    contentDistance: 0.99,
    newExternalLinks: 0,
    oldUrls: 0,
    paragraphsRemoved: 0,
    suspiciousTermScore: 0,
    newWordCount: 100,
    oldWordCount: 100,
    ipRateLimited: false,
    isNewPage: false,
    config,
  });
  t.is(score, 0);
});

test('computeScore: ip rate limit contributes its full weight', (t) => {
  const config = FilterSpamEdit.defaultConfig();
  const { score, reasons } = FilterSpamEdit.computeScore({
    slug: 'test',
    contentDistance: 0,
    newExternalLinks: 0,
    oldUrls: 0,
    paragraphsRemoved: 0,
    suspiciousTermScore: 0,
    newWordCount: 50,
    oldWordCount: 50,
    ipRateLimited: true,
    isNewPage: false,
    config,
  });
  t.is(score, config.weights.ipRateLimit);
  t.true(reasons.includes('ip_rate_limited'));
});

test('computeScore: skips baseline signals for new pages', (t) => {
  const config = FilterSpamEdit.defaultConfig();
  const { score } = FilterSpamEdit.computeScore({
    slug: 'new-page',
    contentDistance: -1,
    newExternalLinks: 0,
    oldUrls: 0,
    paragraphsRemoved: 0,
    suspiciousTermScore: 0,
    newWordCount: 100,
    oldWordCount: 0,
    ipRateLimited: false,
    isNewPage: true,
    config,
  });
  t.is(score, 0);
});

test.serial('logBlockedEdit: writes a JSON line to the log file', (t) => {
  const existsSyncStub = sandbox.stub(fs, 'existsSync').returns(true);
  const appendFileSyncStub = sandbox.stub(fs, 'appendFileSync');

  const config = { ...FilterSpamEdit.defaultConfig(), logPath: '/tmp/test-logs' };
  FilterSpamEdit.logBlockedEdit(config, '1.2.3.4', 'test-slug', 88, ['added_5_external_links']);

  t.true(appendFileSyncStub.calledOnce);
  const written = appendFileSyncStub.firstCall.args[1];
  const parsed = JSON.parse(written.trim());
  t.is(parsed.ip, '1.2.3.4');
  t.is(parsed.slug, 'test-slug');
  t.is(parsed.score, 88);
  t.deepEqual(parsed.reasons, ['added_5_external_links']);

  existsSyncStub.restore();
  appendFileSyncStub.restore();
});

test.serial('logBlockedEdit: creates the log directory when it does not exist', (t) => {
  const existsSyncStub = sandbox.stub(fs, 'existsSync').returns(false);
  const mkdirSyncStub = sandbox.stub(fs, 'mkdirSync');
  const appendFileSyncStub = sandbox.stub(fs, 'appendFileSync');

  const config = { ...FilterSpamEdit.defaultConfig(), logPath: '/tmp/new-logs' };
  FilterSpamEdit.logBlockedEdit(config, '1.2.3.4', 'slug', 80, []);

  t.true(mkdirSyncStub.calledOnce);

  existsSyncStub.restore();
  mkdirSyncStub.restore();
  appendFileSyncStub.restore();
});

test.serial('validateEdit: returns false for a clean edit well under threshold', async (t) => {
  const logStub = sandbox.stub(FilterSpamEdit, 'logBlockedEdit');

  const existingDoc = { content: 'This is the original content with many words.' };
  const context = makeContext({ existingDoc });
  const request = makeRequest({ content: 'This is the original content with many words, updated slightly.' });

  const result = await FilterSpamEdit.validateEdit(request, context);
  t.false(result);
  t.false(logStub.called);

  logStub.restore();
});

test.serial('validateEdit: returns true when spam score exceeds blockThreshold', async (t) => {
  const logStub = sandbox.stub(FilterSpamEdit, 'logBlockedEdit');

  const existingDoc = { content: 'Normal wiki content about retro games and history.' };
  const spamContent = [
    'Buy casino chips at http://casino1.example.com http://casino2.example.com http://casino3.example.com',
    'Poker online http://poker1.example.com http://poker2.example.com',
    'Viagra pills http://pharma.example.com http://pills.example.com',
    'Crypto investment http://crypto1.example.com',
    'Essay writing service http://essay1.example.com http://essay2.example.com',
  ].join('\n\n');

  const context = makeContext({
    existingDoc,
    configOverrides: { blockThreshold: 30 },
  });
  const request = makeRequest({ content: spamContent });

  const result = await FilterSpamEdit.validateEdit(request, context);
  t.true(result);

  logStub.restore();
});

test.serial('validateEdit: skips content-similarity signals for a new page (no existing doc)', async (t) => {
  const logStub = sandbox.stub(FilterSpamEdit, 'logBlockedEdit');

  // storage-get returns null - treated as new page
  const context = makeContext({ existingDoc: null });
  const request = makeRequest({ content: 'Clean new page content.' });

  const result = await FilterSpamEdit.validateEdit(request, context);
  t.false(result);

  logStub.restore();
});

test.serial('validateEdit: targeted-slug produces a score >= non-targeted for the same content', async (t) => {
  const logStub = sandbox.stub(FilterSpamEdit, 'logBlockedEdit');

  const existingDoc = { content: 'Normal content about gaming.' };
  const mildSpam = 'casino loan http://spam.example.com normal content about gaming preserved.';

  // Capture scores by wrapping computeScore
  const scores = [];
  const origCompute = FilterSpamEdit.computeScore.bind(FilterSpamEdit);
  const computeStub = sandbox.stub(FilterSpamEdit, 'computeScore').callsFake((params) => {
    const result = origCompute(params);
    scores.push(result.score);
    return result;
  });

  const contextNormal = makeContext({ existingDoc, configOverrides: { targetedSlugs: [] } });
  const contextTargeted = makeContext({ existingDoc, configOverrides: { targetedSlugs: ['test-page'], targetedSlugMultiplier: 2 } });
  const request = makeRequest({ slug: 'test-page', content: mildSpam });

  await FilterSpamEdit.validateEdit({ ...request }, contextNormal);
  await FilterSpamEdit.validateEdit({ ...request }, contextTargeted);

  t.is(scores.length, 2);
  // Targeted score (second call) must be >= normal score (first call)
  t.true(scores[1] >= scores[0]);

  computeStub.restore();
  logStub.restore();
});

test.serial('validateEdit: calls logBlockedEdit when blocking', async (t) => {
  const logStub = sandbox.stub(FilterSpamEdit, 'logBlockedEdit');

  const existingDoc = { content: 'Normal content.' };
  const spamContent = 'casino poker viagra http://a.example.com http://b.example.com http://c.example.com http://d.example.com';

  const context = makeContext({
    existingDoc,
    configOverrides: { blockThreshold: 1 },
  });
  const request = makeRequest({ content: spamContent });

  const result = await FilterSpamEdit.validateEdit(request, context);
  t.true(result);
  t.true(logStub.called);

  logStub.restore();
});

test.serial('validateEdit: does not call logBlockedEdit when allowing', async (t) => {
  const logStub = sandbox.stub(FilterSpamEdit, 'logBlockedEdit');

  const existingDoc = { content: 'Same content.' };
  const context = makeContext({ existingDoc, configOverrides: { blockThreshold: 999 } });
  const request = makeRequest({ content: 'Same content.' });

  const result = await FilterSpamEdit.validateEdit(request, context);
  t.false(result);
  t.false(logStub.called);

  logStub.restore();
});

test.serial('validateEdit: handles storage-get returning null gracefully', async (t) => {
  const logStub = sandbox.stub(FilterSpamEdit, 'logBlockedEdit');

  // Default makeContext resolves to [null]
  const context = makeContext();
  const request = makeRequest();

  t.false(await FilterSpamEdit.validateEdit(request, context));

  logStub.restore();
});

test.serial('validateEdit: handles storage-get throwing gracefully', async (t) => {
  const logStub = sandbox.stub(FilterSpamEdit, 'logBlockedEdit');

  const context = makeContext();
  context.hooks.fetch = sinon.stub().rejects(new Error('storage unavailable'));

  const request = makeRequest({ content: 'safe content' });
  // Should not throw; treats as new page since the fetch failed
  t.false(await FilterSpamEdit.validateEdit(request, context));

  logStub.restore();
});

test.serial('validateEdit: returns false when all weights are 0 regardless of content', async (t) => {
  const logStub = sandbox.stub(FilterSpamEdit, 'logBlockedEdit');

  const existingDoc = { content: 'Normal content.' };
  const spamContent = 'casino poker http://a.com http://b.com http://c.com';

  const context = makeContext({
    existingDoc,
    configOverrides: {
      blockThreshold: 1,
      weights: {
        contentSimilarity: 0,
        externalLinksAdded: 0,
        paragraphRatio: 0,
        suspiciousTerms: 0,
        linkDensity: 0,
        ipRateLimit: 0,
        contentGrowth: 0,
        unicodeObfuscation: 0,
        smallPageLinkSpam: 0,
      },
    },
  });
  const request = makeRequest({ content: spamContent });

  t.false(await FilterSpamEdit.validateEdit(request, context));

  logStub.restore();
});

test.serial('validateEdit: resolves slug from request.body when request.params.slug is absent', async (t) => {
  const logStub = sandbox.stub(FilterSpamEdit, 'logBlockedEdit');

  const context = makeContext();
  const request = {
    params: {},
    body: { content: 'new page content', slug: 'my-new-page' },
    ip: '1.2.3.4',
  };

  t.false(await FilterSpamEdit.validateEdit(request, context));

  logStub.restore();
});

test.serial('validateEdit: records IP edit on every call', async (t) => {
  const logStub = sandbox.stub(FilterSpamEdit, 'logBlockedEdit');

  const context = makeContext();
  const request = makeRequest({ ip: '9.9.9.9' });

  await FilterSpamEdit.validateEdit(request, context);
  t.true(ipEditHistory.has('9.9.9.9'));
  t.is(ipEditHistory.get('9.9.9.9').length, 1);

  logStub.restore();
});
