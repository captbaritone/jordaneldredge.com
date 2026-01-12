---
title: SQLite can emit ASCII art diagrams of its parse AST
tags:
  - sqlite
  - staticAnalysis
  - share
  - video
summary: >-
  For debugging purposes you can compile SQLite with special flags to make it
  print out its ASTs in a special ASCII format
notion_id: 1d8376e2-3751-80d8-bb94-e91e746cad8a
summary_image: >-
  https://pub-d4cecb3d578a4c0a8939680792e49682.r2.dev/notion-mirror/84ebb48c-616a-4f51-ae9a-991a4e0a7e9b/071647ff-1065-4f45-921c-853264aa8f6d/FYrrVT4WAAYrAXC.jpeg
---
_This post originally shared as_ [_a Tweet_](https://x.com/captbaritone/status/1552313020067594249) _in 2022._

---

Watching [this 2015 talk from Richard Hipp](https://youtube.com/watch?v=gpxnbly9bz4) about SQLite and learned that you can configure SQLite (at build time) to emit cool ascii art of its parse AST as well as IR at various points during compilation/optimization. Presumably this mode is used by SQLIte’s own developers for debugging parsing and IR transformation issues.

![FYrrVT4WAAYrAXC.jpeg](https://pub-d4cecb3d578a4c0a8939680792e49682.r2.dev/notion-mirror/84ebb48c-616a-4f51-ae9a-991a4e0a7e9b/071647ff-1065-4f45-921c-853264aa8f6d/FYrrVT4WAAYrAXC.jpeg)

I had to pass `--enable-debug` when running `configure` before running make. Then ran the following pragmas before issuing my query:

```text
.selecttrace 0xfff
.wheretrace 0xfff
```

Documented as #5 here: [https://sqlite.org/debugging.html](https://t.co/sKpOLAI3z6)

## Explain

Another cool debug feature is SQLite’s `EXPLAIN` which prints the [bytecode](https://sqlite.org/whybytecode.html) for a given query in a cute table format (what else would you expect!). For example:

```text
sqlite> EXPLAIN SELECT `title` from `content` WHERE `tags` LIKE "%sqlite%";
addr  opcode         p1    p2    p3    p4             p5  comment
----  -------------  ----  ----  ----  -------------  --  -------------
0     Init           0     10    0                    0   Start at 10
1     OpenRead       0     2     0     6              0   root=2 iDb=0; content
2     Rewind         0     9     0                    0
3       Column         0     5     3                    0   r[3]= cursor 0 column 5
4       Function       1     2     1     like(2)        0   r[1]=func(r[2..3])
5       IfNot          1     8     1                    0
6       Column         0     3     4                    0   r[4]= cursor 0 column 3
7       ResultRow      4     1     0                    0   output=r[4]
8     Next           0     3     0                    1
9     Halt           0     0     0                    0
10    Transaction    0     0     136   0              1   usesStmtJournal=0
11    String8        0     2     0     %sqlite%       0   r[2]='%sqlite%'
12    Goto           0     1     0                    0
```

I particularly like that the `comment` column contains a little translation of what the instruction will do.

Documented as #3 here: <https://sqlite.org/opcode.html>
