import test from 'ava';
import EmailHandler from '../../../src/plugins/form-handlers/email-handler.js';

const formConfig = /** @type {import('../../../src/plugins/form-handler.js').FormConfig} */ ({ name: 'contact', fields: [] });

test('template placeholders use literal field names and replacement values', (t) => {
  const fields = { 'a.b': '$&', 'name[': 'valid' };
  const template = '{a.b} / {axb} / {name[}';

  t.is(EmailHandler.generateSubject(template, fields, formConfig), '$& / {axb} / valid');
  t.is(EmailHandler.generateBody(template, fields, formConfig), '$& / {axb} / valid');
});
