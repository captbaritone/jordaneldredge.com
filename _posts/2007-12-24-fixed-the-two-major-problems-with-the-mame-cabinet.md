---
title: "Fixed the two major problems with the MAME cabinet"
summary: "Update on my MAME cabinet project."
tags: []
---

Finally I fixed the last two major flaws with the MAME cabinet!

**Problem:** The device that connects the arcade buttons to the keyboard port
was not recognized as keyboard, and therefore the computer was not listening
for input.

**Solution:** My [brother](https://thatsmathematics.com/blog/about-me/) hacked the
kernel so that no matter if the keyboard is recognized or not, the computer
listens on that port.

**Problem:** Since my upgrade to Ubuntu Gutsy, xmame would sometimes not reset
the resolution when it exited.

**Solution:** I found the answer
[here](https://ubuntuforums.org/showthread.php?t=195981). By adding `; xrandr -s 1024x768` to the end of the list of options that wahcade passes to
xmame, I essentially tell wahcade to run xmame (with my option) and when xmame
closes (when I close a game) to reset the resolution with xrandr. So far, it
seems to work.

It looks like we are ready for the xmame party just as soon as these holiday's
are over.
