import { promises as fs } from 'node:fs';
import test from 'ava';
import { EventDispatcher } from '@uttori/event-dispatcher';

import AIChatBot from '../../src/plugins/ai-chat-bot.js';

const folder = 'test/site-ai-chat-bot';
const databasePath = `${folder}/uttori-chat.db`;

test.beforeEach(async () => {
  await fs.rm(folder, { recursive: true, force: true });
  await fs.mkdir(folder, { recursive: true });
});

test.afterEach.always(async () => {
  await fs.rm(folder, { recursive: true, force: true });
});

test('AIChatBot.defaultConfig(): wires index update events', (t) => {
  const config = AIChatBot.defaultConfig();

  t.deepEqual(config.events.bindWebSocket, ['server-listening']);
  t.deepEqual(config.events.onSearchUpdate, ['search-update']);
  t.deepEqual(config.events.onSearchDelete, ['search-delete']);
});

test('AIChatBot.register(): binds default index events without bootstrapping when disabled', async (t) => {
  const hooks = new EventDispatcher();
  const context = {
    hooks,
    config: {
      [AIChatBot.configKey]: {
        bootstrapIndexOnStartup: false,
        databasePath,
        interfaceRequestHandler: () => (_request, _response) => {},
      },
    },
  };

  await t.notThrowsAsync(AIChatBot.register(/** @type {any} */ (context)));
  t.true(hooks.events['search-update'].callbacks.includes(AIChatBot.onSearchUpdate));
  t.true(hooks.events['search-delete'].callbacks.includes(AIChatBot.onSearchDelete));
  t.true(hooks.events['server-listening'].callbacks.includes(AIChatBot.bindWebSocket));
});

test('AIChatBot.bindRoutes(): binds documents, chat API, and public routes', (t) => {
  /** @type {Array<{method: string, route: string, handlers: Function[]}>} */
  const routes = [];
  const server = {
    get(route, ...handlers) {
      routes.push({ method: 'get', route, handlers });
    },
    post(route, ...handlers) {
      routes.push({ method: 'post', route, handlers });
    },
  };
  const context = {
    config: {
      [AIChatBot.configKey]: {
        bootstrapIndexOnStartup: false,
        databasePath,
        interfaceRequestHandler: () => (_request, _response) => {},
      },
    },
  };

  AIChatBot.bindRoutes(/** @type {any} */ (server), /** @type {any} */ (context));

  const documentsRoute = routes.find(route => route.method === 'get' && route.route === '/chat-documents');
  const chatRoute = routes.find(route => route.method === 'post' && route.route === '/chat-api');
  const publicRoute = routes.find(route => route.method === 'get' && route.route === '/chat');

  t.truthy(documentsRoute);
  t.truthy(chatRoute);
  t.truthy(publicRoute);
  t.is(typeof chatRoute?.handlers[0], 'function');
});

test('AIChatBot.onSearchDelete(): ignores missing documents', (t) => {
  t.notThrows(() => {
    AIChatBot.onSearchDelete(/** @type {any} */ (undefined), /** @type {any} */ ({
      config: {
        [AIChatBot.configKey]: {
          bootstrapIndexOnStartup: false,
          databasePath,
        },
      },
    }));
  });
});
