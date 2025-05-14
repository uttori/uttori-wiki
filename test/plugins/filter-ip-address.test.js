import test from 'ava';
import sinon from 'sinon';
import fs from 'fs';

import FilterIPAddress from '../../src/plugins/filter-ip-address.js';

test('configKey: should return the correct configuration key', (t) => {
  t.is(FilterIPAddress.configKey, 'uttori-plugin-filter-ip-address');
});

test('defaultConfig: should return the default configuration', (t) => {
  t.deepEqual(FilterIPAddress.defaultConfig(), {
    events: {
      callback: ['validate-save'],
      validateConfig: ['validate-config'],
    },
    logPath: './logs',
    blocklist: [],
    trustProxy: false,
  });
});

test('validateConfig: should throw an error if the configuration key is missing', (t) => {
  t.throws(() => FilterIPAddress.validateConfig({}), { message: `Config missing '${FilterIPAddress.configKey}' entry.` });
});

test('validateConfig: should throw an error if blocklist is missing', (t) => {
  const config = {
    [FilterIPAddress.configKey]: {},
  };
  t.throws(() => FilterIPAddress.validateConfig(config), { message: `Config missing '${FilterIPAddress.configKey}.blocklist' entry.` });
});

test('validateConfig: should throw an error if blocklist is not an array', (t) => {
  const config = {
    [FilterIPAddress.configKey]: {
      blocklist: 'not-an-array',
    },
  };
  t.throws(() => FilterIPAddress.validateConfig(config), { message: `Config '${FilterIPAddress.configKey}.blocklist' must be an array.` });
});

test('validateConfig: should throw an error if logPath is not a string', (t) => {
  const config = {
    [FilterIPAddress.configKey]: {
      blocklist: [],
      logPath: 123,
    },
  };
  t.throws(() => FilterIPAddress.validateConfig(config), { message: `Config '${FilterIPAddress.configKey}.logPath' must be a string.` });
});

test('validateConfig: should throw an error if logPath is empty', (t) => {
  const config = {
    [FilterIPAddress.configKey]: {
      blocklist: [],
      logPath: '',
    },
  };
  t.throws(() => FilterIPAddress.validateConfig(config), { message: `Config missing '${FilterIPAddress.configKey}.logPath' entry.` });
});

test('validateConfig: should throw an error if trustProxy is not a boolean', (t) => {
  const config = {
    [FilterIPAddress.configKey]: {
      blocklist: [],
      logPath: './logs',
      trustProxy: 'not-a-boolean',
    },
  };
  t.throws(() => FilterIPAddress.validateConfig(config), { message: `Config '${FilterIPAddress.configKey}.trustProxy' must be a boolean.` });
});

test('register: should throw error if context is missing', (t) => {
  t.throws(() => FilterIPAddress.register(), { message: "Missing event dispatcher in 'context.hooks.on(event, callback)' format." });
});

test('register: should throw error if hooks are missing', (t) => {
  t.throws(() => FilterIPAddress.register({}), { message: "Missing event dispatcher in 'context.hooks.on(event, callback)' format." });
});

test('register: should throw error if events are missing', (t) => {
  const context = {
    hooks: {
      on: sinon.spy(),
    },
    config: {
      [FilterIPAddress.configKey]: {
        events: null,
      },
    },
  };
  t.throws(() => FilterIPAddress.register(context), { message: 'Missing events to register for in the FilterIPAddress configuration' });
});

test('register: should register events', (t) => {
  const context = {
    hooks: {
      on: sinon.spy(),
    },
    config: {
      [FilterIPAddress.configKey]: {
        events: {
          validateIP: ['validate-save'],
          validateConfig: ['validate-config'],
          missingEvent: ['missing-event'],
        },
      },
    },
  };
  FilterIPAddress.register(context);
  t.true(context.hooks.on.calledWith('validate-save'));
  t.true(context.hooks.on.calledWith('validate-config'));
});

test('getClientIP: should return IP from request.ip when not using proxy', (t) => {
  const config = { trustProxy: false };
  const request = { ip: '192.168.1.1' };
  t.is(FilterIPAddress.getClientIP(config, request), '192.168.1.1');
});

