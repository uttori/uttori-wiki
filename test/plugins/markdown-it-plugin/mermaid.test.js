import test from 'ava';
import MarkdownIt from 'markdown-it';
import Plugin from '../../../dist/plugins/markdown-it-plugin/markdown-it-plugin.js';
import { mermaid } from '../../../dist/plugins/markdown-it-plugin/mermaid.js';
import MarkdownItRenderer from '../../../dist/plugins/renderer-markdown-it.js';

const diagrams = {
  flowchart: 'flowchart TD\n  A[Start] --> B{Ready?}\n  B -->|Yes| C[Done]',
  graph: 'graph LR\n  A --> B',
  sequence: 'sequenceDiagram\n  Alice->>Bob: Hello\n  Bob-->>Alice: Hi',
  class: 'classDiagram\n  Animal <|-- Duck\n  Animal : +int age',
  state: 'stateDiagram-v2\n  [*] --> Idle\n  Idle --> Running',
  er: 'erDiagram\n  CUSTOMER ||--o{ ORDER : places',
  gantt: 'gantt\n  dateFormat YYYY-MM-DD\n  section Work\n  Build :2026-09-01, 2d',
  pie: 'pie title Results\n  "Pass" : 90\n  "Fail" : 10',
  mindmap: 'mindmap\n  root((Project))\n    Code\n    Tests',
  timeline: 'timeline\n  title Releases\n  2026 : Mermaid support',
  git: 'gitGraph\n  commit\n  branch feature\n  checkout feature\n  commit',
};

for (const [name, source] of Object.entries(diagrams)) {
  test(`Mermaid passes ${name} source through for browser rendering`, (t) => {
    const html = MarkdownItRenderer.render(`\`\`\`mermaid\n${source}\n\`\`\``);
    t.is(html, `<pre class="mermaid">${new MarkdownIt().utils.escapeHtml(source)}\n</pre>`);
  });
}

for (const info of ['mermaid', 'MERMAID', 'Mermaid', ' mermaid  ', 'mermaid title="Example"', 'mermaid\tignored']) {
  test(`Mermaid recognizes the complete language token: ${JSON.stringify(info)}`, (t) => {
    t.is(new MarkdownIt().use(Plugin).render(`\`\`\`${info}\nA --> B\n\`\`\``), '<pre class="mermaid">A --&gt; B\n</pre>\n');
  });
}

for (const info of ['', 'js', 'mermaid-js', 'mermaidish', 'text mermaid', 'mermaid<script>']) {
  test(`Mermaid preserves ordinary fence rendering: ${JSON.stringify(info)}`, (t) => {
    const source = `\`\`\`${info}\n<&>\n\`\`\``;
    const options = { langPrefix: 'custom-' };
    t.is(new MarkdownIt(options).use(Plugin).render(source), new MarkdownIt(options).render(source));
  });
}

test('Mermaid escapes HTML, quotes, and entities even when raw HTML is enabled', (t) => {
  const source = 'flowchart LR\n  A["</pre><script>alert(1)</script><img onerror=alert(1)>"]\n  B["&lt;tag&gt; & \'quoted\'"]';
  const expected = '<pre class="mermaid">flowchart LR\n  A[&quot;&lt;/pre&gt;&lt;script&gt;alert(1)&lt;/script&gt;&lt;img onerror=alert(1)&gt;&quot;]\n  B[&quot;&amp;lt;tag&amp;gt; &amp; \'quoted\'&quot;]\n</pre>\n';
  for (const html of [false, true]) {
    t.is(new MarkdownIt({ html }).use(Plugin).render(`\`\`\`mermaid\n${source}\n\`\`\``), expected);
  }
});

