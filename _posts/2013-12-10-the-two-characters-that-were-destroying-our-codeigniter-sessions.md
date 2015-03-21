---
title: "The two characters that were destroying our CodeIgniter sessions"
layout: post
alis: /blog/the_two_characters_that_were_destroying_our_codeigniter_sessions
---

A [CodeIgniter] project I was working on for work had a strange bug where
users were getting mysteriously logged out. After hours of debugging I was able
to narrow it down to it's minimal reproduceable form:

~~~php
$this->session->set_userdata('example_session_value', array('\/'));
~~~

Running that line of code will render the current session irretrievable. We
were running version 2.1.3. I also tried the most recent stable version (2.1.4)
and the bug persists. However, the current development branch seems immune to
the bug.

While I don't exactly understand why it breaks, it has something to do with the
escaping CodeIgniter does before it serializes the session array to store it in
the database.

**Update:** (Dec 21st, 2013) After considerable digging my [brother] and
I found the root of the problem. In the days of [Magic Quotes]
a `strip_slashes()` was needed to strip cookie escapement. It has been
[removed] in development branch of CodeIgniter but still persists in the most
recent stable release. We have written up a possible history explaining how
this issue persists as part of a [related pull request].

[CodeIgniter]: http://ellislab.com/codeigniter
[brother]: http://thatsmathematics.com
[Magic Quotes]: http://www.php.net/magic_quotes
[removed]: https://github.com/EllisLab/CodeIgniter/commit/ca20d8
[related pull request]: https://github.com/EllisLab/CodeIgniter/pull/2784
