import test from 'ava';
import express from 'express';
import request from 'supertest';
import FormHandler from '../../src/plugins/form-handler.js';
import { EventDispatcher } from '@uttori/event-dispatcher';

test('configKey: has correct configKey', (t) => {
  t.is(FormHandler.configKey, 'uttori-plugin-form-handler');
});

test('defaultConfig: has default config', (t) => {
  const config = FormHandler.defaultConfig();
  t.is(typeof config.baseRoute, 'string');
  t.true(Array.isArray(config.forms));
  t.is(typeof config.defaultHandler, 'function');
});

test('validateConfig: throws on missing config key', (t) => {
  const invalidConfig = {
    'wrong-key': {
      forms: [],
    },
  };

  t.throws(() => FormHandler.validateConfig(invalidConfig), {
    message: /Config Error.*configuration key is missing/,
  });
});

test('validateConfig: throws on invalid forms array', (t) => {
  const invalidConfig = {
    [FormHandler.configKey]: {
      forms: 'not-an-array',
    },
  };

  t.throws(() => FormHandler.validateConfig(invalidConfig), {
    message: /Config Error.*forms.*should be an array/,
  });
});

test('validateConfig: throws on missing baseRoute', (t) => {
  const invalidConfig = {
    [FormHandler.configKey]: {
      forms: [],
    },
  };

  t.throws(() => FormHandler.validateConfig(invalidConfig), {
    message: /Config Error.*baseRoute.*should be a string/,
  });
});

test('validateConfig: throws on missing form name', (t) => {
  const invalidConfig = {
    [FormHandler.configKey]: {
      baseRoute: '/forms',
      forms: [
        {
          route: '/test',
          fields: [],
        },
      ],
    },
  };

  t.throws(() => FormHandler.validateConfig(invalidConfig), {
    message: /Config Error.*form must have a.*name.*property/,
  });
});

test('validateConfig: throws on missing form route', (t) => {
  const invalidConfig = {
    [FormHandler.configKey]: {
      baseRoute: '/forms',
      forms: [
        {
          name: 'test',
          fields: [],
        },
      ],
    },
  };

  t.throws(() => FormHandler.validateConfig(invalidConfig), {
    message: /Config Error.*form must have a.*route.*property/,
  });
});

test('validateConfig: throws on missing form fields', (t) => {
  const invalidConfig = {
    [FormHandler.configKey]: {
      baseRoute: '/forms',
      forms: [
        {
          name: 'test',
          route: '/test',
        },
      ],
    },
  };

  t.throws(() => FormHandler.validateConfig(invalidConfig), {
    message: /Config Error.*form must have a.*fields.*array/,
  });
});

test('validateConfig: throws on missing form successMessage', (t) => {
  const invalidConfig = {
    [FormHandler.configKey]: {
      baseRoute: '/forms',
      forms: [
        {
          name: 'test',
          route: '/test',
          fields: [],
        },
      ],
    },
  };

  t.throws(() => FormHandler.validateConfig(invalidConfig), {
    message: /Config Error.*form must have a.*successMessage.*property/,
  });
});

test('validateConfig: throws on missing form errorMessage', (t) => {
  const invalidConfig = {
    [FormHandler.configKey]: {
      baseRoute: '/forms',
      forms: [
        {
          name: 'test',
          route: '/test',
          fields: [],
          successMessage: 'Success!',
        },
      ],
    },
  };

  t.throws(() => FormHandler.validateConfig(invalidConfig), {
    message: /Config Error.*form must have a.*errorMessage.*property/,
  });
});

test('validateConfig: throws on missing field name', (t) => {
  const invalidConfig = {
    [FormHandler.configKey]: {
      baseRoute: '/forms',
      forms: [
        {
          name: 'test',
          route: '/test',
          fields: [
            { type: 'text' },
          ],
          successMessage: 'Success!',
          errorMessage: 'Error!',
        },
      ],
    },
  };

  t.throws(() => FormHandler.validateConfig(invalidConfig), {
    message: /Config Error.*field must have a.*name.*property/,
  });
});