test('Mermaid bypasses highlighting and delegates other fences with all renderer arguments', (t) => {
  const calls = [];
  const md = new MarkdownIt({ highlight: (source, language) => {
    calls.push([source, language]);
    return '<b>highlighted</b>';
  } }).use(Plugin);
  t.is(md.render('```mermaid\nA --> B\n```'), '<pre class="mermaid">A --&gt; B\n</pre>\n');
  t.deepEqual(calls, []);
  t.is(md.render('```js\nconst x = 1;\n```'), '<pre><code class="language-js"><b>highlighted</b></code></pre>\n');
  t.deepEqual(calls, [['const x = 1;\n', 'js']]);

  const custom = new MarkdownIt();
  const env = { marker: 'kept' };
  custom.renderer.rules.fence = (tokens, index, options, receivedEnv, renderer) => {
    t.is(tokens[index].content, 'example\n');
    t.is(options, custom.options);
    t.is(receivedEnv, env);
    t.is(renderer, custom.renderer);
    return 'custom fence';
  };
  custom.use(mermaid);
  t.is(custom.render('```text\nexample\n```', env), 'custom fence');
});

test('Mermaid is enabled by default and can be disabled without leaking across renders', (t) => {
  const source = '```mermaid\nA --> B\n```';
  const config = MarkdownItRenderer.extendConfig({ markdownIt: { uttori: { mermaid: false } } });
  t.true(MarkdownItRenderer.defaultConfig().markdownIt.uttori.mermaid);
  t.false(config.markdownIt.uttori.mermaid);
  t.is(MarkdownItRenderer.render(source, config), '<pre><code class="language-mermaid">A --&gt; B\n</code></pre>');
  t.is(MarkdownItRenderer.render(source), '<pre class="mermaid">A --&gt; B\n</pre>');
});

test('Mermaid supports multiple blocks and normal Markdown in one document', (t) => {
  const source = '# Diagrams\n\n```mermaid\nA --> B\n```\n\n**Between**\n\n~~~mermaid\nsequenceDiagram\n  Alice->>Bob: Hi\n~~~';
  const html = MarkdownItRenderer.render(source);
  t.is((html.match(/<pre class="mermaid">/g) || []).length, 2);
  t.regex(html, /<h1[^>]*>Diagrams<\/h1>/);
  t.true(html.includes('<p><strong>Between</strong></p>'));
  t.true(html.includes('Alice-&gt;&gt;Bob: Hi'));
  t.false(html.includes('<script'));
});

test('Mermaid supports nested blockquotes and lists', (t) => {
  const source = '> ```mermaid\n> A --> B\n> ```\n\n- Diagram\n\n  ~~~mermaid\n  B --> C\n  ~~~';
  const html = MarkdownItRenderer.render(source);
  t.true(html.includes('<blockquote>\n<pre class="mermaid">A --&gt; B\n</pre>\n</blockquote>'));
  t.true(html.includes('<pre class="mermaid">B --&gt; C\n</pre>\n</li>'));
});

test('Mermaid leaves empty, incomplete, and invalid definitions for the runtime to handle', (t) => {
  t.is(MarkdownItRenderer.render('```mermaid\n```'), '<pre class="mermaid"></pre>');
  t.is(MarkdownItRenderer.render('```mermaid\nnot a diagram'), '<pre class="mermaid">not a diagram</pre>');
  t.is(MarkdownItRenderer.render('~~~~mermaid\nA --> B\n~~~\n~~~~'), '<pre class="mermaid">A --&gt; B\n~~~\n</pre>');
});

test('Mermaid does not interpret inline code, indented code, or fenced examples as diagrams', (t) => {
  const md = new MarkdownIt().use(Plugin);
  t.is(md.render('`mermaid`'), '<p><code>mermaid</code></p>\n');
  const source = '    ```mermaid\n    A --> B\n    ```\n\n````markdown\n```mermaid\nA --> B\n```\n````';
  t.is(md.render(source), new MarkdownIt().render(source));
});

