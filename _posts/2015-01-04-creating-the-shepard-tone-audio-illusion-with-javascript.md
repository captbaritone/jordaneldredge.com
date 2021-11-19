---
title: "Creating the Shepard Tone audio illusion with JavaScript"
layout: post
summary: The Shepard Tone is an audio illusion that creates the impression of an endlessly rising or falling tone.
---

The [Shepard Tone](http://en.wikipedia.org/wiki/Shepard_tone) is an audio
illusion that creates the impression of an endlessly rising or falling tone.

Back in 2009 I rendered an [example of it using
Lilypond](/projects/winamp2-js/), which was pretty
hacky.

Having recently played with the Web Audio API for my [Winamp2-js
project](/projects/winamp2-js/) I realized it
would be easy to create this effect using Javascript.

You can hear for yourself, just turn up the volume:

<script>
var min_freq = 10;
var max_freq = 40000;
var steps_per_loop = 12;
var seconds_per_loop = 5;

var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
var gainNode = audioCtx.createGain();
gainNode.connect(audioCtx.destination);

setVolume(0); // Initialize volume to match range input
var playing = false;

var step_speed = 1000 * seconds_per_loop / steps_per_loop;
var multiplier = Math.pow(2, 1/steps_per_loop)
var current_step = 0;
var oscillators = [];

function shepardLoop () {
    base_freq = min_freq;
    for(i = 0; base_freq < max_freq; i++) {
        if(oscillators[i]) oscillators[i].stop(0);
        freq = base_freq * Math.pow(multiplier, current_step);
        oscillator = audioCtx.createOscillator();
        oscillator.frequency.value = freq; // value in hertz
        oscillator.connect(gainNode);
        oscillator.start(0);
        oscillators[i] = oscillator;
        base_freq = base_freq * 2;
    }
    current_step = (current_step + 1) % steps_per_loop;
    setTimeout(shepardLoop, step_speed);
}

function start() {
    if(!playing) {
        playing = true;
        shepardLoop();
    }
}
function setVolume(volume) {
    gainNode.gain.value = volume / 100 / 12;
}
</script>

Volume: <input type='range' min='0' max='100' value='0' oninput="setVolume(this.value)" ontouchstart="start();" onmousedown="start();">

Check out the ~40 lines of code on
[JSFiddle](http://jsfiddle.net/captbaritone/x893Lqk5) or
[GitHub](https://raw.githubusercontent.com/captbaritone/programming-blog-content/master/blog/creating-the-shepard-tone-audio-illusion-with-javascript.md)

