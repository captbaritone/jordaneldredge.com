---
title: Using Notion as my CMS with Next.js
tags:
  - javascript
  - anecdote
  - react
  - thisSite
  - note
summary: >-
  Why I chose to use Notion as the backing CMS for the Notes portion of this
  site, and the technical details of how it’s implemented
notion_id: dbbf2aea-c222-4cea-a6af-d6e19f83a606
summary_image: >-
  https://pub-d4cecb3d578a4c0a8939680792e49682.r2.dev/notion-mirror/84ebb48c-616a-4f51-ae9a-991a4e0a7e9b/727fb2ac-8f96-4964-8790-c88490cb5417/Screenshot_2024-07-24_at_11.53.31_AM.png
---
The [Notes](https://jordaneldredge.com/notes/) section of this site is currently implemented using Notion as the backend. I’ve found this really helpful in terms of writing content and also an interesting technical challenge so I thought I’d document what I’ve done and why.

## Motivation

For most of its history my blog has mostly served as a place to share the results of larger projects. The site was originally run via Wordpress and at some point rewritten using the static site generator [Jekyll](/dbbf2aeac2224ceaa6afd6e19f83a606). I loved that _posts were stored as Markdown files in a Git repository_, and I generally only wrote a handful of posts a year, so opening a text editor on my laptop and pushing to GitHub was an acceptable amount of friction. From there I migrated to [Next.js](https://nextjs.org/), but kept the same model where posts were Markdown files that got parsed at build time. More on that [here](https://jordaneldredge.com/notes/markdown-react/).

As Twitter started shifting under Musk’s ownership, I realized that I wanted a place that I owned myself where I could share the types of content I usually shared on Twitter: Anecdotes, observations, links to interesting content, things I had recently learned, etc. Maybe not as a distribution channel, but as a place to put things that I could link out to in the future.

Markdown+Git was too heavy-weight for this. I wanted something I could post to from my phone while waiting in line at the grocery store, but also have the freedom to create longer form content.

I was already a heavy user of Notion for note taking, todo lists and other personal projects, so decide to try using Notion to author posts and use their API to dynamically pull them into my website.

It ended up working really well! I’ve written [over 90 of these notes](https://jordaneldredge.com/notes/) of varying lengths since I added the feature in October of 2022. I credit this to both having a lower friction way to post, and also carving out a separate section on my site where I clarify that these are less formal posts. That gave me permission to do less proof reading (I’m terribly prone to typos) and just post. This is Twitter, not Medium!

Since I’ve found the approach so nice, I figured others might be doing something similar, so I wanted to share how I’ve built it so far.

## Data Access

I created my own [Notion Integration](https://developers.notion.com/docs/create-a-notion-integration) and connected it to my personal account. My website reads data from Notion using Notion’s own [`@notionhq/client`](https://www.npmjs.com/package/@notionhq/client) NPM module with an API key in a `.env` file. It’s quite easy to setup, and you can manually add pages (with their sub-pages) to the integration, so it should be fairly secure while also low friction.

## Publishing Notes

I draft notes by adding a new subpage to a page called “Notes Drafts”. The “Notes Drafts” page also acts as an inbox where I can quickly jot down post ideas without even creating a new page. When I’m ready to post, I simply move the page to be a child of the parent page “Notes”. There’s even a handy option in the dropdown menu to move pages.

The Notes section of this website is rendered by fetching the contents of the Notion “Notes” page, iterating thought it’s blocks and collecting the page id of each `child_page` block. So, as pages are added and removed from the “Notes” page, they are published and unpublished from my site. Their order is based on their Notion creation date.

![Screenshot\_2024-07-24\_at\_11.53.31\_AM.png](https://pub-d4cecb3d578a4c0a8939680792e49682.r2.dev/notion-mirror/84ebb48c-616a-4f51-ae9a-991a4e0a7e9b/727fb2ac-8f96-4964-8790-c88490cb5417/Screenshot_2024-07-24_at_11.53.31_AM.png)

## Metadata

You’ll notice that pages also have a permalink slug (the bit of the url after `/notes/`) a summary paragraph and even tags. This are achieved via a “Notes Metadata” database in Notion where the primary column is a reference to an individual Note’s page and the other columns contain structured data about the post:

![Screenshot\_2024-07-24\_at\_11.55.24\_AM.png](https://pub-d4cecb3d578a4c0a8939680792e49682.r2.dev/notion-mirror/84ebb48c-616a-4f51-ae9a-991a4e0a7e9b/d6d3f2a8-9931-441a-bf7f-0715ead3b1b7/Screenshot_2024-07-24_at_11.55.24_AM.png)

This database is also fetched from Notion when rendering the list, and parsed into a map containing the metadata for each post. All of these fields are optional, so I can choose not to add them, or post quickly and come back to add them after the fact. If a slug is not defined, the Notion id (UUID) of the page is used for the URL.

## Formatting

The existing blog posts on my site are rendered from Markdown using a [technique](https://jordaneldredge.com/notes/markdown-react/) where I parse the Markdown to AST and render that using a recursive React component. I wanted to reuse as much of that as possible, so I found the excellent [notion-to-md](https://github.com/souvikinator/notion-to-md) package and convert each post to Markdown. From there, rendering of Markdown files and Notion pages looks about the same! All my CSS, syntax highlighting, etc work just the same, with a few minor exceptions:

### Images

Images in Notion docs have URLs that point to Amazon S3 buckets and have a special signature added to them which expires. This causes problems if I want to be able to cache these results since the image URLs will eventually go out of date. To combat this, I do a quick traversal of the AST and for each image, download any new ones locally to my server and then rewrite the URL in the AST to point to my local version.

### Audio Embeds

I have a custom audio player as part of my site, and a few Notion posts have audio files referenced in them. Since `notion-to-md` does not handle audio embeds in any special way, I simply include these audio files as links in my Notion page, and then have a little check in my Markdown rendering React component that renders any links to audio files as an embedded audio player. For example:

<https://capt.dev/file/gFG874yS3IsXMnlruKWrr/cool.mp3>

(Taken from [this post](https://jordaneldredge.com/notes/corrupted-skins/))

## Preventing lock-in, resiliency, and backups

Another advantage of converting everything to Markdown, is that it commodifies Notion. If at some point in the future I want or need to move away from Notion, I have the freedom to move to any other solution which I can ultimately convert to Markdown.

In fact, I have a script which serializes the posts in Notion to [Markdown files in the repo](https://github.com/captbaritone/jordaneldredge.com/tree/dc611db6986cc87d7e5dac77540d1c4064aa9f72/_notes) that look identical to my existing blog posts: Markdown with a Yaml header for metadata.

![Screenshot\_2024-07-24\_at\_2.52.28\_PM.png](https://pub-d4cecb3d578a4c0a8939680792e49682.r2.dev/notion-mirror/84ebb48c-616a-4f51-ae9a-991a4e0a7e9b/19c69eee-6b62-4e4e-9312-eaf048941871/Screenshot_2024-07-24_at_2.52.28_PM.png)

This means that in a pinch I could just delete the Notion integration and go back to rendering from Markdown. I could even setup my server to fallback to these files in the case of Notion API errors (though I haven’t gone that far yet).

## Caching

Making multiple network request to Notion just to render a page, going to end up with me hitting my Notion API rate limit and also going to cause very slow page loads. To avoid this, I aggressively cache reads from Notion across requests. I originally tried Next.js’ `unstable_cache` API for this, but [found it too unpredictable](https://jordaneldredge.com/notes/unstable_cache/) and just wrote my own simple memoization function. The current strategy is that it caches every request for 10 minutes, and it uses a “stale while revalidate” approach, so even requests that get a cache miss should still resolve without needing to wait on Notion.

I could see a number of other optimization opportunities here, like falling back to stale data if Notion network requests fail, or waiting to reset the cache until the promise resolves.

## What’s next

In addition to improving caching, there are a few other improvements I’d like to make:

1. Some scheme for realtime updates to my search index (using SQLite’s FTS feature)
2. Better resiliency in case Notion goes down. Fallback to Markdown files?
3. Write my own Notion → Markdown AST conversation. Right now I actually serialize the Notion format to a Markdown string and reparse that, which is pretty wasteful
4. Some scheme to manually break the cache so I can see new posts right after I post them

## The code

The code for this is [on GitHub](https://github.com/captbaritone/jordaneldredge.com/blob/dc611db6986cc87d7e5dac77540d1c4064aa9f72/app/api/backup/route.ts#L4). You can find there relevant code in these places:

- [Notion API calls](https://github.com/captbaritone/jordaneldredge.com/blob/dc611db6986cc87d7e5dac77540d1c4064aa9f72/lib/services/notion.ts#L4)
- [Notes model](https://github.com/captbaritone/jordaneldredge.com/blob/dc611db6986cc87d7e5dac77540d1c4064aa9f72/lib/data/Note.ts)
- [Backup api that saves notes as Markdown](https://github.com/captbaritone/jordaneldredge.com/blob/dc611db6986cc87d7e5dac77540d1c4064aa9f72/app/api/backup/route.ts#L4)
- [Memoization code](https://github.com/captbaritone/jordaneldredge.com/blob/dc611db6986cc87d7e5dac77540d1c4064aa9f72/lib/memoize.ts#L17)
