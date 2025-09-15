
import test from 'ava';
import SqlWhereParser from '../../../src/plugins/storeage-provider-json/where-parser.js';
import Operator from '../../../src/plugins/storeage-provider-json/operator.js';
import { TokenizeThis } from '../../../src/plugins/storeage-provider-json/tokenizer.js';

test('parse(sql): parses the WHERE portion of an SQL-like string into an abstract syntax tree', (t) => {
  const sql = 'name = "First Last" AND age >= 27';
  const parser = new SqlWhereParser();
  const parsed = parser.parse(sql);
  t.deepEqual(parsed, {
    AND: [
      {
        '=': ['name', 'First Last'],
      },
      {
        '>=': ['age', 27],
      },
    ],
  });
});

test('You can also evaluate the query in-line as the expressions are being built', (t) => {
  const sql = 'name = "First Last" AND age >= (20 + 7)';
  const parser = new SqlWhereParser();

  /**
   * This evaluator function will evaluate the "+" operator with its operands by adding its operands together.
   */
  const parsed = parser.parse(sql, (operatorValue, operands) => {
    if (operatorValue === '+') {
      return operands[0] + operands[1];
    }
    return SqlWhereParser.defaultEvaluator(operatorValue, operands);
  });

  t.deepEqual(parsed, {
    AND: [
      {
        '=': ['name', 'First Last'],
      },
      {
        '>=': ['age', 27],
      },
    ],
  });
});

test('This evaluation can also be used to convert the AST into a specific tree, like a MongoDB query', (t) => {
  const sql = 'name = "First Last" AND age >= 27';
  const parser = new SqlWhereParser();

  /**
   * This will map each operand to its mongoDB equivalent.
   */
  const parsed = parser.parse(sql, (operatorValue, operands) => {
    switch (operatorValue) {
      case '=':
        return {
          [operands[0]]: operands[1],
        };
      case 'AND':
        return {
          $and: operands,
        };
      case '>=':
        return {
          [operands[0]]: {
            $gte: operands[1],
          },
        };
      default:
        return undefined;
    }
  });

  t.deepEqual(parsed, {
    $and: [
      {
        name: 'First Last',
      },
      {
        age: {
          $gte: 27,
        },
      },
    ],
  });
});

test('This can be used to create new operators', (t) => {
  // start off with the default config.
  const config = {
    operators: [
      {
        '!': 1,
      },
      {},
      {
        '^': 2,
      },
      {
        '*': 2,
        '/': 2,
        '%': 2,
      },
      {
        '+': 2,
        '-': 2,
      },
      {
        '=': 2,
        '<': 2,
        '>': 2,
        '<=': 2,
        '>=': 2,
        '!=': 2,
      },
      {
        ',': 2,
      },
      {
        NOT: 1,
      },
      {
        BETWEEN: 3,
        IN: 2,
        IS: 2,
        IS_NULL: 1,
        IS_NOT_NULL: 1,
        LIKE: 2,
      },
      {
        AND: 2,
      },
      {
        OR: 2,
      },
    ],
    tokenizer: {
      shouldTokenize: ['(', ')', ',', '*', '/', '%', '+', '-', '=', '!=', '!', '<', '>', '<=', '>=', '^'],
      shouldMatch: ['"', '\'', '`'],
      shouldDelimitBy: [' ', '\n', '\r', '\t'],
    },
  };

  config.operators[5]['<=>'] = 2; // number of operands to expect for this operator.
  config.operators[5]['<>'] = 2; // number of operands to expect for this operator.

  config.tokenizer.shouldTokenize.push('<=>', '<>');

  const sql = 'name <> "First Last" AND age <=> 27';
  const parser = new SqlWhereParser(config); // use the new config

  const parsed = parser.parse(sql);

  t.deepEqual(parsed, {
    AND: [
      {
        '<>': ['name', 'First Last'],
      },
      {
        '<=>': ['age', 27],
      },
    ],
  });
});

