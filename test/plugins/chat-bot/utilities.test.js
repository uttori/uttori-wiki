import test from 'ava';
import {
  oneLine,
  toCSV,
  genTreeNode,
  markdownItAST,
  stripImagesFromMarkdown,
  consolidateHeaders,
  consolidateParagraph,
  consolidateNestedItems,
  countWords,
  joinContent,
  removeEmptyItems,
  consolidateSectionsByHeader,
  longestCommonPrefix,
} from '../../../src/plugins/chat-bot/utilities.js';

test('oneLine: should convert newlines to spaces', (t) => {
  const input = 'Line 1\nLine 2\n\nLine 3';
  const expected = 'Line 1 Line 2 Line 3';
  t.is(oneLine(input), expected);
});

test('oneLine: should use custom replacement', (t) => {
  const input = 'Line 1\nLine 2\n\nLine 3';
  const expected = 'Line 1|Line 2|Line 3';
  t.is(oneLine(input, '|'), expected);
});

test('oneLine: should handle multiple consecutive newlines', (t) => {
  const input = 'Line 1\n\n\nLine 2';
  const expected = 'Line 1 Line 2';
  t.is(oneLine(input), expected);
});

test('oneLine: should trim whitespace', (t) => {
  const input = '  Line 1\n  Line 2  ';
  const expected = 'Line 1 Line 2';
  t.is(oneLine(input), expected);
});

test('toCSV: should convert array to CSV', (t) => {
  const table = [
    ['Name', 'Age', 'City'],
    ['John', '25', 'New York'],
    ['Jane', '30', 'Los Angeles'],
  ];
  const expected = '"Name","Age","City"\n"John","25","New York"\n"Jane","30","Los Angeles"';
  t.is(toCSV(table), expected);
});

test('toCSV: should handle custom separator', (t) => {
  const table = [['A', 'B'], ['C', 'D']];
  const expected = '"A";"B"\n"C";"D"';
  t.is(toCSV(table, ';'), expected);
});

test('toCSV: should handle cells with commas', (t) => {
  const table = [['Name, Title', 'Age'], ['John, Mr.', '25']];
  const expected = '"Name, Title","Age"\n"John, Mr.","25"';
  t.is(toCSV(table), expected);
});

test('toCSV: should handle cells with quotes', (t) => {
  const table = [['He said "Hello"', 'Age']];
  const expected = '"He said ""Hello""","Age"';
  t.is(toCSV(table), expected);
});

test('toCSV: should not quote when alwaysDoubleQuote is false', (t) => {
  const table = [['Simple', 'Text'], ['With, Comma', 'Normal']];
  const expected = 'Simple,Text\n"With, Comma",Normal';
  t.is(toCSV(table, ',', '\n', false), expected);
});

test('genTreeNode: should create root node when no token provided', (t) => {
  const node = genTreeNode();
  t.is(node.type, 'root');
  t.deepEqual(node.content, []);
  t.deepEqual(node.headers, []);
  t.deepEqual(node.children, []);
});

test('genTreeNode: should create node from token', (t) => {
  const token = { type: 'paragraph_open' };
  const node = genTreeNode(token);
  t.is(node.type, 'paragraph');
  t.deepEqual(node.content, []);
  t.deepEqual(node.headers, []);
  t.deepEqual(node.children, []);
});

test('stripImagesFromMarkdown: should remove images with alt text', (t) => {
  const input = '![Alt Text](image.png) Some text';
  const expected = 'Alt Text Some text';
  t.is(stripImagesFromMarkdown(input), expected);
});

test('stripImagesFromMarkdown: should remove images without alt text', (t) => {
  const input = '![](image.png) Some text';
  const expected = 'Some text';
  t.is(stripImagesFromMarkdown(input), expected);
});

test('stripImagesFromMarkdown: should handle data URLs', (t) => {
  const input = '![](data:image/svg+xml;base64,PHN2ZyB2aWV3Ym94PSIwIDAgMjQgMjQiIGhlaWdodD0iMjIiIHdpZHRoPSIyMiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMCAwaDI0djI0SDB6IiBmaWxsPSJub25lIiAvPjxwYXRoIGQ9Ik0zLjkgMTJjMC0xLjcxIDEuMzktMy4xIDMuMS0zLjFoNFY3SDdjLTIuNzYuMC01IDIuMjQtNSA1czIuMjQgNSA1IDVoNHYtMS45SDdjLTEuNzEuMC0zLjEtMS4zOS0zLjEtMy4xek04IDEzaDh2LTJIOHYyem05LTZoLTR2MS45aDRjMS43MS4wIDMuMSAxLjM5IDMuMSAzLjFzLTEuMzkgMy4xLTMuMSAzLjFoLTRWMTdoNGMyLjc2LjAgNS0yLjI0IDUtNXMtMi4yNC01LTUtNXoiIC8+PC9zdmc+) Inventing Wheels Is Learning';
  const expected = 'Inventing Wheels Is Learning';
  t.is(stripImagesFromMarkdown(input), expected);
});

test('stripImagesFromMarkdown: should handle multiple images', (t) => {
  const input = '![First](img1.png) Text ![Second](img2.png) More text';
  const expected = 'First Text Second More text';
  t.is(stripImagesFromMarkdown(input), expected);
});

test('stripImagesFromMarkdown: should handle non-string input', (t) => {
  t.is(stripImagesFromMarkdown(null), null);
  t.is(stripImagesFromMarkdown(undefined), undefined);
  t.is(stripImagesFromMarkdown(123), 123);
});

test('joinContent: should join content arrays', (t) => {
  const items = [{
    type: 'paragraph',
    content: ['First', 'Second', 'Third'],
    headers: [],
    children: [],
  }];
  const result = joinContent(items);
  t.deepEqual(result[0].content, ['First Second Third']);
});

test('joinContent: should handle empty content', (t) => {
  const items = [{
    type: 'paragraph',
    content: [],
    headers: [],
    children: [],
  }];
  const result = joinContent(items);
  t.deepEqual(result[0].content, []);
});

test('joinContent: should handle items with children', (t) => {
  const items = [{
    type: 'paragraph',
    content: ['Some', 'content'],
    headers: [],
    children: [
      { type: 'span', content: ['child content'], headers: [], children: [] },
    ],
  }];
  const result = joinContent(items);
  t.deepEqual(result[0].content, ['Some content']);
  t.is(result[0].children.length, 1);
});

test('consolidateHeaders: should strip images from string headers', (t) => {
  const items = [{
    type: 'paragraph',
    headers: [['![Image](test.png) Header Text', 1]],
    content: ['Some content'],
    children: [],
  }];
  const result = consolidateHeaders(items);
  t.is(result[0].headers[0], 'Image Header Text');
});

