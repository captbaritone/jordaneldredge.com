---
title: Rendering “modern” Winamp skins in the browser
tags:
  - winamp
  - javascript
  - staticAnalysis
summary: >-
  Writing an interpreter for a custom bytecode opens the door for rendering
  interactive custom Winamp skins in the browser
notion_id: 144376e2-3751-80de-abf0-ec0b005d6d26
summary_image: >-
  https://pub-d4cecb3d578a4c0a8939680792e49682.r2.dev/notion-mirror/84ebb48c-616a-4f51-ae9a-991a4e0a7e9b/8b644494-12b4-4aa3-8e6f-fd02f95341bd/Screenshot_2024-11-19_at_4.39.04_PM.png
---
_Discussed on_ [_Hacker News_](https://news.ycombinator.com/item?id=42215438)

---

![](https://pub-d4cecb3d578a4c0a8939680792e49682.r2.dev/notion-mirror/84ebb48c-616a-4f51-ae9a-991a4e0a7e9b/8b644494-12b4-4aa3-8e6f-fd02f95341bd/Screenshot_2024-11-19_at_4.39.04_PM.png)

_TL;DR several years ago I got a proof of concept working where I was able to render highly interactive “modern” Winamp skins in the browser by reverse engineering Maki byte code and implementing an interpreter for it in JavaScript. You can try the_ [_proof of concept_](https://webamp.org/modern/) _in your browser._

---

One of the most rewarding projects I’ve worked on was [Webamp](https://webamp.org/). Seeing classic Winamp skins come to life in my browser via code I wrote was intoxicating and eventually inspired me to create the [Winamp Skin Museum](https://jordaneldredge.com/blog/winamp-skin-musuem/). But Webamp “just” implements “classic” Winamp skins, which were basically a glorified set of sprite sheets. They could change the appearance of the player but not the layout, and they could not add any custom interactions.

However, after [skipping Winamp 4](https://jordaneldredge.com/notes/winamp-4-skin/), Winamp 5 introduced a new, dramatically more powerful, skinning engine. The new engine was powered by XML files describing the UI, which was made interactive via skinner defined scripts written in a bespoke language called MAKI (”Make a killer interface”). Together, XML and Maki worked much like HTML and JavaScript. They enabled “skinners” to create highly dynamic UIs. This included interfaces with custom animations, interactive elements, and more.

After tackling classic Winamp skins it was only natural that I should be curious about modern skins, and I was! Could I get modern skins to run in the browser?

After reading up on how these skins were implemented, I learned that the modern skins were distributed as `.zip` files with the extension `.wal` that consisted of `.xml` and `.maki` files along with images. The `.maki` scripting files contained a custom compiled bytecode. Some skins also included the source `.m` files, but not all. The skin authors had been required to compile their skins before uploading them. If I was going to render these skins in the browser, I was going to need to understand the bytecode.

## Reverse engineering Maki

At this point I was new to the concepts of byte code, interpreters _and_ reverse engineering, so I needed some help. Luckily, I found an ancient [Maki dissembler written by Ralf Engels](https://web.archive.org/web/20180627114343/http://www.rengels.de/maki_decompiler/doc.html). This Perl script would take a Maki byte code file and try to construct a source file from it. The intended audience was skinners who wanted to learn from an existing skin’s script which was not distributed with its source code. Aside: The tool’s page has an interesting meditation on the ethics of enabling people to see code that skinners had potentially intentionally tried to hide from others.

Since the Perl code had to understand the semantics of the byte code in order to produce the equivalent source code, I was able to read the Perl code and (slowly!) build my own JavaScript parser capable of converting Maki byte code files into a structured representation. By leveraging a large collection of real `.maki` files extracted from downloaded skins, I was able to fuzz my implementation and rattle out many bugs.

As a resource to any fellow traveler who decides to go down this same path, I attempted to document all my findings in this file: [`maki-bytecode.md`](http://maki-bytecode.mdhttps//github.com/captbaritone/webamp/blob/master/packages/webamp-modern/src/maki/maki-bytecode.md)

## Crafting an interpreter

With a structured version of the byte code in hand, I was able to start work on an interpreter. As a newbie to this type of programming I leaned into a “[learn by doing](https://jordaneldredge.com/notes/lazy-learning/)” approach. To any reader interested in reading this type of work, I highly recommend Bob Nystrom’s [Crafting Interpreters](https://jordaneldredge.com/notes/crafting-interpreters/).

Partially because the language is a bit quirky, and mostly because I had no idea what I was doing, I spent a fair bit of time getting hung up on things like:

- How return pointers worked (do they go on the stack? Is there some other return stack?)
- Some mysterious byte codes which the decompiler implied had to do with “stack protection”
- How to model both scalars and complex objects on the stack

Each of these was an interesting puzzle to solve! At one point I even tried [disassembling Winamp itself using Ghidra](https://jordaneldredge.com/notes/winamp-ghidra/), and while I was able to locate the main interpreter loop, my C++/disassembly chops were not sufficient for this to provide much insight.

But, with enough iteration, and enough test cases (again mined from my collection of real skins) I was able to get it basically working!

You can see the current version of the interpreter [here on GitHub](https://github.com/captbaritone/webamp/blob/master/packages/webamp-modern/src/maki/interpreter.ts).

## The standard library and the DOM (equivalent)

Having an interpreter was actually just the beginning. Just like having a JavaScript engine is not sufficient to build a browser, I needed to figure out how to parse the accompanying XML files, bind them to the scripts in the `.maki` files and also implement all the “standard library” of Maki. This included things from basic utility functions, all the way up to the various classes that modeled all the different types of UI objects. On the order of 65 classes with many methods each (you can find a [full list here](https://github.com/captbaritone/webamp/blob/master/packages/webamp-modern/resources/maki_compiler/v1.2.0%20\(Winamp%205.66\)/lib/std.mi)).

Basically each of these classes needed to be implemented and define some mapping/binding from its properties and methods to an equivilent DOM representation. I took a pragmatic approach. I picked the simplest skin I could find and started implementing the classes and methods needed just to render that one skin. Slowly but surely I was able to get the one skin rendering! After that first skin, I pick another small skin and over time I had a small handful working and then dozens!

![](https://pub-d4cecb3d578a4c0a8939680792e49682.r2.dev/notion-mirror/84ebb48c-616a-4f51-ae9a-991a4e0a7e9b/68b66ce9-6089-4fe1-8b71-7f85cdb2772c/Screenshot_2024-11-19_at_6.57.08_PM.png)

[CornerAmp\_Redux.wal, the first skin I got working in Webamp Modern](https://webamp.org/modern/?skin=assets%2Fskins%2FCornerAmp_Redux.wal)

But this is eventually where I lost steam. The API surface was just to large for me to complete with my available time, and even figuring out what the expected behavior of any class/method/property was required hours of manual trial and error in Winamp. But more importantly, I never found a satisfactory way to connect these nested objects to the DOM that was scalable to implement reliably, performant, didn’t leak, and preserved the subtle difference to how the DOM and Maki worked. I suspect a way exists, I just wasn’t able to find it.

## A hero comes along

Despite the project basically sitting on ice, [x2nie](https://github.com/x2nie) appeared in our Discord one day and wanted to drive the project forward. However, his style was dramatically different than my own. Sprawling ambitious PRs focusing on getting things to “work” instead of carefully considered incremental improvements, focusing on detailed parity with Winamp and elegant architecture on the JavaScript side.

I was stuck in an awkward position of holding up PRs because they were time consuming to review and I often didn’t find the approaches taken to be satisfactory. At the same time, I didn’t have the time or brain space to come up with satisfactory solutions to help unblock him. After all, it was my inability to come up with satisfactory solutions to these hard problems that had lead me to stall out on the project in the first place!

In the end, I had to admit that my approach was stalled out and his approach, while different than my own, had forward momentum. I opted to just try to get out of his way and “let him cook”.

I revived the [progress dashboard](https://webamp.org/modern/progress.html) I had made which introspected the implementation to derive an always-up-to-date progress report, and just stamped his diffs as they poured in.

![](https://pub-d4cecb3d578a4c0a8939680792e49682.r2.dev/notion-mirror/84ebb48c-616a-4f51-ae9a-991a4e0a7e9b/fb623f47-d527-46b9-8635-69a5082c18e3/Screenshot_2024-11-19_at_6.55.47_PM.png)

In the end, he made considerable progress, getting many additional features working, but the project still struggled to feel robust or complete. Eventually his attention moved on to other things, but I’m still grateful for the energy he brought to the project!

## Conclusion, for now?

I still don’t have a clear idea how to structure the JS code to make it scalable to fill in all the blanks needed while being largely “correct”. And, while more features work now than when I last actively worked on it, the code is likely harder for me to get into the shape I envision. Mostly because it’s no-longer code I wrote.

That said, several things have changed in the intervening years. LLMs have made highly repetitive/derivative programming tasks easier to scale, and the source code for Winamp has been released as “open”, so in theory I could go look at the actual source code and get more authoritative answers to what the expected Winamp behavior _should_ be, and maybe have a higher likelihood of being able to cover all the ground needed to get a fully working version.

Unfortunately, the license of the released Winamp code is not actually permissive and they’ve actually [pulled the code from GitHub](https://www.theregister.com/2024/10/16/opensourcing_of_winamp_goes_badly/). At this point, it actually feels legally more risky to build derivative works than it did before the source was “opened up”.

I still hold out hope that I’ll be motivated at some point in the future to come back to the project and have some epiphany. But in the mean time, I’m very happy to have seen the project come this far!

**Give it a try!** [**https://webamp.org/modern/**](https://webamp.org/modern/)

## Gallery

I’ll end with a collection of screenshots showing some of the interesting skins that Webamp Modern is capable of rendering. I’d encourage you to click into the skins to try them in your browser and interact with them to see the animations and explore all the little drawers and tabs.

![](https://pub-d4cecb3d578a4c0a8939680792e49682.r2.dev/notion-mirror/84ebb48c-616a-4f51-ae9a-991a4e0a7e9b/404c13f1-053b-4d3b-8212-f7732d039260/Screenshot_2024-11-19_at_7.03.26_PM.png)

[https://webamp.org/modern/](https://webamp.org/modern/?skin=)

---

![](https://pub-d4cecb3d578a4c0a8939680792e49682.r2.dev/notion-mirror/84ebb48c-616a-4f51-ae9a-991a4e0a7e9b/514cbb99-2b2d-4d18-a621-d6f826a9cf05/Screenshot_2024-11-22_at_9.49.46_PM.png)

[https://webamp.org/modern/?skin=https://r2.webampskins.org/skins/c2273648295a986350f0e2007b705e85.wal](https://webamp.org/modern/?skin=https%3A%2F%2Fr2.webampskins.org%2Fskins%2Fc2273648295a986350f0e2007b705e85.wal)

---

![](https://pub-d4cecb3d578a4c0a8939680792e49682.r2.dev/notion-mirror/84ebb48c-616a-4f51-ae9a-991a4e0a7e9b/ac26dbf8-edb7-4fc9-96fe-d590489de37b/Screenshot_2024-11-22_at_9.52.46_PM.png)

[https://webamp.org/modern/?skin=https://r2.webampskins.org/skins/84be4029fa8dd4305b3eee70c648749b.wal](https://webamp.org/modern/?skin=https%3A%2F%2Fr2.webampskins.org%2Fskins%2F84be4029fa8dd4305b3eee70c648749b.wal)

---

![](https://pub-d4cecb3d578a4c0a8939680792e49682.r2.dev/notion-mirror/84ebb48c-616a-4f51-ae9a-991a4e0a7e9b/322618d1-d08c-4ada-bcd6-ba97e837abf5/Screenshot_2024-11-22_at_9.54.11_PM.png)

[https://webamp.org/modern/?skin=https://r2.webampskins.org/skins/00bf47f38660c04f89c3abe06eacd5af.wal](https://webamp.org/modern/?skin=https%3A%2F%2Fr2.webampskins.org%2Fskins%2F00bf47f38660c04f89c3abe06eacd5af.wal)

---

![](https://pub-d4cecb3d578a4c0a8939680792e49682.r2.dev/notion-mirror/84ebb48c-616a-4f51-ae9a-991a4e0a7e9b/d0ef561f-1616-418b-9044-c2121865e4cf/Screenshot_2024-11-22_at_9.56.53_PM.png)

[https://webamp.org/modern/?skin=https://r2.webampskins.org/skins/97a759e2f0261eb0b7c65452d70318d0.wal](https://webamp.org/modern/?skin=https%3A%2F%2Fr2.webampskins.org%2Fskins%2F97a759e2f0261eb0b7c65452d70318d0.wal)

---

![](https://pub-d4cecb3d578a4c0a8939680792e49682.r2.dev/notion-mirror/84ebb48c-616a-4f51-ae9a-991a4e0a7e9b/dad3ca85-9543-4d3a-b129-7e83839762c9/Screenshot_2024-11-22_at_9.58.03_PM.png)

[https://webamp.org/modern/?skin=https://r2.webampskins.org/skins/026d840ca4bebf678704f460f740790b.wal](https://webamp.org/modern/?skin=https%3A%2F%2Fr2.webampskins.org%2Fskins%2F026d840ca4bebf678704f460f740790b.wal)

---

![](https://pub-d4cecb3d578a4c0a8939680792e49682.r2.dev/notion-mirror/84ebb48c-616a-4f51-ae9a-991a4e0a7e9b/61e55b5e-c750-4013-8a45-2d3400f1c670/Screenshot_2024-11-22_at_9.59.09_PM.png)

[https://webamp.org/modern/?skin=https://r2.webampskins.org/skins/2f2d4a3b9aff93ed9d1a240597c298c6.wal](https://webamp.org/modern/?skin=https%3A%2F%2Fr2.webampskins.org%2Fskins%2F2f2d4a3b9aff93ed9d1a240597c298c6.wal)
