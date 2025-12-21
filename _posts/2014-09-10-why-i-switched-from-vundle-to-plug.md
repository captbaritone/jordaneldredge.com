---
title: "Why I switched from Vundle to Plug"
summary: I've found Plug to be superior to Vundle in several regards.
github_comments_issue_id: 8
tags: ["vim", "opinion"]
---

At a recent [Vim meetup][keith smiley] introduced me to [Plug],
a plugin manager for Vim that improves upon [Vundle]. Below are the reasons
I switched from Vundle to Plug:

## Vundle is not being actively maintained by its creator

Gmarik, the creator of Vundle is [no longer able to maintain the
project](https://github.com/gmarik/Vundle.vim/issues/608). Somebody may pick up
the reins, but the project has been stalled for some time now.

## Simpler bootstrapping for initial install.

With Vundle, getting my plugins working on a new machine was always a pain.
With Plug, I can use this snippet from Keith's dotfiles which will
automatically install Plug if Vim starts without it:

```vim
" Load vim-plug
if empty(glob("~/.vim/autoload/plug.vim"))
    execute '!curl -fLo ~/.vim/autoload/plug.vim https://raw.github.com/junegunn/vim-plug/master/plug.vim'
endif
```

To be fair, you could probably implement a similar thing with Vundle.

## "Lazy Load" plugins

Running lots of plugins can drastically slow down Vim's startup time. Plug gets
around this by allowing you to put off the loading of some plugins.

For example, I only need this syntax plugin when I'm editing markdown files:

```vim
Plug 'plasticboy/vim-markdown', { 'for': 'markdown' }
```

And I only need this plugin when I issue the `Rename` command:

```vim
Plug 'AlexJF/rename.vim', { 'on': 'Rename' }
```

## Faster installation of plugins (sometimes)

If your installation of Vim is compiled with Ruby, which most of mine are, Plug
will update/install plugins in parallel. If you don't have Ruby, it falls back
to a native Vim approach.

You can see my Plug configuration in this file which is sourced by my `.vimrc`:
[Plug.vim]

[vim meetup]: https://groups.google.com/forum/#!forum/vimsf
[plug]: https://github.com/junegunn/vim-plug
[keith smiley]: https://smileykeith.com/
[vundle]: https://github.com/gmarik/Vundle.vim
[plug.vim]: https://github.com/captbaritone/dotfiles/blob/master/vim/plug.vim
