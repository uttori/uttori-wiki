import test from 'ava';
import sinon from 'sinon';
import EmailHandler from '../../../src/plugins/form-handlers/email-handler.js';

/**
 * Builds a nodemailer-compatible transport plugin object.
 * @param {{ reject?: boolean }} [opts]
 * @returns {object} Transport plugin
 */
const makeTransport = ({ reject = false } = {}) => ({
  name: 'test-transport',
  version: '1.0.0',
  send: (mail, callback) => {
    if (reject) {
      callback(new Error('Connection refused'));
    } else {
      callback(null, { messageId: '<test-id@localhost>' });
    }
  },
});

/** @type {import('sinon').SinonSandbox} */
let sandbox;
test.beforeEach(() => {
  sandbox = sinon.createSandbox();
});

test.afterEach(() => {
  sandbox.restore();
});

// ── create ────────────────────────────────────────────────────────────────────

test('create: throws when transportOptions is missing', (t) => {
  t.throws(() => EmailHandler.create({ from: 'a@b.com', to: 'c@d.com' }), {
    message: 'Email handler requires transportOptions, from, and to configuration',
  });
});

test('create: throws when from is missing', (t) => {
  t.throws(() => EmailHandler.create({ transportOptions: {}, to: 'c@d.com' }), {
    message: 'Email handler requires transportOptions, from, and to configuration',
  });
});

test('create: throws when to is missing', (t) => {
  t.throws(() => EmailHandler.create({ transportOptions: {}, from: 'a@b.com' }), {
    message: 'Email handler requires transportOptions, from, and to configuration',
  });
});

test('create: returns a function with valid config', (t) => {
  const handler = EmailHandler.create({
    transportOptions: makeTransport(),
    from: 'a@b.com',
    to: 'c@d.com',
    subject: 'Test',
  });
  t.is(typeof handler, 'function');
});

test('create: handler resolves with success on successful send', async (t) => {
  const handler = EmailHandler.create({
    transportOptions: makeTransport(),
    from: 'sender@example.com',
    to: 'receiver@example.com',
    subject: 'Hello {name}',
  });

  /** @type {import('../../../src/plugins/form-handler.js').FormConfig} */
  const formConfig = /** @type {any} */ ({ name: 'contact', fields: [] });

  const result = await handler({ name: 'World' }, formConfig, null, null);

  t.true(result.success);
  t.is(result.message, 'Email sent successfully');
});

test('create: handler resolves with failure when sendMail throws', async (t) => {
  const handler = EmailHandler.create({
    transportOptions: makeTransport({ reject: true }),
    from: 'sender@example.com',
    to: 'receiver@example.com',
    subject: 'Test',
  });

  /** @type {import('../../../src/plugins/form-handler.js').FormConfig} */
  const formConfig = /** @type {any} */ ({ name: 'contact', fields: [] });

  const result = await handler({}, formConfig, null, null);

  t.false(result.success);
  t.true(result.message.includes('Failed to send email'));
  t.true(result.message.includes('Connection refused'));
});

test('create: handler uses template for both subject and body', async (t) => {
  const renderStub = sandbox.stub();
  const handler = EmailHandler.create({
    transportOptions: {
      name: 'spy-transport',
      version: '1.0.0',
      send: (mail, callback) => {
        renderStub(mail.data);
        callback(null, { messageId: 'x' });
      },
    },
    from: 'a@b.com',
    to: 'c@d.com',
    subject: 'Sub: {formName}',
    template: '<p>Body: {formName}</p>',
  });

  /** @type {import('../../../src/plugins/form-handler.js').FormConfig} */
  const formConfig = /** @type {any} */ ({ name: 'my-form', fields: [] });
  await handler({}, formConfig, null, null);

  t.true(renderStub.calledOnce);
  const mailData = renderStub.firstCall.args[0];
  t.true(mailData.subject.includes('my-form'));
  t.true(mailData.html.includes('my-form'));
});

