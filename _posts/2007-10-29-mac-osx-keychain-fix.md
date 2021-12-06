---
title: "Mac OS X keychain fix"
---

![Keychain First Aid](/content/images/osx-keychain-fix.png)

It turns out there is a very simple fix for a corrupt keychain file. One of the
symptoms of my MacBook battery dying is that it shuts off at unexpected times.
(Very annoying) Recently it turned off right in the middle of writing to the
keychain, and when I turned it back on, BAM the keychain was broken.  Anytime
any application tried to access anything stored in it or write anything to it,
the application would fail (at best) or crash (at worst). Anyway, it turns out
that the good folks at Apple realized that this might happen and included
a tool to repair just such a corruption.

In Applications & Utilities is an app called Keychain Access.app. Under the
Keychain Access menu is the option  Keychain First Aid. This tool will let you
verify if your keychain file is broken or not (mine was) and repair it if it
is. It was as simple as that.
