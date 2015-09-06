---
title: "Why I switched from Vundle to Plug"
layout: post
summary: I've found Plug to be superior to Vundle in several regards.
---

At a recent [Vim meetup] I learned about [Plug], from [Keith Smiley] which is
a plugin manager for Vim that improves upon [Vundle]. Below are the reasons
I switched from Vundle to Plug:

## Vundle is not being actively maintained by its creator

Gmarik, the creator of Vundle is [no longer able to maintain the
project](https://github.com/gmarik/Vundle.vim/issues/608). Somebody may pick up
the reigns, but the project has been stalled for some time now.

## Simpler bootstrapping for initial install.

With Vundle. getting my plugins working on a new machine was always a pain.
With Plug, I can use this snippet from Keith's dotfiles which will
automatically install Plug if Vim starts without it:

    " Load vim-plug
    if empty(glob("~/.vim/autoload/plug.vim"))
        execute '!curl -fLo ~/.vim/autoload/plug.vim https://raw.github.com/junegunn/vim-plug/master/plug.vim'
    endif

To be fair, you could probably implement a similar thing with Vundle.

## "Lazy Load" plugins

Running lots of plugins can drastically slow down Vim's startup time. Plug gets
around this by allowing you to put off the loading of some plugins.

For example, I only need this syntax plugin when I'm editing markdown files:

    Plug 'plasticboy/vim-markdown', { 'for': 'markdown' }

And I only need this plugin when I issue the `Rename` command:

    Plug 'AlexJF/rename.vim', { 'on': 'Rename' }

## Faster installation of plugins (sometimes)

If your installation of Vim is compiled with Ruby, which most of mine are, Plug
will update/install plugins in parallel. If you don't have Ruby, it falls back
to a native Vim approach.

You can see my Plug configuration in this file which is sourced by my `.vimrc`:
[Plug.vim]

[Vim meetup]:https://groups.google.com/forum/#!forum/vimsf
[Plug]:https://github.com/junegunn/vim-plug
[Keith Smiley]:https://smileykeith.com/
[vundle]:https://github.com/gmarik/Vundle.vim
[Plug.vim]:https://github.com/captbaritone/dotfiles/blob/master/vim/plug.vim
