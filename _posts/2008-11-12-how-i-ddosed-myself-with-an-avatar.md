---
title: "How I DDOSed myself with an avatar"
layout: post
---

Building on my <a href="http://blog.classicalcode.com/?p=105">previous avatar hack</a>, I set out to design an avatar that was also an interactive game. The game I eventually settled on was one where you compete with the other users to see who can load the avatar the most times. The image you are served shows your ranking as compared to the other users. It looked like this:
<p style="text-align: center;"><a href="http://jordaneldredge.com/uploads/2008/11/off.png"><img class="size-full wp-image-133 aligncenter" title="Avatar Game Example" src="http://jordaneldredge.com/uploads/2008/11/off.png" alt="" width="150" height="200" /></a></p>
And true to its word, every time you refreshed it, your number went up, and you could climb to the top. I thought it would be fun, and a person or two might even refresh it a few times to get to the top. So, before I went to bed, I set it as my avatar on a forum I frequent. When I woke up the next morning<span id="more-132"></span> I checked to see if anyone had taken an interest. It turns out that there was so much interest that a thread I had started about Facebook ads had been renamed by the mods to "The refresh game" where people could discuss techniques for getting high scores. I had already recieved 100,000 requests for the image by this time.

The forum ranged from people discussing using Firefox tabs:
<blockquote>I did something similar [opening several tabs in Firefox], except I opened it in 126 tabs, mass bookmarked them, opened a few windows, loaded all the tabs into each window, and THEN refreshed all the tabs in all the windows. Unfortunately Firefox could barely handle it so I quit after getting to like 12th or so.</blockquote>
To more automated methods:
<blockquote>I'll put my seedbox on a wget loop muahahahaahha</blockquote>
One user found a clever way to stay in the lead. Take first, save the image and save it as your avatar:
<blockquote>I have a new avatar so i'm done :)
<a href="http://jordaneldredge.com/uploads/2008/11/gamekz8.png"><img class="alignnone size-full wp-image-163" title="Static Avatar to stay in the lead" src="http://jordaneldredge.com/uploads/2008/11/gamekz8.png" alt="" width="150" height="200" /></a></blockquote>
However the most amusing method was this:
<blockquote>I put a screwdriver on my F5 key while I walked away for a while at work, leaned it up against the laptop screen. Got me to 7th Place with 8613 refreshes. I tried "ReloadEvery" for Firefox.

The screwdriver was faster!

<a href="http://jordaneldredge.com/uploads/2008/11/2gsnxg4.jpg"><img class="alignnone size-medium wp-image-134" title="Screwdriver refreshes avatar" src="http://jordaneldredge.com/uploads/2008/11/2gsnxg4-225x300.jpg" alt="" width="225" height="300" /></a></blockquote>
By that evening, our interet had slowed to a stop (due to our router not being able to deal with large numbers of connections) and I was forced to remove the image. By this time, barely 12 hours later, the image had been requested 260,964 times with nearly 60 people having had requested it more than 100 times. The take-down was greeted with instant complaints, including suggestions to rehost it on a real server. So, to appease the nerds, I sent to code to another member of the community who has just recently reposted it. So, <del datetime="2008-12-09T22:55:50+00:00">here is a working copy if you want to compete (go ahead and refresh!)</del> (The reposted version has been ddosed too.)

<strong>Update:</strong>

New quotes form in the forum in reference to the avatar that the other guy is hosting:
<blockquote>when i started piecing together a pc out of spare parts, deciding which linux live cd to use, and looking for an ethernet cable to directly connect to my modem, i realized i was about to waste too much time on this competition. i think i will stop playing now.</blockquote>
<blockquote>People are now writing C, PHP, BASH, and Java programs to get high scores. Aparently Java just came out of no where and stole the lead by a huge margin by managing 40 requests per scound.</blockquote>
<blockquote>aha I found out someone is using a java program with 1000 threads, no wonder &lt;_&lt; [I showed this to other people on IRC as well - they're all bragging ]</blockquote>
<blockquote>Looks like the 1st place person is taking a break, time to catch up! I've noticed that people's #s have been getting too big for the image, I made a quick top20 here: <a href="http://facepwn.com/avatarstats.php">http://facepwn.com/avatarstats.php</a> It wont increase your score when you refresh though ;)</blockquote>
