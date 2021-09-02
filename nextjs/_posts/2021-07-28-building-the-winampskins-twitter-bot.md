---
layout: post
title: "Building the @WinampSkins Twitter Bot"
summary: "How my Twitter bot @winampskins works under the hood, how it has evolved over time, and what I've learned from the project."
summary_image: /images/winamp-skins-twitter-bot-bio.png
---

In November 2017 I started a Twitter bot called [@winampskins](https://twitter.com/winampskins) which periodically tweets images of [Winamp](https://en.wikipedia.org/wiki/Winamp) skins. It's been a really interesting project with a fun evolution, but I never sat down and wrote about it, so I wanted to rectify that situation.

The idea is simple: Several times a day the bot tweets an image of a classic Winamp skin with a link to try out that skin in the browser. Today it has ~6.5k followers (+200/month recently), garners around 700k impressions/month, and has tweeted ~6k skins.

::tweet{status=1420368489106182152}

## MVP

After writing a script combing [Puppeteer](https://pptr.dev/) and [Webamp](https://webamp.org/) to automate taking screenshots of Winamp skins, [@ckolderup](https://twitter.com/ckolderup) on Twitter [suggested I create a Twitter bot](https://twitter.com/captbaritone/status/901921282609995776). I loved the idea, so I registered an account and hacked together a Python script to tweet an image with a link to that skin loaded in the bowser. It was a manual process and I tried to run it a couple times a day from my laptop.

## Image Quality

I soon realized that Twitter was reencoding my `.png` images as `.jpg`. This meant that the pixel art images I was uploading were getting presented in a lossy format optimized for photos and, as a result, looked pretty awful. Additionally, the scaling used to present the images at a large size assumed all images were photos and smooth out the pixels as it scaled, rather than keeping the pixels distinct and crisp.

I was able to work around these two issues by adding a step to my script which would pre-process the image before uploading. First, I set one pixel's alpha channel to 254. The fact that the image (technically) had transparency forced Twitter to keep the images as a lossless `.png`. Next, I manually upscaled the image to twice its original size by doubling each pixel. This ensured that even when upscaled using the smoothing approach, the pixels were relatively distinct.

## Review

The biggest challenge with running the bot was that, because I was trying to collect as many skins as possible, many of the ones I had were of very poor quality or were "not safe for work". This meant I couldn't blindly tweet a random skin, I needed a review process. I wrote a script which would pick a random skin, open its image in Preview, and then prompt me to approve or reject it. The script would then record the filename in one of two text files.

## Tweeting Autonomously

In order to send the tweets automatically, I needed to have the bot running on a server since my laptop is often closed/off. So, I adjusted the review script to read/write the text files from an S3 bucket and moved the Python script to a server where I had an account. I also added some code so that if it noticed that the list of approved skins was getting short, it would email me a reminder to review some skins. I set the bot to tweet twice a day.

## Letting My Discord Community Review

It turns out, it was rather tedious to keep up with the bot's appetite for reviewed skins. I would often fall behind and feel guilty as I went about my day knowing that I was behind on reviewing skins. I figured a better UI — and the ability to review from my phone — would help, so I rewrote the review script as a Discord bot. When prompted, via a `!review` command, it would pick a skin, send a message with the skin's screenshot attached, and wait for a `y`/`n` response. I also updated the script that sent the tweets to post in Discord when the queue ran low.

This seemed like an easy way to make a nice UI for myself. However, I soon realized that the real benefit was that others in the server could help out. Before too long, others were responding to notifications and reviewing more skins and I never had to worry about it. I would just review skins on the rare occasion that it sounded fun.

Upon feedback from my Discord users, I eventually updated the bot to respond to 👍/👎 reactions rather than text responses. By seeding each message with both reactions, this made review on mobile super easy, since both reactions were already visible, you just tapped the one you wanted.

![Reviewing a Winamp skin with the Discord bot](/images/discord-winamp-skin-review.png)

## Increasing Tweet Frequency

Initially I configured the bot to tweet twice a day. After noticing that a similar bot, @win_icons tweeted much more frequently (every hour) and had nearly 20k followers I decided to up the frequency to every two hours. While this change increased churn, users who followed the bot and subsequently unfollowed, it seemed to pretty dramatically increase the number of net new followers the bot accumulated each month.

## Tinder Style Review

Now that the bot was tweeting twelve times a day, keeping up with reviews was once again an issue. I started jokingly dreaming about a Tinder style UI for review where you could swipe left or right to approve/reject a skin. I decided to build a prototype of it. This required building a web app with some form of authentication. I used Discord's auth flow — since the folks reviewing were already using Discord, and hacked together a very simple UI with [`react-twitter-card`](https://github.com/3DJakob/react-tinder-card) which handled the Tinder style swipe and some additional logic to preloaded images so that the flow could be very fast. It actually worked! At the same time I added hotkeys so you could just press y/n to approve/reject a skin.

It turns out the keyboard controls were so fast that they rendered the novel Tinder UI unnecessary. One of our Discord users got into a flow state and ended up reviewing 4-5 thousand skins over the course of a few evenings!

::tweet{status=1420393398121291790}

## The Great Uncropping

When I first started this bot, Twitter would display all images using a horizontal aspect ratio. Any image which did not fix exactly into that aspect ratio would be cropped to fit. It used some heuristic of "visual interest" to decide where to center the image. For Winamp skins, this often meant that the only part of the skin screenshot that users would see in their feed was of the equalizer window only, since the large number of sliders tend to make that the most visually noisy part of the skin. This was unfortunate and was frustratingly outside of my control.

In May of 2021, Twitter [removed this behavior](https://variety.com/2021/digital/news/twitter-uncropped-photos-bias-1234967778/) (at least on mobile) after its heuristics were criticised for having a racial bias. The result is that when you see one of the bot's tweets in your timeline, you will see the full screenshot, which is much nicer.

## My Reward (Feedback Loop)

The best thing about the Twitter bot is that it has created a new public stage for these unique works of art. Pieces which otherwise would be relegated to Winamp die-hards and archival backups are now getting in front of a modern audience and sparking conversations again. It has been particularly gratifying to see [LuigiHann](https://twitter.com/luigihann) replying to the bot with artist commentary and context whenever the bot Tweets one of his many iconic skins.

In addition to that altruistic benefit, the Twitter bot has provided me with a few personal benefits. Firstly it's been a super fun and educational project with many interesting technical challenges. Secondly, the audience the the bot has built has been very useful for promoting my other Winamp-themed projects.

However, the biggest — and most surprising — value it has created has been data. When building the [Winamp Skin Museum](https://skins.webamp.org/), I was able to leverage the like/retweet counts of each skin, as well as review results to rank skins by their relevance to a modern audience.

As a result, despite the fact that the Winamp Skin Museum contains more than 70k images (far too many for me to rank in an editorial fashion) the first six thousand are all sorted by their popularity on Twitter. The result is that for 99% of users, they can scroll for as long as they are interested and see all highly rated skins. And, as our review process and the Twitter bot continue to churn away, we are unearthing more nice skins, allowing the best ones to bubble to the top. You can read more about how I built the Winamp Skin Museum, in this other blog post: [Mainlining Nostalgia: Making the Winamp Skin Museum](https://jordaneldredge.com/blog/winamp-skin-musuem/)

Thanks for reading and, if you don't already, go follow [@WinampSkins](https://twitter.com/winampskins/)!