import test from 'ava';
import { TokenizeThis } from '../../../src/plugins/storeage-provider-json/tokenizer.js';

test('TokenizeThis: It turns a string into tokens!', (t) => {
  const tokenizer = new TokenizeThis();
  const str = 'Tokenize this!';

  const tokens = [];

  tokenizer.tokenize(str, (token) => {
    tokens.push(token);
  });

  t.deepEqual(tokens, ['Tokenize', 'this', '!']);
});

test('TokenizeThis: By default, it can tokenize math-based strings', (t) => {
  const tokenizer = new TokenizeThis();
  const str = '5 + 6 -(4/2) + gcd(10, 5)';

  const tokens = [];

  tokenizer.tokenize(str, (token) => {
    tokens.push(token);
  });

  t.deepEqual(tokens, [5, '+', 6, '-', '(', 4, '/', 2, ')', '+', 'gcd', '(', 10, ',', 5, ')']);
});

test('TokenizeThis: ...Or SQL', (t) => {
  const tokenizer = new TokenizeThis();
  const str = 'SELECT COUNT(id), 5+6 FROM `users` WHERE name = "shaun persad" AND hobby IS NULL';

  const tokens = [];

  tokenizer.tokenize(str, (token, surroundedBy) => {
    if (surroundedBy) {
      tokens.push(surroundedBy + token + surroundedBy);
    } else {
      tokens.push(token);
    }
  });

  t.deepEqual(tokens, [
    'SELECT',
    'COUNT', '(', 'id', ')',
    ',',
    5, '+', 6,
    'FROM', '`users`',
    'WHERE',
    'name', '=', '"shaun persad"',
    'AND',
    'hobby', 'IS', null,
  ]);
});

test('TokenizeThis: `require` it, create a new instance, then call `tokenize`', (t) => {
  const tokenizer = new TokenizeThis();
  const str = 'Hi!, I want to add 5+6';
  const tokens = [];

  tokenizer.tokenize(str, (token) => {
    tokens.push(token);
  });

  t.deepEqual(tokens, ['Hi', '!', ',', 'I', 'want', 'to', 'add', 5, '+', 6]);
});

test('TokenizeThis: This can be used to tokenize many forms of data, like JSON into key-value pairs', (t) => {
  const jsonConfig = {
    shouldTokenize: ['{', '}', '[', ']'],
    shouldMatch: ['"'],
    shouldDelimitBy: [' ', '\n', '\r', '\t', ':', ','],
    convertLiterals: true,
    escapeCharacter: '\\',
  };

  const tokenizer = new TokenizeThis(jsonConfig);

  const str = '[{name:"Shaun Persad", id: 5}, { gender : null}]';

  const tokens = [];

  tokenizer.tokenize(str, (token) => {
    tokens.push(token);
  });

  t.deepEqual(tokens, ['[', '{', 'name', 'Shaun Persad', 'id', 5, '}', '{', 'gender', null, '}', ']']);
});

test('TokenizeThis: Here it is tokenizing XML like a boss', (t) => {
  const xmlConfig = {
    shouldTokenize: ['<?', '?>', '<!', '<', '</', '>', '/>', '='],
    shouldMatch: ['"'],
    shouldDelimitBy: [' ', '\n', '\r', '\t'],
    convertLiterals: true,
  };

  const tokenizer = new TokenizeThis(xmlConfig);

  const str = `
          <?xml-stylesheet href="catalog.xsl" type="text/xsl"?>
          <!DOCTYPE catalog SYSTEM "catalog.dtd">
          <catalog>
              <product description="Cardigan Sweater" product_image="cardigan.jpg">
                <size description="Large" />
                <color_swatch image="red_cardigan.jpg">
                  Red
                </color_swatch>
              </product>
          </catalog>
      `;

  const tokens = [];

  tokenizer.tokenize(str, (token) => {
    tokens.push(token);
  });

  t.deepEqual(tokens, [
    '<?', 'xml-stylesheet', 'href', '=', 'catalog.xsl', 'type', '=', 'text/xsl', '?>',
    '<!', 'DOCTYPE', 'catalog', 'SYSTEM', 'catalog.dtd', '>',
    '<', 'catalog', '>',
    '<', 'product', 'description', '=', 'Cardigan Sweater', 'product_image', '=', 'cardigan.jpg', '>',
    '<', 'size', 'description', '=', 'Large', '/>',
    '<', 'color_swatch', 'image', '=', 'red_cardigan.jpg', '>',
    'Red',
    '</', 'color_swatch', '>',
    '</', 'product', '>',
    '</', 'catalog', '>',
  ]);
});

