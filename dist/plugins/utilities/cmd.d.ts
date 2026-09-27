/**
 * Runs a command and returns the result as a promise.
 * Uses execFile to avoid shell interpolation.
 * @param command The command to run.
 * @param [options] The options for the runner.
 * @param [options.log] If set, logs the output to the console.
 * @param [options.timeout] Timeout in milliseconds (default: 30000).
 * @returns The result of the command as a string.
 * @see {@link https://nodejs.org/api/process.html#process_signal_events}
 * @example <caption>Cmd</caption>
 * const result = await cmd({ file: 'wget', args: ['-O', localImagePath, imageURL] }, { log: (data) => console.log(data) });
 * console.log(result);
 */
export declare function cmd(command: {
    file: string;
    args?: string[];
}, { log, timeout }?: {
    log?: (...args: unknown[]) => unknown;
    timeout?: number;
}): Promise<string>;
//# sourceMappingURL=cmd.d.ts.map