---
title: Why UrlMe.me failed
tags:
  - observation
summary: Reflections on why my side project meme generator never caught on
notion_id: a6d192dd-d25a-45d0-8977-b74ae315bf49
summary_image: >-
  https://pub-d4cecb3d578a4c0a8939680792e49682.r2.dev/notion-mirror/84ebb48c-616a-4f51-ae9a-991a4e0a7e9b/c5c9bd2b-2342-479d-85a1-66aeb432a2c7/it_failed.jpg
---
![](https://pub-d4cecb3d578a4c0a8939680792e49682.r2.dev/notion-mirror/84ebb48c-616a-4f51-ae9a-991a4e0a7e9b/c5c9bd2b-2342-479d-85a1-66aeb432a2c7/it_failed.jpg)

I made an [image macro generator site](https://urlme.me/) that had a unique idea: what if the entire UI of the generator was just the URL? The pitch was “Type a url, get a meme”.

The site never caught on (not that I tried super hard). I’ve spent some time reflecting on why, and I thought others might enjoy learning from mistakes:

## Reasons:

- Implementing meme image search is hard
  - Everyone has their own name for a meme image, and you need to program your app with all possible names.
  - This requires extensive context on memes.
- It was too hard to make search “always right”
  - If you want to create and share a meme in one step, you need to have high confidence that the search term you enter will return the image you expect. This is is very difficult, possibly impossible, to actually deliver.
  - Names are ambiguous. Many meme images had non-unique names. Different people would expect different images for the same search term.
- I didn’t watermark the images
  - I was proud of my principled approach here, but it likely precluded the possibility of any viral growth
- Not that many social apps will actually expand an image url inline
  - When I started the project my work used HipChat. We moved to Slack, and I don’t think slack did
  - Maybe a clever use of Open Graph tags could solve this?
- Need to keep an up to date library of meme images
  - Not finding the image you want is incredibly frustrating.
  - There’s actually a very long tail of meme images, and a user bias toward very new images. Very hard to keep up, especially given that you need a rich understanding of the meme to make it searchable. By the time it’s on Know Your Meme, it’s probably too late.
