---
layout: post
title: "UrlMeme: Make memes anywhere you can type a URL"
date: "2015-09-27 13:35:43 -0700"
---

Online meme generators are annoyingly complex. What if instead of ever visiting
one again, you just had to remember this pattern?

~~~ markdown
http://urlme.me/{meme_name}/{top_text}/{bottom_text}.jpg
~~~

That's the idea behind my latest project: [urlme.me](http://urlme.me)

### How do you do that?

The only really difficult part is taking a user's name for a meme, and finding
the image that they actually want.

The secret sauce is [n-gram
matching](https://en.wikipedia.org/wiki/N-gram#n-grams_for_approximate_matching) which is a technique for determining how similar two strings are.

Basically we take the string the user supplied and compare it against a list of
meme names which I've collected (sometimes several for each image). We then
take the name which is the closest match and use its corresponding image.

This allows us to return the correct result even in the face of typos,
misspellings and even partial matches.

If you want to see more, check out the Python source code on
[GitHub](https://github.com/captbaritone/urlmeme).

## Inspiration

Placeholder image generator websites like
[PlaceKitten](https://placekitten.com/) were my direct inspiration, but after
completing the first draft I found I'm not the only one to have come up with
this solution. 

See also: 

* [upboat.me](https://upboat.me/)
* [iome.me](http://www.iome.me/)

