---
title: "I gave a talk about compiling to WebAssembly in the browser"
summary: 'Video of my TSConf 2021 talk entitled "Faster, Safer: Compiling Untrusted Code to WebAssembly in the Browser".'
youtube_slug: hZzjrgZb-mw
tags: ["talk", "wasm", "typescript", "javascript", "staticAnalysis"]
---

After receiving positive feedback on my post [Speeding Up Webamp's Music Visualizer with WebAssembly](/blog/speeding-up-winamps-music-visualizer-with-webassembly), I was encouraged by [Colin Eberhardt](https://blog.scottlogic.com/ceberhardt/), author of [WebAssembly Weekly](https://wasmweekly.news/), to give a talk on the topic. I submitted a proposal to [TSConf](https://tsconf.io/) and, to my surprise, it was accepted!

The talk covers:

- The many varied projects that have spun out of my work on [Webamp](https://webamp.org)
- Our choice to use WebAssembly, and run the compiler in the browser
- A glimpse at how the compiler is implemented
- Some of the challenges we faced in trying to make WebAssembly fast

You can watch the video of the talk here:

::youtube{token=hZzjrgZb-mw}

For me, the highlight of the day was a comment that [Anders Hejlsberg](https://en.wikipedia.org/wiki/Anders_Hejlsberg), creator of TypeScript, gave to a question in the [final Q/A](https://youtu.be/gfn-aKykyAM?t=763) of the event about TypeScript targeting WebAssembly:

> I thought that talk about dynamically creating WebAssembly from a little mini DSL was actually super interesting, and I think that's a very appropriate use of WebAssembly.

_― Anders Hejlsberg_

In many ways, this talk is a more polished version of the one I gave at the virtual meetup [Speakeasy JS](https://speakeasyjs.com/) back in July entitled _Speeding Up Webamp's Music Visualizer w/ In-Browser WebAssembly Compiler_:

::youtube{token=68nBrxM5ukU}

_Thanks to [Jordan Berg](https://twitter.com/jnberg16), author of Butterchurn for collaborating with me on the compiler, [Colin Eberhardt](https://blog.scottlogic.com/ceberhardt/) for suggesting I give the talk, and [Lauren Tan](https://www.no.lol/) for connecting me with the excellent folks who organize TSConf._
