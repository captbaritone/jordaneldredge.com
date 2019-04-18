---
layout: post
title: Implementing a Robust Web Audio API Balance Node
summary: "After more than four years, I'm finally happy with how Webamp implements balance"
---

![Webamp's Balance Slider](/images/webamp-balance.png)


As part of the [Webamp project](https://webamp.org/about) I needed the ability to adjust the balance of an audio source with the Web Audio API. We’ve gone through a number of implementations over the course of several years, and each implementation had non-obvious problems. I finally feel good about our current solution so I thought I would document it for others who might be trying to build something similar. Notably, it solves the following problems:


- Mono audio sources are played in both channels
- Implements “balance” instead of “panning”. When balance is set all the way left, you hear only the left channel, rather than both channels in the left speaker.

TL;DR: [Here’s the implementation](https://github.com/captbaritone/webamp/blob/7913048e41c332f3357e0de8149501d45973d71d/js/media/StereoBalanceNode.js).

And here’s how to use it (adapted from the [MDN StereoPannerNode example code](https://developer.mozilla.org/en-US/docs/Web/API/StereoPannerNode)):


    import StereoBalanceNode froem './somewhere/in/your/project/StereoBalanceNode';
    
    var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    var myAudio = document.querySelector('audio');
    
    var balanceControl = document.querySelector('.balance-control');
    var balanceValue = document.querySelector('.balance-value');
    
    pre.innerHTML = myScript.innerHTML;
    
    // Create a MediaElementAudioSourceNode
    // Feed the HTMLMediaElement into it
    var source = audioCtx.createMediaElementSource(myAudio);
    
    // Create a stereo blance
    var balanceNode = new StereoBalanceNode(audioCtx);
    
    // Event handler function to increase balance to the right and left
    // when the slider is moved
    
    balanceControl.oninput = function() {
      balanceNode.balance.value = balanceControl.value;
      balanceValue.innerHTML = balanceControl.value;
    }
    
    // connect the MediaElementAudioSourceNode to the balanceNode
    // and the balanceNode to the destination, so we can play the
    // music and adjust the panning using the controls
    source.connect(balanceNode);
    balanceNode.connect(audioCtx.destination);

If you are interested in all the broken solutions that I built before finding this one, read on:

# Two Gain Nodes

Our initial approach, built by [Joseph Portelli](http://lostsource.com/) ([pull request](https://github.com/captbaritone/webamp/pull/8)), was to use a [ChannelSplitterNode](https://developer.mozilla.org/en-US/docs/Web/API/ChannelSplitterNode) to divide the source node into two sources (left and right), attach a [GainNode](https://developer.mozilla.org/en-US/docs/Web/API/GainNode) to each of those and then merge them back together with a [ChannelMergerNode](https://developer.mozilla.org/en-US/docs/Web/API/ChannelMergerNode) node.

While this generally worked, it suffered from a flaw with mono audio files. The channel splitter node does not know anything about the number of channels in the source node so splitting a mono audio source results in a left source that contains all the mono signal, and a right source that is silent, rather than playing the same mono signal in both left and right channels.

# Bad Hacks

My initial attempt at solving this revolved around trying to deduce, in user land, how many channels the source had, and then using that information to decide if we should split the source node or not. From what I’ve been able to glean, there is no way to actually tell how many channels a source node has. So, I resorted to a hack: play the audio for some bit of time and if you never observe any signal I the right channel, assume you have a mono file and rebuild the balance nodes without using the ChannelSplitterNode. This was a stupid idea, since it could never be robust. I wish I had never worked on it.

# StereoPannerNode

Stuck in a world where mono audio files were still playing only in one speaker, I eventually asked in the [Web Audio Slack channel](https://web-audio-slackin.herokuapp.com/) where a user pointed out the existence of the [StereoPannerNode](https://developer.mozilla.org/en-US/docs/Web/API/StereoPannerNode). At first glance this was the solution to all my problems and I quickly shipped a new version of Webamp that made use of it. However, I later realized that *panning* is not quite the same as *balance*. When you pan, you *move* the signal from side to side, so when panned fully left, all the signal from the right channel will play in the left speaker. With balance, you are simply reducing the gain on the channel opposite the direction in which you’ve adjusted the balance. So, if your balance control is fully left, you would simply expect the right channel to be fully muted and the left channel to be playing at normal amplitude.


## Finally, a Robust Solution

My final breakthrough was [this comment](https://github.com/WebAudio/web-audio-api/issues/975#issue-177242377) ****on GitHub which clued me into both the existence of `[channelInterpretation](https://developer.mozilla.org/en-US/docs/Web/API/AudioNode/channelInterpretation)`  property and how we could reasonably apply it to a channel splitter. In short: use a dummy gain node with a `channelInterpretation` of `"``speakers``"` to handle converting mono sources into two equal stereo channels. Then use our original “Two Gain Nodes” approach of `ChannelSplitterNode`, two `GainNode`s and a `ChannelMergerNode`.

With this final missing piece I was able to write a module which has an API which is basically compatible with StereoPannerNode but implements balance and not panning. Sadly the `.connect()`  API makes implanting custom audio nodes very awkward  — you have to return a native audio node which your methods monkey patched into it — but hopefully nobody has to look inside the module and it will “Just Work”.

This code is available [in the Webamp code base](https://github.com/captbaritone/webamp/blob/7913048e41c332f3357e0de8149501d45973d71d/js/media/StereoBalanceNode.js) which is MIT licensed. Feel free to copy it into your own project, or bundle it up as an NPM module. It would be particularly cool if somebody wanted to implement the rest of the [AudioParam methods](https://developer.mozilla.org/en-US/docs/Web/API/AudioParam#Methods) on `StereoBalanceNode.balance` API so that it could be a drop in replacement for StereoPannerNode.