test('consolidateHeaders: should handle object headers with string content', (t) => {
  const items = [{
    type: 'paragraph',
    headers: [[{ content: '![Image](test.png) Header Text' }, 1]],
    content: ['Some content'],
    children: [],
  }];
  const result = consolidateHeaders(items);
  t.is(result[0].headers[0], 'Image Header Text');
});

test('consolidateHeaders: should handle object headers with array content', (t) => {
  const items = [{
    type: 'paragraph',
    headers: [[{ content: ['![Image](test.png)', 'Header', 'Text'] }, 1]],
    content: ['Some content'],
    children: [],
  }];
  const result = consolidateHeaders(items);
  t.is(result[0].headers[0], 'Image Header Text');
});

test('consolidateHeaders: should preserve number headers', (t) => {
  const items = [{
    type: 'paragraph',
    headers: [[123, 1]],
    content: ['Some content'],
    children: [],
  }];
  const result = consolidateHeaders(items);
  t.is(result[0].headers[0], 123);
});

test('consolidateHeaders: should handle object headers with non-string non-array content', (t) => {
  const items = [{
    type: 'paragraph',
    headers: [[{ content: 456 }, 1]],
    content: ['Some content'],
    children: [],
  }];
  const result = consolidateHeaders(items);
  t.is(result[0].headers[0], 456);
});

test('consolidateHeaders: should handle object headers with boolean content', (t) => {
  const items = [{
    type: 'paragraph',
    headers: [[{ content: true }, 1]],
    content: ['Some content'],
    children: [],
  }];
  const result = consolidateHeaders(items);
  t.is(result[0].headers[0], true);
});

test('consolidateHeaders: should handle headers with non-string non-number non-object values', (t) => {
  const items = [{
    type: 'paragraph',
    headers: [[true, 1]],
    content: ['Some content'],
    children: [],
  }];
  const result = consolidateHeaders(items);
  t.is(result[0].headers[0], true);
});

test('consolidateHeaders: should handle headers with null values', (t) => {
  const items = [{
    type: 'paragraph',
    headers: [[null, 1]],
    content: ['Some content'],
    children: [],
  }];
  const result = consolidateHeaders(items);
  t.is(result[0].headers[0], null);
});

test('consolidateHeaders: should handle headers with undefined values', (t) => {
  const items = [{
    type: 'paragraph',
    headers: [[undefined, 1]],
    content: ['Some content'],
    children: [],
  }];
  const result = consolidateHeaders(items);
  t.is(result[0].headers[0], undefined);
});

test('consolidateParagraph: should extract text from paragraph', (t) => {
  const token = {
    children: [
      { type: 'text', content: 'Hello ' },
      { type: 'strong_open' },
      { type: 'text', content: 'world' },
      { type: 'strong_close' },
    ],
  };
  const result = consolidateParagraph(token);
  t.deepEqual(result, ['Hello ', 'world']);
});

test('consolidateParagraph: should handle nested paragraphs', (t) => {
  const token = {
    children: [
      { type: 'paragraph', content: ['Nested content'], children: [
        { type: 'text', content: 'Nested text' },
      ]},
    ],
  };
  const result = consolidateParagraph(token);
  t.deepEqual(result, ['Nested text', 'Nested content']);
});

test('consolidateParagraph: should handle nested paragraphs with array content', (t) => {
  const token = {
    children: [
      { type: 'paragraph', content: ['Nested content'], children: [
        { type: 'text', content: ['Nested text'] },
      ]},
    ],
  };
  const result = consolidateParagraph(token);
  t.deepEqual(result, ['Nested text', 'Nested content']);
});

test('consolidateParagraph: should handle list items', (t) => {
  const token = {
    children: [
      { type: 'list_item', content: ['List content'], children: [
        { type: 'paragraph', content: ['Item text'], children: [
          { type: 'text', content: 'Item text' },
        ]},
      ]},
    ],
  };
  const result = consolidateParagraph(token);
  t.deepEqual(result, ['Item text', 'List content']);
});

test('consolidateParagraph: should handle token without children', (t) => {
  const token = { content: ['Direct content'] };
  const result = consolidateParagraph(token);
  t.deepEqual(result, ['Direct content']);
});

test('consolidateParagraph: should ignore image and link tokens', (t) => {
  const token = {
    children: [
      { type: 'text', content: ['Before '] },
      { type: 'image', content: ['ignored image'] },
      { type: 'text', content: [' middle '] },
      { type: 'link_open', content: ['ignored link open'] },
      { type: 'text', content: ['link text'] },
      { type: 'link_close', content: ['ignored link close'] },
      { type: 'text', content: [' after'] },
    ],
  };
  const result = consolidateParagraph(token);
  t.deepEqual(result, ['Before ', ' middle ', 'link text', ' after']);
});

test('consolidateParagraph: should handle list items with string content', (t) => {
  const token = {
    children: [
      { type: 'list_item', content: 'String content', children: [] },
    ],
  };
  const result = consolidateParagraph(token);
  t.deepEqual(result, ['String content']);
});

test('consolidateParagraph: should handle paragraphs with string content', (t) => {
  const token = {
    children: [
      { type: 'paragraph', content: 'String paragraph content', children: [] },
    ],
  };
  const result = consolidateParagraph(token);
  t.deepEqual(result, ['String paragraph content']);
});

test('consolidateParagraph: should handle list items with number content', (t) => {
  const token = {
    children: [
      { type: 'list_item', content: 123, children: [] },
    ],
  };
  const result = consolidateParagraph(token);
  t.deepEqual(result, [123]);
});

test('consolidateParagraph: should handle paragraphs with number content', (t) => {
  const token = {
    children: [
      { type: 'paragraph', content: 456, children: [] },
    ],
  };
  const result = consolidateParagraph(token);
  t.deepEqual(result, [456]);
});

test('consolidateNestedItems: should consolidate bullet lists', (t) => {
  const items = [{
    type: 'bullet_list',
    content: [],
    headers: [],
    children: [
      {
        type: 'list_item',
        children: [{ type: 'paragraph', content: ['Item 1'], headers: [], children: [] }],
      },
      {
        type: 'list_item',
        children: [{ type: 'paragraph', content: ['Item 2'], headers: [], children: [] }],
      },
    ],
  }];
  const result = consolidateNestedItems(items);
  t.is(result[0].type, 'bullet_list');
  t.deepEqual(result[0].content, [['Item 1'], ['Item 2']]);
  t.deepEqual(result[0].children, []);
});

