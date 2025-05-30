---
title: Software at Scale
tags:
  - observation
  - note
summary: >-
  On scaling software to large numbers of developers, not just large amounts of
  data
notion_id: 614bf6fb-f58e-4318-8d5d-462bf6bb0d5d
---
When people talk about “software at scale” their first thought is often about algorithms and infrastructure scaling to billions/trillions of requests.

But there’s less discussed aspect of scale: abstractions that scale to support tens of thousands of developers in a shared code base.

How do you scale up contributors without [tragedy-of-the-commons](https://en.m.wikipedia.org/wiki/Tragedy_of_the_commons) dynamics leading to an unmaintainable mess or terrible user experience/performance?

Meta has a combination of scale (people) and bottoms-up, flat, engineering culture that forces us to think about this problem harder than nearly anybody else. I suspect that's why we see technologies like React and GraphQL come out of Meta and not, say, Google or Microsoft.
