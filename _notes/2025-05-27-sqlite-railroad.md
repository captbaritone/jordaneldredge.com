---
title: SQLite Railroad Diagrams
tags:
  - share
  - sqlite
  - staticAnalysis
  - note
summary: >-
  I love the way SQLite uses these visual diagrams to describe the grammar of
  their SQL dialect
notion_id: 146376e2-3751-8000-b2e5-c96dfb297646
summary_image: >-
  https://pub-d4cecb3d578a4c0a8939680792e49682.r2.dev/notion-mirror/84ebb48c-616a-4f51-ae9a-991a4e0a7e9b/000aec1e-ad7d-4bd5-b977-9f7e04ab84a7/FZDSVzdUEAA3ufm.jpeg
---
_Originally_ [_shared on Twitter_](https://x.com/captbaritone/status/1553973901251596288) _in Jul. 2022._

---

![FZDSVzdUEAA3ufm.jpeg](https://pub-d4cecb3d578a4c0a8939680792e49682.r2.dev/notion-mirror/84ebb48c-616a-4f51-ae9a-991a4e0a7e9b/000aec1e-ad7d-4bd5-b977-9f7e04ab84a7/FZDSVzdUEAA3ufm.jpeg)

Programming languages (including SQL) are generally defined in terms of formal grammars. Often this gets documented using formal grammar notion syntaxes like [Backus–Naur form](https://en.wikipedia.org/wiki/Backus%E2%80%93Naur_form). For example, here is how Postgres documents their syntax:

![image.png](https://pub-d4cecb3d578a4c0a8939680792e49682.r2.dev/notion-mirror/84ebb48c-616a-4f51-ae9a-991a4e0a7e9b/26288bed-fb18-48e2-80c2-670bdcb0d770/image.png)

While SQLite does uses a syntax like that internally, for the purposes of their documentation, they generate these delightful “Railroad Diagrams” that work more like little choose your own adventure flow charts. I personally find them very intuitive to read, despite having spent quite a bit of time thinking about formal grammars and being relatively fluent in the various [metasyntaxes](/146376e237518000b2e5c96dfb297646).

Like many things the SQLite folks do, they actually created their own declarative language [Pikchr](https://pikchr.org/home/doc/trunk/doc/userman.md) for defining diagrams which get embedded in documentation. I believe this is what’s used to generate these railroad diagrams. Note that the tool’s site is hosted using [Fossil](https://fossil-scm.org/) which is their all in one source control/website tool which they also hand rolled and is powered by (you guessed it) SQLite. At this point you’ll be unsurprised to learn that Fossil includes a hand rolled HTTP stack.