test('consolidateNestedItems: should consolidate ordered lists', (t) => {
  const items = [{
    type: 'ordered_list',
    content: [],
    headers: [],
    children: [
      {
        type: 'list_item',
        children: [{ type: 'paragraph', content: ['First item'], headers: [], children: [] }],
      },
      {
        type: 'list_item',
        children: [{ type: 'paragraph', content: ['Second item'], headers: [], children: [] }],
      },
    ],
  }];
  const result = consolidateNestedItems(items);
  t.is(result[0].type, 'ordered_list');
  t.deepEqual(result[0].content, ['1.) First item', '2.) Second item']);
  t.deepEqual(result[0].children, []);
});

test('consolidateNestedItems: should consolidate blockquotes', (t) => {
  const items = [{
    type: 'blockquote',
    content: [],
    headers: [],
    children: [
      { type: 'paragraph', content: ['Quote text'], headers: [], children: [] },
    ],
  }];
  const result = consolidateNestedItems(items);
  t.is(result[0].type, 'blockquote');
  t.deepEqual(result[0].content, ['Quote text']);
  t.deepEqual(result[0].children, []);
});

test('consolidateNestedItems: should consolidate tables', (t) => {
  const items = [{
    type: 'table',
    content: [],
    headers: [],
    children: [
      {
        type: 'thead',
        children: [{
          type: 'tr',
          children: [
            { type: 'th', content: ['Header 1'], headers: [], children: [] },
            { type: 'th', content: ['Header 2'], headers: [], children: [] },
          ],
        }],
      },
      {
        type: 'tbody',
        children: [{
          type: 'tr',
          children: [
            { type: 'td', content: ['Cell 1'], headers: [], children: [] },
            { type: 'td', content: ['Cell 2'], headers: [], children: [] },
          ],
        }],
      },
    ],
  }];
  let result = consolidateNestedItems(items, { tableToCSV: false });
  t.is(JSON.stringify(result), '[{"type":"table","content":["Table as Markdown:\\n| Header 1 | Header 2 |\\n| --- | --- |\\n| Cell 1 | Cell 2 |"],"children":[],"headers":[]}]');
  result = consolidateNestedItems(items, { tableToCSV: true });
  t.is(JSON.stringify(result), '[{"type":"table","content":["Table as CSV:\\n\\"Header 1\\",\\"Header 2\\"\\n\\"Cell 1\\",\\"Cell 2\\""],"children":[],"headers":[]}]');
});

test('consolidateNestedItems: should consolidate footnotes', (t) => {
  const items = [{
    type: 'footnote',
    content: [],
    headers: [],
    children: [
      { type: 'paragraph', content: ['Footnote content'], headers: [], children: [] },
    ],
  }];
  const result = consolidateNestedItems(items);
  t.is(result[0].type, 'footnote');
  t.true(result[0].content[0].includes('Footenote'));
  t.true(result[0].content[0].includes('Footnote content'));
  t.deepEqual(result[0].children, []);
});

test('consolidateNestedItems: should handle unknown item types', (t) => {
  const items = [{
    type: 'unknown_type',
    content: ['Some content'],
    headers: [],
    children: [],
  }];
  const result = consolidateNestedItems(items);
  t.is(result[0].type, 'unknown_type');
  t.deepEqual(result[0].content, ['Some content']);
});

test('consolidateNestedItems: should handle table headers with children', (t) => {
  const items = [{
    type: 'table',
    content: [],
    headers: [],
    children: [
      {
        type: 'thead',
        children: [{
          type: 'tr',
          children: [
            {
              type: 'th',
              content: ['Header 1'],
              headers: [],
              children: [{ type: 'span', content: ['Nested content'] }], // This should trigger the warning
            },
            { type: 'th', content: ['Header 2'], headers: [], children: [] },
          ],
        }],
      },
      {
        type: 'tbody',
        children: [{
          type: 'tr',
          children: [
            { type: 'td', content: ['Cell 1'], headers: [], children: [] },
            { type: 'td', content: ['Cell 2'], headers: [], children: [] },
          ],
        }],
      },
    ],
  }];
  let result = consolidateNestedItems(items, { tableToCSV: false });
  t.is(JSON.stringify(result), '[{"type":"table","content":["Table as Markdown:\\n| Header 1 | Header 2 |\\n| --- | --- |\\n| Cell 1 | Cell 2 |"],"children":[],"headers":[]}]');
  result = consolidateNestedItems(items, { tableToCSV: true });
  t.is(JSON.stringify(result), '[{"type":"table","content":["Table as CSV:\\n\\"Header 1\\",\\"Header 2\\"\\n\\"Cell 1\\",\\"Cell 2\\""],"children":[],"headers":[]}]');
});

test('consolidateNestedItems: should handle table cells with children', (t) => {
  const items = [{
    type: 'table',
    content: [],
    headers: [],
    children: [
      {
        type: 'thead',
        children: [{
          type: 'tr',
          children: [
            { type: 'th', content: ['Header 1'], headers: [], children: [] },
            { type: 'th', content: ['Header 2'], headers: [], children: [] },
          ],
        }],
      },
      {
        type: 'tbody',
        children: [{
          type: 'tr',
          children: [
            {
              type: 'td',
              content: ['Cell 1'],
              headers: [],
              children: [{ type: 'span', content: ['Nested content'] }], // This should trigger the warning
            },
            { type: 'td', content: ['Cell 2'], headers: [], children: [] },
          ],
        }],
      },
    ],
  }];
  let result = consolidateNestedItems(items, { tableToCSV: false });
  t.is(JSON.stringify(result), '[{"type":"table","content":["Table as Markdown:\\n| Header 1 | Header 2 |\\n| --- | --- |\\n| Cell 1 | Cell 2 |"],"children":[],"headers":[]}]');
  result = consolidateNestedItems(items, { tableToCSV: true });
  t.is(JSON.stringify(result), '[{"type":"table","content":["Table as CSV:\\n\\"Header 1\\",\\"Header 2\\"\\n\\"Cell 1\\",\\"Cell 2\\""],"children":[],"headers":[]}]');
});

test('consolidateNestedItems: should handle unknown table child types', (t) => {
  const items = [{
    type: 'table',
    content: [],
    headers: [],
    children: [
      {
        type: 'thead',
        children: [{
          type: 'tr',
          children: [
            { type: 'th', content: ['Header 1'], headers: [], children: [] },
            { type: 'th', content: ['Header 2'], headers: [], children: [] },
          ],
        }],
      },
      {
        type: 'unknown_table_child', // This should trigger the warning
        children: [],
      },
      {
        type: 'tbody',
        children: [{
          type: 'tr',
          children: [
            { type: 'td', content: ['Cell 1'], headers: [], children: [] },
            { type: 'td', content: ['Cell 2'], headers: [], children: [] },
          ],
        }],
      },
    ],
  }];
  let result = consolidateNestedItems(items, { tableToCSV: false });
  t.is(JSON.stringify(result), '[{"type":"table","content":["Table as Markdown:\\n| Header 1 | Header 2 |\\n| --- | --- |\\n| Cell 1 | Cell 2 |"],"children":[],"headers":[]}]');
  result = consolidateNestedItems(items, { tableToCSV: true });
  t.is(JSON.stringify(result), '[{"type":"table","content":["Table as CSV:\\n\\"Header 1\\",\\"Header 2\\"\\n\\"Cell 1\\",\\"Cell 2\\""],"children":[],"headers":[]}]');
});

