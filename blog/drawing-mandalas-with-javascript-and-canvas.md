/*
Title: Drawing mandalas with JavaScript and canvas
Description:
Author: Jordan Eldredge
Date: 2015/01/02
*/

I was looking through my old blog posts when I came across [Drawing mandalas
with PHP for my
Papa](http://jordaneldredge.com/blog/drawing-mandalas-with-php-for-my-papa)
from back in 2008.
Having just played with the HTML5 canvas tag as part of my
[Winamp2-js project](http://jordaneldredge.com/projects/winamp2-js/),
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
    var points = []
    for (var i = 0; i <= point_count; i++) {
        angle = i * 2 * Math.PI / point_count - Math.PI / 2;
        points.push({
            'x': radius + radius * Math.cos(angle),
            'y': radius + radius * Math.sin(angle)
        });
    }
    ctx.clearRect(0, 0, canv.width, canv.height);
    ctx.beginPath();
    ctx.lineWidth = 1;
    for(var i = 0; i < points.length; i++) {
        for(var j = 0; j < points.length; j++) {
            ctx.moveTo(points[i].x, points[i].y);
            ctx.lineTo(points[j].x, points[j].y);
        }
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
[JSFiddle](http://jsfiddle.net/captbaritone/8vwjn4cx/34/) or
[GitHub](https://github.com/captbaritone/programming-blog-content/blob/master/blog/drawing-mandalas-with-javascript-and-canvas.md)

