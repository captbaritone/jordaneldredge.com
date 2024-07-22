---
title: A nice way to render Markdown in React apps
tags:
  - react
  - markdown
  - javascript
  - opinion
summary: >-
  A pattern for rendering Markdown in React apps directly from an AST without
  any serialized HTML
---
I’ve been pretty happy with the approach I’m using for rendering Markdown for this blog. Pages are checked into the codebase as markdown files. At build time these files are parsed to an abstract syntax tree (AST) using [`remark-parse`](https://www.npmjs.com/package/remark-parse). This AST is then passed into my page component where a recursive Rect component pmaps the AST into the appropriate HTML/DOM.


**You can see the React component** [**here**](https://github.com/captbaritone/jordaneldredge.com/blob/705cb9213b79f68ec48c05ec052f740f7234d936/lib/components/Markdown.js)**. It’s less than 200 lines of code.**


This blog uses [Next.js](https://nextjs.org/), but the approach is likely useful for any similar website. This approach has some nice properties:


### Security


Mostly safe against XSS attacks since rendering is done with safe React APIs. There is one caveat which is the HTML markdown node. You could choose to treat this as an error if you want to be paranoid. I appreciate knowing React is handling this security boundary rather than some random NPM module.


### Extensible


It’s simple to support [custom directives](https://github.com/remarkjs/remark-directive). This has proved useful for things like embedding audio files, embedded Tweets, or YouTube videos.


### Dynamic


It’s trivial to render either static HTML or interactive components as appropriate. For example, I render a custom audio node that is interactive and connected via React context to a player bound to the bottom of the page.


### Transparent


It’s easy to control (and see!) exactly what HTML will be emitted. This makes it easy to use global CSS to control the styling that applies to all basic elements. With solutions that pre-compile markdown directly to HTML this can be very hard to control, if not impossible.


### Powerful


I can apply transformations and validations on the AST. For example:

- I transform code blocks into highlighted code blocks at build time by transforming markdown code blocks into markdown html block
- Transform footnote links into inline links
- I generate a small placeholder image as a data uri for each image so that pages load smoothly without jank
- I validate the set of languages used in code blocks are from the subset that are supported by my syntax highlighting plugin

### Works well with server components


It’s possible to parse the markdown to AST in a server component. I’ve also implanted the main recursive React component as a server component. This allows the transformation from AST to HTML to be done on the server (or at build time) while still leaving some leaf node components (like audio elements) interactive.

