import test from 'ava';
import MarkdownItRenderer from '../../../src/plugins/renderer-markdown-it.js';

test('MarkdownItRenderer.render(content, config): can render a table of contents', (t) => {
  const markdown = '# First\n## Second\n### Third\n### Third Again\n#### Fouth\n\n## Second Again\n### Third Last\nContent\nContent\n[toc]\nContent\nContent';
  const output = `<h1 id="first-0">First</h1>
<h2 id="second-1">Second</h2>
<h3 id="third-2">Third</h3>
<h3 id="third-again-3">Third Again</h3>
<h4 id="fouth-4">Fouth</h4>
<h2 id="second-again-6">Second Again</h2>
<h3 id="third-last-7">Third Last</h3>
<p>Content
Content
<nav class="table-of-contents"><ul class="table-of-contents-h1"><li><a href="#first-0" title="First">First</a></li><li><ul class="table-of-contents-h2"><li><a href="#second-1" title="Second">Second</a></li><li><ul class="table-of-contents-h3"><li><a href="#third-2" title="Third">Third</a></li><li><a href="#third-again-3" title="Third Again">Third Again</a></li><li><ul class="table-of-contents-h4"><li><a href="#fouth-4" title="Fouth">Fouth</a></li></ul></li></ul></li><li><a href="#second-again-6" title="Second Again">Second Again</a></li><li><ul class="table-of-contents-h3"><li><a href="#third-last-7" title="Third Last">Third Last</a></li></ul></li></ul></li></ul></nav>
Content
Content</p>`;
  t.is(MarkdownItRenderer.render(markdown, MarkdownItRenderer.defaultConfig()), output);
});

test('MarkdownItRenderer.render(content, config): can render a table of contents with no H1', (t) => {
  const markdown = '## First\n## Second\n### Third\n### Third Again\n#### Fouth\n\n## Second Again\n### Third Last\nContent\nContent\n[toc]';
  const output = `<h2 id="first-0">First</h2>
<h2 id="second-1">Second</h2>
<h3 id="third-2">Third</h3>
<h3 id="third-again-3">Third Again</h3>
<h4 id="fouth-4">Fouth</h4>
<h2 id="second-again-6">Second Again</h2>
<h3 id="third-last-7">Third Last</h3>
<p>Content
Content
<nav class="table-of-contents"><ul class="table-of-contents-h2"><li><a href="#first-0" title="First">First</a></li><li><a href="#second-1" title="Second">Second</a></li><li><ul class="table-of-contents-h3"><li><a href="#third-2" title="Third">Third</a></li><li><a href="#third-again-3" title="Third Again">Third Again</a></li><li><ul class="table-of-contents-h4"><li><a href="#fouth-4" title="Fouth">Fouth</a></li></ul></li><li><a href="#second-again-6" title="Second Again">Second Again</a></li><li><ul class="table-of-contents-h3"><li><a href="#third-last-7" title="Third Last">Third Last</a></li></ul></li></ul></li></ul></nav></p>`;
  t.is(MarkdownItRenderer.render(markdown, MarkdownItRenderer.defaultConfig()), output);
});

test('MarkdownItRenderer.render(content, config): can render a table of contents with no H2', (t) => {
  const markdown = '### First\n### Second\n#### Third\n### Third Again\n#### Fouth\n\n### Second Again\n#### Third Last\nContent\nContent\n[toc]';
  const output = `<h3 id="first-0">First</h3>
<h3 id="second-1">Second</h3>
<h4 id="third-2">Third</h4>
<h3 id="third-again-3">Third Again</h3>
<h4 id="fouth-4">Fouth</h4>
<h3 id="second-again-6">Second Again</h3>
<h4 id="third-last-7">Third Last</h4>
<p>Content
Content
<nav class="table-of-contents"><ul class="table-of-contents-h3"><li><a href="#first-0" title="First">First</a></li><li><a href="#second-1" title="Second">Second</a></li><li><ul class="table-of-contents-h4"><li><a href="#third-2" title="Third">Third</a></li></ul></li><li><a href="#third-again-3" title="Third Again">Third Again</a></li><li><ul class="table-of-contents-h4"><li><a href="#fouth-4" title="Fouth">Fouth</a></li></ul></li><li><a href="#second-again-6" title="Second Again">Second Again</a></li><li><ul class="table-of-contents-h4"><li><a href="#third-last-7" title="Third Last">Third Last</a></li></ul></li></ul></nav></p>`;
  t.is(MarkdownItRenderer.render(markdown, MarkdownItRenderer.defaultConfig()), output);
});

