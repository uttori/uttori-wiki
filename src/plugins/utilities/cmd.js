import child_process from 'node:child_process';

let debug = (..._) => {};
/* c8 ignore next 2 */
try { const { default: d } = await import('debug'); debug = d('Uttori.Utilities.Cmd'); } catch {}

/**
 * Runs a command and returns the result as a promise.
 * @param {string} command The command to run.
 * @param {object} [options] The options for the runner.
 * @param {Function} [options.log] If set, logs the output to the console.
 * @param {number} [options.timeout] Timeout in milliseconds (default: 30000).
 * @returns {Promise<string>} The result of the command as a string.
 * @see {@link https://nodejs.org/api/process.html#process_signal_events}
 * @example <caption>Cmd</caption>
 * const result = await cmd('ls -la');
 * console.log(result);
 * const result2 = await cmd('`wget -O "${localImagePath}" "${imageURL}"`', { log: (data) => console.log(data) });
 * console.log(result2);
 */
export async function cmd (command, { log = () => {}, timeout = 30000 } = {}) {
  return new Promise(function(resolve, reject) {
    debug('cmd:', command);
    if (!command || typeof command !== 'string') {
      debug('cmd:', command, 'is not a string');
      reject(new Error('Command must be a non-empty string'));
      return;
    }

    const commandProcess = child_process.exec(command);
    // Special condition for tests
    // eslint-disable-next-line @typescript-eslint/no-base-to-string, @typescript-eslint/restrict-template-expressions
    if (`${commandProcess}` === 'TEST') {
      resolve('TEST');
      return;
    }

    // Run the command and collect the results
    let result = '';
    let isResolved = false;

    const cleanup = () => {
      if (!isResolved) {
        isResolved = true;
        commandProcess.kill('SIGTERM');
      }
    };

    const timeoutId = setTimeout(() => {
      cleanup();
      reject(new Error(`Command timed out after ${timeout}ms`));
    }, timeout);

    commandProcess.stdout?.on('data', (data) => {
      log(data);
      result += data;
    });

    commandProcess.stderr?.on('data', (data) => {
      log(data);
      result += data;
    });

    commandProcess.on('exit', (code) => {
      clearTimeout(timeoutId);
      if (!isResolved) {
        isResolved = true;
        if (code === 0) {
          resolve(result);
        } else {
          reject(new Error(`Process exited with code ${code}`));
        }
      }
    });

    // Signal handlers - simplified and corrected
    const handleSignal = (_signal) => {
      clearTimeout(timeoutId);
      if (!isResolved) {
        isResolved = true;
        resolve(result);
      }
    };

    // catches ctrl+c event
    commandProcess.on('SIGINT', handleSignal);

    commandProcess.on('SIGTERM', handleSignal);

    commandProcess.on('SIGQUIT', handleSignal);

    commandProcess.on('SIGKILL', handleSignal);

    // Catches "kill pid", for example: nodemon restart
    commandProcess.on('SIGUSR1', handleSignal);
    commandProcess.on('SIGUSR2', handleSignal);

    commandProcess.on('error', (error) => {
      clearTimeout(timeoutId);
      if (!isResolved) {
        isResolved = true;
        reject(error);
      }
    });

    // Catches uncaught exceptions
    commandProcess.on('uncaughtException', (error, _signal) => {
      clearTimeout(timeoutId);
      debug('uncaughtException:', error);
      if (!isResolved) {
        isResolved = true;
        reject(new Error(error));
      }
    });

    // Cleanup on process termination
    commandProcess.on('close', () => {
      clearTimeout(timeoutId);
    });
  });
}
