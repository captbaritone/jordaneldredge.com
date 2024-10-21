---
title: Winamp Skin Mosaics
tags:
  - winamp
summary: Generating photo mosaics from Winamp Skins
notion_id: b3060da3-d716-4228-985d-a961a861e1a1
summary_image: >-
  /notion-mirror/84ebb48c-616a-4f51-ae9a-991a4e0a7e9b/de10cdc9-395a-4ae6-a34d-c8635a711783/Untitled.png
---
Originally shared as a [Twitter thread](https://x.com/captbaritone/status/1353499963058130945?s=46).

---

[Photo mosaics](https://en.m.wikipedia.org/wiki/Photographic_mosaic) have been around in various forms since as early as 1973. [Back in 2021](https://x.com/captbaritone/status/1353499963058130945?s=46) I had the idea that I could write a program to generate photo mosaics out of my [large collection of Winamp Skins](https://jordaneldredge.com/blog/winamp-skin-musuem/).

I did this by first running a script which would extract the average color from each skin and write it to a database. Then I wrote a second script which would take an input image and break it into a grid. For each cell in the grid it would find the average color and then locate the skin in the database with the closest average color.

I recall that one technique which gave better results was to start in the center of the image and spiral out from there. That way you didn’t use up the best matching skins on the cells at the perimeter of the image, which tend to be less important.

Some of the results:

## Winamp Logo

![](/notion-mirror/84ebb48c-616a-4f51-ae9a-991a4e0a7e9b/de10cdc9-395a-4ae6-a34d-c8635a711783/Untitled.png)

## Justin Frankel

Only fitting to creat a mosaic of the creator of Winamp.

![](/notion-mirror/84ebb48c-616a-4f51-ae9a-991a4e0a7e9b/8defb888-79fd-47d3-a3d6-6b3043e148d0/Untitled.png)

## Jason Scott

I did one of Jason Scott, archivist at large at the Internet Archive, since he helped facilitate [archiving these Winamp Skins at the Internet Archive](https://blog.archive.org/2018/10/02/dont-click-on-the-llama/).

![](/notion-mirror/84ebb48c-616a-4f51-ae9a-991a4e0a7e9b/8c7fd82b-e211-4221-b054-bf111e046653/Untitled.png)

## Bernie Sanders

The iconic photo of Bernie Sanders with his mittens.

![](/notion-mirror/84ebb48c-616a-4f51-ae9a-991a4e0a7e9b/2a5da455-411e-435b-aefa-46c5bd9da75c/image.png)

---

If I were to revisit this project, I would probably try to analyze the screenshots as three distinct regions, one for each window, to avoid issues where the average of the three windows matches well, but one or more individual windows stick out awkwardly.
