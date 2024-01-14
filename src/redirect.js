let debug = (..._) => {};
/* c8 ignore next */
try { const { default: d } = await import('debug'); debug = d('Uttori.Wiki.Redirect'); } catch {}

/**
 * Parse an Express compatible path into an array containing literal path segments and ParsedPathKey objects.
 * @param {string} path The path to parse.
 * @returns {(string|import('../dist/custom.js').ParsedPathKey)[]} The parsed path segments.
 */
export function parsePath(path) {
  debug('parsePath:', { path });

  const segments = [];
  let buffer = '';
  let variableBuffer = '';
  let isVariable = false;

  /**
   * Processes the collected variable buffer into a key object.
   * @param {string} innerVariableBuffer Variable buffer to process.
   */
  const processVariable = (innerVariableBuffer) => {
    let optional = false;
    let def;

    // Check if variable is optional
    if (innerVariableBuffer.endsWith('?')) {
      optional = true;
      innerVariableBuffer = innerVariableBuffer.slice(0, -1);
    }

    // Check for default value
    const defIndex = innerVariableBuffer.indexOf('(');
    if (defIndex !== -1) {
      def = innerVariableBuffer.slice(defIndex + 1, innerVariableBuffer.indexOf(')'));
      innerVariableBuffer = innerVariableBuffer.slice(0, defIndex);
    }

    segments.push({ name: innerVariableBuffer, optional, def });
  };

  for (let i = 0; i < path.length; i++) {
    if (path[i] === ':' && (i === 0 || !/\w/.test(path[i - 1]))) {
      if (buffer) {
        segments.push(buffer);
        buffer = '';
      }
      isVariable = true;
      variableBuffer = '';
      continue;
    }

    if (isVariable) {
      if (/[\w()?]/.test(path[i])) {
        variableBuffer += path[i];
      } else {
        processVariable(variableBuffer);
        isVariable = false;
        buffer += path[i];
      }
    } else {
      buffer += path[i];
    }
  }

  if (isVariable) {
    processVariable(variableBuffer);
  } else if (buffer) {
    segments.push(buffer);
  }

  debug('parsePath:', { segments });
  return segments;
}

/**
 * The function now iterates over the parsed segments of the target.
 * For each segment, if it's an object representing a key, it checks against the routeKeyMap to see if the key is present in the route.
 * If the key is not in the route, it checks if the key is optional or has a default value.
 * String segments (path elements) are returned as is, while key objects are returned with their modifications (if any).
 * @param {string} route The route to process.
 * @param {string} target The target to process.
 * @returns {(string|import('../dist/custom.js').ParsedPathKey)[]} The processed segments, ready to be used for path construction.
 */
export function prepareTarget(route, target) {
  debug('prepareTarget:', { route, target });
  const parsedRoute = parsePath(route);
  const parsedTarget = parsePath(target);

  // Create a map of route keys for easy lookup
  /** @type {Map<string, import('../dist/custom.js').ParsedPathKey>} */
  const routeKeyMap = new Map();
  for (const segment of parsedRoute) {
    if (typeof segment === 'object') {
      routeKeyMap.set(segment.name, segment);
    }
  }

  const segments = parsedTarget.map((segment) => {
    // Return string segments as is
    if (typeof segment === 'string') {
      return segment;
    }

    // Check if the key is not present in the route
    const routeKey = routeKeyMap.get(segment.name);
    if (!routeKey) {
      // Handle non-existent keys in route
      if (!segment.optional && !segment.def) {
        throw new Error(`'${segment.name}' isn't defined in your route. Make it optional or provide a default.`);
      }
      // Use default value if available
      return segment.def ? segment.def : segment;
    }

    // Key is present in route
    return segment;
  });

  debug('prepareTarget:', segments);
  return segments;
}

/**
 * The buildPath function constructs the final path string.
 * It iterates over the combined segments, assembling the path segment-by-segment.
 * This function handles the inclusion of parameters and defaults and concatenates the final path.
 * @param {Record<string, string | undefined>} params The key/value pairs to compile.
 * @param {string} route The route to.
 * @param {string} target The target to compile.
 * @returns {string} The compiled path.
 */
export function buildPath(params, route, target) {
  debug('buildPath:', { params, route, target });
  const segments = prepareTarget(route, target);

  let path = '';
  for (const segment of segments) {
    // Just add the string segment to the path
    if (typeof segment === 'string') {
      path += segment;
      continue;
    }

    if (typeof segment === 'object') {
      // Check for a value in the params object or use the default value
      const value = params[segment.name] || segment.def;
      // Add the value to the path if it's not undefined
      if (value !== undefined) {
        path += value;
      } else if (!segment.optional) {
        throw new Error(`Missing required key '${segment.name}'.`);
      }
    }
  }

  debug('buildPath:', path);
  return path;
}