test('validateConfig: throws on missing field type', (t) => {
  const invalidConfig = {
    [FormHandler.configKey]: {
      baseRoute: '/forms',
      forms: [
        {
          name: 'test',
          route: '/test',
          fields: [
            { name: 'field1' },
          ],
          successMessage: 'Success!',
          errorMessage: 'Error!',
        },
      ],
    },
  };

  t.throws(() => FormHandler.validateConfig(invalidConfig), {
    message: /Config Error.*field must have a.*type.*property/,
  });
});

test('validateConfig: validates config correctly', (t) => {
  const validConfig = {
    [FormHandler.configKey]: {
      baseRoute: '/forms',
      forms: [
        {
          name: 'test',
          route: '/test',
          fields: [
            { name: 'field1', type: 'text', required: true },
          ],
          successMessage: 'Success!',
          errorMessage: 'Error!',
        },
      ],
    },
  };

  t.notThrows(() => FormHandler.validateConfig(validConfig));
});

test('validateFormData(formData, formConfig): validates form data correctly', (t) => {
  const formConfig = {
    name: 'test',
    route: '/test',
    fields: [
      { name: 'required_field', type: 'text', required: true },
      { name: 'email_field', type: 'email', required: true },
      { name: 'optional_field', type: 'text', required: false },
    ],
  };

  // Valid data
  const validData = {
    required_field: 'test value',
    email_field: 'test@example.com',
    optional_field: 'optional value',
  };

  const result = FormHandler.validateFormData(validData, formConfig);
  t.true(result.valid);
  t.is(result.errors.length, 0);
});

test('validateFormData(formData, formConfig): validates required fields', (t) => {
  const formConfig = {
    name: 'test',
    fields: [
      { name: 'required_field', type: 'text', required: true },
    ],
  };

  const invalidData = {};

  const result = FormHandler.validateFormData(invalidData, formConfig);
  t.false(result.valid);
  t.true(result.errors.some(error => error.includes('required')));
});

test('validateFormData(formData, formConfig): validates email format', (t) => {
  const formConfig = {
    name: 'test',
    route: '/test',
    fields: [
      { name: 'email_field', type: 'email', required: true },
    ],
  };

  const invalidData = {
    email_field: 'invalid-email',
  };

  const result = FormHandler.validateFormData(invalidData, formConfig);
  t.false(result.valid);
  t.true(result.errors.some(error => error.includes('valid email')));
});

test('validateFormData(formData, formConfig): validates number format', (t) => {
  const formConfig = {
    name: 'test',
    route: '/test',
    fields: [
      { name: 'number_field', type: 'number', required: true },
    ],
  };

  const invalidData = {
    number_field: 'not-a-number',
  };

  const result = FormHandler.validateFormData(invalidData, formConfig);
  t.false(result.valid);
  t.true(result.errors.some(error => error.includes('valid number')));
});

test('validateFormData(formData, formConfig): validates URL format', (t) => {
  const formConfig = {
    name: 'test',
    route: '/test',
    fields: [
      { name: 'url_field', type: 'url', required: true },
    ],
  };

  const invalidData = {
    url_field: 'not-a-url',
  };

  const result = FormHandler.validateFormData(invalidData, formConfig);
  t.false(result.valid);
  t.true(result.errors.some(error => error.includes('valid URL')));
});

test('validateFormData(formData, formConfig): validates custom validation', (t) => {
  const formConfig = {
    route: '/test',
    name: 'test',
    fields: [
      {
        name: 'custom_field',
        type: 'text',
        required: true,
        validation: (value) => value.length === 3 && value.toUpperCase() === value,
      },
    ],
  };

  const invalidData = {
    custom_field: 'abc',
  };

  let result = FormHandler.validateFormData(invalidData, formConfig);
  t.false(result.valid);
  t.true(result.errors.some(error => error.includes('is invalid')));

  const validData = {
    custom_field: 'ABC',
  };

  result = FormHandler.validateFormData(validData, formConfig);
  t.true(result.valid);
  t.is(result.errors.length, 0);
});