test('MarkdownItRenderer.render(content, config): can render a table of contents with empty headers', (t) => {
  const markdown = '# \n## \n### \n### \n#### \n\n## \n### \nContent\nContent\n[toc]\nContent\nContent';
  const output = `<h1></h1>
<h2></h2>
<h3></h3>
<h3></h3>
<h4></h4>
<h2></h2>
<h3></h3>
<p>Content
Content
<nav class="table-of-contents"><ul class="table-of-contents-h1"><li><a href="#-0" title=""></a></li><li><ul class="table-of-contents-h2"><li><a href="#-1" title=""></a></li><li><ul class="table-of-contents-h3"><li><a href="#-2" title=""></a></li><li><a href="#-3" title=""></a></li><li><ul class="table-of-contents-h4"><li><a href="#-4" title=""></a></li></ul></li></ul></li><li><a href="#-6" title=""></a></li><li><ul class="table-of-contents-h3"><li><a href="#-7" title=""></a></li></ul></li></ul></li></ul></nav>
Content
Content</p>`;
  t.is(MarkdownItRenderer.render(markdown, MarkdownItRenderer.defaultConfig()), output);
});

test('MarkdownItRenderer.render(content, config): can render a table of contents with ending tags', (t) => {
  const markdown = '# First #\n## Second ##\n### Third ###\n### Third Again ###\n#### Fouth ####\n\n## Second Again ##\n### Third Last ###\nContent\nContent\n[toc]\nContent\nContent';
  const output = `<h1 id="first-0">First</h1>
<h2 id="second-1">Second</h2>
<h3 id="third-2">Third</h3>
<h3 id="third-again-3">Third Again</h3>
<h4 id="fouth-4">Fouth</h4>
<h2 id="second-again-6">Second Again</h2>
<h3 id="third-last-7">Third Last</h3>
<p>Content
Content
<nav class="table-of-contents"><ul class="table-of-contents-h1"><li><a href="#first-0" title="First">First</a></li><li><ul class="table-of-contents-h2"><li><a href="#second-1" title="Second">Second</a></li><li><ul class="table-of-contents-h3"><li><a href="#third-2" title="Third">Third</a></li><li><a href="#third-again-3" title="Third Again">Third Again</a></li><li><ul class="table-of-contents-h4"><li><a href="#fouth-4" title="Fouth">Fouth</a></li></ul></li></ul></li><li><a href="#second-again-6" title="Second Again">Second Again</a></li><li><ul class="table-of-contents-h3"><li><a href="#third-last-7" title="Third Last">Third Last</a></li></ul></li></ul></li></ul></nav>
Content
Content</p>`;
  t.is(MarkdownItRenderer.render(markdown, MarkdownItRenderer.defaultConfig()), output);
});

test('MarkdownItRenderer.render(content, config): can render a table of contents with new lines', (t) => {
  const markdown = '# First\n## Second\n### Third\n### Third Again\n#### Fouth\n\n## Second Again\n### Third Last\nContent\nContent\n\n[toc]\nContent\nContent';
  const output = `<h1 id="first-0">First</h1>
<h2 id="second-1">Second</h2>
<h3 id="third-2">Third</h3>
<h3 id="third-again-3">Third Again</h3>
<h4 id="fouth-4">Fouth</h4>
<h2 id="second-again-6">Second Again</h2>
<h3 id="third-last-7">Third Last</h3>
<p>Content
Content</p>
<p><nav class="table-of-contents"><ul class="table-of-contents-h1"><li><a href="#first-0" title="First">First</a></li><li><ul class="table-of-contents-h2"><li><a href="#second-1" title="Second">Second</a></li><li><ul class="table-of-contents-h3"><li><a href="#third-2" title="Third">Third</a></li><li><a href="#third-again-3" title="Third Again">Third Again</a></li><li><ul class="table-of-contents-h4"><li><a href="#fouth-4" title="Fouth">Fouth</a></li></ul></li></ul></li><li><a href="#second-again-6" title="Second Again">Second Again</a></li><li><ul class="table-of-contents-h3"><li><a href="#third-last-7" title="Third Last">Third Last</a></li></ul></li></ul></li></ul></nav>
Content
Content</p>`;
  t.is(MarkdownItRenderer.render(markdown, MarkdownItRenderer.defaultConfig()), output);
});

test('MarkdownItRenderer.render(content, config): can render a table of contents with no headers', (t) => {
  const markdown = 'Content\nContent\n[toc]\nContent\nContent';
  const output = `<p>Content
Content
<nav class="table-of-contents"></nav>
Content
Content</p>`;
  t.is(MarkdownItRenderer.render(markdown, MarkdownItRenderer.defaultConfig()), output);
});

test('MarkdownItRenderer.render(content, config): can render a table of contents with code in headers', (t) => {
  const markdown = '## End / Return (`$00`)\n[toc]\n';
  const output = '<h2 id="end-return-(dollar00)-0">End / Return (<code>$00</code>)</h2>\n<p><nav class="table-of-contents"><ul class="table-of-contents-h2"><li><a href="#end-return-(dollar00)-0" title="End / Return (\`$00\`)">End / Return (\`$00\`)</a></li></ul></nav></p>';
  t.is(MarkdownItRenderer.render(markdown, MarkdownItRenderer.defaultConfig()), output);
});
