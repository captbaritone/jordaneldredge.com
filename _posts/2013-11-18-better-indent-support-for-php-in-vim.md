---
title: "Better indent support for PHP in Vim"
---

If you use PHP for templating, chances are you have trouble getting Vim to
handle auto indenting.

Luckily [Christian J. Robinson](http://christianrobinson.name/vim/) wrote up
a great little script on the Vim Wiki called "[Better indent support for php
with html](http://vim.wikia.com/wiki/Better_indent_support_for_php_with_html)".

This lets Vim intelligently handle both HTML and PHP within a single file.

Pasting his block of code into your `.vimrc` works, but is pretty messy, so
I've wrapped it up as a [Vim
plugin](https://github.com/captbaritone/better-indent-support-for-php-with-html).
Now, if you use Vundle, you can simply install it by adding this line to your
`.vimrc` and running `:BundleInstall`:

```vim
Bundle 'captbaritone/better-indent-support-for-php-with-html'
```
