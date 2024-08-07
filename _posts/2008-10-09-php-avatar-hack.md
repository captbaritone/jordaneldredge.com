---
title: "PHP: Avatar Hack"
summary: "A php script that generates an image for use as an avatar."
tags: [security, php]
---

![](/uploads/2008/11/avatar.jpg "avatar Hack")I am a member of a web forum which allows you to use an Avatar image of your choice. You simply give them the url of the image. The ability of php to generate images lead me to try to come up with ways to take advantage of this system.

My first attempt at a dynamically generated avatar was thwarted by the sites form verification. It rejected my avatar because it pointed to a .php file instead of an image file. To get around this, I created a directory called:
<pre>/avatar.jpg</pre>
that contained an index.php file. Therefore when a user requests:
<pre>http://www.classicalcode.com/avatar.jpg</pre>
the server resolves that to:
<pre>http://www.classicalcode.com/avatar.jpg/index.php</pre>
and that script generates an image which it then returns with .jpg headers.

Now that the image is dynamically generated, the question is: what can the script do? Currently it logs ip addresses, browsers and operating systems, does a google image search, finds a random image for a search term, and displays that image along with the users ip and the total times that the avatar has been requested. The source code can be found here: [avatar_source.php](https://gist.github.com/4093003)
