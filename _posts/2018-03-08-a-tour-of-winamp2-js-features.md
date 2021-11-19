---
title: "A Tour of Winamp2-js Features"
summary: Demo videos of Winamp2-js' more interesting features with notes on how they are implemented.
layout: post
summary_image: /images/winamp/three-windows-screenshot.png
---

> _This post is an expanded version of this [Twitter thread](https://twitter.com/captbaritone/status/961274714013319168)._

![Winamp2-js showing all three windows](/images/winamp/three-windows-screenshot.png)

Sitting on my bed one evening in October of 2014 I had an idea: I could use [CSS sprites] to render original Winamp skin files in the browser. I got so exicted about the idea that I worked on it late into the night. For the next three years I continued, off and on, to hack on this silly, yet entrancing project.

As of last month, all three main windows are complete ([Give it a try!](/projects/winamp2-js/)) and it finally feels like an actual media player.

To celebrate this milestone, I thought I'd share a few of the more interesteing features that Winamp2-js has successfully reimplemented and a few technical details behinnd how they were implemented.

## Load any classic Winamp skin

Winamp skins are, under the hood, `.zip` files that contained some `.bmp` sprite sheets and a few config files. Thanks to [Stuart Knightley]'s library [JSZip], we can actually extract/parse real Winamp skins in your browser. Just drop the skin file into the main window. Check out [How Winamp2-js loads native skins in your browser](/blog/how-winamp2-js-loads-native-skins-in-your-browser/) for a detailed explanation of how this is achieved.

::youtube{token=NpPu48NFOWY}

## Queue up local files

Adding the playlist window involved refactoring my entire approach to playing audio, since I had to be able to manage multiple audio tracks at a time. Now you can open multiple files at the same time, via the Eject button, or drag in multiple files. We even respect where in the playlist you drop them!

::youtube{token=NrL2JYZ5Z4E}

## Visualize your music

The [Web Audio API] exposes an [AnalyserNode] which gives us access to [Fast Fourier Transform]s of our audio stream in real time. Combining this with the [Canvas API] we can relitively easily draw real time visual representations of the audio you are hearing. So far I've have implemented both the waveform/oscilloscope visualizer and the bar graph visualizer.

Eventually I would love to support some of the more advanced visualization plugins that Winamp had, such as [AVS] presets or [MilkDrop]. Lucklily with WebGL this should be possible to do in the browser. In fact, [butterchurnviz.com](https://butterchurnviz.com/) is a highly impressive MilkDrop clone, and the [author](https://twitter.com/jnberg16) has [expressed interest](https://twitter.com/jnberg16/status/970078322393628672) in making it avalaible in Winamp-js.

Additionally there are two different efforts to bring AVS presets to the browser. Both are being discussed in [https://gitter.im/visbot/AVS](https://gitter.im/visbot/AVS).

::youtube{token=pxEbu4iLVMw}

## Fully functional equalizer

The Web Audio API provides all the primitives needed to implement a frequency band equalizer. I had to learn about all this stuff from scratch, but basically you can chain together some [BiquadFilterNode](https://developer.mozilla.org/en-US/docs/Web/API/BiquadFilterNode)s, one for each frequency, and connect the sliders to the gain of those nodes.

The bigger challenge was actually the colored line which illustrates the values of the EQ. First, the line is not just a collection of straight line segments, the line is "splined" to create a smoother curved line. Thanks to the awesome [cardinal-spline-js](https://github.com/epistemex/cardinal-spline-js) by [@epistimex](https://twitter.com/epistemex), this was just about as easy as `yarn add cardinal-spline-js`.

Secondly, this curved line is not just a single color, it's a gradient. And more than that, the gradient is defined as a single line of pixels in a sprite sheet within the `.wsz` skin file.

As luck would have it, the Canvas API lets you draw lines with a `strokeStyle` of a [CanvasPattern](https://developer.mozilla.org/en-US/docs/Web/API/CanvasPattern) which can just be an image! Since we already have the ability to slice individual sprites out of a skin file, this was trivial.

::youtube{token=6nyACdAxoTc}

## Import/export Winamp's own binary EQ settings files

Winamp defined a propritary `.eqf` binary file format for exporting your EQ presets. Having never delt with binary formats before this was a steep learning curve for me. Luckly the format is very simple, just a name and eleven values. I wrote a little parser/generator as an NPM package [winamp-eqf](https://github.com/captbaritone/winamp-eqf) in case anyone else ever wants to deal with these files. Now you can save your presets locally and load any presets that you happen to have kept around for the last twenty years.

::youtube{token=6nyACdAxoTc}

## Export your playlist as an .html file

Here is another feature hidden away among Winamp 2's many menus. You can export your current playlist as an HTML file. To get this to work, all I had to do was:

1.  Reverse engineer the template that Winamp used to generate the HTML
2.  Create a React component that matched that template, filling in some unbalanced tags along the way
3.  Render it to a DOM node out of the DOM
4.  Extract the node's `innerHTML` as a string
5.  Encode that string as a Data URI
6.  Inject that URI into an `<a>` tag's `href`
7.  Get the user to click on that link.

Easy.

::youtube{token=ovyleQQgL7M}

## Shade mode

Each window can exist in two different modes. Regular and "shade" in which the main functionlity is compressed into the size of the title bar. Nothing special here technically, we just had to implement twice as many windows. \:P

![Winamp2-js showing all three windows in "shade" mode](/images/winamp/shade-mode.png)

## ID3 tags

A few months after starting my job at Facebook, I was talking to a collegue about Winamp2-js. I mentioned that I eventually wanted to support ID3 tags. I had looked around for JavaScript libraries that could do this a few years ago, but I hadn't had time to evaluate them since. Amazingly he said: "Oh, I wrote one of those libraries!". A few days later I integrated [jsmediatags] into Winamp2-js. Now we can read the metadata from MP3s, FLACs and more. Small world! Thanks [@aadsm]!

::youtube{token=WPnRKrcndzE}

## Window transparency

One of those config files that make up a Winamp skin is `region.txt` which provides a series of coordinates which map out areas of the skin that should be transparent. Originally I assumed this would not be possible to support in the browser, but afer reading [SaraSoueidan's](https://twitter.com/SaraSoueidan) excellent article [CSS SVG Clipping](https://www.sarasoueidan.com/blog/css-svg-clipping/), I realized it is! All I had to do was:

1.  Parse the `region.txt` file out of the skin
2.  Use that data to dynamically generate an SVG somewhere in the DOM
3.  Inject some CSS into the DOM that pointed to that SVG

Easy!

::youtube{token=WjyYieYbnSg}

## Window snapping

Winamp is split into three main windows, but usually you don't want them just spread randomly arround your desktop; you want them arranged in some neat and tidy configuration. To help you achieve this, Winamp windows "snap" or "dock" if you get them close to one another. I reimplemented this detail as well. Truth be told though, this code is very ugly and probably 10x more complicated than it needs to be. Hopefully one day I'll come back and clean this up.

::youtube{token=S54UH1CmzLA}

## Hotkeys

Hotkeys for all the major pieces of functionality are supported. With the [Redux] architecture I'm using these global hotkeys were super easy to add. There's even a Winamp easter egg, triggered from the keyboard, that I've reimplemented. See if you can find it!

::youtube{token=H8fRTYr_Jl8}

## Drag tracks to reorder them

This feature was a nice remider as to why you never want to have to reimplement things like multi-select from scratch. When the user clicks on a selected track, we add a `mousemove` event listener. On every event, we decide how far we've moved in the `Y` axis, and move the selected tracks based upon this data. It's made more complicated by the fact that the selected tracks may not be entirely sequential, so we need to have a special algorithm to merge them.

::youtube{token=-VJOLXpFPRc}

## Double mode

Even at older resolutions Winamp looked pretty small, and monitor resolution has only increased in the interveneing years. To address this, Winamp had "double" mode which doubles the size of the two non-resizeable windows. With the CSS `transform: scale(2);`, the resizing was super simple. The only trick was getting the browser to use a graphical resizing algorithm that is friendly to pixel art. We want each individual pixel to be rendered as four individual pixels in the resized version, we don't want them blurred, like you would for a photo. Again, the CSS spec has our back. `image-rendering: pixelated;` does exactly this.

Interestingly, modern "retina" displays are already doing pixel dobuling, so specifying the `image-rendering` property makes things look cripser even when not in double mode.

You can enable double mode with they hotkey `ctrl+d` or by clicking the "D" in the "clutter bar" to the left of the visualizer in the main window.

One feature that I haven't yet implemented is Winamp's strategy for rearranging windows as you resize them. For now, when you enter double mode, you end up with the windows sitting on top of eachother, which is a bit of a shame.

![Double mode](/images/winamp/double-mode.png)

## What's next?

Getting all of this to work entirely in the browser has been a great challenge, and I've learned a lot. While in many ways the project feels "done", I doubt I will stop working on it in the forseeable future.

I still have a list of UI details which are not quite right:

* Visualizer in the "shade" version of the main window is not implemented
* Windows do not reposition eachother when toggling shade or double modes
* The visualizer and EQ canvases are rendering anti-aliased lines, which is not how Winamp actually works.
* The bar graph visualizer is missing the white "peaks" which fall slowly
* Many hotkeys and context menus are missing

Beyond those, I'm not entirely sure where this project will evolve. Here are some of the things I'm currently exploring to one degree or another:

1.  Support playing files from the cloud via Dropbox or Google Drive integration
2.  Let people use it as a Soundcloud player
3.  Get one or more WebGL visualizers working
4.  Wrap it up as an Electron app
5.  Build a Winamp skin museum website, with the ability to swap in any skin
6.  Build out some of the other windows: Media Library, Browser, etc.
7.  Playing file formats which are not natively supported by the browser

If any of these things sound interesting to you, please reach out to me on [Twitter](https://twitter.com/captbaritone).

## Thanks

While this project has been primarly me working alone on my couch, there are a few people who have made it measureably better through their indirect contributions:

Thanks to [Darren Owen](https://twitter.com/the_doctoro) for being an invaluable source of insider information.

Thanks to [LuigiHann](https://twitter.com/LuigiHann) for catching many small places where I hand't perfectly recreated Winamp's handling of skins.

Thanks to [Jake Rodkin](https://twitter.com/ja2ke) for the original [retweet](https://twitter.com/captbaritone/status/530030571141873664) which I believe kicked this whole thing off more than three years ago.

And of course, thanks to [Justin Frankel](https://www.1014.org/).

[css sprites]: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Images/Implementing_image_sprites_in_CSS
[stuart knightley]: http://stuartk.com/
[jszip]: http://stuartk.com/
[web audio api]: (https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
[analysernode]: (https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode)
[fast fourier transform]: https://en.wikipedia.org/wiki/Fast_Fourier_transform
[canvas api]: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API
[avs]: https://en.wikipedia.org/wiki/Advanced_Visualization_Studio
[milkdrop]: https://en.wikipedia.org/wiki/MilkDrop
[jsmediatags]: https://github.com/captbaritone/winamp-eqf
[@aadsm]: https://twitter.com/aadsm
[redux]: https://redux.js.org/