test('#parse(sql:String):Object: Parses the SQL string into an AST with the proper order of operations', (t) => {
  const sql = 'name = "First Last" AND job = developer AND (gender = male OR type = person AND location IN (NY, America) AND hobby = coding)';
  const parser = new SqlWhereParser();
  const parsed = parser.parse(sql);

  /**
   * Original.
   */
  // 'name = "First Last" AND job = developer AND (gender = male OR type = person AND location IN (NY, America) AND hobby = coding)';
  /**
   * Perform equals.
   */
  // '(name = "First Last") AND (job = developer) AND ((gender = male) OR (type = person) AND location IN (NY, America) AND (hobby = coding))';
  /**
   * Perform IN
   */
  // '(name = "First Last") AND (job = developer) AND ((gender = male) OR (type = person) AND (location IN (NY, America)) AND (hobby = coding))';
  /**
   * Perform AND
   */
  // '(((name = "First Last") AND (job = developer)) AND ((gender = male) OR (((type = person) AND (location IN (NY, America))) AND (hobby = coding))))';

  t.deepEqual(parsed, {
    AND: [
      {
        AND: [
          {
            '=': ['name', 'First Last'],
          },
          {
            '=': ['job', 'developer'],
          },
        ],
      },
      {
        OR: [
          {
            '=': ['gender', 'male'],
          },
          {
            AND: [
              {
                AND: [
                  {
                    '=': ['type', 'person'],
                  },
                  {
                    IN: ['location', ['NY', 'America']],
                  },
                ],
              },
              {
                '=': ['hobby', 'coding'],
              },
            ],
          },
        ],
      },
    ],
  });
});

test('#parse(sql:String):Object: It handles the unary minus case appropriately', (t) => {
  const parser = new SqlWhereParser();
  let parsed = parser.parse('1 + -5');

  t.deepEqual(parsed, {
    '+': [
      1,
      {
        '-': [5],
      },
    ],
  });

  parsed = parser.parse('-1 + -(5 - - 5)');

  t.deepEqual(parsed, {
    '+': [
      {
        '-': [1],
      },
      {
        '-': [
          {
            '-': [
              5,
              {
                '-': [5],
              },
            ],
          },
        ],
      },
    ],
  });
});

test('#parse(sql:String):Object: It handles the BETWEEN case appropriately', (t) => {
  const parser = new SqlWhereParser();
  const parsed = parser.parse('A BETWEEN 5 AND 10 AND B = C');

  t.deepEqual(parsed, {
    AND: [
      {
        BETWEEN: ['A', 5, 10],
      },
      {
        '=': ['B', 'C'],
      },
    ],
  });
});

test('#parse(sql:String):Object: It handles the INCLUDES case appropriately', (t) => {
  const parser = new SqlWhereParser();
  const parsed = parser.parse('tags INCLUDES ("cool", "new")');

  t.deepEqual(parsed, {
    INCLUDES: [
      'tags',
      [
        'cool',
        'new',
      ],
    ],
  });
});

test('#parse(sql:String):Object: It handles the EXCLUDES case appropriately', (t) => {
  const parser = new SqlWhereParser();
  const parsed = parser.parse('tags EXCLUDES ("cool", "new")');

  t.deepEqual(parsed, {
    EXCLUDES: [
      'tags',
      [
        'cool',
        'new',
      ],
    ],
  });
});

test('#parse(sql:String):Object: It handles the INCLUDES AND EXCLUDES case appropriately', (t) => {
  const parser = new SqlWhereParser();
  const parsed = parser.parse('(tags INCLUDES ("lame", "fake")) AND (tags EXCLUDES ("cool", "new"))');

  t.deepEqual(parsed, {
    AND: [
      {
        INCLUDES: [
          'tags',
          [
            'lame',
            'fake',
          ],
        ],
      },
      {
        EXCLUDES: [
          'tags',
          [
            'cool',
            'new',
          ],
        ],
      },
    ],

  });
});

