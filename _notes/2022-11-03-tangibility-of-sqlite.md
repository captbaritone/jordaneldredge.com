---
title: The tangibility of SQLite databases
tags:
  - observation
summary: For some reason SQLite databases feel more “real” to me
notion_id: fca04651-18e9-4f47-bd99-50b079e9e14e
---
Something about using SQLite _feels_ different.

As I’ve started using SQLite for projects instead of MySQL, I’ve started to notice a subtle change in my emotional sense of the database itself. As I write code to record facts in an SQLite database, I find myself with the feeling of tending a garden. Growing this little database file to be richer, more complete and capable.

I think that something about the fact that the database is a single file on disk has transformed “the database” from an abstract implementation detail of a software application, to a concrete, tangible artifact. It has an identity of its own that is separate from the code I use to interact with it. I find myself caring about it in a way that I hadn’t with MySQL databases. What’s more, I find myself starting to think about the goal of the project as “enrich and refine this database”, rather than “build this application”. The code is just a means toward this end. Tools used to tend the garden.

## Zooming out

As our software moves away from the file system and into the cloud, our digital creations have less of a sense concrete identity as they did when they were files on disk.

Don’t get me wrong, it’s fine. Thing change, and the incidental consequences of the old systems are replaced by the incidental consequences of the new. For example, a trustworthy permalink has its own sense of concreteness, and it’s global uniqueness and sharability gives an even stronger sense of identity. GitHub repositories have a sense of concreteness which is stronger than a set of arbitrary files that I uploaded via FTP.

As we design software systems, it’s interesting to think about what it is that imbues things with tangible identity, and how we can design systems to reenforce that feeling where appropriate.
