---
layout: post
title: Gzip hates your DRY code
summary: How to remove code and still increase your library weight.
---

A little over a year ago, I was reading through the source code of [Underscore.js] and noticed two methods that looked awfully similar. Knowing that Underscore was actively trying to [shave off some weight], I thought I'd try to combine them.

Many hours later, I had a working solution which combined the two ten-line functions into a single twelve-line factory function. Smugly please with my cleverness, I went to measure how these few shaved lines would affect the total size of the library.

I had trimmed the minified size by 87 bytes! However I knew the real measure people care about was the gzipped file size so, I gzipped each version to see my final score!

_I had **added** twelve bytes._

That's right, by removing 87 bytes of JavaScript I had increased the over-the-wire size by twelve bytes.

Then it dawned on me. Gzip's entire job is to remove duplication, and it's really good at its job.

None of this is to say that you shouldn't try to consolidate duplicate logic in your code. 99% of the time, DRY code is simpler to understand and easier to maintain. However, do keep in mind that when it comes to file size, gzip is probably better at removing duplicate content than you are.

You can find my proposed change in this [pull request](https://github.com/jashkenas/underscore/pull/2383)

[Underscore.js]: http://underscorejs.org/
[shave off some weight]: https://github.com/jashkenas/underscore/issues/2060
[DRYer]: https://en.wikipedia.org/wiki/Don't_repeat_yourself