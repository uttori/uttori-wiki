let debug = (..._) => {};
/* c8 ignore next 2 */
try { const { default: d } = await import('debug'); debug = d('Uttori.FisherYatesShuffle'); } catch {}

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
const fyShuffle = (array) => {
  if (!Array.isArray(array)) {
    return array;
  }
  if (array.length === 0) {
    return array;
  }
  debug('fyShuffle:', array.length);
  let currentIndex = array.length;

  // While there remain elements to shuffle...
  while (currentIndex !== 0) {
    // Pick a remaining element.
    const randomIndex = Math.floor(Math.random() * currentIndex--);

    // Swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    // NOTE: This is the same as the following code:
    // const temporaryValue = array[currentIndex];
    // array[currentIndex] = array[randomIndex];
    // array[randomIndex] = temporaryValue;
  }

  return array;
};

export default fyShuffle;
