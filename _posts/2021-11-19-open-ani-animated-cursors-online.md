---
layout: post
title: "Open .ani Animated Cursors Online"
summary: "I made a simple website where you can instantly open and view any .ani file for free"
summary_image: /images/open-ani-online.png
---

*TL;DR: I made a simple website where you can instantly open and view any `.ani` file for free. You can find it here: [https://capt.dev/open-ani-online/](https://capt.dev/open-ani-online/)*

---

Previously, as [part of another project](https://jordaneldredge.com/blog/rendering-animated-ani-cursors-in-the-browser/), I wrote an [NPM module](https://www.npmjs.com/package/ani-cursor) that can convert Windows animated cursor files (`.ani`) into CSS animations so that they can be used in the browser.

Recently it occurred to me that I could use that module to build a tiny website that would let people open/view their `.ani` files online. Given that `.ani` is a relatively obscure file format, this seemed like a potentially useful tool. I can imagine that people occasionally come across an `.ani` file and would like to view it, but don't have any software installed which can do that.

Having a website that can let you view the file instantly without installing any software seemed valuable. So, I checked to see if anything like this already exists. I was able to find two websites that claim to do this job but sadly neither one really worked.

Below is a description of the two existing sites, and finally — by way of contrast — a description of the one I built:

## FileProInfo.com

[https://fileproinfo.com/tools/viewer/ani](https://fileproinfo.com/tools/viewer/ani)

This site greets you with a full page takeover ad, plus a GDPR cookies notification. When you close the ad it spawns an extra tab taking you to some SEO spam site. After closing that, I'm able to upload my `.ani` file via a file picker, drag and drop is not supported. I can then scroll down past some more ads to the "View ANI file now" button which takes me to a page which is cluttered with ads and informs me that there is "No preview available".

![filext.com showing just one frame of an animated .ani file](/images/fileext-com-ani.png)

## filext.com

[https://filext.com/file-extension/ANI](https://filext.com/file-extension/ANI)

This site is at least a bit better. You can drag in the `.ani` file to view it. However, the site is a bit slow. It took ~4 seconds on my very fast internet to open the file once I dropped it. Once it does open the file, it only shows you *one frame at a time* and takes another ~4 seconds (and a network round trip) to view each subsequent frame. **There's no way to view actual animation**.

![fileproinfo.com failing to show an .ani animated cursor. It's just the next "No preview avaliable" with two popups overlapping it](/images/fileproinfo-com-ani.png)

## My Solution

[https://capt.dev/open-ani-online/](https://capt.dev/open-ani-online/)

My simple solution allows you to drag in, or select, any local `.ani` file and instantly view it as an actual animated cursor inside the drop area. No ads, no waiting. In fact, the file never leaves your browser. One caveat: my site does not work on Safari due to a [bug](https://bugs.webkit.org/show_bug.cgi?id=221589) in their browser.

<video src="/videos/open-ani-online.mov" controls muted style="image-rendering: pixelated; display: block; margin: 0 auto; margin-bottom: 20px; max-width: 100%;"></video>