test('removeEmptyItems: should remove items with no content and no children', (t) => {
  const items = [
    { type: 'paragraph', content: ['Has content'], headers: [], children: [] },
    { type: 'paragraph', content: [], headers: [], children: [] },
    { type: 'paragraph', content: [], headers: [], children: [{ type: 'paragraph', content: ['Child content'], headers: [], children: [] }] },
  ];
  const result = removeEmptyItems(items);
  t.is(result.length, 2);
  t.is(result[0].content[0], 'Has content');
  t.is(result[1].children[0].content[0], 'Child content');
});

test('removeEmptyItems: should handle nested empty items', (t) => {
  const items = [{
    type: 'paragraph',
    content: ['Parent content'],
    headers: [],
    children: [
      { type: 'paragraph', content: [], headers: [], children: [] },
      { type: 'paragraph', content: ['Child content'], headers: [], children: [] },
    ],
  }];
  const result = removeEmptyItems(items);
  t.is(result[0].children.length, 1);
  t.is(result[0].children[0].content[0], 'Child content');
});

test('countWords: should count word occurrences', (t) => {
  const input = 'hello world hello test world hello';
  const expected = { hello: 3, world: 2, test: 1 };
  t.deepEqual(countWords(input), expected);
});

test('countWords: should handle punctuation', (t) => {
  const input = 'Hello, world! How are you?';
  const expected = { hello: 1, world: 1, how: 1, are: 1, you: 1 };
  t.deepEqual(countWords(input), expected);
});

test('countWords: should handle curly quotes', (t) => {
  const input = '"Hello" ‘world’ \'hello\' “test”';
  const expected = { '\'hello\'': 1, hello: 1, test: 1, world: 1 };
  t.deepEqual(countWords(input), expected);
});

test('countWords: should be case insensitive', (t) => {
  const input = 'Hello HELLO hello';
  const expected = { hello: 3 };
  t.deepEqual(countWords(input), expected);
});

test('countWords: should handle empty string', (t) => {
  const input = '';
  const expected = {};
  t.deepEqual(countWords(input), expected);
});

test('countWords: should handle whitespace only', (t) => {
  const input = '   \n\t  ';
  const expected = {};
  t.deepEqual(countWords(input), expected);
});

test('longestCommonPrefix: should return empty array for empty input', (t) => {
  const result = longestCommonPrefix([]);
  t.deepEqual(result, []);
});

test('longestCommonPrefix: should return single path for single input', (t) => {
  const paths = [['Chapter 1', 'Section A', 'Subsection 1']];
  const result = longestCommonPrefix(paths);
  t.deepEqual(result, ['Chapter 1', 'Section A', 'Subsection 1']);
});

test('longestCommonPrefix: should find common prefix for identical paths', (t) => {
  const paths = [
    ['Chapter 1', 'Section A', 'Subsection 1'],
    ['Chapter 1', 'Section A', 'Subsection 1'],
  ];
  const result = longestCommonPrefix(paths);
  t.deepEqual(result, ['Chapter 1', 'Section A', 'Subsection 1']);
});

test('longestCommonPrefix: should find partial common prefix', (t) => {
  const paths = [
    ['Chapter 1', 'Section A', 'Subsection 1'],
    ['Chapter 1', 'Section A', 'Subsection 2'],
    ['Chapter 1', 'Section A', 'Subsection 3'],
  ];
  const result = longestCommonPrefix(paths);
  t.deepEqual(result, ['Chapter 1', 'Section A']);
});

test('longestCommonPrefix: should find single element common prefix', (t) => {
  const paths = [
    ['Chapter 1', 'Section A', 'Subsection 1'],
    ['Chapter 1', 'Section B', 'Subsection 2'],
    ['Chapter 1', 'Section C', 'Subsection 3'],
  ];
  const result = longestCommonPrefix(paths);
  t.deepEqual(result, ['Chapter 1']);
});

test('longestCommonPrefix: should return empty array for no common prefix', (t) => {
  const paths = [
    ['Chapter 1', 'Section A'],
    ['Chapter 2', 'Section B'],
    ['Chapter 3', 'Section C'],
  ];
  const result = longestCommonPrefix(paths);
  t.deepEqual(result, []);
});

test('longestCommonPrefix: should handle paths of different lengths', (t) => {
  const paths = [
    ['Chapter 1', 'Section A', 'Subsection 1', 'Detail 1'],
    ['Chapter 1', 'Section A', 'Subsection 2'],
    ['Chapter 1', 'Section A'],
  ];
  const result = longestCommonPrefix(paths);
  t.deepEqual(result, ['Chapter 1', 'Section A']);
});

test('longestCommonPrefix: should handle single element paths', (t) => {
  const paths = [
    ['Chapter 1'],
    ['Chapter 1'],
    ['Chapter 2'],
  ];
  const result = longestCommonPrefix(paths);
  t.deepEqual(result, []);
});

test('longestCommonPrefix: should handle mixed single and multi-element paths', (t) => {
  const paths = [
    ['Chapter 1'],
    ['Chapter 1', 'Section A'],
    ['Chapter 1', 'Section B'],
  ];
  const result = longestCommonPrefix(paths);
  t.deepEqual(result, ['Chapter 1']);
});

test('longestCommonPrefix: should handle complex hierarchical paths', (t) => {
  const paths = [
    ['Document', 'Chapter 1', 'Section A', 'Subsection 1', 'Detail A'],
    ['Document', 'Chapter 1', 'Section A', 'Subsection 1', 'Detail B'],
    ['Document', 'Chapter 1', 'Section A', 'Subsection 2', 'Detail C'],
    ['Document', 'Chapter 1', 'Section B', 'Subsection 3', 'Detail D'],
  ];
  const result = longestCommonPrefix(paths);
  t.deepEqual(result, ['Document', 'Chapter 1']);
});

test('longestCommonPrefix: should handle paths with empty strings', (t) => {
  const paths = [
    ['', 'Section A'],
    ['', 'Section B'],
    ['', 'Section C'],
  ];
  const result = longestCommonPrefix(paths);
  t.deepEqual(result, ['']);
});

test('longestCommonPrefix: should handle paths with special characters', (t) => {
  const paths = [
    ['Chapter 1', 'Section A & B', 'Subsection 1'],
    ['Chapter 1', 'Section A & B', 'Subsection 2'],
    ['Chapter 1', 'Section C', 'Subsection 3'],
  ];
  const result = longestCommonPrefix(paths);
  t.deepEqual(result, ['Chapter 1']);
});

