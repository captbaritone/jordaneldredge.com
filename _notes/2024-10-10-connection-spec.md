---
title: Why use the Relay Connection Spec?
tags:
  - graphql
  - share
  - note
summary: >-
  My response to a Reddit user’s question about the value of the Relay
  Connection Spec
notion_id: 11b376e2-3751-8058-8a7f-c7a1a11c786c
summary_image: https://pub-d4cecb3d578a4c0a8939680792e49682.r2.dev/youtube/PGBC-0E-kco.jpg
---
Reddit user [SherlockCodes](https://www.reddit.com/user/SherlockCodes/) recently [asked](https://www.reddit.com/r/graphql/s/wB2DEFtFQg) this question:

> Why relay spec?\
> Why do people like to use the relay spec?\
> Why the extra boilerplate (node, edges, etc)?

I thought it was a good question and one I feel represents the ecosystem’s general under appreciation for the value this specification can provide, so I thought I’d reply:

---

You might enjoy this GraphQL Conf from last month:

::youtube{token=PGBC-0E-kco}

It walks through deriving the Connection spec from scratch motivated by confronting the different challenges of optimal pagination logic. It also demonstrates how it generalizes the many challenges associated with fetching lists, and allows clients (like Relay) to generically implement sophisticated/optimal list fetching logic.

The original goal was to upstream the connection spec as a “best practice” within the larger spec, but the team lost momentum to push that through once we had solved it internally.
