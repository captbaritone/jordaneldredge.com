/*
Title: How Winamp2-js loads native skins in your browser
Description:
Author: Jordan Eldredge
Date: 2015/03/09
*/

*This post is the third in an ongoing series about things I learned from my
recent [Winamp2-js](http://jordaneldredge.com/projects/winamp2-js/) project.*

*Previously: [Surviving Hacker News traffic with the help of free CDNs](http://jordaneldredge.com/blog/surviving-hacker-news-traffic-with-the-help-of-free-cdns)*

A remarkable confluence of lucky breaks and clever hacks combine to allow
[Winamp2-js](http://jordaneldredge.com/projects/winamp2-js/) to do what,
I think, is it's most impressive feat: load any native Winamp 2 skin ever made,
all within the limitations of your browser.

This is the story of how we get from dragging in a binary .wsz skin file to
seeing Winamp2-js take on the look of your favorite skin.

*TL;DR: We unzip the .wsz file, slice up the images it contains, encode those
slices as data URIs, dynamically construct CSS rules containing those data
URIs, and inject those CSS rules into the DOM.*

## Getting access to the file

Our fist challenge is getting access to the skin file you want to load.
Browsers, as you would expect don't have access to files on your hard drive.
However, they do have read access to any file that has been loaded into an
`<input type='file'>` input. We take advantage of this by taking the file you
have dropped onto the browser, and loading it into a hidden file `<input>` tag.

See for yourself by selecting an image in the `<input>` below:

<script>
function preview(file) {
    var reader = new FileReader();
    reader.onload = function (e) {
        var img = document.createElement('img');
        img.src = e.target.result;
        var preview = document.getElementById('preview');
        preview.innerHTML = '';
        preview.appendChild(img);
    }
    reader.readAsDataURL(file);
}
</script>

<input type='file' onchange="preview(this.files[0]);">
<div id='preview' style='padding: 2em 0; margin: 1em 0; text-align: center; border: 4px dashed grey; color: grey;'>Preview</div>

## Opening the .wsz file

Great, now we can read the file, but how do we parse a .wsz file? This is our
first lucky break. The Winamp developers very cleverly used the ubiquitous Zip
archive format as the basis for their skins. In other words, the .wsz is
actually just a .zip archive file that has been renamed. Lucky for us, somebody
else has already done the hard work of writing [a JavaScript library that can
extract zip files](http://stuk.github.io/jszip/)! So, now we can access the
individual files within this skin archive as binary data blobs.

## But what *are* those blobs?

Our luck continues. It turns out the graphics files within the skin archive,
are actually .bmp files. Simple, uncompressed image files which all major
browsers still support!

## Rendering binary data blobs as images

Our next challenge is to get the browser to display this binary data as an
image.  Here is where we have to start getting clever. The answer is: [data
URIs](http://en.wikipedia.org/wiki/Data_URI_scheme). A data URI is like a URL,
and can be used in place of a URL, except that instead of being a pointer to
content, it contains the data.

Basically, you can take your raw binary data, base-64 encode it, and then
create a string in this format: `data:<MIME-type>;base64,<data>`. That (very
long) string can now be used as a URL that represents your file. Handily,
JavaScript has
a [`btoa()`](https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64.btoa)
function which takes a string and base-64 encodes it. So our all we need a bit
of code that looks something like:

    var uri = "data:image/bmp;base64," + btoa(binaryData);

The variable `uri` can now be set as an `<img>`'s source and it will render in
the browser!

This small image is encoded as a data URI: <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABoklEQVR42p2TzUtUURjGJy7SBC0GB8PPmatDgjMhg6CtEskyRBLJghBkLi1cn0VQKMoJSSW1AQUz+rhBEKbCWbuISxpEFJ2d23Ht5v4Jv86V0WZGZxp74N2d33Oe9z3vCYUqyHEcggr9j/KgCqrExOmMR1RVMHkdmwxfD2n96R7y7hWqhnO5HGJiBPXsMuw/hletPOq29D9h3/fJLkrk2AXYa4efAlYamOixfHMmUhF2XRdxP4K/WQNfmuFgGl43I0cTnDGTv7DWGjGeRq9a8C0Fv/rhxy3YHcBXdxC9MYIzRSaFN0spTdQx2L4JH/vgcB1+O6CGYa4Nb7IFz/OKBnvaYKMD3sZN7Dn4moGZBKxfhXcxsiPhowRFBqUt2HYT+vs8vDHRn9smSTv+i1rEUBtKqdNw4RzS6RR6ZxIWOs3QzK3vY7iZOuRTcfQqZeFAjY21rl57CMsG3EyRm40iRrtOeq4I2/VhqT+bfj8kzRvGkYNhsi+XKFRZONCDG1GPrWvoqSh9Ccsrt8pl13cgeVE9uX0p2DBRxWc6U3a+zv2d/wCsTn3YI226kwAAAABJRU5ErkJggg=="/> Try inspecting the source!


## But wait, the images are actually sprite sheets!

Image sprites are a technique first used by video games where you take several
small images and bundle them together into one image. This is the approach that
Winamp skins take. Lucky for us, sprites are a common technique in CSS as well.

An example from Facebook's home page:

![Facebook's sprite
sheet](https://www.facebook.com//rsrc.php/v2/y3/r/LUUpSAFvDIn.png)

An example Winamp's default skin:

![Winamp's sprite sheet](http://jordaneldredge.com/content/images/TITLEBAR.BMP)

Using the following CSS applied to a `<div>`...

    background-image: url('http://jordaneldredge.com/content/images/TITLEBAR.BMP');
    width: 275px;
    height: 14px;
    background-position: -27px -15px;

We can use the same image as above to display only Winamp's title bar:

<div style="background-image: url('http://jordaneldredge.com/content/images/TITLEBAR.BMP'); width: 275px; height: 14px; background-position: -27px -15px;"></div>

All of these properties can be set via JavaScript, so you might think we now
have everything we need. However I ran into a few gotchas:

1. JavaScript can't set style properties on pseudo elements like `:active` or
   `::-webkit-slider-thumb`.
2. I wanted elements to use different sprites depending on what class they had.

This meant that what I really wanted to do was specify some CSS rules from
within JavaScript.

## Specifying CSS rules via Javascript

Turns out you can dynamically create CSS rules using JavaScript string
manipulation and then inject those rules into a `<style>` DOM element's inner
HTML. It looks something like this:

    var cssRules = "#play:active { background-image: url(" + spriteSheetUri + "); }"

    // ...
    // Append several more rules to cssRules
    // ...

    var textNode = document.createTextNode(cssRules);

    var styleNode = document.createElement('style');
    styleNode.appendChild(textNode);

    // Inject the <style> node into the <head>
    document.head.appendChild(styleNode);


## But what about tiling sprites?

Some Winamp windows, like the playlist, can be resized. To accommodate this,
Winamp tiles its various background images to fill the entire window.
Unfortunately, tiling and CSS sprites don't play well together. If you make
your DOM element larger than the sprite you want to show, you'll see other
elements in the sprite sheet rather than the single sprite repeating.

My solution to this problem is, I think, both very clever and extremely hackey.
In any other situation, the right solution would be to avoid using sprites for
that one image. Unfortunately for me, I didn't have that as an option.

So, here's what I did:

1. Outside of the DOM, I create both a `<canvas>` and a `<img>` element.
2. I set the `<img>`'s src to the sprite sheet's data uri.
3. I use `context.drawImage()` to draw a cropped protion of the sprite sheet to
   the canvas element.
4. I use `canvas.toDataURL()` to export the canvas (which now contains just one
   sprite) as a new data URI.

I now have a data URI representing just one sprite image, which I can use to
generate the CSS rules!

## Summary

Whew! In summation here are the hoops we had to jump through:

1. Unzip the .wsz file
2. Convert each image to a data URI
3. Using a `<canvas>` element, get a data URI for each individual sprite
4. Generate a massive CSS string containing those URIs
5. Inject that CSS into the document's `<head>` tag

If you want to see the code, you can find it
[here](https://github.com/captbaritone/winamp2-js/blob/master/js/skin.js)
