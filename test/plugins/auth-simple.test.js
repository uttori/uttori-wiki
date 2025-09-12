import test from 'ava';
import sinon from 'sinon';
import request from 'supertest';

import AuthSimple from '../../src/plugins/auth-simple.js';
import { config, seed, serverSetup } from '../_helpers/server.js';
import UttoriWiki from '../../src/wiki.js';


let sandbox;
test.beforeEach(() => {
    sandbox = sinon.createSandbox();
});

test.afterEach(() => {
  sandbox.restore();
});

test('AuthSimple.register(context): can register', (t) => {
  t.notThrows(() => {
    AuthSimple.register({ hooks: { on: () => {} }, config: { [AuthSimple.configKey]: { events: { callback: [] } } } });
  });
});

test('AuthSimple.register(context): errors without event dispatcher', (t) => {
  t.throws(() => {
    AuthSimple.register({ hooks: {} });
  }, { message: 'Missing event dispatcher in \'context.hooks.on(event, callback)\' format.' });
});

test('AuthSimple.register(context): errors without events', (t) => {
  t.throws(() => {
    AuthSimple.register({ hooks: { on: () => {} }, config: { [AuthSimple.configKey]: { } } });
  }, { message: 'Missing events to listen to for in \'config.events\'.' });
});

test('AuthSimple.register(context): does not error with events corresponding to missing methods', (t) => {
  t.notThrows(() => {
    AuthSimple.register({
      hooks: {
        on: () => {},
      },
      config: {
        [AuthSimple.configKey]: {
          events: {
            test: ['test'],
            bindRoutes: ['bind-routes'],
            validateConfig: ['validate-config'],
          },
        },
      },
    });
  });
});

test('AuthSimple.defaultConfig(): can return a default config', (t) => {
  t.notThrows(AuthSimple.defaultConfig);
});

test('AuthSimple.validateConfig(config, _context): throws when configuration key is missing', (t) => {
  t.throws(() => {
    AuthSimple.validateConfig({});
  }, { message: 'Config Error: \'uttori-plugin-auth-simple\' configuration key is missing.' });
});

test('AuthSimple.validateConfig(config, _context): throws when loginPath is not a string', (t) => {
  t.throws(() => {
    AuthSimple.validateConfig({
      [AuthSimple.configKey]: {
        loginPath: 10,
      },
    });
  }, { message: 'Config Error: `loginPath` should be a string server route to where credentials should be POSTed to.' });
});

test('AuthSimple.validateConfig(config, _context): throws when loginRedirectPath is not a string', (t) => {
  t.throws(() => {
    AuthSimple.validateConfig({
      [AuthSimple.configKey]: {
        loginPath: '/login',
        loginRedirectPath: false,
      },
    });
  }, { message: 'Config Error: `loginRedirectPath` should be a string server route to where a successful login should navigate to.' });
});

test('AuthSimple.validateConfig(config, _context): throws when loginMiddleware is not an array', (t) => {
  t.throws(() => {
    AuthSimple.validateConfig({
      [AuthSimple.configKey]: {
        loginPath: '/login',
        loginRedirectPath: '/',
        loginMiddleware: {},
      },
    });
  }, { message: 'Config Error: `loginMiddleware` should be an array of middlewares or an empty array.' });
});

test('AuthSimple.validateConfig(config, _context): throws when logoutPath is not a string', (t) => {
  t.throws(() => {
    AuthSimple.validateConfig({
      [AuthSimple.configKey]: {
        loginPath: '/login',
        loginRedirectPath: '/',
        loginMiddleware: [],
        logoutPath: true,
      },
    });
  }, { message: 'Config Error: `logoutPath` should be a string server route to where logout requests should be POSTed to.' });
});

test('AuthSimple.validateConfig(config, _context): throws when logoutRedirectPath is not a string', (t) => {
  t.throws(() => {
    AuthSimple.validateConfig({
      [AuthSimple.configKey]: {
        loginPath: '/login',
        loginRedirectPath: '/',
        loginMiddleware: [],
        logoutPath: '/logout',
        logoutRedirectPath: true,
      },
    });
  }, { message: 'Config Error: `logoutRedirectPath` should be a string server route to where a logout should navigate to.' });
});

test('AuthSimple.validateConfig(config, _context): throws when logoutMiddleware is not an array', (t) => {
  t.throws(() => {
    AuthSimple.validateConfig({
      [AuthSimple.configKey]: {
        loginPath: '/login',
        loginRedirectPath: '/',
        loginMiddleware: [],
        logoutPath: '/logout',
        logoutRedirectPath: '/',
        logoutMiddleware: {},
      },
    });
  }, { message: 'Config Error: `logoutMiddleware` should be an array of middlewares or an empty array.' });
});

test('AuthSimple.validateConfig(config, _context): throws when validateLogin is not a function', (t) => {
  t.throws(() => {
    AuthSimple.validateConfig({
      [AuthSimple.configKey]: {
        loginPath: '/login',
        loginRedirectPath: '/',
        loginMiddleware: [],
        logoutPath: '/logout',
        logoutRedirectPath: '/',
        logoutMiddleware: [],
        validateLogin: '',
      },
    });
  }, { message: 'Config Error: `validateLogin` should be a function to validate the request body.' });
});

test('AuthSimple.validateConfig(config, _context):can validate', (t) => {
  t.notThrows(() => {
    AuthSimple.validateConfig({
      [AuthSimple.configKey]: {
        loginPath: '/login',
        loginRedirectPath: '/',
        loginMiddleware: [],
        logoutPath: '/logout',
        logoutRedirectPath: '/',
        logoutMiddleware: [],
        validateLogin: () => {},
      },
    });
  });
});