test('longestCommonPrefix: should handle paths with numbers', (t) => {
  const paths = [
    ['Chapter 1', 'Section 2', 'Subsection 3'],
    ['Chapter 1', 'Section 2', 'Subsection 4'],
    ['Chapter 1', 'Section 5', 'Subsection 6'],
  ];
  const result = longestCommonPrefix(paths);
  t.deepEqual(result, ['Chapter 1']);
});

test('longestCommonPrefix: should find longer common prefix when all paths share it', (t) => {
  const paths = [
    ['Chapter 1', 'Section 2', 'Subsection 3', 'Detail A'],
    ['Chapter 1', 'Section 2', 'Subsection 3', 'Detail B'],
    ['Chapter 1', 'Section 2', 'Subsection 3', 'Detail C'],
  ];
  const result = longestCommonPrefix(paths);
  t.deepEqual(result, ['Chapter 1', 'Section 2', 'Subsection 3']);
});

test('longestCommonPrefix: should handle paths with special characters correctly', (t) => {
  const paths = [
    ['Chapter 1', 'Section A & B', 'Subsection 1'],
    ['Chapter 1', 'Section A & B', 'Subsection 2'],
    ['Chapter 1', 'Section A & B', 'Subsection 3'],
  ];
  const result = longestCommonPrefix(paths);
  t.deepEqual(result, ['Chapter 1', 'Section A & B']);
});

test('longestCommonPrefix: should handle paths with Unicode characters', (t) => {
  const paths = [
    ['Chapter 1', 'Section α', 'Subsection β'],
    ['Chapter 1', 'Section α', 'Subsection γ'],
    ['Chapter 1', 'Section β', 'Subsection δ'],
  ];
  const result = longestCommonPrefix(paths);
  t.deepEqual(result, ['Chapter 1']);
});

test('consolidateSectionsByHeader: should consolidate sections by slug', (t) => {
  const items = [
    { slug: 'doc1', sectionPath: ['Header 1'], text: 'Content 1', tokenCount: 10 },
    { slug: 'doc1', sectionPath: ['Header 1', 'Subheader'], text: 'Content 2', tokenCount: 10 },
    { slug: 'doc2', sectionPath: ['Header 2'], text: 'Content 3', tokenCount: 10 },
  ];
  const result = consolidateSectionsByHeader(items, 50);
  t.is(result.length, 2); // Should consolidate doc1 sections, keep doc2 separate
  t.true(result.some(r => r.slug === 'doc1' && r.text.includes('Content 1')));
  t.true(result.some(r => r.slug === 'doc2'));
});

test('consolidateSectionsByHeader: should respect maximum token count', (t) => {
  const items = [
    { slug: 'doc1', sectionPath: ['Header 1'], text: 'Content 1', tokenCount: 30 },
    { slug: 'doc1', sectionPath: ['Header 1', 'Subheader'], text: 'Content 2', tokenCount: 30 },
  ];
  const result = consolidateSectionsByHeader(items, 50);
  t.is(result.length, 2); // Should not consolidate due to token limit
});

test('consolidateSectionsByHeader: should handle empty items array', (t) => {
  const items = [];
  const result = consolidateSectionsByHeader(items, 50);
  t.is(result.length, 0);
});

test('consolidateSectionsByHeader: should handle single item', (t) => {
  const items = [
    { slug: 'doc1', sectionPath: ['Header 1'], text: 'Content 1', tokenCount: 10 },
  ];
  const result = consolidateSectionsByHeader(items, 50);
  t.is(result.length, 1);
  t.is(result[0].slug, 'doc1');
  t.is(result[0].text, 'Content 1');
});

test('consolidateSectionsByHeader: should handle single item exceeding token limit', (t) => {
  const items = [
    { slug: 'doc1', sectionPath: ['Header 1'], text: 'Very long content that exceeds the token limit', tokenCount: 100 },
  ];
  const result = consolidateSectionsByHeader(items, 50);
  t.is(result.length, 1);
  t.is(result[0].slug, 'doc1');
  t.is(result[0].tokenCount, 100);
  t.is(result[0].idx, 1);
});

test('consolidateSectionsByHeader: should flush pack when single item exceeds limit', (t) => {
  const items = [
    { slug: 'doc1', sectionPath: ['Header 1'], text: 'Content 1', tokenCount: 20 },
    { slug: 'doc1', sectionPath: ['Header 1', 'Subheader'], text: 'Content 2', tokenCount: 20 },
    { slug: 'doc1', sectionPath: ['Header 1', 'Another Subheader'], text: 'Very long content that exceeds the token limit', tokenCount: 100 },
  ];
  const result = consolidateSectionsByHeader(items, 50);
  t.is(result.length, 2);
  // First result should be consolidated pack
  t.is(result[0].text, 'Content 1\nSubheader - Content 2');
  t.is(result[0].tokenCount, 40);
  // Second result should be the oversized item
  t.is(result[1].text, 'Very long content that exceeds the token limit');
  t.is(result[1].tokenCount, 100);
});

test('consolidateSectionsByHeader: should handle soft minimum early flush', (t) => {
  const items = [
    { slug: 'doc1', sectionPath: ['Header 1', 'Subheader A'], text: 'Content A', tokenCount: 400 },
    { slug: 'doc1', sectionPath: ['Header 1', 'Subheader A', 'Sub-subheader'], text: 'Content B', tokenCount: 300 },
    { slug: 'doc1', sectionPath: ['Header 1', 'Subheader B'], text: 'Content C', tokenCount: 200 },
  ];
  const result = consolidateSectionsByHeader(items, 1000, 600, 1);
  t.is(result.length, 2);
  // First result should be the first two items (same anchor path)
  t.is(result[0].sectionPath[0], 'Header 1');
  t.is(result[0].sectionPath[1], 'Subheader A');
  t.true(result[0].text.includes('Content A'));
  t.true(result[0].text.includes('Content B'));
  // Second result should be the third item (different anchor path)
  t.is(result[1].sectionPath[0], 'Header 1');
  t.is(result[1].sectionPath[1], 'Subheader B');
  t.is(result[1].text, 'Content C');
});

test('consolidateSectionsByHeader: should handle anchor decrease threshold', (t) => {
  const items = [
    { slug: 'doc1', sectionPath: ['Header 1', 'Subheader A'], text: 'Content A', tokenCount: 400 },
    { slug: 'doc1', sectionPath: ['Header 1', 'Subheader A', 'Sub-subheader'], text: 'Content B', tokenCount: 300 },
    { slug: 'doc1', sectionPath: ['Header 2'], text: 'Content C', tokenCount: 200 },
  ];
  const result = consolidateSectionsByHeader(items, 1000, 600, 2);
  t.is(result.length, 2);
  // Should flush when anchor decreases by 2 levels (meets threshold)
  t.true(result[0].text.includes('Content A'));
  t.true(result[0].text.includes('Content B'));
  t.is(result[1].text, 'Content C');
});

