---
title: 'My GraphQL Conf 2024 talk: Semantic Nullability'
tags:
  - javascript
  - graphql
  - react
  - talk
  - video
  - note
summary: >-
  Youtube video of the talk I gave at GraphQL Conf 2024 covering advanced client
  error handling and its implications for potentially fundamentally solving the
  problem of pervasive nullability in GraphQL
notion_id: 605c4506-27cf-4162-850d-e435f429c52b
summary_image: https://pub-d4cecb3d578a4c0a8939680792e49682.r2.dev/youtube/kVYlplb1gKk.jpg
---
At this year’s GraphQL Conf I gave a talk on some work I’ve been helping drive within [Relay](https://relay.dev/) and through the GraphQL Working Group. It outlines how nullability and error handling are entangled in GraphQL today, and how if clients can start handling field errors explicitly, there is a chance to untangle these two concepts. The result is a much better product development experience that retains network response resiliency.

It’s also a good introduction to the new `@catch` and `@throwOnFieldError` directives that have shipped in [Relay version 18](https://github.com/facebook/relay/releases/tag/v18.0.0).

::youtube{token=kVYlplb1gKk}
