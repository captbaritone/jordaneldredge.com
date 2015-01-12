/*
Title: Generative "Bingy Bongy music" in JavaScript
Description:
Author: Jordan Eldredge
DraftDate: 2015/01/04
*/
*dec*
<script>
var audioContext = new (window.AudioContext || window.webkitAudioContext)();
var isPlaying = false;
var register = [];
var flipflop = true;
var pointer = 1;

for (var i = 0; i < 2048; i++) {
    register[i] = true;
}

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

var gainNode = audioContext.createGain();
gainNode.connect(audioContext.destination);

function setVolume(value) {
    gainNode.gain.value = value / 100;
}

setVolume(0); // Initialize volume to match range input
function start() {
    if(!isPlaying) {
        var node = audioContext.createScriptProcessor(1024, 1, 1);
        node.onaudioprocess = onProcess;
        node.connect(gainNode);

        bufferNode = audioContext.createBufferSource()
        var buffer = audioContext.createBuffer(1, 1024, audioContext.sampleRate)
        var  data = buffer.getChannelData(0);
        for (var i = 0; i < 2048; i++) {
            data[i] = 0;
        }
        bufferNode.buffer = buffer;
        bufferNode.loop = true;
        bufferNode.connect(node);
        bufferNode.start(0);
        isPlaying = true;
    }
}

</script>

Volume: <input type='range' min='0' max='100' value='0' oninput="setVolume(this.value)" ontouchstart="start();" onmousedown="start();">