test('consolidateSectionsByHeader: should not flush when anchor decrease is below threshold', (t) => {
  const items = [
    { slug: 'doc1', sectionPath: ['Header 1', 'Subheader A'], text: 'Content A', tokenCount: 400 },
    { slug: 'doc1', sectionPath: ['Header 1', 'Subheader A', 'Sub-subheader'], text: 'Content B', tokenCount: 300 },
    { slug: 'doc1', sectionPath: ['Header 1', 'Subheader B'], text: 'Content C', tokenCount: 200 },
  ];
  const result = consolidateSectionsByHeader(items, 1000, 600, 3);
  t.is(result.length, 1);
  // Should consolidate all items because anchor decrease (1 level) is below threshold (3)
  t.true(result[0].text.includes('Content A'));
  t.true(result[0].text.includes('Content B'));
  t.true(result[0].text.includes('Content C'));
});

test('consolidateSectionsByHeader: should handle items without tokenCount', (t) => {
  const items = [
    { slug: 'doc1', sectionPath: ['Header 1'], text: 'Content without token count' },
    { slug: 'doc1', sectionPath: ['Header 1', 'Subheader'], text: 'Another content without token count' },
  ];
  const result = consolidateSectionsByHeader(items, 50);
  t.is(result.length, 1);
  t.true(result[0].text.includes('Content without token count'));
  t.true(result[0].text.includes('Another content without token count'));
  // Token count should be calculated from individual items (may be NaN if calculation fails)
  t.true(Number.isNaN(result[0].tokenCount) || result[0].tokenCount > 0);
});

test('consolidateSectionsByHeader: should handle items with empty text', (t) => {
  const items = [
    { slug: 'doc1', sectionPath: ['Header 1'], text: '', tokenCount: 0 },
    { slug: 'doc1', sectionPath: ['Header 1', 'Subheader'], text: null, tokenCount: 0 },
  ];
  const result = consolidateSectionsByHeader(items, 50);
  t.is(result.length, 1);
  t.is(result[0].tokenCount, 0);
});

test('consolidateSectionsByHeader: should handle complex section paths', (t) => {
  const items = [
    { slug: 'doc1', sectionPath: ['Chapter 1', 'Section A', 'Subsection 1'], text: 'Content 1', tokenCount: 10 },
    { slug: 'doc1', sectionPath: ['Chapter 1', 'Section A', 'Subsection 2'], text: 'Content 2', tokenCount: 10 },
    { slug: 'doc1', sectionPath: ['Chapter 1', 'Section B'], text: 'Content 3', tokenCount: 10 },
    { slug: 'doc1', sectionPath: ['Chapter 2'], text: 'Content 4', tokenCount: 10 },
  ];
  const result = consolidateSectionsByHeader(items, 30);
  t.is(result.length, 2);
  // First result: Chapter 1 items (consolidated)
  t.deepEqual(result[0].sectionPath, ['Chapter 1']);
  t.true(result[0].text.includes('Content 1'));
  t.true(result[0].text.includes('Content 2'));
  t.true(result[0].text.includes('Content 3'));
  // Second result: Chapter 2
  t.deepEqual(result[1].sectionPath, ['Chapter 2']);
  t.is(result[1].text, 'Content 4');
});

test('consolidateSectionsByHeader: should handle multiple documents', (t) => {
  const items = [
    { slug: 'doc1', sectionPath: ['Header 1'], text: 'Content 1', tokenCount: 10 },
    { slug: 'doc1', sectionPath: ['Header 1', 'Subheader'], text: 'Content 2', tokenCount: 10 },
    { slug: 'doc2', sectionPath: ['Header 1'], text: 'Content 3', tokenCount: 10 },
    { slug: 'doc2', sectionPath: ['Header 1', 'Subheader'], text: 'Content 4', tokenCount: 10 },
  ];
  const result = consolidateSectionsByHeader(items, 50);
  t.is(result.length, 2);
  // Should have one consolidated result per document
  t.is(result[0].slug, 'doc1');
  t.true(result[0].text.includes('Content 1'));
  t.true(result[0].text.includes('Content 2'));
  t.is(result[1].slug, 'doc2');
  t.true(result[1].text.includes('Content 3'));
  t.true(result[1].text.includes('Content 4'));
});

test('consolidateSectionsByHeader: should handle edge case with no common prefix', (t) => {
  const items = [
    { slug: 'doc1', sectionPath: ['A'], text: 'Content 1', tokenCount: 10 },
    { slug: 'doc1', sectionPath: ['B'], text: 'Content 2', tokenCount: 10 },
  ];
  const result = consolidateSectionsByHeader(items, 50);
  t.is(result.length, 1);
  // Should use first item's first path element as anchor
  t.deepEqual(result[0].sectionPath, ['A']);
  t.true(result[0].text.includes('Content 1'));
  t.true(result[0].text.includes('Content 2'));
});

test('markdownItAST: should handle simple markdown', (t) => {
  const tokens = [
    { type: 'heading_open', tag: 'h1', nesting: 1 },
    { type: 'inline', content: ['Test Header'], nesting: 0, children: [
      { type: 'text', content: 'Test Header' },
    ]},
    { type: 'heading_close', tag: 'h1', nesting: -1 },
    { type: 'paragraph_open', tag: 'p', nesting: 1 },
    { type: 'inline', content: ['Test paragraph'], nesting: 0, children: [
      { type: 'text', content: 'Test paragraph' },
    ]},
    { type: 'paragraph_close', tag: 'p', nesting: -1 },
  ];
  const result = markdownItAST(tokens, 'Document Title');
  t.is(result.length, 2); // Should have heading and paragraph
  t.is(result[0].type, 'heading');
  t.deepEqual(result[0].content, ['Test Header']);
  t.is(result[1].type, 'paragraph');
  t.deepEqual(result[1].content, ['Test paragraph']);
  t.deepEqual(result[1].headers, ['Test Header']);
});

test('markdownItAST: should handle code blocks', (t) => {
  const tokens = [
    { type: 'fence', info: 'javascript', content: 'console.log("hello");', nesting: 0 },
  ];
  const result = markdownItAST(tokens, 'Document Title');
  t.is(result.length, 1);
  t.is(result[0].type, 'code');
  t.true(result[0].content[0].includes('```javascript'));
  t.true(result[0].content[0].includes('console.log("hello");'));
});

