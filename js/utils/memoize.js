// Task 3
export function memoize(fn, { maxSize = 10 } = {}) {
  const cache = new Map();

  return function (...args) {
    const key = JSON.stringify(args);

    if (cache.has(key)) {
      const value = cache.get(key);
      cache.delete(key);
      cache.set(key, value); 
      return value;
    }

    const result = fn.apply(this, args);

    if (cache.size >= maxSize) {
      const oldestKey = cache.keys().next().value;
      cache.delete(oldestKey);
    }

    cache.set(key, result);
    return result;
  };
}