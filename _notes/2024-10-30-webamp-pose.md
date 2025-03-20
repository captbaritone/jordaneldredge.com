---
title: Webamp can pose for the camera
tags:
  - winamp
  - javascript
  - note
summary: Webamp.org has a feature that lets it pose as if it were in action
notion_id: 12f376e2-3751-8053-bdb1-e1a5776bb325
summary_image: >-
  https://pub-d4cecb3d578a4c0a8939680792e49682.r2.dev/notion-mirror/84ebb48c-616a-4f51-ae9a-991a4e0a7e9b/ee127ca2-dabf-4d09-ba6a-79571304d7e9/Screenshot_2024-10-29_at_10.00.51_PM.png
---
![Screenshot\_2024-10-29\_at\_10.00.51\_PM.png](https://pub-d4cecb3d578a4c0a8939680792e49682.r2.dev/notion-mirror/84ebb48c-616a-4f51-ae9a-991a4e0a7e9b/ee127ca2-dabf-4d09-ba6a-79571304d7e9/Screenshot_2024-10-29_at_10.00.51_PM.png)

The [Winamp Skin Museum](https://jordaneldredge.com/blog/winamp-skin-musuem/) now contains [over 100,000 skins](https://jordaneldredge.com/notes/skin-upload/), and the main way it surfaces them is as a screenshot. In fact, one of the key dependencies of building the Winamp Skin Museum was the ability to automate the process of generating screenshots of Winamp skins.

Rather than trying to figure out how to automate actual Winamp, I chose to leverage the JavaScript/web tooling ecosystem and actually take screenshots using Webamp and [Puppeteer](https://pptr.dev/). When you upload a skin to the Winamp skin Museum, the server loads it into a headless browser that’s running [webamp.org](http://webamp.org/) and snaps a cropped screenshot.

When I first started, this approach, the screenshots were not very lively. They didn’t show the visualizer in action, or the different positions of the equalizer sliders or the design of the digits in the time display.

In order to reliably demonstrate each skin in an active pose, which showed off as many of its features as possible, I added a hidden query parameter to webamp.org: `?screenshot=1`. You can try it for yourself here:

<https://webamp.org/?screenshot=1>

Adding this flag will cause the site to dispatch a bunch of dummy events to Webamp’s l store, putting it in a state that looks as if it’s in the middle of playing a track with a rather… “inventive” EQ setting.

This brings a lot of visual interest and activity to the screenshots in the museum while still preserving uniformity.

Interestingly, this uniformity has also turned into a sort of watermark. Anytime I come across someone sharing a screenshot of a Winamp skin. I can look for that specific pose, playlist, EQ setting, and tell if the screenshot comes from the museum and therefore is  actually a screenshot of Webamp. It is a source of pride for me that I’m finding _most_ images of Winamp skins, are now actually of Webamp. It means these projects have played a role in helping keep these artifacts alive relevant.

JavaScript is a warty language, and its fragmented ecosystem leaves much to be desired, but I’d caution anyone against betting against its modular ecosystem of relatively easy to assemble tools. Easy/fast to build and automate beats efficient and elegant nearly every time.
