---
title: Reactive GraphQL Architecture
tags:
  - graphql
  - javascript
  - react
  - opinion
summary: >-
  A vision for using GraphQL on the client for local-first apps, apps using e2e
  encryption, and other apps with heavy client state
notion_id: 121376e2-3751-80e8-b1bf-e7d3e23b5749
---
As part of designing proposed architecture solutions for some Meta web apps, I wrote a GitHub issue outlining a vision for an application architecture which leverages the GraphQL language to model rich, reactive, client state as fields and types stitched into a GraphQL graph which can (optionally) also expose server state.

You can read the full write up here: <https://github.com/facebook/relay/issues/4687>

The architecture allows a sophisticated GraphQL client (Relay?) to coordinate:

1. Fetching of server data
2. Reading of and (subtraction to) client data sources
3. Reactive (re)computation of data derived from the above
4. Efficient updates of UI components derived from 1,2,3

It does this while presenting a unified, and tool-supported interface to product code, GraphQL, providing a structured way to define your data layer, and also offering a path to moving heavy client star off the main thread.

I think this is a very interesting architecture to explore for apps with a large contributor bases, heavy client state, and a need to use a hybrid of client and server state.

## Local-First

The [Local-First](https://localfirstweb.dev/) architecture movement is hopeful that many apps will eventually be able to be built against a fully local database, with the server reduced to a distributed systems synchronization problem. I hope they’re right! But, for the time being, I remain convinced that even if their vision is wildly successful, most real apps will continue to need to meaningfully incorporate traditional request/response server data. If that proves to be the case, an architecture like this may prove quite useful.
