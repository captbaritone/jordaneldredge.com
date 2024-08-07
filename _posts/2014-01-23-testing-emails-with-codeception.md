---
title: "Testing emails with Codeception"
summary: "A Codeception helper to test emails sent by your application."
tags: ["php"]
---

**Update:** _(Mar 19, 2014) I have converted the helper file into a Codeception
module which can be installed as a simple Composer requirement. You can find it
(and its installation instructions) here: [MailCatcher Codeception Module]_

Acceptance testing, testing your site via an automated browser, is great way to
ensure that the various pages on your site behave the way you expect them to.
However, there are some things that a website does that can be harder to test
in acceptance tests. One of those things is email. Luckily the folks at
Codeception wrote up a blog post on using [MailCatcher's API to test sent
emails].

![screenshot of MailCatcher][screenshot]

Their examples give you all the pieces, but you still have to implement it.
I decided to put them together into a Helper file that anyone can drop into
their project.

Take a look at the project on GitHub: [MailCatcher Codeception Helper]. Once you
have [MailCatcher] installed, its just a matter of downloading the file, and
adding a few lines to your configuration.

[mailcatcher's api to test sent emails]: http://codeception.com/12-15-2013/testing-emails-in-php
[mailcatcher codeception helper]: https://github.com/captbaritone/mailcatcher-codeception-helper
[mailcatcher codeception module]: https://github.com/captbaritone/codeception-mailcatcher-module
[mailcatcher]: http://mailcatcher.me/
[screenshot]: /content/images/mailcatcher.png