test('markdownItAST: should handle nested headings', (t) => {
  const tokens = [
    { type: 'heading_open', tag: 'h1', nesting: 1 },
    { type: 'inline', content: ['Main Title'], nesting: 0, children: [
      { type: 'text', content: 'Main Title' },
    ]},
    { type: 'heading_close', tag: 'h1', nesting: -1 },
    { type: 'heading_open', tag: 'h2', nesting: 1 },
    { type: 'inline', content: ['Subtitle'], nesting: 0, children: [
      { type: 'text', content: 'Subtitle' },
    ]},
    { type: 'heading_close', tag: 'h2', nesting: -1 },
    { type: 'paragraph_open', tag: 'p', nesting: 1 },
    { type: 'inline', content: 'Content under subtitle', nesting: 0, children: [
      { type: 'text', content: 'Content under subtitle' },
    ]},
    { type: 'paragraph_close', tag: 'p', nesting: -1 },
  ];
  const result = markdownItAST(tokens, 'Document Title');
  t.is(result.length, 3);
  t.is(result[0].type, 'heading');
  t.deepEqual(result[0].content, ['Main Title']);
  t.is(result[1].type, 'heading');
  t.deepEqual(result[1].content, ['Subtitle']);
  t.is(result[2].type, 'paragraph');
  t.deepEqual(result[2].content, ['Content under subtitle']);
  t.deepEqual(result[2].headers, ['Main Title', 'Subtitle']);
});

test('markdownItAST: should handle heading level changes', (t) => {
  const tokens = [
    { type: 'heading_open', tag: 'h1', nesting: 1 },
    { type: 'inline', content: 'H1', nesting: 0, children: [{ type: 'text', content: 'H1' }]},
    { type: 'heading_close', tag: 'h1', nesting: -1 },
    { type: 'heading_open', tag: 'h2', nesting: 1 },
    { type: 'inline', content: 'H2', nesting: 0, children: [{ type: 'text', content: 'H2' }]},
    { type: 'heading_close', tag: 'h2', nesting: -1 },
    { type: 'heading_open', tag: 'h1', nesting: 1 },
    { type: 'inline', content: 'H1 Again', nesting: 0, children: [{ type: 'text', content: 'H1 Again' }]},
    { type: 'heading_close', tag: 'h1', nesting: -1 },
    { type: 'paragraph_open', tag: 'p', nesting: 1 },
    { type: 'inline', content: 'Content', nesting: 0, children: [{ type: 'text', content: 'Content' }]},
    { type: 'paragraph_close', tag: 'p', nesting: -1 },
  ];
  const result = markdownItAST(tokens, 'Document Title');
  t.is(result.length, 4);
  t.is(result[0].type, 'heading');
  t.deepEqual(result[0].content, ['H1']);
  t.is(result[1].type, 'heading');
  t.deepEqual(result[1].content, ['H2']);
  t.is(result[2].type, 'heading');
  t.deepEqual(result[2].content, ['H1 Again']);
  t.is(result[3].type, 'paragraph');
  t.deepEqual(result[3].content, ['Content']);
  t.deepEqual(result[3].headers, ['H1 Again']);
});

test('markdownItAST: should handle inline formatting', (t) => {
  const tokens = [
    { type: 'paragraph_open', tag: 'p', nesting: 1 },
    { type: 'inline', content: 'Bold text', nesting: 0, children: [
      { type: 'text', content: 'Bold ' },
      { type: 'strong_open' },
      { type: 'text', content: 'text' },
      { type: 'strong_close' },
    ]},
    { type: 'paragraph_close', tag: 'p', nesting: -1 },
  ];
  const result = markdownItAST(tokens, 'Document Title');
  t.is(result.length, 1);
  t.is(result[0].type, 'paragraph');
  t.deepEqual(result[0].content, ['Bold text']);
});

test('markdownItAST: should handle code inline', (t) => {
  const tokens = [
    { type: 'paragraph_open', tag: 'p', nesting: 1 },
    { type: 'inline', content: 'Code: `hello`', nesting: 0, children: [
      { type: 'text', content: 'Code: ' },
      { type: 'code_inline', content: 'hello' },
    ]},
    { type: 'paragraph_close', tag: 'p', nesting: -1 },
  ];
  const result = markdownItAST(tokens, 'Document Title');
  t.is(result.length, 1);
  t.is(result[0].type, 'paragraph');
  t.deepEqual(result[0].content, ['Code: `hello`']);
});

test('markdownItAST: should handle empty tokens array', (t) => {
  const tokens = [];
  const result = markdownItAST(tokens, 'Document Title');
  t.is(result.length, 0);
});

test('markdownItAST: should handle unbalanced tokens', (t) => {
  const tokens = [
    { type: 'paragraph_open', tag: 'p', nesting: 1 },
    { type: 'inline', content: 'Unclosed paragraph', nesting: 0, children: [
      { type: 'text', content: 'Unclosed paragraph' },
    ]},
    // Missing paragraph_close
  ];
  t.throws(() => markdownItAST(tokens, 'Document Title'), { message: 'Unbalanced block open/close tokens.' });
});

test('markdownItAST: should handle text tokens with empty content', (t) => {
  const tokens = [
    { type: 'paragraph_open', tag: 'p', nesting: 1 },
    {
      type: 'inline',
      nesting: 0,
      content: '',
      children: [
        { type: 'text', content: '   ' }, // Whitespace only content
      ],
    },
    { type: 'paragraph_close', tag: 'p', nesting: -1 },
  ];
  const result = markdownItAST(tokens, 'Test Document');
  t.is(result.length, 0); // Empty content should be filtered out
});

test('markdownItAST: should handle softbreak and hardbreak tokens', (t) => {
  const tokens = [
    { type: 'paragraph_open', tag: 'p', nesting: 1 },
    {
      type: 'inline',
      nesting: 0,
      content: '',
      children: [
        { type: 'text', content: 'Hello' },
        { type: 'softbreak', content: '' },
        { type: 'hardbreak', content: '' },
        { type: 'text', content: 'world' },
      ],
    },
    { type: 'paragraph_close', tag: 'p', nesting: -1 },
  ];
  const result = markdownItAST(tokens, 'Test Document');
  t.is(result.length, 1);
  t.is(result[0].type, 'paragraph');
  t.deepEqual(result[0].content, ['Hello world']);
});

test('markdownItAST: should handle strong formatting tokens', (t) => {
  const tokens = [
    { type: 'paragraph_open', tag: 'p', nesting: 1 },
    {
      type: 'inline',
      nesting: 0,
      content: '',
      children: [
        { type: 'text', content: 'Hello' },
        { type: 'strong_open', content: '' },
        { type: 'text', content: 'bold' },
        { type: 'strong_close', content: '' },
        { type: 'text', content: 'world' },
      ],
    },
    { type: 'paragraph_close', tag: 'p', nesting: -1 },
  ];
  const result = markdownItAST(tokens, 'Test Document');
  t.is(result.length, 1);
  t.is(result[0].type, 'paragraph');
  t.deepEqual(result[0].content, ['Hello bold world']);
});