test('validateFormData(formData, formConfig): validates custom validation with custom error message', (t) => {
  const formConfig = {
    route: '/test',
    name: 'test',
    fields: [
      {
        name: 'custom_field',
        type: 'text',
        required: true,
        validation: (value) => value.length === 3 && value.toUpperCase() === value,
        errorMessage: 'Must be 3 uppercase letters',
      },
    ],
  };

  const invalidData = {
    custom_field: 'abc',
  };

  let result = FormHandler.validateFormData(invalidData, formConfig);
  t.false(result.valid);
  t.true(result.errors.some(error => error.includes('3 uppercase letters')));

  const validData = {
    custom_field: 'ABC',
  };

  result = FormHandler.validateFormData(validData, formConfig);
  t.true(result.valid);
  t.is(result.errors.length, 0);
});

test('validateFormData(formData, formConfig): validates custom validation with error message', (t) => {
  const formConfig = {
    name: 'test',
    route: '/test',
    fields: [
      {
        name: 'field1',
        type: 'text',
        required: true,
        validation: (_value) => { throw new Error('Test error'); },
        errorMessage: 'Must be 3 uppercase letters',
      },
    ],
  };

  const invalidData = {
    field1: 'abc',
  };

  const result = FormHandler.validateFormData(invalidData, formConfig);
  t.false(result.valid);
  t.true(result.errors.some(error => error.includes('due to error')));
});

test('validateFormData(formData, formConfig): does nothing with missing optional fields', (t) => {
  const formConfig = {
    name: 'test',
    route: '/test',
    fields: [
      { name: 'field1', type: 'text', required: false },
    ],
  };

  const validData = {
    field1: '',
  };

  const result = FormHandler.validateFormData(validData, formConfig);
  t.true(result.valid);
  t.is(result.errors.length, 0);
});

test('createFormHandler: creates form handler middleware', (t) => {
  const formConfig = {
    name: 'test',
    route: '/test',
    fields: [
      { name: 'field1', type: 'text', required: true },
    ],
    successMessage: 'Success!',
  };

  const defaultHandler = async (_formData, _formConfig, _req, _res) => {
    return { message: 'Processed' };
  };

  const middleware = FormHandler.createFormHandler(formConfig, defaultHandler);
  t.is(typeof middleware, 'function');
});

test('register(context): throws on missing event dispatcher', (t) => {
  const mockContext = {
    config: {
      [FormHandler.configKey]: {
        forms: [],
      },
    },
    buildMetadata: () => Promise.resolve({}),
  };

  t.throws(() => FormHandler.register(mockContext), {
    message: /Missing event dispatcher/,
  });
});

test('register(context): throws on missing events', (t) => {
  const mockContext = {
    hooks: new EventDispatcher(),
    config: {
      [FormHandler.configKey]: {
        forms: [],
      },
    },
    buildMetadata: () => Promise.resolve({}),
  };

  t.throws(() => FormHandler.register(mockContext), {
    message: /Missing events to listen to for in \'config.events\'./,
  });
});

test('register(context): should throw an error if events are missing in config', (t) => {
  const context = {
    hooks: new EventDispatcher(),
    config: {
      [FormHandler.configKey]: FormHandler.defaultConfig(),
    },
    buildMetadata: () => Promise.resolve({}),
  };
  t.throws(() => FormHandler.register(context), {
    message: 'Missing events to listen to for in \'config.events\'.',
  });
});

test('register(context): handles missing methods', (t) => {
  t.notThrows(() => {
    FormHandler.register({
      hooks: new EventDispatcher(),
      config: {
        [FormHandler.configKey]: {
          ...FormHandler.defaultConfig(),
          events: { womp: ['womp'] },
        },
      },
      buildMetadata: () => Promise.resolve({}),
    });
  });
});

test('register(context): registers without errors', (t) => {
  const mockContext = {
    hooks: new EventDispatcher(),
    config: {
      [FormHandler.configKey]: {
        events: {
          validateConfig: ['validate-config'],
        },
        baseRoute: '/forms',
        forms: [],
      },
    },
    buildMetadata: () => Promise.resolve({}),
  };

  t.notThrows(() => FormHandler.register(mockContext));
});

