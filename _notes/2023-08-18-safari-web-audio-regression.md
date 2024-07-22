---
title: Web Audio regression in Safari iOS 17 Beta
tags:
  - javascript
summary: >-
  Documenting a regression, I observed in iOS’ implementation of the web audio
  API
---
_Update, Sept. 8, 2023: Apple engineering has acknowledged that this is a bug in the Safari Media frameworks rather than WebKit itself, and that they expect it to get fixed in an upcoming beta release._


_Update, Sept. 19, 2023: Apple engineering has pointed to_ [_a fix_](https://github.com/WebKit/WebKit/commit/1499ac30c10734ccdebafbb766506ec1023ecf66)_, which appears to be in WebKit. However, the initial release of iOS 17 does not seem to include the fix, which was merged a few days before the launch._


---


Playing audio from a `MediaElementAudioSourceNode` silently fails in the iOS 17 Beta. I’ve reported this to the WebKit bug tracker [here](https://bugs.webkit.org/show_bug.cgi?id=260412).


## Repro


Open the repro link (below) and click “Play”.


**Expected:** An audio sample plays (this happens on Safari 16)


**Actual:** No audio plays (this happens on Safari 17)

- Repro: [https://captbaritone.github.io/safari-17-element-source-bug/](https://captbaritone.github.io/safari-17-element-source-bug/)
- Repro code: [https://github.com/captbaritone/safari-17-element-source-bug](https://github.com/captbaritone/safari-17-element-source-bug)

### Impact

- This issue was discovered when [webamp.org](http://webamp.org/) broke ([issue](https://github.com/captbaritone/webamp/issues/1223))
- The Webamp audio player is also used as an [optional audio player](https://blog.archive.org/2018/10/02/dont-click-on-the-llama/) on the Internet Archive [archive.org](https://archive.org/), and the bug manifests there as well
- I’ve also discovered a few other project which worked on Safari 16, but seems to be broken on iOS by this beta release:
	- [https://visicality.derekwolpert.com](https://visicality.derekwolpert.com/) It also uses `MediaElementAudioSourceNode` ([source](https://github.com/derekwolpert/Visicality/blob/25518a682bbbfd55d9abd74fae38f6fce8e158e6/src/index.js#L217))
	- [https://saturn.fm](https://saturn.fm/) (sound effects still work, but music does not play)

## Observations

- The issue reproduces on iOS 17.0 (21a5312c)
- The issue does _not_ reproduce on iOS 16.3 (20D47)
- The issue does _not_ reproduce on Safari 17 on MacOS. Tested on version 17.0 (18616.1.27.101.1, 18616)
- [Some projects](https://github.com/mrdoob/three.js/commit/1c07c8a9868f85f99fb098c82da946e7a7945d07) seem to avoid using `MediaElementAudioSourceNode` on iOS devices, going back to at least May 2020
- There have been a few previous WebKit bugs that look similar: [Bug 211394](https://bugs.webkit.org/show_bug.cgi?id=211394) and [Bug 203435](https://bugs.webkit.org/show_bug.cgi?id=203435)
