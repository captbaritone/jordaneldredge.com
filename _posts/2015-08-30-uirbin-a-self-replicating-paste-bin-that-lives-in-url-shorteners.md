---
layout: post
title: "UriBin: A self-replicating paste bin that lives in url shorteners"
date: "2015-08-30 13:38:49 -0700"
---

Back in February, I created a strange thing which I called
[UriBin](http://tinyurl.com/porqfo9), but I never wrote about it, because it
ended up inspiring [HashBin](http://hashb.in) which
achieves a similar goal, but in a less insane way.

Today I was looking through old projects, and decided UriBin deserves
a nice breakdown. It's crazy, and interesting, and not trivial to grok.

I called UriBin "A self-replicating paste bin that lives in URL shorteners",
but what on earth does that mean? I'll try to break it down.

## What are Data URIs?

A standard URL is a pointer to a website where your browser can find some data.
A data URI acts like a URL, but contains the data encoded within it. Try
pasting this in your URL bar:

```text
data:text/html,<h1>Hello World</h1><p>Enjoy my website</p>
```

Unlike a standard URL, no HTTP request or server is required, the browser
simply reads it out of the URI.

## What is a link shortener?

Link shortening services like [Bit.ly](http://bit.ly) or
[TinyUrl](http://tinyurl.com) are essentially public lookup tables that map
short URLs to longer URLs. You load the shortened URL and the service sends
your browser the longer URL and says "go here instead". This is known as
a "redirect". Some of URL shorteners, like TinyUrl, don't distinguish between
URLs and data URIs.

## See where this is going?

If your data is small enough, you can encode it as a data URI and "shorten"
the URI. For example, I've shorted the example URI from above as:

[http://tinyurl.com/nl92nr8](http://tinyurl.com/nl92nr8)

If you click that link it will "redirect" you to the data URI and you will see
my "Hello World" website in your browser. Note that rather than sending your
browser a new URL, TinyUrl returned the actual _data_ of my website.
Essentially I've tricked TinyURL into hosting my web page.

So we can stash arbitrary content in TinyUrl?

## Let's build tool to do just that!

To make that easy, we could write a little JavaScript tool that takes some
given text, wraps it in HTML to make it pretty and encodes the whole thing as
a data URI. Then it submits that URI it to TinyURL.

> But that's not crazy enough!

Okay, it turns out we can make our tool so tiny, that we can encode *it* as
a data URI and host it in a URL shortener itself.

> But even *that's* not crazy enough!

Fine! If we're generating a little HTML page to display our text, why not
bundle in our JavaScript tool as well? That way people who are viewing our text
can create their own hosted snippets!

And there you have it. Each little hosted text snippet we generate is a replica
of our original tool, but with the user's text embedded within it.

## How does it work?

It's actually quite simple. Our tools just grabs a copy of itself from
`document.URL`, replaces the old text with the text the user has supplied, and
then redirects the user to `http://tinyurl.com/create.php?url=<URL>` where
`<URL>` is the URL string it just created.

And... viola, you have a self-replicating paste bin that lives in url
shorteners.

You can find the code on [GitHub](https://github.com/captbaritone/uribin), or
see it in action and create your own pastes/replicas here:
[http://tinyurl.com/porqfo9](http://tinyurl.com/porqfo9)
