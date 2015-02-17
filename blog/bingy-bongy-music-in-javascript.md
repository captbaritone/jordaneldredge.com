/*
Title: Generative "Bingy Bongy music" in JavaScript
Description:
Author: Jordan Eldredge
DraftDate: 2015/01/04
*/

> My friend Peter Wallace had the original idea. He made one using +5/-12 volt
> PMOS dynamic shift registers with two phase clocks and a JK flipflop.

> I made various versions using NMOS static shift registers, Static RAM with
> address counters, and dynamic ram.

> I used it for the alarm of my BIG (4 inch tall numbers) NIXIE tube clock.

> Mama invented the name "Bingy Bongy" after waking up to it too many times.

> I built a unit for an electronic music concert at Sonoma State College in the
> early 1970's. It included a counter which stopped after one complete cycle.

> For my father's binary clock I added bingy-bongy music for the chime. Because
> the clock kept binary sub-multiples of the day instead of chiming the hours
> (24 times a day) it chimed 32 times a day (45 minutes)

<script>
var audioContext = new (window.AudioContext || window.webkitAudioContext)();
var gainNode = audioContext.createGain();
gainNode.connect(audioContext.destination);
var isPlaying = false;

var register = [];
for (var i = 0; i < 2048; i++) {
    register[i] = true;
}
var flipflop = true;
var pointer = 1;

function onProcess(e) {
    var output = e.outputBuffer.getChannelData(0);
    for (var i = 0; i < output.length; i++) {
        output[i] = register[pointer] ? 1 : -1;
        flipflop = register[pointer] ? !flipflop : flipflop;

        register[pointer] = flipflop;
        pointer++;
        if(pointer == register.length) {
            pointer = 0;
        }
    }
};

function setVolume(value) {
    gainNode.gain.value = value / 100;
}

setVolume(0); // Initialize volume to match range input

function start() {
    if(!isPlaying) {
        var node = audioContext.createScriptProcessor(1024, 1, 1);
        node.onaudioprocess = onProcess;
        node.connect(gainNode);

        // Create a dummy buffer that outputs nothing
        // onProcess does the real work, but Safair requires an input buffer to
        // "process"
        bufferNode = audioContext.createBufferSource()
        var buffer = audioContext.createBuffer(1, 1024, audioContext.sampleRate)
        var  data = buffer.getChannelData(0);
        for (var i = 0; i < 2048; i++) { data[i] = 0; }
        bufferNode.buffer = buffer;
        bufferNode.loop = true;
        bufferNode.connect(node);
        bufferNode.start(0);

        isPlaying = true;
    }
}

</script>

Volume: <input type='range' min='0' max='100' value='0' oninput="setVolume(this.value)" ontouchstart="start();" onmousedown="start();">

See the code on
[GitHub](https://raw.githubusercontent.com/captbaritone/programming-blog-content/master/blog/bingy-bongy-music-in-javascript.md)
