---
title: "A trick to get consistent checkbox form values"
layout: post
---

HTML form checkboxes have a rather frustrating quirk when it comes to
processing their post data. If the box is unchecked, rather than submit a value
of false or zero, browsers will just not post any data at all.

When using PHP to parse post data, this means you can't just blindly access
`$_POST['my_checkbox']` without risking throwing an 'undefined index' notice.

I just came across a trick to get around this annoyance. Right before your
checkbox input, include a hidden input with the same name set to `0` like so:

    <input name='my_checkbox' type='hidden' value='0' />
    <input name='my_checkbox' type='checkbox' value='1' />

If the checkbox is checked, it will override the hidden input, but if it's left
unchecked, the hidden input's `0` value will be submitted.



