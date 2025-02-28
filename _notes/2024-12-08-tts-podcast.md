---
title: You can now “read” this blog as a podcast
tags:
  - thisSite
  - podcast
summary: >-
  I wired this blog up to Open AI’s text-to-speech API so you can listen to
  individual posts or subscribe to the blog as a podcast.
notion_id: 156376e2-3751-80ed-a80d-f3ce2daf7003
summary_image: >-
  https://pub-d4cecb3d578a4c0a8939680792e49682.r2.dev/notion-mirror/84ebb48c-616a-4f51-ae9a-991a4e0a7e9b/3406fb27-6d01-4df4-9781-709aec856965/Screenshot_2024-12-08_at_12.02.05_AM.png
---
_TL;DR: You can copy_ [_this link_](https://jordaneldredge.com/feed/podcast/) _into your podcast player to subscribe to a text-to-speech version of this blog._

---

![Screenshot\_2024-12-08\_at\_12.02.05\_AM.png](https://pub-d4cecb3d578a4c0a8939680792e49682.r2.dev/notion-mirror/84ebb48c-616a-4f51-ae9a-991a4e0a7e9b/3406fb27-6d01-4df4-9781-709aec856965/Screenshot_2024-12-08_at_12.02.05_AM.png)

I personally prefer listening to reading. As such, for years I’ve developed [personal workflows](https://jordaneldredge.com/blog/listen-faster/) around bookmarking interesting text content to consume later as audio content. But now that LLM’s have made good text to speech accessible to tinkerers like myself, it occurred to me that others might like to consume my blog’s content in a similar way.

## The Listen Button

So, I took it upon myself to automate the task of wiring my blog up to OpenAI’s text-to-speech, API and produce MP3 versions of all of my posts. To start with, each blog post now features an integrated “Listen“ button.

Give it a try on this post!

## Podcast

My blog already has an [RSS feed](https://jordaneldredge.com/feed/rss.xml), but only die hard nerds still use RSS. However, just about everyone listens to podcasts, and podcasts are just RSS feeds under the hood! So, I forked my RSS feed code to emit a podcasts consisting of these generated audio files. So, if you’d like to follow my blog in your podcast app, just copy this URL into your app:

[**https://jordaneldredge.com/feed/podcast/**](https://jordaneldredge.com/feed/podcast/)

## Integrating with existing audio content

![Screenshot\_2024-12-08\_at\_12.19.46\_AM.png](https://pub-d4cecb3d578a4c0a8939680792e49682.r2.dev/notion-mirror/84ebb48c-616a-4f51-ae9a-991a4e0a7e9b/a2ba7b27-e0df-440e-b179-1a8a157f3358/Screenshot_2024-12-08_at_12.19.46_AM.png)

As a [musician](https://jordaneldredge.com/notes/opera-to-tech/) several of my posts already contain audio content. For example some posts embed snippets of me [singing](https://jordaneldredge.com/blog/original-song-our-love-will-last-as-long/) or [playing ukulele](https://jordaneldredge.com/blog/charlie-chaplins-smile-ukulele-solo/). For these I was able to stitch together the text-to-speech audio and the “real” audio into a single, contiguous Mp3 artifact.

All of this is achieved via a job which parses the markdown of an individual post’s content, chunks into blocks of top level elements which are small enough to be processed by the OpenAI API and then builds up a list of small Mp3s. If an embedded audio file is one of those top level elements, it becomes its own chunk. These chunks are then concatenated together with FFMpeg and uploaded to [Cloudflare’s R2](https://www.cloudflare.com/developer-platform/products/r2/).

The code is all on GitHub. Here’s the script that generates the mp3s: [audio.ts](https://github.com/captbaritone/jordaneldredge.com/blob/142589ab1e443346e0e24f87253bd3c661793b51/scripts/audio.ts)

## Cost

AI APIs can get pretty expensive, so I was pleased to find that it only cost about $15 to convert the 291 posts I’ve written over the last 17 years.

![Screenshot\_2024-12-07\_at\_10.24.11\_PM.png](https://pub-d4cecb3d578a4c0a8939680792e49682.r2.dev/notion-mirror/84ebb48c-616a-4f51-ae9a-991a4e0a7e9b/cfc30752-459e-4d2e-a89b-0974b38a591b/Screenshot_2024-12-07_at_10.24.11_PM.png)