test('Mermaid retains directives, frontmatter, Unicode, and Uttori-looking syntax verbatim', (t) => {
  const source = '---\ntitle: 流れ 🧭\n---\n%%{init: {"theme": "dark"}}%%\nflowchart TD\n  A["[toc] [[Page]] [example:id] <br> <youtube v=\"x\"> <video src=\"x\">"]';
  const tokens = MarkdownItRenderer.parse(`\`\`\`mermaid\n${source}\n\`\`\``);
  t.is(tokens.length, 1);
  t.is(tokens[0].type, 'fence');
  t.is(tokens[0].info, 'mermaid');
  t.is(tokens[0].content, `${source}\n`);
  t.is(MarkdownItRenderer.render(`\`\`\`mermaid\n${source}\n\`\`\``), `<pre class="mermaid">${new MarkdownIt().utils.escapeHtml(source)}\n</pre>`);
});

test('Mermaid rendering works through content and collection hooks', (t) => {
  const source = '```mermaid\nA --> B\n```';
  const context = { config: { [MarkdownItRenderer.configKey]: {} } };
  const expected = '<pre class="mermaid">A --&gt; B\n</pre>';
  t.is(MarkdownItRenderer.renderContent(source, context), expected);
  const collection = [{ slug: 'diagram', html: source }];
  t.deepEqual(MarkdownItRenderer.renderCollection(collection, context), [{ slug: 'diagram', html: expected }]);
  t.is(collection[0].html, source);
});

test('link cleanup preserves diagram labels and source maps while cleaning surrounding prose', (t) => {
  const source = '[Before]()\n\n```mermaid\nflowchart TD\n  A["[]() [Label]()"] --> B\n```\n\n[After]()';
  const expectedSource = source.replace('[Before]()', '[Before](/before)').replace('[After]()', '[After](/after)');
  t.is(MarkdownItRenderer.cleanContent(source), expectedSource);
  const token = MarkdownItRenderer.parse(source).find((item) => item.type === 'fence');
  t.is(token.content, 'flowchart TD\n  A["[]() [Label]()"] --> B\n');
  t.deepEqual(token.map, [2, 6]);
  const html = MarkdownItRenderer.render(source);
  t.true(html.includes('A[&quot;[]() [Label]()&quot;] --&gt; B'));
  t.true(html.includes('<a href="/before">Before</a>'));
  t.true(html.includes('<a href="/after">After</a>'));
});

for (const source of [
  '```mermaid\nA["[]() [Label]()"]\n```',
  '~~~mermaid\nA["[]() [Label]()"]\n~~~\n',
  '> ```mermaid\n> A["[]() [Label]()"]\n> ```',
  '- Diagram\n\n  ```mermaid\n  A["[]() [Label]()"]\n  ```',
  '```mermaid\nA["[]() [Label]()"]',
  '```mermaid\nA["[]()"]\n```\n```mermaid\nB["[Label]()"]\n```',
  '```js\nconst label = "[Label]()";\n```',
  '    [Label]()\n',
]) {
  test(`link cleanup preserves code boundaries: ${JSON.stringify(source)}`, (t) => {
    t.is(MarkdownItRenderer.cleanContent(source), source);
    const tokens = MarkdownItRenderer.parse(source);
    const code = tokens.filter((token) => token.type === 'fence' || token.type === 'code_block');
    t.true(code.length > 0);
    t.true(code.some((token) => token.content.includes('[]()') || token.content.includes('[Label]()')));
  });
}

test('link cleanup handles CRLF, lone CR, and empty links without changing fence boundaries', (t) => {
  const source = '[]()\n\n```mermaid\nA["[Label]()"]\n```\n\n[After]()\n';
  const expected = '\n\n```mermaid\nA["[Label]()"]\n```\n\n[After](/after)\n';
  for (const newline of ['\n', '\r\n', '\r']) {
    t.is(MarkdownItRenderer.cleanContent(source.replaceAll('\n', newline)), expected);
  }
  t.is(MarkdownItRenderer.cleanContent('[]()'), '');
  t.is(MarkdownItRenderer.cleanContent('untouched\n'), 'untouched\n');
});
