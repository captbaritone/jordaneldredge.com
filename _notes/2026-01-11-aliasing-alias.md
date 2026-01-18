---
title: Aliasing alias
tags:
  - anecdote
summary: The time I accidentally aliased the command alias and fork bombed myself
notion_id: 146376e2-3751-8002-95b8-ce1c9cbb40b5
---
_Originally_ [_posted on Twitter_](https://x.com/captbaritone/status/1796487170531922360) _in May 2024._

---

Back in May of 2024 I realized that I was underusing the `alias` shell feature. “I should be creating more aliases!” I thought. “I know, I’ll make an alias that opens my `.zshrc` file in VSCode!” I continued to think.

Now, what should I name this alias? Something short and memorable. “I know: `alias`!”. That was a mistake. Next time I opened a terminal, my `.zshrc` was run and my new `alias` alias was established. This meant that all subsequent aliases in my `.zshrc` (about five) didn’t create a new alias, but instead opened their own copy of VSCode.

Now here’s the fun part: VSCode has its own terminal so each new instance of VSCode _also_ invoked my `.zshrc`. The result is that my computer instantly started opening an exponentially increasing number of instances of VSCode, much faster than I could kill them. I had accidentally created a [fork bomb](https://en.m.wikipedia.org/wiki/Fork_bomb).

Amusingly Mac OS was still able to smoothly animate each VSCode icon being added to the application bar with it’s jovial little bounce, resulting in an amusing wave pattern of increasingly tiny VSCodes.

For your amusement, I’ve included a video of that dance here. That’s a lot of VSCodes!

[Jordan\_Eldredge\_-\_Pro\_tip%EF%BC%9A\_Dont\_alias\_the\_command\_alias\_to\_a\_command\_that\_opens\_VSCo...\_1796487116010233856.mp4](https://pub-d4cecb3d578a4c0a8939680792e49682.r2.dev/notion-mirror/84ebb48c-616a-4f51-ae9a-991a4e0a7e9b/8fd0e04e-a5ed-43df-ad83-e68974680ba3/Jordan_Eldredge_-_Pro_tip%25EF%25BC%259A_Dont_alias_the_command_alias_to_a_command_that_opens_VSCo..._1796487116010233856.mp4)
