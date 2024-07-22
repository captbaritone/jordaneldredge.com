---
title: 'Play the card game "War" in my avatar'
summary: "I programed a dynamic avatar that plays the card game war."
tags: [refresh, game, php, defunct]
---

Since my previous avatar [DDOSed my router](/blog/how-i-ddosed-myself-with-an-avatar/), today I wrote a less popular avatar game. The only game I could think of that has no need for actual user input was the [card game war](<http://en.wikipedia.org/wiki/War_(card_game)>). So I implemented it in my avatar. You can play too, by simply refreshing this image:

![](/projects/war/index.php)

Features:

- Proper handeling of running out of cards during a "war"
- War cards are show (with appropriate cards face up or down)
- Independent games for each ip address playing
- Deck state stored in database between refreshes
- Special WIN/LOSE screens

**You may want to try [opening the image in its own window](/projects/war/index.php).**
