import test from 'ava';
import SqlWhereParser from '../../../src/plugins/storeage-provider-json/where-parser.js';
import parseQueryToFilterFunctions from '../../../src/plugins/storeage-provider-json/parse-query-filter-functions.js';

const docs = [
  {
    name: 'First Last',
    age: 27,
    iq: 91,
    size: 8,
    weight: 10,
    location: 'WA',
    favorite: null,
    tags: ['new', 'cool'],
    slug: 'first-last',
  },
  {
    name: '1st 2nd',
    age: 50,
    iq: 80,
    size: 12,
    weight: 20,
    location: 'NY',
    favorite: 'Chcolate',
    tags: ['old', 'cool'],
    slug: '1st-2nd',
  },
  {
    name: 'No Name',
    age: 10,
    iq: 40,
    size: 14,
    weight: 120,
    location: 'SF',
    favorite: '',
    tags: ['new', 'lame'],
    slug: 'no-name',
  },
  // Check against a completely null document
  {},
];

const filter = (query) => {
  const parser = new SqlWhereParser();
  const ast = parser.parse(query);
  const filters = parseQueryToFilterFunctions(ast);
  return [...docs].filter(filters);
};

let sql;
let out;

test('Level 0: IS', (t) => {
  sql = 'name IS "First Last"';
  out = filter(sql);
  t.is(out.length, 1);
});

test('Level 0: =', (t) => {
  sql = 'name = "First Last"';
  out = filter(sql);
  t.is(out.length, 1);
});

test('Level 0: !=', (t) => {
  sql = 'name != "First Last"';
  out = filter(sql);
  t.is(out.length, 2);
});

test('Level 0: <=', (t) => {
  sql = 'age <= 10';
  out = filter(sql);
  t.is(out.length, 1);

  sql = 'age <= 27';
  out = filter(sql);
  t.is(out.length, 2);

  sql = 'age <= 100';
  out = filter(sql);
  t.is(out.length, 3);
});

test('Level 0: <', (t) => {
  sql = 'age < 10';
  out = filter(sql);
  t.is(out.length, 0);

  sql = 'age < 27';
  out = filter(sql);
  t.is(out.length, 1);

  sql = 'age < 100';
  out = filter(sql);
  t.is(out.length, 3);
});

test('Level 0: >=', (t) => {
  sql = 'age >= 10';
  out = filter(sql);
  t.is(out.length, 3);

  sql = 'age >= 27';
  out = filter(sql);
  t.is(out.length, 2);

  sql = 'age >= 100';
  out = filter(sql);
  t.is(out.length, 0);
});

test('Level 0: >', (t) => {
  sql = 'age > 10';
  out = filter(sql);
  t.is(out.length, 2);

  sql = 'age > 27';
  out = filter(sql);
  t.is(out.length, 1);

  sql = 'age > 0';
  out = filter(sql);
  t.is(out.length, 3);
});

test('Level 0: LIKE', (t) => {
  sql = 'name LIKE "Last"';
  out = filter(sql);
  t.is(out.length, 1);
});

test('Level 0: IN', (t) => {
  sql = 'location IN (NY)';
  out = filter(sql);
  t.is(out.length, 1);

  sql = 'location IN (NY, SF)';
  out = filter(sql);
  t.is(out.length, 2);

  sql = 'location IN (NY, SF, WA)';
  out = filter(sql);
  t.is(out.length, 3);
});

test('Level 0: NOT_IN', (t) => {
  sql = 'location NOT_IN (NY)';
  out = filter(sql);
  t.is(out.length, 2);

  sql = 'location NOT_IN (NY, SF)';
  out = filter(sql);
  t.is(out.length, 1);

  sql = 'location NOT_IN (NY, SF, WA)';
  out = filter(sql);
  t.is(out.length, 0);

  sql = 'location NOT_IN (TN)';
  out = filter(sql);
  t.is(out.length, 3);
});

