type Options = {
  /** The number of milliseconds to cache the result */
  ttl: number;
  /** A global key used for logging */
  key: string;
};

/**
 * Memoizes a function with a cache that expires after a certain amount of time.
 *
 * If the function returns a Promise, we use a "stale-while-revalidate" strategy
 * on the assumption that it's better to never wait on async data if we can help it.
 * This should mean that even if the site gets infrequent traffic, users should still
 * experience fast load times which for a largely static site is more important
 * than it being up-to-date. Eventual consistency is fine.
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

    // If the value is a promise, and we already have a cached value, we return
    // the cached value immediately on the assumption that the cached value
    // already resolved and it's better to not wait on async data if we can help
    // it.
    // The next reader will get the new value.
    if (cached && value instanceof Promise) {
      return cached.value;
    }

    // If the value is _not_ a promise, we return the new value directly since
    // the work to compute the new value has presumably already been done.
    return value;
  } as F;
}

// TODO: Maybe randomize the expiration time to avoid cache stampedes.
export const TEN_MINUTES = 1000 * 60 * 10;
