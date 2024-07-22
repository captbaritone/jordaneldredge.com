---
title: "Drawing mandalas with PHP for my Papa"
summary: "I wrote a PHP script that generates mandalas based on the size and number of points you give it."
tags: [php]
---

_Update, Jan 2015: I've rewritten this in JavaScript:
[Drawing mandalas with JavaScript and canvas](/blog/drawing-mandalas-with-javascript-and-canvas)_

[![A sample mandala I have generated](/uploads/2008/06/trig.png "Mandala")](/uploads/2008/06/trig.png)

The earliest memories I have of computers is a contraption my dad rigged up that would draw mandalas on a screen. Later in my life he wrote software that would plot large mandalas on his huge plotters.

In my [last project](/blog/get-alerts-when-the-emails-you-send-are-opened/), I learned about image generation using PHP and realized that it might be possible to use PHP functions to draw mandalas. After a couple hours of relearning trig, I was able to create a script that outputs a .png image of a mandala based on the size and number of points that you give it.

Give it a try:

<form style="text-align: left;" action="/projects/mandala/index.php" method="get" target="_blank">
    <label for="size">Size in pixels (1-1024):</label> <input id="size" style="display: inline;" type="text" name="size" /><br />
    <label for="points">Number of points (1-100):</label><input id="points" style="display: inline;" type="text" name="points" />
    <input type="submit" value="Generate Mandala" />
</form>

[Source code](https://gist.github.com/4093015)