test('getClientIP: should return IP from socket when request.ip is missing', (t) => {
  const config = { trustProxy: false };
  const request = { socket: { remoteAddress: '192.168.1.2' } };
  t.is(FilterIPAddress.getClientIP(config, request), '192.168.1.2');
});

test('getClientIP: should return IP from socket when request.ip and request.socket.remoteAddress is missing', (t) => {
  const config = { trustProxy: false };
  const request = { };
  t.is(FilterIPAddress.getClientIP(config, request), '0.0.0.0');
});

test('getClientIP: should return x-forwarded-for IP when trustProxy is true', (t) => {
  const config = { trustProxy: true };
  const request = {
    ip: '10.0.0.1',
    headers: {
      'x-forwarded-for': '192.168.1.3, 10.0.0.1',
    },
  };
  t.true(FilterIPAddress.getClientIP(config, request).includes('192'));
});

test('logIPActivity: should create log directory if it does not exist', (t) => {
  const config = { logPath: './test-logs' };
  const existsSyncStub = sinon.stub(fs, 'existsSync').returns(false);
  const mkdirSyncStub = sinon.stub(fs, 'mkdirSync');
  const appendFileSyncStub = sinon.stub(fs, 'appendFileSync');

  FilterIPAddress.logIPActivity(config, '192.168.1.5', { originalUrl: '/test', body: { title: 'Test' } });

  t.true(existsSyncStub.called);
  t.true(mkdirSyncStub.called);
  t.true(appendFileSyncStub.called);

  existsSyncStub.restore();
  mkdirSyncStub.restore();
  appendFileSyncStub.restore();
});

test('logIPActivity: should append to log file', (t) => {
  const config = { logPath: './test-logs' };
  const existsSyncStub = sinon.stub(fs, 'existsSync').returns(true);
  const appendFileSyncStub = sinon.stub(fs, 'appendFileSync');

  FilterIPAddress.logIPActivity(config, '192.168.1.6', { originalUrl: '/test', body: { title: 'Test' } });

  t.true(existsSyncStub.called);
  t.true(appendFileSyncStub.called);

  existsSyncStub.restore();
  appendFileSyncStub.restore();
});

test('logIPActivity: should handle fallbacks', (t) => {
  const config = { logPath: './test-logs' };
  const existsSyncStub = sinon.stub(fs, 'existsSync').returns(true);
  const appendFileSyncStub = sinon.stub(fs, 'appendFileSync');

  FilterIPAddress.logIPActivity(config, '192.168.1.6', { });

  t.true(existsSyncStub.called);
  t.true(appendFileSyncStub.called);

  existsSyncStub.restore();
  appendFileSyncStub.restore();
});

test('validateIP: should return false for non-blocklisted IPs', (t) => {
  const context = {
    config: {
      [FilterIPAddress.configKey]: {
        blocklist: ['192.168.1.100'],
        logPath: './logs',
      },
    },
  };

  const request = { ip: '192.168.1.7' };
  const logIPActivityStub = sinon.stub(FilterIPAddress, 'logIPActivity');
  const getClientIPStub = sinon.stub(FilterIPAddress, 'getClientIP').returns('192.168.1.7');

  const result = FilterIPAddress.validateIP(request, context);

  t.false(result);
  t.true(logIPActivityStub.called);
  t.true(getClientIPStub.called);

  logIPActivityStub.restore();
  getClientIPStub.restore();
});

test('validateIP: should return true for blocklisted IPs', (t) => {
  const context = {
    config: {
      [FilterIPAddress.configKey]: {
        blocklist: ['192.168.1.8'],
        logPath: './logs',
      },
    },
  };

  const request = { ip: '192.168.1.8' };
  const logIPActivityStub = sinon.stub(FilterIPAddress, 'logIPActivity');
  const getClientIPStub = sinon.stub(FilterIPAddress, 'getClientIP').returns('192.168.1.8');

  const result = FilterIPAddress.validateIP(request, context);

  t.true(result);
  t.true(logIPActivityStub.called);
  t.true(getClientIPStub.called);

  logIPActivityStub.restore();
  getClientIPStub.restore();
});
