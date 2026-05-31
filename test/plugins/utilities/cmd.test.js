import test from 'ava';
import sinon from 'sinon';
import { EventEmitter } from 'node:events';
import child_process from 'node:child_process';

import { cmd } from '../../../src/plugins/utilities/cmd.js';

/** @type {sinon.SinonSandbox} */
let sandbox;

/** @type {((proc: EventEmitter & { kill: sinon.SinonStub }) => void) | null} */
let execSetup = null;

test.beforeEach(() => {
  sandbox = sinon.createSandbox();
  execSetup = null;
  sandbox.stub(child_process, 'execFile').callsFake(() => {
    const proc = new EventEmitter();
    proc.stdout = new EventEmitter();
    proc.stderr = new EventEmitter();
    proc.kill = sandbox.stub();
    setImmediate(() => execSetup?.(proc));
    return proc;
  });
});

test.afterEach(() => {
  sandbox.restore();
});

test.serial('cmd: rejects invalid commands', async (t) => {
  await t.throwsAsync(() => cmd(/** @type {any} */ (null)), { message: /"file" property/ });
  await t.throwsAsync(() => cmd(/** @type {any} */ ('echo')), { message: /"file" property/ });
  await t.throwsAsync(() => cmd(/** @type {any} */ ({}), {}), { message: /"file" property/ });
});

test.serial('cmd: defaults args to an empty array', async (t) => {
  execSetup = (proc) => proc.emit('exit', 0);
  await cmd({ file: 'echo' });
  t.deepEqual(child_process.execFile.firstCall.args[1], []);
});

test.serial('cmd: resolves the TEST shortcut used by import-document tests', async (t) => {
  sandbox.restore();
  sandbox = sinon.createSandbox();
  sandbox.stub(child_process, 'execFile').returns(/** @type {any} */ ('TEST'));
  t.is(await cmd({ file: 'wget' }), 'TEST');
});

test.serial('cmd: resolves stdout on exit 0', async (t) => {
  execSetup = (proc) => {
    proc.stdout.emit('data', 'hello');
    proc.emit('exit', 0);
  };
  t.is(await cmd({ file: 'echo', args: ['hi'] }), 'hello');
});

test.serial('cmd: concatenates stdout and stderr', async (t) => {
  execSetup = (proc) => {
    proc.stdout.emit('data', 'out');
    proc.stderr.emit('data', 'err');
    proc.emit('exit', 0);
  };
  t.is(await cmd({ file: 'echo' }), 'outerr');
});

test.serial('cmd: forwards output to log callback', async (t) => {
  const log = sandbox.spy();
  execSetup = (proc) => {
    proc.stdout.emit('data', 'a');
    proc.stderr.emit('data', 'b');
    proc.emit('exit', 0);
  };
  await cmd({ file: 'echo' }, { log });
  t.is(log.callCount, 2);
});

test.serial('cmd: rejects non-zero exit codes', async (t) => {
  execSetup = (proc) => proc.emit('exit', 2);
  await t.throwsAsync(() => cmd({ file: 'false' }), { message: /code 2/ });
});

test.serial('cmd: rejects when the process times out', async (t) => {
  /** @type {EventEmitter & { kill: sinon.SinonStub }} */
  let procRef;
  execSetup = (proc) => {
    procRef = proc;
  };
  await t.throwsAsync(() => cmd({ file: 'sleep', args: ['999'] }, { timeout: 20 }), { message: /timed out after 20ms/ });
  t.true(procRef.kill.calledWith('SIGTERM'));
});

test.serial('cmd: resolves partial output when interrupted by signal', async (t) => {
  execSetup = (proc) => {
    proc.stdout.emit('data', 'partial');
    proc.emit('SIGTERM');
  };
  t.is(await cmd({ file: 'long-running' }), 'partial');
});

test.serial('cmd: rejects spawn errors', async (t) => {
  execSetup = (proc) => proc.emit('error', new Error('ENOENT'));
  await t.throwsAsync(() => cmd({ file: 'missing-binary' }), { message: 'ENOENT' });
});

test.serial('cmd: rejects uncaughtException events', async (t) => {
  execSetup = (proc) => proc.emit('uncaughtException', new Error('boom'));
  await t.throwsAsync(() => cmd({ file: 'crash' }), { message: 'boom' });
});

test.serial('cmd: wraps non-Error uncaughtException values', async (t) => {
  execSetup = (proc) => proc.emit('uncaughtException', 'oops');
  await t.throwsAsync(() => cmd({ file: 'crash' }), { message: 'oops' });
});

test.serial('cmd: close clears timeout without rejecting after exit', async (t) => {
  execSetup = (proc) => {
    proc.stdout.emit('data', 'done');
    proc.emit('exit', 0);
    proc.emit('close');
  };
  t.is(await cmd({ file: 'echo' }), 'done');
});
