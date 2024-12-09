---
title: A Winamp Skin Detective Story
tags:
  - winamp
  - anecdote
summary: Tracking down the cause of some mysteriously corrupted Winamp skins
notion_id: dc60fad4-de0b-465f-b0f0-cd4217d3c157
summary_image: >-
  https://pub-d4cecb3d578a4c0a8939680792e49682.r2.dev/notion-mirror/84ebb48c-616a-4f51-ae9a-991a4e0a7e9b/fa0ff4b2-ba0e-41f8-af03-a14453041eb7/Screenshot_2023-08-04_at_8.03.39_PM.png
---
A little Winamp skin detective story played out in the Webamp Discord today. Figured I’d write up the story as it played out as a thread.

Someone reported a skin as NSFW (it wasn’t) but while I was reviewing it, I noticed something odd. The background colors of the numbers was off.

Maybe a Webamp rendering bug…? 🧵

![](https://pub-d4cecb3d578a4c0a8939680792e49682.r2.dev/notion-mirror/84ebb48c-616a-4f51-ae9a-991a4e0a7e9b/fa0ff4b2-ba0e-41f8-af03-a14453041eb7/Screenshot_2023-08-04_at_8.03.39_PM.png)

---

Nope, Eris checked, and the bug reproduced in real Winamp. Something was wrong with the skin. But what? Upon closer inspection he noticed it included both numbers.bmp AND nums\_ex.bmp. Winamp prefers the later, but the nums\_ex.bmp didn’t match the rest of the skin.

How did that file it end up in this skin…?

![](https://pub-d4cecb3d578a4c0a8939680792e49682.r2.dev/notion-mirror/84ebb48c-616a-4f51-ae9a-991a4e0a7e9b/1b6b24f6-efc6-455c-8c97-b6ce36302e9a/Screenshot_2023-08-04_at_8.05.23_PM.png)

---

Maybe the designer of the skin was testing on an old version of Winamp that didn’t check for nums\_ex.bmp? Eris checked v2.666, and it still used the \_ex file. Then he checked v2.0 and it rendered something very odd.

What was going on…?

![](https://pub-d4cecb3d578a4c0a8939680792e49682.r2.dev/notion-mirror/84ebb48c-616a-4f51-ae9a-991a4e0a7e9b/0caee1b4-1614-4c69-891f-a6b6ecdef856/Untitled.png)

---

It turns out the skin had a BUNCH of other files inside it! Files from another skin it seemed. Some file names differed only by case. But how did they get there? At this point, I noticed something interesting. The skin had an advertisement file embedded in it.

Could this be related…?

![](https://pub-d4cecb3d578a4c0a8939680792e49682.r2.dev/notion-mirror/84ebb48c-616a-4f51-ae9a-991a4e0a7e9b/3244f9a3-c0c4-4baf-b209-cf444db0e336/Screenshot_2023-08-04_at_7.51.04_PM.png)

---

Some site that offered the skin for download had inserted an additional file into the archive. This spawned a new hypothesis: Inserting the ad file would mean repacking the archive. Maybe the repacking was done by some kind of script that used the temporary directory and didn’t correctly clean up between skins?

How could we test this hypothesis… ?

---

If this guess was correct, we could expect that there was an “original” skin out there which contained a strict subset of the files in this archive. No ad file, and no files from other skins. A quick search on the Winamp Skin Museum turned up this.

And look, the background color on the numbers looks right!

But were the files the same…?

<https://skins.webamp.org/skin/527dc3dadc9bb32843928a3e5f717075/Fanta_LS.wsz/>

---

Yes! The new skin contained a strict subset of what was in the corrupt skin, and no ad file!

Next question. Does this generalize? Did this site serve up other corrupt skins? If so, maybe we could find those too… ?

![](https://pub-d4cecb3d578a4c0a8939680792e49682.r2.dev/notion-mirror/84ebb48c-616a-4f51-ae9a-991a4e0a7e9b/cd0d9f70-a22f-450d-a694-1dc954c2b2e8/Screenshot_2023-08-04_at_5.04.57_PM.png)

---

We head back to the museum, and search for “[http://www.winampskins.info](http://www.winampskins.info/)”, and look, lot of skins!

Are any others corrupt…?

![](https://pub-d4cecb3d578a4c0a8939680792e49682.r2.dev/notion-mirror/84ebb48c-616a-4f51-ae9a-991a4e0a7e9b/c4096643-28d6-45d6-a027-264aee7038ec/Screenshot_2023-08-04_at_8.17.33_PM.png)

---

Found one! <https://skins.webamp.org/skin/b6a1eaf8779c3f923dfdec212d4a5e29/Knight_Test.wsz/> looks a bit off. Why is the playlist red? Looking for a skin with the same name, we see <https://skins.webamp.org/skin/afd0e0215273f506da2091a85154cea7/Knight_Test.wsz/> which has the same red playlist!
