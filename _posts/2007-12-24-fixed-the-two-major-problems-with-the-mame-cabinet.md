---
title: "Fixed the two major problems with the MAME cabinet"
layout: post
---

Finally I fixed the last two major flaws with the MAME cabinet!

<strong>Problem:</strong> The device that connects the arcade buttons to the keyboard port was not recognised as keyboard, and therefore the computer was not listening for input.

<strong>Solution:</strong> My <a href="http://www.math.ucsd.edu/~neldredg/">brother</a> hacked the kernel so that no matter if the keyboard is recognized or not, the computer listens on that port.

<strong>Problem:</strong> Since my upgrade to Ubuntu Gutsy, xmame would sometimes not reset the resolution when it exited.

<strong>Solution:</strong> I found the answer <a href="http://ubuntuforums.org/showthread.php?t=195981">here</a>. By adding "; xrandr -s 1024x768" to the end of the list of options that wahcade passes to xmame, I essentially tell wahcade to run xmame (with my option) and when xmame closes (when I close a game) to reset the resolution with xrandr. So far, it seems to work.

It looks like we are ready for the xmame party just as soon as these holiday's are over.
