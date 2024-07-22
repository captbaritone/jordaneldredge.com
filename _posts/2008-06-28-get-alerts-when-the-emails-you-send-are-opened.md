---
title: "Get alerts when the emails you send are opened"
summary: "I wrote a script that sends you an email when the image you embed in your emails is opened."
tags: [security, defunct, php]
---

Inspired by [spypig.com](http://www.spypig.com/), a site that helps you track when your emails are opened, I decided to see if I could write a script with the same functionality. It tuned out to be a rather interesting project.

Here it is: [http://www.classicalcode.com/t.php](http://www.classicalcode.com/t.php)

It works by generating an image which you embed in your email. Then when your recipeint reads their email, their email client downloads that image. Downloading that image triggers a script on my server which then sends you an email.

In order to make the image look less suspicious I implemented a feature where the image is a string of text of the senders choosing. Example:

[![An Example of a tracker image from my email tracking project](/uploads/2008/06/t1.png "Tracker Image")](/uploads/2008/06/t1.png)

Give it a try!