test('#parse(sql:String):Object: Unnecessarily nested parentheses do not matter', (t) => {
  const sql = '((((name = "First Last")) AND (age >= 27)))';
  const parser = new SqlWhereParser();
  const parsed = parser.parse(sql);

  t.deepEqual(parsed, {
    AND: [
      {
        '=': ['name', 'First Last',
        ],
      },
      {
        '>=': ['age', 27],
      },
    ],
  });
});

test('#parse(sql:String):Object: Throws a SyntaxError if the supplied parentheses do not match', (t) => {
  const sql = '(name = "First Last" AND age >= 27';
  const parser = new SqlWhereParser({ wrapQuery: false });
  t.throws(() => {
    parser.parse(sql);
  }, { message: 'Unmatched parentheses.' });
});

test('#parse(sql:String):Object: throws a SyntaxError if the supplied brackets do not match in parentheses', (t) => {
  const sql = '([a, b, c)';
  const parser = new SqlWhereParser({ wrapQuery: false });
  t.throws(() => {
    parser.parse(sql);
  }, { message: 'Unmatched pair within parentheses, cannot find value of: [' });
});

test('#parse(sql:String):Object: throws a SyntaxError if the supplied brackets do not match', (t) => {
  const sql = '[a, b, c';
  const parser = new SqlWhereParser({ wrapQuery: false });
  t.throws(() => {
    parser.parse(sql);
  }, { message: 'Unmatched bracket.' });
});

test('#parse(sql:String):Object: throws a SyntaxError if the supplied brackets contain a missing match', (t) => {
  const sql = '[a, b, (]';
  const parser = new SqlWhereParser({ wrapQuery: false });
  t.throws(() => {
    parser.parse(sql);
  }, { message: 'Unmatched pair within brackets, no operator matches: (' });
});

test('#parse(sql:String, evaluator:Function):*: Uses the supplied `evaluator(operatorValue:String|Symbol, operands:Array)` function to convert an operator and its operands into its evaluation. '
              + 'The default evaluator actually does no "evaluation" in the mathematical sense. '
              + 'Instead it creates an object whose key is the operator, and the value is an array of the operands', (t) => {
  let timesCalled = 0;

  const sql = 'name = "First Last" AND age >= 27';
  const parser = new SqlWhereParser();

  const parsed = parser.parse(sql, (operatorValue, operands) => {
    timesCalled++;
    return SqlWhereParser.defaultEvaluator(operatorValue, operands);
  });

  t.is(timesCalled, 3);

  t.deepEqual(parsed, {
    AND: [
      {
        '=': ['name', 'First Last',
        ],
      },
      {
        '>=': ['age', 27],
      },
    ],
  });
});

test('#parse(sql, evaluator): can parse arrays back to arrays', (t) => {
  const sql = '[NY, LA] IN (NY, America)';
  const parser = new SqlWhereParser();
  const parsed = parser.parse(sql, SqlWhereParser.defaultEvaluator);
  t.deepEqual(parsed, {
    IN: [
      ['NY', 'LA'],
      ['NY', 'America'],
    ],
  });
});

test('#parse(sql, evaluator): "Evaluation" is subjective, and this can be exploited to convert the default object-based structure of the AST into something else, like this array-based structure', (t) => {
  const sql = '(name = "First Last" AND age >= 27)';
  const parser = new SqlWhereParser();

  const parsed = parser.parse(sql, (operatorValue, operands) => [operatorValue, operands]);

  t.deepEqual(parsed, [
    'AND',
    [
      ['=', ['name', 'First Last']],
      ['>=', ['age', 27]],
    ],
  ]);
});

test('#operatorPrecedenceFromValues(operatorValue1:String|Symbol, operatorValue2:String|Symbol):Boolean: Determines if operator 2 is of a higher precedence than operator 1', (t) => {
  const parser = new SqlWhereParser();

  t.false(parser.operatorPrecedenceFromValues('AND', 'OR')); // AND is higher than OR
  t.true(parser.operatorPrecedenceFromValues('+', '-')); // + and - are equal
  t.true(parser.operatorPrecedenceFromValues('+', '*')); // * is higher than +
});

