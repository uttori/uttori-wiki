import test from 'ava';
import request from 'supertest';
import express from 'express';

import session from 'express-session';
import { middleware } from '../src/wiki-flash.js';

test('middleware: returns with no session', (t) => {
  t.notThrows(() => {
    const app = express();
    app.use(middleware);
  });
});

test('middleware: can setup with a session', async (t) => {
  const app = express();
  app.use(session({
    secret: 'test',
    resave: false,
    saveUninitialized: false,
  }));
  app.use(middleware);

  // Route that creates a flash message
  app.all('/flash', (requestz, response) => {
    requestz.wikiFlash('success', 'Did the thing to do.');
    requestz.wikiFlash('error', 'Failed to do one thing.');
    response.json({ flash: requestz.wikiFlash('success'), other: requestz.wikiFlash() });
  });

  // Route that reads flash messages
  app.get('/', (requestz, response) => {
    response.json({ flash: requestz.wikiFlash('success'), other: requestz.wikiFlash() });
  });

  const listener = app.listen(3000);

  let response = await request(app).get('/flash');
  t.deepEqual(response.body, {
    flash: [
      'Did the thing to do.',
    ],
    other: {
      error: [
        'Failed to do one thing.',
      ],
    },
  });
  t.is(response.status, 200);
  response = await request(app).get('/');
  t.deepEqual(response.body, {
    flash: [],
    other: {},
  });
  t.is(response.status, 200);
  listener.close();
});
