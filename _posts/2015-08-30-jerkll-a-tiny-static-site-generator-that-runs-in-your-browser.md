---
layout: post
title: "Jerkll: A tiny static site generator that runs in your browser"
summary: Replacing Jekyll with 14 lines of run-anywhere JavaScript.
---

While playing with [RequireJS](http://requirejs.org) for another project,
I was impressed to see that browsers can recursively fetch files at load time,
and still feel fast. This made me think:

> Could I maintain my website as simple Markdown and template files and have
> the HTML generation done at request time in the browser?

The idea seemed novel to me, so I decided to implement it. It ended up being
surprisingly trivial, so  I [code
golfed](https://en.wikipedia.org/wiki/Code_golf) it and reduced it to the
following 14 lines:

```javascript
(onhashchange = function(e, d) {
    var p = location.hash ? location.hash.slice(1) : 'index';
    d = d || {'template': 'pages/' + p + ".md"};
    var r = new XMLHttpRequest(), f = /^---\n((.|\n)*)\n---/;
    r.onload = function() {
        d.content = marked(r.response.replace(f, function(f, j) {
            for(i in s = JSON.parse(j)){ d[i] = d[i] || s[i]; };
            d.template = s.template;
            return '';
        }).replace(/{{ (\S*) }}/g, function(m, w) { return d[w] || m; }));
        d.template ? onhashchange(e, d) : document.body.innerHTML = d.content;
    };
    r.open("get", d.template);
    r.send();
})();
```

This code, together with the [marked.js](https://github.com/chjj/marked)
Markdown library, reimplements the major functionality of a static site
generator like [Jekyll](http://jekyllrb.com/) without any need for server side
software.

When you navigate to a new page it recursively fetches the template files and
replaces the DOM with the generated HTML.

## In Action

You can see a demo [here](https://jordaneldredge.com/projects/jerkll/) or find
the code on [GitHub](https://github.com/captbaritone/jerkll).

## Why?

This approach has a couple interesting advantages over the standard static site
generator model:

1. Lower barrier to entry. Everybody has a browser. Not everybody has
   Ruby/Node/Python/PHP and the associated package manager.
2. A more elaborate version could build the entire site in the browser and
   offer you a .zip file of the generated HTML files which you would deploy to
   your server. (I actually have a version of this working).
3. Templating is done at request time, so results are always up to date.

## The Catch

There are a few limitations that make this approach not terribly feasible for
a real project:

1. It can't discover files, so you can't have a page that lists all your blog
   posts without maintaining all the links yourself.
2. While it runs entirely in your browser, [The Cross
   Origin](https://developer.mozilla.org/en-US/docs/Web/HTTP/Access_control_CORS)
   rule means you need an actual web server to use it. This could be as simple
   as: `python -m SimpleHTTPServer`, but you still need to use the command
   line.
