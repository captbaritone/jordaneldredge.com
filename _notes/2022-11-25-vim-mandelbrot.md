---
title: A Vim macro that edits itself to draw a fractal
tags:
  - share
summary: A virtuosic self-executing Vim macro that renders a fractal in your editor
notion_id: d25050ed-8bff-4fd5-8a3d-ab3613918010
summary_image: >-
  /notion-mirror/84ebb48c-616a-4f51-ae9a-991a4e0a7e9b/6c1a46fe-c264-4934-9736-f61f0e122f59/Screenshot_2022-11-24_at_10.49.44_PM.png
---
The text editor [Vim](https://www.vim.org/) is famous for its terse editing keyboard commands. It also features a “macro” mode where you can record these commands and reply them. Whats more, you can actually copy text from your editor and ask Vim to interpret the characters as a macro.

[Linus Åkesson](http://www.linusakesson.net/index.php) (who also created [The Commodordion](https://jordaneldredge.com/notes/deec59a9-cbc0-4eb5-b534-0d32a7a2b482/)) took this to the extreme and created a text file that one can open in Vim, type the commands to copy and execute as a macro: `GY@"`, and it will begin to edit itself into and ascii representation of the [Mandelbrot set](https://en.wikipedia.org/wiki/Mandelbrot_set) fractal!

![](/notion-mirror/84ebb48c-616a-4f51-ae9a-991a4e0a7e9b/6c1a46fe-c264-4934-9736-f61f0e122f59/Screenshot_2022-11-24_at_10.49.44_PM.png)

The file: <http://www.linusakesson.net/programming/vim/mandelbrot>

From [his page](http://www.linusakesson.net/programming/vim/index.php):

> Note: If you have configured vim to use alternate keyboard mappings, these programs won't work. If this is the case, start vim with the standard mapping, i.e. "vim -u NONE mandelbrot".

See also, his interactive implementation of [Towers of Hanoi](https://en.wikipedia.org/wiki/Tower_of_Hanoi) using the same technique: <http://www.linusakesson.net/programming/vim/hanoi>

---

Update Aug. 18th, 2023: Only recently have I learned that this is the same guy who made the [Commodordian](https://jordaneldredge.com/notes/deec59a9-cbc0-4eb5-b534-0d32a7a2b482/).
