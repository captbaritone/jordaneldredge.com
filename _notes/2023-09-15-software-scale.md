---
title: Software at Scale
tags:
  - observation
summary: >-
  On scaling software to large numbers of developers, not just large amounts of
  data
---
When people talk about “software at scale” their first thought is often about algorithms and infrastructure scaling to billions/trillions of requests.

But there’s less discussed aspect of scale: abstractions that scale to support tens of thousands developers in a shared code base.

How do you scale up contributors without tragedy-of-the-commons dynamics leading to an unmaintainable mess or terrible user experience/performance?

Meta has a combination of scale (people) and bottoms-up, flat, engineering culture that forces us to think about this problem harder than nearly anybody else. I suspect that's why we see technologies like React and GraphQL come out of Meta and not, say, Google or Microsoft.
