---
title: Next.js’s unstable_cache() demystified
tags:
  - share
  - til
  - note
summary: I found some interesting information about Next.js’ elusive unstable_cache API
notion_id: f0059280-f796-4bf3-bb62-c98c1391139c
---
In working on my personal site, I’ve been trying to add some caching using Next.js’s `unstable_cache()` feature. It sounds like what I want, but the behavior has been quite unpredictable and the [spartan documentation](https://nextjs.org/docs/app/api-reference/functions/unstable_cache) does not help much. Luckily [Alfonsus Ardani](https://github.com/alfonsusac) went down this rabbit hole before me and documented his many findings in this great Notion doc.

[`unstable_cache()`](/f300b3184d6a472ea5282543d50b9f02)[ from next/cache](https://capt.dev/unstable_cache)

It turns out one of my major issues was I was returning classes from my cached functions and that fails. In fact, it has many subtle complexiteis and caveats:

- It caches across requests _and_ reloads and it’s not clear how to reset that
- It cannot be used outside of a request (this means you can’t reuse these functions in scripts etc)
- It’s very heavyweight (serializing the entire function body as part of the cache key!)
- Despite caching across requests Alfonsus mentions that it does not dedupe across contexts, which seems very confusing if it’s true.
- Returned values must be serializable

With all of that context, I’m going to explore a simpler approach and just use a memoize-style in-memory caching approach. Maybe in the future when the API stabilizes I’ll revisit it.
