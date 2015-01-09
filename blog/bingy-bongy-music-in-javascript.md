/*
Title: Bingy Bongy music in JavaScript
Description:
Author: Jordan Eldredge
DraftDate: 2015/01/04
*/
*dev*

<script>
var audioContext = new (window.AudioContext || window.webkitAudioContext)();
var bufferSize = 400 * audioContext.sampleRate;
var bingyBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
var output = bingyBuffer.getChannelData(0);

register = [];
for (var i = 0; i < 2048; i++) {
    register[i] = true;
}

flipflop = true;
pointer = 0;
for (var i = 0; i < bufferSize; i++) {
    output[i] = register[pointer] ? 1 : -1;
    flipflop = register[pointer] ? !flipflop : flipflop;

    register[pointer] = flipflop;
    pointer++;
    if(pointer >= register.length)
        pointer = 0;
}


var bingy = audioContext.createBufferSource();
bingy.connect(audioContext.destination);
bingy.buffer = bingyBuffer;
bingy.start(0);

</script>
