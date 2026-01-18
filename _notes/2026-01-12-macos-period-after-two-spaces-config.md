---
title: Prevent MacOS from inserting a period after two spaces
tags: []
summary: >-
  How to disable the feature of MacOS that auto inserts a period after typing
  two spaces
notion_id: 2d1376e2-3751-8018-8619-d124f41a0797
---
When indenting code in my editor, I wold frequently see a period automatically inserted. For ages I thought this was some plugin of VSCode but when I finally decided to figure out how to disable it, I learned it’s a feature of MacOS. Here’s how to disable it:

```javascript
defaults write NSGlobalDomain NSAutomaticPeriodSubstitutionEnabled -bool false
```

Via <https://github.com/AdamMaras/vscode-overtype/issues/9#issuecomment-1032198855>
