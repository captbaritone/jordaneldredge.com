---
title: Bob Nystrom explains the Pratt Parser algorithm
tags:
  - share
  - staticAnalysis
  - note
summary: >-
  Sharing Bob Nystrom’s excellent blog post explaining the Pratt Parser
  algorithm which offers a very clean way to model operator precedence
notion_id: 830b6ccc-73f9-469e-ac8b-19297ccc88ba
---
One of the most challenging things to express cleanly in a parser is operator precedence. That’s why I’m so enamored of this blog post by Bob Nystrom, the author of [my favorite compiler book](https://jordaneldredge.com/notes/crafting-interpreters/). [Pratt Parsers: Expression Parsing Made Easy](https://journal.stuffwithstuff.com/2011/03/19/pratt-parsers-expression-parsing-made-easy/). This post provides an incredibly approachable breakdown of how to implement a Pratt parser. While the algorithm can take some time to wrap your head around, Bob does a great job of helping you get there. And once you get it, the result is a nice tidy way to express precedence in your parser.

<https://journal.stuffwithstuff.com/2011/03/19/pratt-parsers-expression-parsing-made-easy/>