test('markdownItAST: should handle emphasis formatting tokens', (t) => {
  const tokens = [
    { type: 'paragraph_open', tag: 'p', nesting: 1 },
    {
      type: 'inline',
      nesting: 0,
      content: '',
      children: [
        { type: 'text', content: 'Hello' },
        { type: 'em_open', content: '' },
        { type: 'text', content: 'italic' },
        { type: 'em_close', content: '' },
        { type: 'text', content: 'world' },
      ],
    },
    { type: 'paragraph_close', tag: 'p', nesting: -1 },
  ];
  const result = markdownItAST(tokens, 'Test Document');
  t.is(result.length, 1);
  t.is(result[0].type, 'paragraph');
  t.deepEqual(result[0].content, ['Hello italic world']);
});

test('markdownItAST: should handle table of contents tokens', (t) => {
  const tokens = [
    { type: 'paragraph_open', tag: 'p', nesting: 1 },
    {
      type: 'inline',
      nesting: 0,
      content: '',
      children: [
        { type: 'text', content: 'Hello' },
        { type: 'toc_open', content: '' },
        { type: 'toc_body', content: '' },
        { type: 'toc_close', content: '' },
        { type: 'text', content: 'world' },
      ],
    },
    { type: 'paragraph_close', tag: 'p', nesting: -1 },
  ];
  const result = markdownItAST(tokens, 'Test Document');
  t.is(result.length, 1);
  t.is(result[0].type, 'paragraph');
  t.deepEqual(result[0].content, ['Hello world']);
});

test('markdownItAST: should handle footnote reference tokens', (t) => {
  const tokens = [
    { type: 'paragraph_open', tag: 'p', nesting: 1 },
    {
      type: 'inline',
      nesting: 0,
      content: '',
      children: [
        { type: 'text', content: 'Hello' },
        { type: 'footnote_ref', content: '', meta: { label: '1' } },
        { type: 'text', content: 'world' },
      ],
    },
    { type: 'paragraph_close', tag: 'p', nesting: -1 },
  ];
  const result = markdownItAST(tokens, 'Test Document');
  t.is(result.length, 1);
  t.is(result[0].type, 'paragraph');
  t.deepEqual(result[0].content, ['Hello (See footnote 1) world']);
});

test('markdownItAST: should handle unknown child token types', (t) => {
  const tokens = [
    { type: 'paragraph_open', tag: 'p', nesting: 1 },
    {
      type: 'inline',
      nesting: 0,
      content: '',
      children: [
        { type: 'text', content: 'Hello' },
        { type: 'unknown_token', content: 'unknown' },
        { type: 'text', content: 'world' },
      ],
    },
    { type: 'paragraph_close', tag: 'p', nesting: -1 },
  ];
  const result = markdownItAST(tokens, 'Test Document');
  t.is(result.length, 1);
  t.is(result[0].type, 'paragraph');
  t.deepEqual(result[0].content, ['Hello world']);
});

test('markdownItAST: should handle inline tokens without children', (t) => {
  const tokens = [
    { type: 'paragraph_open', tag: 'p', nesting: 1 },
    { type: 'inline', nesting: 0, content: 'Direct content' },
    { type: 'paragraph_close', tag: 'p', nesting: -1 },
  ];
  const result = markdownItAST(tokens, 'Test Document');
  t.is(result.length, 1);
  t.is(result[0].type, 'paragraph');
  t.deepEqual(result[0].content, ['Direct content']);
});

test('markdownItAST: should handle fence tokens', (t) => {
  const tokens = [
    { type: 'fence', nesting: 0, content: 'console.log("hello");', info: 'javascript' },
  ];
  const result = markdownItAST(tokens, 'Test Document');
  t.is(result.length, 1);
  t.is(result[0].type, 'code');
  t.true(result[0].content[0].includes('console.log("hello");'));
  t.true(result[0].content[0].includes('```javascript'));
});

test('markdownItAST: should handle code_block tokens', (t) => {
  const tokens = [
    { type: 'code_block', nesting: 0, content: 'const x = 1;', info: 'javascript' },
  ];
  const result = markdownItAST(tokens, 'Test Document');
  t.is(result.length, 1);
  t.is(result[0].type, 'code');
  t.true(result[0].content[0].includes('const x = 1;'));
  t.true(result[0].content[0].includes('```javascript'));
});

test('markdownItAST: should handle text tokens', (t) => {
  const tokens = [
    { type: 'text', nesting: 0, content: 'Plain text content' },
  ];
  const result = markdownItAST(tokens, 'Test Document');
  t.is(result.length, 0); // Text tokens are filtered out by removeEmptyItems
});

test('markdownItAST: should handle hr, softbreak, hardbreak tokens', (t) => {
  const tokens = [
    { type: 'hr', nesting: 0, content: '' },
    { type: 'softbreak', nesting: 0, content: '' },
    { type: 'hardbreak', nesting: 0, content: '' },
  ];
  const result = markdownItAST(tokens, 'Test Document');
  t.is(result.length, 0); // These should be skipped
});

test('markdownItAST: should handle unknown token types', (t) => {
  const tokens = [
    { type: 'unknown_token', nesting: 0, content: 'unknown' },
  ];
  const result = markdownItAST(tokens, 'Test Document');
  t.is(result.length, 0); // Unknown tokens are filtered out by removeEmptyItems
});

test('markdownItAST: should handle invalid nesting levels', (t) => {
  const tokens = [
    { type: 'paragraph_open', nesting: 2, content: 'invalid' }, // Invalid nesting level
  ];
  t.throws(() => markdownItAST(tokens, 'Test Document'), { message: /Invalid nesting level found in token/ });
});

test('markdownItAST: should handle image and link tokens', (t) => {
  const tokens = [
    { type: 'paragraph_open', tag: 'p', nesting: 1 },
    {
      type: 'inline',
      nesting: 0,
      content: '',
      children: [
        { type: 'text', content: 'Hello' },
        { type: 'image', content: '', attrs: [{ name: 'src', value: 'test.png' }] },
        { type: 'link_open', content: '', attrs: [{ name: 'href', value: 'test.html' }] },
        { type: 'text', content: 'link' },
        { type: 'link_close', content: '' },
        { type: 'text', content: 'world' },
      ],
    },
    { type: 'paragraph_close', tag: 'p', nesting: -1 },
  ];
  const result = markdownItAST(tokens, 'Test Document');
  t.is(result.length, 1);
  t.is(result[0].type, 'paragraph');
  t.deepEqual(result[0].content, ['Hello link world']); // Images and links should be ignored
});