test('#operatorPrecedenceFromValues(operatorValue1:String|Symbol, operatorValue2:String|Symbol):Boolean: It also works if either of the operator values are a Symbol instead of a String', (t) => {
  const parser = new SqlWhereParser();

  t.false(parser.operatorPrecedenceFromValues(Operator.type('unary-minus'), '-')); // unary minus is higher than minus
});

test('#getOperator(operatorValue:String|Symbol):Operator: Returns the corresponding instance of the Operator class', (t) => {
  const parser = new SqlWhereParser();
  const minus = parser.getOperator('-');

  t.true(minus instanceof Operator);
  t.is(minus.value, '-');
  t.is(minus.precedence, 4);
  t.is(minus.type, 2); // its binary
});

test('#getOperator(operatorValue:String|Symbol):Operator: It also works if the operator value is a Symbol instead of a String', (t) => {
  const parser = new SqlWhereParser();
  const unaryMinus = parser.getOperator(Operator.type('unary-minus'));

  t.true(unaryMinus instanceof Operator);
  t.is(unaryMinus.value, Operator.type('unary-minus'));
  t.is(unaryMinus.precedence, 1);
  t.is(unaryMinus.type, 1); // its unary
});

test('#getOperator(operatorValue:String|Symbol):Operator: returns null when nothing is matched', (t) => {
  const parser = new SqlWhereParser();
  const unaryMinus = parser.getOperator();

  t.is(unaryMinus, null);
});

test('SqlWhereParser.defaultEvaluator(operatorValue:String|Symbol, operands:Array): Converts the operator and its operands into an object whose key is the operator value, and the value is the array of operands', (t) => {
  const evaluation = SqlWhereParser.defaultEvaluator('OPERATOR', [1, 2, 3]);
  t.deepEqual(evaluation, {
    OPERATOR: [1, 2, 3],
  });
});

test('SqlWhereParser.defaultEvaluator(operatorValue:String|Symbol, operands:Array): ...Except for the special "," operator, which acts like a binary operator, but is not really an operator. It combines anything comma-separated into an array', (t) => {
  const evaluation = SqlWhereParser.defaultEvaluator(',', [1, 2]);
  t.deepEqual(evaluation, [1, 2]);
});

test('SqlWhereParser.defaultEvaluator(operatorValue:String|Symbol, operands:Array): When used in the recursive manner that it is, we are able to combine the results of several binary comma operations into a single array', (t) => {
  const evaluation = SqlWhereParser.defaultEvaluator(',', [[1, 2], 3]);
  t.deepEqual(evaluation, [1, 2, 3]);
});

test('SqlWhereParser.defaultEvaluator(operatorValue:String|Symbol, operands:Array): With the unary minus Symbol, it converts it back into a regular minus string, since the operands have been determined by this point', (t) => {
  const evaluation = SqlWhereParser.defaultEvaluator(Operator.type('unary-minus'), [1]);
  t.deepEqual(evaluation, { '-': [1] });
});

test('.tokenizer: The tokenizer used on the string', (t) => {
  const parser = new SqlWhereParser();
  t.true(parser.tokenizer instanceof TokenizeThis);
});

test('.operators: An object whose keys are the supported operator values, and whose values are instances of the Operator class', (t) => {
  const parser = new SqlWhereParser();
  const operators = ['!', Operator.type('unary-minus'), '^', '*', '/', '%', '+', '-', '=', '<', '>', '<=', '>=', '!=', ',', 'NOT', 'BETWEEN', 'IN', 'IS', 'LIKE', 'AND', 'OR'];

  operators.forEach((operator) => {
    t.true(parser.operators[operator] instanceof Operator);
  });
});
