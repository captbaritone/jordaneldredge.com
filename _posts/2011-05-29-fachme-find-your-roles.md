---
title: "FachMe: Find your roles"
layout: post
---

I built a data-driven website to help opera singers find roles which are likely to suit their voice. The name is a questionable pun based on the German <a href="http://en.wikipedia.org/wiki/Fach">fach system</a> for classifying voices. I present to you <a href="http://fachme.com">FachMe</a>:
<p style="text-align: center;"><a href="http://fachme.com"><img class="size-full wp-image-899 aligncenter" title="FachMe Screen Shot" alt="" src="http://jordaneldredge.com/uploads/2011/04/Screen-shot-2011-04-16-at-10.34.01-AM.png" width="419" height="367" /></a></p>
The fach system is widely used to help singers find opera roles which will "fit" their voice. The problem is that human voices are infinitely variable while there are only a set number of fachs. My goal was to create a service that would bypass the limits of the fach system and allow singers to find roles which are suitable for their voice.

<strong>How does it work?</strong>

FachMe uses a database of the recording careers of over 15,000 actual singers to recommend roles which are statistically likely to suit the users voice. When the user arrives, they are prompted to supply a list of roles which they know suit their voice. We then search the database for other singers who have sung these guide roles and create a profile of the user. We can assume that the user's voice is somewhat similar to all of the singers in their profile, so we pull all the roles that the singers in their profile have sung. We then sort this massive list of roles, which are at least tangentially related to the user, based on which roles appear most prominently. The results are a list of roles which are most similar to the roles input by the user.
