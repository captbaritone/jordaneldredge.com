---
title: "Play the card game \"War\" in my avatar"
layout: post
---

Since my previous avatar <a href="{{ site.url }}/blog/how-i-ddosed-myself-with-an-avatar/">DDOSed my router</a>, today I wrote a less popular avatar game. The only game I could think of that has no need for actual user input was the <a href="http://en.wikipedia.org/wiki/War_(card_game)">card game war</a>. So I implemented it in my avatar. You can play too, by simply refreshing this image:
<p style="text-align: center;"><img class="aligncenter" src="{{ site.url }}/projects/war/index.php" alt="" width="150" height="132" /></p>
Features:
<ul>
	<li>Proper handeling of running out of cards during a "war"</li>
	<li>War cards are show (with appropriate cards face up or down)</li>
	<li>Independent games for each ip address playing</li>
	<li>Deck state stored in database between refreshes</li>
	<li>Special WIN/LOSE screens</li>
</ul>

**You may want to try <a href="{{ site.url }}/projects/war/index.php" target="_blank">opening the image in its own window</a>.**
