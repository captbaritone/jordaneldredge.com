---
title: "Drawing mandalas with JavaScript and canvas"
summary: Rewriting a PHP script from 2008 in JavaScript.
summary_image: /images/mandala.png
tags: [javascript]
---

I was looking through my old blog posts when I came across [Drawing mandalas
with PHP for my
Papa](/blog/drawing-mandalas-with-php-for-my-papa)
from back in 2008.
Having just played with the HTML5 canvas tag as part of my
[Winamp2-js project](/projects/winamp2-js/),
I immediatly thought: "This would be easy to do using Javascript and
Canvas".

So I took a stab at it. You can play with it below. The slider allows you to
select how many points you want:

<label>Points:</label>

<input type='range' min='3' max='40' id='points' value='13' /><br />

<canvas id='canvas' width='400' height='400'></canvas>

<script>
var canv = document.getElementById('canvas');
var contx = canv.getContext('2d');

function drawShape(ctx, point_count, radius) {
    var points = new Array(point_count * 2);
    var x = 0;
    var y = 0;
    var angle = 0;

    ctx.clearRect(0, 0, canv.width, canv.height);
    ctx.beginPath();
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(0,0,0,0.7)";

    for (var i = 0; i <= point_count - 1; i++) {
        angle = i * 2 * Math.PI / point_count - Math.PI / 2;
        x = radius + radius * Math.cos(angle);
        y = radius + radius * Math.sin(angle);
        for (var z = 0, zEnd = (i * 2) + 2; z < zEnd; z += 2) {
            ctx.moveTo(x, y);
            ctx.lineTo(points[z], points[z + 1]);
        }
        points[z] = x;
        points[z + 1] = y;
    }
    ctx.stroke();
}

function draw() {
    drawShape(
        contx, document.getElementById('points').value,
        canv.width / 2
    );
}
draw();
document.getElementById('points').oninput = draw;
</script>

Check out the ~30 lines of code on
[JSFiddle](http://jsfiddle.net/captbaritone/8vwjn4cx/42/) or
[GitHub](https://raw.githubusercontent.com/captbaritone/jordaneldredge.com/master/_posts/2015-01-02-drawing-mandalas-with-javascript-and-canvas.md)
