---
title: The Winamp Skin Museum is powered by an sqlite3 database
tags:
  - winamp
  - anecdote
summary: >-
  The Winamp Skin Museum is powered by an sqlite3 database containing 1.2gb of
  metadata about 86,000 Winamp skins and exposed as a public GraphQL endpoint
notion_id: c43cf40f-bd71-4000-8a53-6e4150eb0897
summary_image: >-
  https://pub-d4cecb3d578a4c0a8939680792e49682.r2.dev/notion-mirror/84ebb48c-616a-4f51-ae9a-991a4e0a7e9b/3eff4cda-73c0-4f9f-a6f6-0b747a8e9e18/Untitled.png
---
This note was originally posted as a [thread on Twitter](https://twitter.com/captbaritone/status/1535471373191028737) which was discussed on [Hacker News](https://news.ycombinator.com/item?id=31703874).

---

The Winamp Skin Museum is powered by a sqlite3 database containing 1.2gb of metadata about 86,000 Winamp skins. It's all exposed in this explorable GraphQL endpoint: [https://api.webamp.org/graphql](https://t.co/VTW0YVwtQp)

![](https://pub-d4cecb3d578a4c0a8939680792e49682.r2.dev/notion-mirror/84ebb48c-616a-4f51-ae9a-991a4e0a7e9b/3eff4cda-73c0-4f9f-a6f6-0b747a8e9e18/Untitled.png)

The data includes:

- Original filenames and md5 hashes of each skin
- Names/metadata of all files compressed WITHIN the skins (file size, date, filename)
- Text content of all text files found within the skins
- URL/likes/retweets if the skin was share by [@winampskins](https://twitter.com/winampskins) (or on Instagram)
- Full metadata/info about each skin's [@internetarchive](https://twitter.com/internetarchive) page
- Info about manual reviews (good to tweet? NSFW?)
- URLs to download skin files or  screenshots
- Kinda fun data to [comb though](https://jordaneldredge.com/notes/corrupted-skins/) (if you're like me).

If anyone is interested in getting the raw DB to play with, or has ideas for extra stuff to expose in the graph, get in touch.