test('Level 0: INCLUDES', (t) => {
  sql = 'tags INCLUDES ("cool")';
  out = filter(sql);
  t.is(out.length, 2);

  sql = 'tags INCLUDES (new)';
  out = filter(sql);
  t.is(out.length, 2);

  sql = 'tags INCLUDES (old)';
  out = filter(sql);
  t.is(out.length, 1);

  sql = 'tags INCLUDES ("new", "cool")';
  out = filter(sql);
  t.is(out.length, 3);
});

test('Level 0: EXCLUDES', (t) => {
  sql = 'tags EXCLUDES ("cool")';
  out = filter(sql);
  t.is(out.length, 2);

  sql = 'tags EXCLUDES (new)';
  out = filter(sql);
  t.is(out.length, 2);

  sql = 'tags EXCLUDES (old)';
  out = filter(sql);
  t.is(out.length, 3);

  sql = 'tags EXCLUDES (old)';
  out = filter(sql);
  t.is(out.length, 3);

  sql = 'tags EXCLUDES ("new", "cool")';
  out = filter(sql);
  t.is(out.length, 1);
});

test('Level 0: IS_NULL', (t) => {
  sql = 'favorite IS_NULL';
  out = filter(sql);
  t.is(out.length, 3);
});

test('Level 0: IS_NOT_NULL', (t) => {
  sql = 'favorite IS_NOT_NULL';
  out = filter(sql);
  t.is(out.length, 1);
});

test('Level 0: BETWEEN', (t) => {
  sql = 'age BETWEEN 20 AND 60';
  out = filter(sql);
  t.is(out.length, 2);
});

test('Level 0: Missing Key', (t) => {
  sql = 'age WAKA 20';
  t.notThrows(() => {
    const ast = {
      'WAKA': [
        'slug',
        [
          'example-title',
          'fake',
        ],
      ],
    };
    parseQueryToFilterFunctions(ast);
  });
});

test('Level 1: >= AND <=', (t) => {
  sql = '(age >= 27 AND age <= 50)';
  out = filter(sql);
  t.is(out.length, 2);
});

test('Level 1: IN AND =', (t) => {
  sql = '(location IN (NY, America) AND favorite = "Chcolate")';
  out = filter(sql);
  t.is(out.length, 1);
});

test('Level 1: IN , =', (t) => {
  sql = '(location IN (NY, America), favorite = "Chcolate")';
  out = filter(sql);
  t.is(out.length, 1);
});

test('Level 1: IN OR LIKE', (t) => {
  sql = '(location IN (NY, WA) OR name LIKE "Name")';
  out = filter(sql);
  t.is(out.length, 3);
});

test('Level 1: INCLUDES AND EXCLUDES', (t) => {
  sql = '(tags INCLUDES ("cool")) AND (tags EXCLUDES ("new"))';
  out = filter(sql);
  t.is(out.length, 1);

  sql = '(tags INCLUDES ("cool")) AND (tags EXCLUDES ("old"))';
  out = filter(sql);
  t.is(out.length, 1);

  sql = '(tags INCLUDES ("new")) AND (tags EXCLUDES ("lame"))';
  out = filter(sql);
  t.is(out.length, 1);

  sql = '(tags INCLUDES ("lame")) AND (tags EXCLUDES ("new"))';
  out = filter(sql);
  t.is(out.length, 0);
});

test('Level 2: = AND = AND (= OR = AND IN AND =)', (t) => {
  sql = 'name = "First Last" AND age = 27 AND (favorite = vanilla OR size = 8 AND location IN (NY, WA) AND weight = 10)';
  out = filter(sql);
  t.is(out.length, 1);
});

test('Level 2: Hyphonated Strings used with IN', (t) => {
  sql = 'slug IN ("first-last","no-name")';
  out = filter(sql);
  t.is(out.length, 2);
  sql = 'slug IN ("no-name")';
  out = filter(sql);
  t.is(out.length, 1);
  sql = 'slug IN ("no-name","not-real")';
  out = filter(sql);
  t.is(out.length, 1);
});
