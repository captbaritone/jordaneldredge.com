type Options = {
  /** The number of milliseconds to cache the result */
  ttl: number;
  /** A global key used for logging */
  key: string;
};

/**
 * Memoizes a function with a cache that expires after a certain amount of time.
 */
export function memoize<F extends (...args: any[]) => any>(
  options: Options,
  fn: F
): F {
  const cache = new Map<string, { value: ReturnType<F>; expires: number }>();
  return function (...args: Parameters<F>): ReturnType<F> {
    const key = JSON.stringify([options.key, ...args]);
    const cached = cache.get(key);
    if (cached && cached.expires > Date.now()) {
      // console.log("Cache hit", key);
      return cached.value;
    }
    // console.log("Cache miss", key);
    const value = fn(...args);
    const expires = Date.now() + options.ttl;
    cache.set(key, { value, expires });
    return value;
  } as F;
}

// TODO: Maybe randomize the expiration time to avoid cache stampedes.
export const TEN_MINUTES = 1000 * 60 * 10;
