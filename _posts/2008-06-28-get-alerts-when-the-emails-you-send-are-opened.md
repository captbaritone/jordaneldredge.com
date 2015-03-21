---
title: "Get alerts when the emails you send are opened"
layout: post
---

Inspired by <a href="http://www.spypig.com/">spypig.com</a>, a site that helps you track when your emails are opened, I decided to see if I could write a script with the same functionality. It tuned out to be a rather interesting project.

Here it is: <a href="http://www.classicalcode.com/t.php">http://www.classicalcode.com/t.php</a>

It works by generating an image which you embed in your email. Then when your recipeint reads their email, their email client downloads that image. Downloading that image triggers a script on my server which then sends you an email.

In order to make the image look less suspicious I implemented a feature where the image is a string of text of the senders choosing. Example:

<a href="http://jordaneldredge.com/uploads/2008/06/t1.png"><img class="alignnone size-full wp-image-102" title="Tracker Image" src="http://jordaneldredge.com/uploads/2008/06/t1.png" alt="An Example of a tracker image from my email tracking project" width="324" height="13" /></a>

Give it a try!
