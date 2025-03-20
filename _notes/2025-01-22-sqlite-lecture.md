---
title: Dr. Richard Hipp Lectures on SQLite
tags:
  - share
  - sqlite
  - talk
  - note
summary: >-
  SQLite’s creator Dr. Richard Hipp shares the story and implimentation of
  SQLite
notion_id: 183376e2-3751-80b6-b682-fa0b9127a77a
summary_image: https://pub-d4cecb3d578a4c0a8939680792e49682.r2.dev/youtube/gpxnbly9bz4.jpg
---
SQLite is a fascinating pice of technology. It is a model of picking a single problem to solve, and solving it really robustly while keeping external complexity low. In 2015 SQLite’s creator, Dr. Richard Hipp gave a lecture at Carnegie Mellon as part of a [Databaseology](https://db.cs.cmu.edu/seminar2015/) lecture series in which they had key contributors to many different databases present.

Additionally, Dr. Hipp started as something of a database outsider. He did not study databases formally and did not look too keenly at what other databases were doing. Instead he mostly derived the design himself from first principals. In many cases this lead to arriving at similar architecture choices to other databases, but in some cases he ended up with pretty different, but still compelling alternatives.

One notable example, is that prepared statements compile to a bytecode that is interpreted by a VM instead of an AST that is walked to execute the query.

::youtube{token=gpxnbly9bz4}

If you find this interesting and would like to hear more narrative about SQLite I’d recommend [Dr. Hipp’s interview on the CoRecursive podcast](https://corecursive.com/066-sqlite-with-richard-hipp/).
