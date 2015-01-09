/*
Title: Bingy Bongy music in JavaScript
Description:
Author: Jordan Eldredge
DraftDate: 2015/01/04
*/
*dev*
<button>Play Music</button>

<script>
var audioContext = new (window.AudioContext || window.webkitAudioContext)();
var button = document.querySelector('button');
var bufferSize = 400 * audioContext.sampleRate,
    bingyBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate),
    output = bingyBuffer.getChannelData(0);

register = [];
for (var i = 0; i < 2048; i++) {
    register[i] = true;
}

flipflop = true;
pointer = 0;
function nextValue() {
}
for (var i = 0; i < bufferSize; i++) {
    output[i] = register[pointer] ? 1 : -1;
    if(register[pointer])
        flipflop = !flipflop

    register[pointer] = flipflop;
    pointer++;
    if(pointer >= register.length)
        pointer = 0;
}


var bingy = audioContext.createBufferSource();
bingy.connect(audioContext.destination);
bingy.buffer = bingyBuffer;
bingy.loop = false;
bingy.start(0);

</script>
