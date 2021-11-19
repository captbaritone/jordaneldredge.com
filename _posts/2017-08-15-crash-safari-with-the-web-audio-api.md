---
title: "Crash Safari with the Web Audio API"
summary: Discovering, reproducing, and working around a bug that crashes Safari hard.
layout: post
---

Back in the fall of 2016, I was working on adding the equalizer window to [Winamp2-js](/projects/winamp2-js/). Unfortuneatly, wireing up the [`BiquadFilterNode`](https://developer.mozilla.org/en-US/docs/Web/API/BiquadFilterNode)s nessesary to get the correct behavior triggered a bug in Safari, both desktop and mobile, causing Safari to crash hard.

![Screenshot of Safari crashing](/images/crash-safari.png)

The most interesting part of the crash report was:

```
Thread 11 Crashed:: com.apple.audio.IOThread.client
0   com.apple.WebCore             	0x00007fff9f9dbb35 WTF::CrashOnOverflow::crash() + 5
1   com.apple.WebCore             	0x00007fff9f9dbb29 WTF::CrashOnOverflow::overflowed() + 9
2   com.apple.WebCore             	0x00007fff9fa84b77 WebCore::BiquadProcessor::process(WebCore::AudioBus const*, WebCore::AudioBus*, unsigned long) + 215
```

To be clear, I have no idea what exactly that means, but it looks intresting. I reported the bug in their bug tracker and figured I'd wait until I heard back to invest more energy in the feature. As months passed, and it became obvious that  this bug was not a priority for the Safari team, I occasionally would revist the bug, trying to either narrow down what was causing it, or find some way to work around it.

Finally, in April of this year, 2017, I figured out that it was related to the order in which the audio nodes were being connected, and was able to come up with [a workaround for Winamp2-js](https://github.com/captbaritone/winamp2-js/commit/d70dd0cc3780cf4824d70043eba33f22e35ba889).

This also allowed me to create a much more minimal script that triggered the bug, and I thought I would share that today:

```html
<script>
var context = new (window.AudioContext || window.webkitAudioContext)();

function start () {
  var source = context.createOscillator();
  var chanMerge = context.createChannelMerger(2);
  var filter = context.createBiquadFilter();

  source.connect(chanMerge, 0, 0);
  source.connect(chanMerge, 0, 1);
  // Connecting the channel merger directly to
  // the biquad filter seems to be the problem.
  chanMerge.connect(filter);
  filter.connect(context.destination);

  source.start(0);
  source.stop(2); // This triggers the crash.
}
</script>
<p>Safari will crash on/before the end of the tone</p>
<button onclick='start()'>Play then crash</button>
```

Open [this page](https://cdn.rawgit.com/captbaritone/2640628676cc5dfb1541e8255f707624/raw/074b9732bbaac200059952218d0c0a897af0f665/crash_safari.html) in Safari, click the button, wait two seconds and watch it crash.