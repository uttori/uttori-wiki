/**
 * Runs a command and returns the result as a promise.
 * @param {string} command The command to run.
 * @param {object} [options] The options for the runner.
 * @param {Function} [options.log] If set, logs the output to the console.
 * @param {number} [options.timeout] Timeout in milliseconds (default: 30000).
 * @returns {Promise<string>} The result of the command as a string.
 * @see {@link https://nodejs.org/api/process.html#process_signal_events}
 */
export function cmd(command: string, { log, timeout }?: {
    log?: Function;
    timeout?: number;
}): Promise<string>;
//# sourceMappingURL=cmd.d.ts.map