---
title: "Setting up PHP completion in Vim"
layout: post
---

Yesterday I setup PHP completion in Vim by adding the following to my `.vimrc`:

    autocmd FileType php setlocal omnifunc=phpcomplete#CompletePHP

    set completeopt=longest,menuone

    Bundle 'ervandew/supertab'
    let g:SuperTabDefaultCompletionType = "<c-x><c-o>"

    Bundle 'shawncplus/phpcomplete.vim'

Here's a quick breakdown of what each line does:

First we setup omnicomplete for PHP, which will let us trigger the completion
menu with `Ctrl+x,Ctrl+o`.

Then we improve the way the way completion is handled. `longest` makes Vim only
autocomplete up to the "longest" string that all the completions have in common
and `menuone` makes the menu spawn even if there is only one result.

Next, triggering completion with `Ctrl+x,Ctrl+o` is rather cumbersome, so
I also installed [SuperTab][1] via [Vundle][2] which triggers all the
completion commands (including [Ultisnips][3]) via tab, while still letting it
be used for indenting.

Finally, I was able to have the completion menu include the function's
signatures (argument and return types) by installing the [phpcomplete.vim][4]
plugin.

The result:

![screenshot of php completion in vim][screenshot]

[1]: https://github.com/ervandew/supertab
[2]: https://github.com/gmarik/vundle
[3]: https://github.com/SirVer/ultisnips
[4]: https://github.com/shawncplus/phpcomplete.vim
[screenshot]: {{ site.url }}/content/images/php-vim-completion-screenshot.png











