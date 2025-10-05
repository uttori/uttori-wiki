export default fyShuffle;
/**
 * Fisher-Yates Shuffle (aka Knuth Shuffle)
 * The algorithm continually determines the next element by randomly drawing an element from the array until no elements remain.
 * This modifies the passed in array, clone the array being passed in to return a new array.
 * @template T
 * @param {T[]} array The array to randomize.
 * @returns {T[]} The same array, randomized.
 * @example <caption>fyShuffle(array)</caption>
 * const shuffled_array = fyShuffle(sorted_array.slice(0));
 * @see {@link https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle|Fisher-Yates Shuffle (aka Knuth Shuffle)}
 * @see {@link https://bost.ocks.org/mike/shuffle/|Fisher–Yates Shuffle}
 */
declare function fyShuffle<T>(array: T[]): T[];
//# sourceMappingURL=fisher-yates-shuffle.d.ts.map