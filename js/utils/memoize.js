export function memoize(fn, {
  maxSize = Infinity,
  evictionPolicy = 'LRU', 
  maxAge = Infinity,      
  customEvictFn = null    
} = {}) {
  const cache = new Map(); 

  function evict() {
    if (evictionPolicy === 'LFU') {
      let leastKey, leastHits = Infinity;
      for (const [key, entry] of cache) {
        if (entry.hits < leastHits) {
          leastHits = entry.hits;
          leastKey = key;
        }
      }
      if (leastKey !== undefined) cache.delete(leastKey);
    } else if (evictionPolicy === 'TIME') {
      const now = Date.now();
      for (const [key, entry] of cache) {
        if (now - entry.timestamp > maxAge) {
          cache.delete(key);
        }
      }
    } else if (evictionPolicy === 'CUSTOM' && typeof customEvictFn === 'function') {
      customEvictFn(cache);
    } else {
      const oldestKey = cache.keys().next().value;
      if (oldestKey) cache.delete(oldestKey);
    }
  }

  return function (...args) {
    const key = JSON.stringify(args);
    const now = Date.now();

    if (cache.has(key)) {
      const entry = cache.get(key);
      entry.hits++;
      entry.timestamp = now;
      cache.delete(key);
      cache.set(key, entry);
      return entry.value;
    }

    const result = fn.apply(this, args);

    if (cache.size >= maxSize) evict();

    cache.set(key, { value: result, hits: 1, timestamp: now });
    return result;
  };
}
