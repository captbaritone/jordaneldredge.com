---
title: My personal search engine
tags:
  - thisSite
  - note
summary: A little web service I wrote to help myself
notion_id: ad2a8f36-9d78-4d03-9f2c-f3f32f1a51e0
---
For the last year and a half I’ve been running my own personal search engine. To be fair, it’s not actually doing any search indexing or searching. It’s really just a web endpoint that I can configure my browser to use as a search engine and is modeled after Meta’s internal [bunnylol](https://www.quora.com/What-is-Facebooks-bunnylol) tool. In short, it has special handling for a series of simple commands or prefixes, and falls through to a Google Search if the query does not match one of these commands.

So, if I search for “event <some event title I just created>” it redirects me to Google Calendar’s event creation page, with that tile pre-filled. If I search for “movie <some movie title>” it redirects me to my favorite streaming platform’s search page with that query.

And, again, if the query does not start with a known command/prefix it just redirects to a Google search for the query.

By configuring my browser to use this endpoint as my default search engine, my browser URL bar becomes a sort of command prompt.

The examples I have so far are quite simple and could honestly be implemented by a configuring Chrome’s search engines (which lets you pick a search engine based on a prefix) but in the future I’m looking forward to adding more sophisticated commands. For example:

- `short <some url>` could create a short link for the url passed and redirect to a page where I could copy it
- `paste <some text>` could create a paste containing “some text” and redirect to it
- `event Jan 2 at 6-7pm drinks with John` could parse the the date/time and create an event on my calendar for me (a Google Calendar feature I sorely miss)
- `ga dau` could open Google Analytics with a view that show my side project’s daily active users
- `todo <some text>` could add an entry “some text” to my Notion todo list

This search engine is implemented as part of a larger personal server app I’ve written which includes:

- Link shortener
- Paste bin
- Static image/file host

The server portion has a web UI as well as a CLI client which I install on all my computers. Maybe in the future I’ll write about the larger project. Let me know if you’re interested!
