---
title: "My Git alias for shipping a feature branch"
---

I use [feature branching][1] as part of my Git workflow. Once a feature is
implemented, I need to merge its branch into master and push it to the Git
server. That used to look like this:

```bash
git checkout master
git merge feature-415 # Having to remember the branch name
git push
```

I've since created an alias in my global `.gitconfig` which allows me to do
that with one command:

```
git ship
```

Here is line I added to my gitconfig under `[alias]`:

```bash
ship = "!gitmergeto() { export tmp_branch=`git branch | grep '* ' | tr -d '* '` && git checkout master && git merge $tmp_branch && git push; unset tmp_branch; }; gitmergeto"
```

Feel free to checkout my [gitconfig in my dotfiles repo][2]

[1]: https://www.atlassian.com/git/workflows#!workflow-feature-branch
[2]: https://github.com/captbaritone/dotfiles/blob/master/gitconfig