test('AuthSimple.bindRoutes(server, context): can bind routes', (t) => {
  const post = sandbox.spy();
  const server = { post };
  AuthSimple.bindRoutes(server, {
    config: {
      [AuthSimple.configKey]: {
        events: {
          bindRoutes: ['bind-routes'],
          validateConfig: ['validate-config'],
        },
        loginPath: '/login',
        loginRedirectPath: '/',
        loginMiddleware: [],
        logoutPath: '/logout',
        logoutRedirectPath: '/',
        logoutMiddleware: [],
        validateLogin: (_request) => true,
      },
    },
  });
  t.true(post.calledTwice);
});

test('AuthSimple.login(context): returns a Express route and will call next if validateLogin is missing', async (t) => {
  const loginPath = '/login';
  const context = {
    config: {
      [AuthSimple.configKey]: {
        events: {
          bindRoutes: ['bind-routes'],
          validateConfig: ['validate-config'],
        },
        loginPath,
        loginRedirectPath: '/1',
        loginMiddleware: [],
        logoutPath: '/logout',
        logoutRedirectPath: '/2',
        logoutMiddleware: [],
        validateLogin: false,
      },
    },
  };
  const server = serverSetup();
  const uttori = new UttoriWiki(config, server);
  await seed(uttori);
  AuthSimple.bindRoutes(server, context);
  const response = await request(server).post(loginPath).send({ token: 'abcd' });
  t.is(response.status, 404);
});

test('AuthSimple.login(context): returns a Express route and can successfully login', async (t) => {
  t.plan(4);
  const loginPath = '/login';
  const context = {
    config: {
      [AuthSimple.configKey]: {
        events: {
          bindRoutes: ['bind-routes'],
          validateConfig: ['validate-config'],
        },
        loginPath,
        loginRedirectPath: '/1',
        loginMiddleware: [],
        logoutPath: '/logout',
        logoutRedirectPath: '/2',
        logoutMiddleware: [],
        validateLogin: (req) => {
          if (req?.body?.token === 'abcd') {
            return { admin: true };
          }
          return null;
        },
      },
    },
  };
  const server = serverSetup();
  const _uttori = new UttoriWiki(config, server);
  AuthSimple.bindRoutes(server, context);
  const response = await request(server)
    .post(loginPath)
    .set('Accept', 'text/html')
    .set('Content-Type', 'application/json')
    .send({ token: 'abcd' });
  t.is(response.status, 302);
  t.is(response.text, '<p>Found. Redirecting to /1</p>');

  const response2 = await request(server)
    .post(loginPath)
    .set('Accept', 'application/json')
    .set('Content-Type', 'application/json')
    .send({ token: 'abcd' });
  t.is(response2.status, 200);
  t.is(response2.text, '{"admin":true}');
});

test('AuthSimple.login(context): returns a Express route and can fail to login', async (t) => {
  t.plan(4);
  const loginPath = '/login';
  const context = {
    config: {
      [AuthSimple.configKey]: {
        events: {
          bindRoutes: ['bind-routes'],
          validateConfig: ['validate-config'],
        },
        loginPath,
        loginRedirectPath: '/1',
        loginMiddleware: [],
        logoutPath: '/logout',
        logoutRedirectPath: '/2',
        logoutMiddleware: [],
        validateLogin: (req) => {
          if (req?.body?.token === 'not-abcd') {
            return { admin: true };
          }
          return false;
        },
      },
    },
  };
  const server = serverSetup();
  const uttori = new UttoriWiki(config, server);
  await seed(uttori);
  AuthSimple.bindRoutes(server, context);
  const response = await request(server).post(loginPath)
    .set('Accept', 'text/html')
    .set('Content-Type', 'application/json')
    .send({ token: 'abcd' });
  t.is(response.status, 302);
  t.is(response.text, '<p>Found. Redirecting to /login</p>');

  const response2 = await request(server).post(loginPath)
    .set('Accept', 'application/json')
    .set('Content-Type', 'application/json')
    .send({ token: 'abcd' });
  t.is(response2.status, 401);
  t.is(response2.text, '{"error":true}');
});

test('AuthSimple.login(context): returns a Express route and can attempt to logout as HTML', async (t) => {
  t.plan(4);
  const loginPath = '/login';
  const logoutPath = '/logout';
  const context = {
    config: {
      [AuthSimple.configKey]: {
        events: {
          bindRoutes: ['bind-routes'],
          validateConfig: ['validate-config'],
        },
        loginPath,
        loginRedirectPath: '/1',
        loginMiddleware: [],
        logoutPath,
        logoutRedirectPath: '/2',
        logoutMiddleware: [],
        validateLogin: (req) => {
          if (req?.body?.token === 'abcd') {
            return { admin: true };
          }
          return false;
        },
      },
    },
  };
  const server = serverSetup();
  const uttori = new UttoriWiki(config, server);
  await seed(uttori);
  AuthSimple.bindRoutes(server, context);
  const response = await request(server).post(logoutPath).set('Accept', 'text/html');
  t.is(response.status, 302);
  t.is(response.text, '<p>Found. Redirecting to /2</p>');

  const response2 = await request(server).post(logoutPath).set('Accept', 'application/json');
  t.is(response2.status, 200);
  t.is(response2.text, '{"success":true}');
});
