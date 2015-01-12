/*
Title: Surviving Hacker News traffic with the help of free CDNs
Description:
Author: Jordan Eldredge
Date: 2014/12/16
*/

*This post is the second in an ongoing series about things I learned from my
recent [Winamp2-js](http://jordaneldredge.com/projects/winamp2-js/) project.*

*Previously: [I'm glad I factored out jQuery](http://jordaneldredge.com/blog/im-glad-i-factored-out-jquery)*

It was just before midnight on November 6th. My
[tweet](https://twitter.com/captbaritone/status/530030571141873664) from
earlier in the day announcing my latest project had received an unexpected
amount of attention, so I decided to check Google Analytics one last time
before I went to bed.

My nerdy heart skipped a beat when I saw that traffic was spiking, and then
stopped for an entire second when I saw that the source of that spike was
[Hacker News](https://news.ycombinator.com/item?id=8565665). Winamp2-js was on
the front page. I was thrilled, but also nervous.

My project was on a cheap $10/month VPS hosted by
[DigitalOcean](http://digitalocean.com/) and I had no idea what to expect. How
much traffic can this server handle? How much traffic
does Hacker News actually drive?

I had the advantage that my project was completely static, so I decided to see
if it was possible to move some of the asset files off of my server and onto
a CDN. A quick Google turned up [rawgit.com](http://rawgit.com), a free CDN
which will mirror any file found on GitHub. You simply use a URL like
`https://cdn.rawgit.com/user/repo/branch/file` and it serves that file from
that repo on GitHub.

> Oh hello front page of Hacker News. Make yourself at home. Excuse me while
> I try to move static files to a CDN...

-- A [tweet](https://twitter.com/captbaritone/status/530283530664677376)
I tweeted.

I SSHed into my server, issued a quick find and replace, and suddenly instead
of serving ~25 files with each page load, I was serving one small `index.html`
file and everything else was served by rawgit.com. Now, I figured, my server
could handle pretty much any amount of traffic. So I went to bed.

When I woke up in the morning, I checked Google Analytics again, and
[Reddit](http://www.reddit.com/r/InternetIsBeautiful/comments/2lh3ob/winamp_2_preserved_in_html5/)
and
[Gizmodo](http://gizmodo.com/winamp-2-has-been-immortalized-in-html5-for-your-pleasu-1655373653)
had both taken notice. I did a quick assessment of my server and it was
handling the load fine. However, for some reason I was seeing a bug where the
progress bar wasn't moving while the audio played. A quick investigation
pointed to the way rawgit.com was serving the headers for the audio file. They
were set in such a way that the javascript I had wasn't able to asses the
length of the track.

Even though this was my largest asset file by an order of magnitude, I figured
it was worth whatever cost I might accrue to have the project looking its best
during this time of peak exposure, so I pointed that URL back to my server.
With the site now functioning properly, I mounted my bike and headed to work.

Once there, I realized I had been overly optimistic about my VPN's abilities.
The page was retuning very slowly, and my attempts to SSH into the machine were
failing. The server was out of memory. With no other options, I logged into my
DigitalOcean control panel, and reset the machine.

Once the machine was back up, I SSHed in and pointed the demo track URL back
to rawgit. Buggy is better than down. I then [put the word out on
Twitter](https://twitter.com/captbaritone/status/530420655951335424) for help
hosting the demo mp3. Within one minute
[@Michcioperz](https://twitter.com/Michcioperz/status/530420989147217920) came
through suggesting [meadiacru.sh](http://mediacru.sh). Another free CDN, but
this one handled the header in the way I needed. In just a few minutes I had
moved the file over and Winamp2-js was back online, downloading quickly,
and at no expense to me.

I have no idea how these sites are sustainable, and if I needed to support
a high bandwidth site, I would pay for my own CDN. But, to absorb a single
spike in traffic for a pet project on a moment's notice, these two sites were
a godsend. Thank you!
