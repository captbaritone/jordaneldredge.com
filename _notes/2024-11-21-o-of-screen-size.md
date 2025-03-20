---
title: Client data should not need to exceed O(screen size)
tags:
  - javascript
  - opinion
  - observation
  - react
  - note
summary: A rule of thumb for thinking about scaling client application state
notion_id: 145376e2-3751-8072-87d4-d4d75cf407cb
---
A colleague of mine once pointed out a simple but important observation which I’ve carried with me through my career: A client application should never need to download more than `O(screen size)` data at a time.

When thinking about the data needs of a client application, where the source of truth is ultimately a server in the cloud, you should always be able to architect your application such that the client only needs to download and retain, on the order of, one screen size’s worth of data.

This is an important observation because it is common to come across instances where people building a client application _feel_ they need to download and process a large amount of data on the client. As one might expect, this often leads to scaling and performance challenges, which prompt all kinds of complex, crazy, and often untenable technical solutions or workarounds.

This rule of thumb is important because it can act as a reminder when you, or your team find yourself going down this path to step back and ask yourself: “Why is it that I think I need to download more than one screen worth of data to render this UI?”. The answer will be that could be reconsidered, because there should always exist some architecture which gets you back to the point where the client doesn’t need to download an exorbitant amount of data.

I suppose there’s also a corollary to this observation, which is that any client application which requires downloading more than `O(screen size)` data will fundamentally struggle to scale.
