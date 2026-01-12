---
title: Have you tried rubbing a database on it?
tags:
  - share
summary: >-
  A collection of mad science talks applying the ideas of databases to all kinds
  of different problems
notion_id: 1263e050-adce-46a4-ab15-b930979b78fa
---
“[Have you tried rubbing a database on it](https://www.hytradboi.com/)” appears to have been a fantastic conference where people presented all kinds of crazy eccentric projects related to databases. I didn’t know about it at the time, but luckily for me the talks were recorded.

A common refrain I hear in discourse around modern software architecture, especially on the front end, is that we’re simply rediscovering concepts that have been well understood in computer science since the 1970s. As someone interested in the challenges of UI state management, it’s natural to look to databases — a well studied field of compute science — for ideas that might be applicable to this problems space. For this reason, I’ve recently been trying to follow what’s going on in the world of databases.

These talks are all about “what if you apply the concepts of databases to all kinds of software problems?”, and the results, while not always practical, are fascinating to contemplate and are sure to set creative sparks flying in any hacker’s mind.

## Some of my favorites:

- [Your frontend needs a database](https://www.hytradboi.com/2022/your-frontend-needs-a-database) which tries to convince the viewer that they should model their application state in a client-side database
- [Building data-centric apps with a reactive relational database](https://www.hytradboi.com/2022/building-data-centric-apps-with-a-reactive-relational-database) same as above, but imagining a reactive relational database
- [Codebase as database: turning the IDE inside out with datalog](https://www.hytradboi.com/2022/codebase-as-database-turning-the-ide-inside-out-with-datalog) the title is a play on one of my [favorite blog posts ever](https://jordaneldredge.com/notes/a37c0cf1-c04e-4b86-bb84-bd561a378c69/). In the speakers own words “_I made a prototype IDE in which language semantics are specified in datalog, powered by a datalog interpreter written in TypeScript, running the browser.”_
- [Simple Graph: SQLite as (probably) the only graph database you'll ever need](https://www.hytradboi.com/2022/simple-graph-sqlite-as-probably-the-only-graph-database-youll-ever-need) Use SQLite’s built in JSON support to use SQlite like a simple graph database

All the talks: <https://www.hytradboi.com/>
