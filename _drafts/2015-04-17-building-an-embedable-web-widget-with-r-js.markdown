---
title: "Building an embedable web widget with r.js"
date: "2015-04-17 20:01:15 -0700"
summary: Build a single JavaScript file, embeddable widget with r.js
---

As part of my Winamp2-js project, I wanted to allow people to embed my
JavaScript Winamp in their own webpages. It presented some interesting
challenges and r.js ended up being a great tool to help solve those
challenges. This post will show you how you might use r.js to build your own
widget.

Here's how mine turned out:

<script async src="https://jordaneldredge.com/winamp2-js.js"></script>

Ideally, you would use an `<iframe>` to inject your widget, however for my
project, I needed Winamp2-js to run in the context of their page so it could
play media hosted on their server.

Here is a complete list of requirements:

* One line embed code with options specified as tag attributes
* Use my existing HTML and CSS
* Run on the same domain as the host page
* Use the same code as my self-hosted version

Here's what my embed code ended up looking like:

    <script async src="https://jordaneldredge.com/winamp2-js.js"></script>

Given my requirements, here is what my script needed to do:

1. Read the script tag's attributes
2. Create a DOM element directly after itself
3. Inject my HTML into that element
4. Inject a CSS style sheet into the document's `<head>`
5. Execute the JavaScript to make the player work

## Using r.js

r.js is a command line tool for optimizing projects that already use require.js
to manage dependencies. It builds a single minified `.js` file that contains
all the modules your script will need.

It turns out to also have several other features and plugins that make it
perfectly suited for solving this sort of problem.

## Create the DOM element

    var scriptTag = document.currentScript;

    require([
        'text!main-window.html',
        'css!cleanslate.css',
        'css!winamp.css',
        'winamp'
    ], function(
        mainWindowHtml,
        cleanslateCss,
        winampCss,
        Winamp
    ) {
        var node = document.createElement('div');

        scriptTag.parentNode.insertBefore(node, scriptTag);

        var media = 'default-value';
        if(scriptTag.dataset.media) {
            media = scriptTag.dataset.media;
        }
        node.innerHTML = mainWindowHtml;
        node.setAttribute("id", "winamp2-js");

        winamp.go();
    });


## What I might change