test('TokenizeThis: #tokenize(str:String, forEachToken:Function): sends each token to the `forEachToken(token:String, surroundedBy:String)` callback', (t) => {
  const tokenizer = new TokenizeThis();
  const str = 'Tokenize "this"!';

  const tokens = [];
  const forEachToken = (token, surroundedBy) => {
    tokens.push(surroundedBy + token + surroundedBy);
  };

  tokenizer.tokenize(str, forEachToken);

  t.deepEqual(tokens, ['Tokenize', '"this"', '!']);
});

test('TokenizeThis: #tokenize(str:String, forEachToken:Function): it converts `true`, `false`, `null`, and numbers into their literal versions', (t) => {
  const tokenizer = new TokenizeThis();
  const str = 'true false null TRUE FALSE NULL 1 2 3.4 5.6789';

  const tokens = [];

  tokenizer.tokenize(str, (token, _surroundedBy) => {
    tokens.push(token);
  });

  t.deepEqual(tokens, [true, false, null, true, false, null, 1, 2, 3.4, 5.6789]);
});

test('TokenizeThis: You can change converting to literals with the `convertLiterals` config option', (t) => {
  const config = {
    convertLiterals: false,
  };
  const tokenizer = new TokenizeThis(config);
  const str = 'true false null TRUE FALSE NULL 1 2 3.4 5.6789';

  const tokens = [];

  tokenizer.tokenize(str, (token, _surroundedBy) => {
    tokens.push(token);
  });

  t.deepEqual(tokens, ['true', 'false', 'null', 'TRUE', 'FALSE', 'NULL', '1', '2', '3.4', '5.6789']);
});

test('TokenizeThis: Any strings surrounded by the quotes specified in the `shouldMatch` option are treated as whole tokens', (t) => {
  const config = {
    shouldMatch: ['"', '`', '#'],
  };
  const tokenizer = new TokenizeThis(config);
  const str = '"hi there" `this is a test` #of quotes#';

  const tokens = [];
  const tokensQuoted = [];

  tokenizer.tokenize(str, (token, surroundedBy) => {
    tokens.push(token);
    tokensQuoted.push(surroundedBy + token + surroundedBy);
  });

  t.deepEqual(tokens, ['hi there', 'this is a test', 'of quotes']);
  t.deepEqual(tokensQuoted, ['"hi there"', '`this is a test`', '#of quotes#']);
});

test('TokenizeThis: Quotes can be escaped via a backslash', (t) => {
  const tokenizer = new TokenizeThis();
  const str = 'These are "\\"quotes\\""';

  const tokens = [];

  tokenizer.tokenize(str, (token, _surroundedBy) => {
    tokens.push(token);
  });

  t.deepEqual(tokens, ['These', 'are', '"quotes"']);
});

test('TokenizeThis: The escape character can be specified with the `escapeCharacter` option', (t) => {
  const config = {
    escapeCharacter: '#',
  };
  const tokenizer = new TokenizeThis(config);
  const str = 'These are "#"quotes#""';

  const tokens = [];

  tokenizer.tokenize(str, (token, _surroundedBy) => {
    tokens.push(token);
  });

  t.deepEqual(tokens, ['These', 'are', '"quotes"']);
});