test('bindRoutes(server, context): binds routes correctly', async (t) => {
  const app = express();
  const mockContext = {
    hooks: new EventDispatcher(),
    config: {
      [FormHandler.configKey]: {
        baseRoute: '/forms',
        forms: [
          {
            name: 'test',
            route: '/test',
            fields: [
              { name: 'field1', type: 'text', required: true },
            ],
            successMessage: 'Success!',
          },
        ],
      },
    },
    buildMetadata: () => Promise.resolve({}),
  };

  FormHandler.bindRoutes(app, mockContext);

  // Test that the route exists
  const response = await request(app)
    .post('/forms/test')
    .send({ field1: 'test value' })
    .expect(200);

  t.true(response.body.success);
  t.is(response.body.message, 'Success!');
});

test('bindRoutes(server, context): does not bind without forms', async (t) => {
  const app = express();
  const mockContext = {
    hooks: new EventDispatcher(),
    config: {
      [FormHandler.configKey]: {
        baseRoute: '/forms',
        forms: [],
      },
    },
    buildMetadata: () => Promise.resolve({}),
  };

  FormHandler.bindRoutes(app, mockContext);

  // Test that the route does not exist
  const response = await request(app)
    .post('/forms/test')
    .send({ field1: 'test value' })
    .expect(404);

  t.is(response.status, 404);
});

test('bindRoutes(server, context): handles validation errors', async (t) => {
  const app = express();
  const mockContext = {
    hooks: new EventDispatcher(),
    config: {
      [FormHandler.configKey]: {
        baseRoute: '/forms',
        forms: [
          {
            name: 'test',
            route: '/test',
            fields: [
              { name: 'field1', type: 'text', required: true },
            ],
            errorMessage: 'Validation failed!',
          },
        ],
      },
    },
    buildMetadata: () => Promise.resolve({}),
  };

  FormHandler.bindRoutes(app, mockContext);

  // Test with missing required field
  const response = await request(app)
    .post('/forms/test')
    .send({})
    .expect(400);

  t.false(response.body.success);
  t.is(response.body.message, 'Validation failed!');
  t.true(Array.isArray(response.body.errors));
});

test('bindRoutes(server, context): handles handler errors', async (t) => {
  const app = express();
  const mockContext = {
    hooks: new EventDispatcher(),
    config: {
      [FormHandler.configKey]: {
        baseRoute: '/forms',
        forms: [
          {
            name: 'test',
            route: '/test',
            fields: [
              { name: 'field1', type: 'text', required: true },
            ],
            handler: async () => {
              throw new Error('Handler error');
            },
          },
        ],
      },
    },
    buildMetadata: () => Promise.resolve({}),
  };

  FormHandler.bindRoutes(app, mockContext);

  // Test with handler error
  const response = await request(app)
    .post('/forms/test')
    .send({ field1: 'test value' })
    .expect(500);

  t.false(response.body.success);
  t.is(response.body.message, 'Internal server error');
  t.is(response.body.error, 'Handler error');
});

test('bindRoutes(server, context): accepts both JSON and form data', async (t) => {
  const app = express();
  const mockContext = {
    config: {
      [FormHandler.configKey]: {
        baseRoute: '/forms',
        forms: [
          {
            name: 'test',
            route: '/test',
            fields: [
              { name: 'field1', type: 'text', required: true },
            ],
          },
        ],
      },
    },
  };

  FormHandler.bindRoutes(app, mockContext);

  // Test JSON data
  const jsonResponse = await request(app)
    .post('/forms/test')
    .set('Content-Type', 'application/json')
    .send({ field1: 'json value' })
    .expect(200);

  t.true(jsonResponse.body.success);

  // Test form data
  const formResponse = await request(app)
    .post('/forms/test')
    .send('field1=form+value')
    .expect(200);

  t.true(formResponse.body.success);
});
