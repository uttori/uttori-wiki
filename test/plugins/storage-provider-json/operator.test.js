import test from 'ava';
import Operator from '../../../src/plugins/storeage-provider-json/operator.js';

test('#toJSON: returns the JSON value', (t) => {
  t.is(new Operator('=', 2, 5).toJSON(), '=');
  t.is(new Operator('AND', 2, 9).toJSON(), 'AND');
  t.is(new Operator('>=', 2, 5).toJSON(), '>=');
  t.is(new Operator('+', 2, 4).toJSON(), '+');
});

test('#toString: returns the string value', (t) => {
  t.is(new Operator('=', 2, 5).toString(), '=');
  t.is(new Operator('AND', 2, 9).toString(), 'AND');
  t.is(new Operator('>=', 2, 5).toString(), '>=');
  t.is(new Operator('+', 2, 4).toString(), '+');
});

test('Operator.type: returns the numeric value for a type', (t) => {
  t.is(Operator.type('unary-minus').toString(), Symbol('-').toString());
  t.is(Operator.type('unary'), 1);
  t.is(Operator.type('binary'), 2);
  t.is(Operator.type('ternary'), 3);
});

test('Operator.type: throws an error when a type is not found', (t) => {
  const error = t.throws(() => {
    Operator.type('quad');
  });
  t.is(error.message, 'Unknown Operator Type: quad');
});