// ── generateSubject ───────────────────────────────────────────────────────────

test('generateSubject: uses default subject when no template is given', (t) => {
  const formConfig = /** @type {any} */ ({ name: 'contact' });
  const subject = EmailHandler.generateSubject('', {}, formConfig);
  t.is(subject, 'Form Submission: contact');
});

test('generateSubject: replaces {formName} placeholder', (t) => {
  const formConfig = /** @type {any} */ ({ name: 'newsletter' });
  const subject = EmailHandler.generateSubject('New entry: {formName}', {}, formConfig);
  t.is(subject, 'New entry: newsletter');
});

test('generateSubject: replaces {timestamp} placeholder', (t) => {
  const formConfig = /** @type {any} */ ({ name: 'x' });
  const subject = EmailHandler.generateSubject('Sent at {timestamp}', {}, formConfig);
  t.regex(subject, /Sent at \d{4}-\d{2}-\d{2}T/);
});

test('generateSubject: replaces arbitrary field placeholders', (t) => {
  const formConfig = /** @type {any} */ ({ name: 'form' });
  const formData = { email: 'user@example.com', name: 'Alice' };
  const subject = EmailHandler.generateSubject('From {name} <{email}>', formData, formConfig);
  t.is(subject, 'From Alice <user@example.com>');
});

test('generateSubject: handles undefined template (falsy)', (t) => {
  const formConfig = /** @type {any} */ ({ name: 'signup' });
  const subject = EmailHandler.generateSubject(undefined, {}, formConfig);
  t.is(subject, 'Form Submission: signup');
});

// ── generateBody ─────────────────────────────────────────────────────────────

test('generateBody: returns custom template when provided', (t) => {
  const formConfig = /** @type {any} */ ({ name: 'contact' });
  const formData = { message: 'Hello!' };
  const body = EmailHandler.generateBody('<p>{message}</p>', formData, formConfig);
  t.is(body, '<p>Hello!</p>');
});

test('generateBody: replaces {formName} in template', (t) => {
  const formConfig = /** @type {any} */ ({ name: 'survey' });
  const body = EmailHandler.generateBody('<h1>{formName}</h1>', {}, formConfig);
  t.is(body, '<h1>survey</h1>');
});

test('generateBody: replaces {timestamp} in template', (t) => {
  const formConfig = /** @type {any} */ ({ name: 'x' });
  const body = EmailHandler.generateBody('Time: {timestamp}', {}, formConfig);
  t.regex(body, /Time: \d{4}-\d{2}-\d{2}T/);
});

test('generateBody: builds default HTML body when no template is given', (t) => {
  const formConfig = /** @type {any} */ ({ name: 'order' });
  const formData = { product: 'Widget', qty: 3 };
  const body = EmailHandler.generateBody(undefined, formData, formConfig);

  t.true(body.includes('<h2>Form Submission: order</h2>'));
  t.true(body.includes('<strong>product:</strong>'));
  t.true(body.includes('Widget'));
  t.true(body.includes('<strong>qty:</strong>'));
  t.true(body.includes('3'));
  t.true(body.startsWith('<h2>'));
  t.true(body.endsWith('</ul>'));
});

test('generateBody: default body includes all form data fields', (t) => {
  const formConfig = /** @type {any} */ ({ name: 'form' });
  const formData = { a: '1', b: '2', c: '3' };
  const body = EmailHandler.generateBody(null, formData, formConfig);

  t.true(body.includes('<strong>a:</strong>'));
  t.true(body.includes('<strong>b:</strong>'));
  t.true(body.includes('<strong>c:</strong>'));
});

test('generateBody: returns empty template body when template is empty string', (t) => {
  const formConfig = /** @type {any} */ ({ name: 'form' });
  const body = EmailHandler.generateBody('', {}, formConfig);
  // Empty string is falsy, falls through to default template
  t.true(body.includes('<h2>Form Submission: form</h2>'));
});
