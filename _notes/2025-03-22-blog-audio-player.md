---
title: My blog’s audio player
tags:
  - thisSite
  - react
  - markdown
  - javascript
  - music
summary: Details on the audio player I’ve added to this blog
notion_id: 156376e2-3751-8052-b0a0-f601693fa56c
summary_image: >-
  https://pub-d4cecb3d578a4c0a8939680792e49682.r2.dev/notion-mirror/84ebb48c-616a-4f51-ae9a-991a4e0a7e9b/78362f5a-07cd-44f8-928d-ce221611355a/Screenshot_2025-03-22_at_11.40.28_AM.png
---
Since as early as 2008 ([My Brother’s Minuet](https://jordaneldredge.com/blog/my-brothers-minuet/)) I’ve included audio files in posts to this blog. One thing that always bugged me about this setup was that when those audio files are longer in duration they can trap you on a page since the audio player is embedded within the specific page. If you navigate away the audio stops.

Based on my experience using the web audio API in other projects it occurred to me I could build my own audio player into the site rather than just relying on simple `<audio>` tags as I had in the past. So, I switched to a model where the audio embedded in each post simply rendered as a control to start playing the audio file in the site‘s global audio player. With this approach you can start listening to an audio file on one post and continue listening as you navigate to other pages on the site.

![Screenshot\_2025-03-22\_at\_11.40.28\_AM.png](https://pub-d4cecb3d578a4c0a8939680792e49682.r2.dev/notion-mirror/84ebb48c-616a-4f51-ae9a-991a4e0a7e9b/78362f5a-07cd-44f8-928d-ce221611355a/Screenshot_2025-03-22_at_11.40.28_AM.png)

This is enabled by Next.js’ model where intra-site navigations are handled by JavaScript (instead of as a brand new page load) and thus can retain state. The implementation consists of a React context which maintains the state of which audio file is playing and its duration, progress etc. Audio files in posts are then rendered (using a [nice way of rendering markdown in React apps](https://jordaneldredge.com/notes/markdown-react/)) as React components which check the context to see if the file is currently being played and, when clicked, tell that context to start playing the given audio file.

The main website layout includes a global audio player component at the bottom of the page which, if any audio is currently playing, shows the global player.

## Inline Example

You can try out an example here:

<https://jordaneldredge.com/uploads/2008/02/minuet.mp3>

## Code Pointers

- [The audio context](https://github.com/captbaritone/jordaneldredge.com/blob/master/app/AudioContext.js)
- [Global audio player component](https://github.com/captbaritone/jordaneldredge.com/blob/39d85a6e6b3fad0e8841b3aca8a3f0d94af7a4c2/app/AudioPlayer.js)
- [The audio element component](https://github.com/captbaritone/jordaneldredge.com/blob/39d85a6e6b3fad0e8841b3aca8a3f0d94af7a4c2/lib/components/AudioElement.js) embedded in pages with audio
- [Rendering the audio element within markdown documents](https://github.com/captbaritone/jordaneldredge.com/blob/39d85a6e6b3fad0e8841b3aca8a3f0d94af7a4c2/lib/components/Markdown.js#L45)

## Complications

This approach highlighted a subtle bug in my site: in some places I had intra-site links which were using fully qualified URLs instead of internal paths. These links would, confusingly, force full page reloads which would interrupt currently playing files. To address this, I added [normalization logic](https://github.com/captbaritone/jordaneldredge.com/blob/39d85a6e6b3fad0e8841b3aca8a3f0d94af7a4c2/lib/components/Markdown.js#L69) to my markdown renderer which ensures all internal links are rendered as paths not URLs.

## Related Work

When I [turned this blog into a podcast](https://jordaneldredge.com/notes/tts-podcast/) I took these same embedded audio files and inlined them within the text-to-speech generated audio.

At some point in the future, I’d like to build upon this work by adding support for enqueuing tracks or defining playlists which let you play a series for tracks in a row.
