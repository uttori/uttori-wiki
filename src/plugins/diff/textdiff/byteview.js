/**
 * ByteView provides a mechanism to handle strings and Uint8Array as immutable byte views.
 */
export class ByteView {
  /** @type {string} */
  data = '';

  /**
   * @param {string} data
   */
  constructor(data) {
    this.data = data;
  }

  /**
   * @param {string | Uint8Array} in_ The input to convert to a ByteView.
   * @returns {ByteView}
   */
  static from(in_) {
    if (typeof in_ === 'string') {
      return new ByteView(in_);
    } else {
      // Convert Uint8Array to string
      const decoder = new TextDecoder();
      return new ByteView(decoder.decode(in_));
    }
  }

  /**
   * @returns {number}
   */
  len() {
    return this.data.length;
  }

  /**
   * @returns {number}
   */
  get length() {
    return this.data.length;
  }

  /**
   * @returns {IterableIterator<number>}
   */
  bytes() {
    const data = this.data;
    let index = 0;
    return {
      [Symbol.iterator]() {
        return this;
      },
      /**
       * @returns {IteratorResult<number>}
       */
      next() {
        if (index < data.length) {
          const value = data.charCodeAt(index);
          index++;
          return { value, done: false };
        }
        return { value: undefined, done: true };
      },
    };
  }

  /**
   * UnsafeAs converts a ByteView to type T independently of what it was originally. This is
   * only safe if the type is the same one used for From and either the result is not modified
   * or the ByteView is no longer used.
   * @returns {string | Uint8Array}
   */
  unsafeAs() {
    if (typeof ({}) === 'string') {
      return this.data;
    } else {
      // Convert string to Uint8Array
      const encoder = new TextEncoder();
      return encoder.encode(this.data);
    }
  }

  /**
   * SplitLines splits the input on '\n' and returns the lines including the newline character and
   * and either -1 if the last line ends in a newline character or len([]ByteView) if it's missing
   * a newline character.
   *
   * @param {ByteView} v The ByteView to split.
   * @returns {[ByteView[], number]} The lines and the index of the missing newline.
   */
  static splitLines(v) {
    const s = v.data;
    let n = 0;
    for (const char of s) {
      if (char === '\n') {
        n++;
      }
    }
    if (s.length > 0 && s[s.length - 1] !== '\n') {
      n++;
    }

    /** @type {ByteView[]} */
    const a = [];
    let remaining = s;
    for (let i = 0; i < n; i++) {
      const m = remaining.indexOf('\n');
      if (m < 0) {
        break;
      }
      a[i] = new ByteView(remaining.substring(0, m + 1));
      remaining = remaining.substring(m + 1);
    }

    let missingNewline = -1;
    if (remaining.length > 0) {
      a[n - 1] = new ByteView(remaining);
      missingNewline = n - 1;
    }

    return [a, missingNewline];
  }
}

/**
 */
export class Builder {
  /** @type {string} */
  buf = '';
  /** @type {boolean} */
  isString;

  constructor() {
    // Determine if we're building a string or Uint8Array
    this.isString = true; // Default to string for now
  }

  /**
   * @param {number} _n
   */
  grow(_n) {
    // For strings, we don't need to pre-allocate
  }

  /**
   * @param {number[]} v
   * @returns {number}
   */
  write(v) {
    this.buf += String.fromCharCode(...v);
    return v.length;
  }

  /**
   * @param {ByteView} v
   * @returns {number}
   */
  writeByteView(v) {
    this.buf += v.data;
    return v.data.length;
  }

  /**
   * @param {string} v
   * @returns {number}
   */
  writeString(v) {
    this.buf += v;
    return v.length;
  }

  /**
   * @returns {string | Uint8Array}
   */
  build() {
    const result = this.buf;
    this.buf = '';

    if (this.isString) {
      return result;
    } else {
      // Convert string to Uint8Array
      const encoder = new TextEncoder();
      return encoder.encode(result);
    }
  }
}
