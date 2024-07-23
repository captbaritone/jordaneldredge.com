---
title: Laravel’s obsessive comment style
tags:
  - anecdote
summary: >-
  An insane detail that points to the obsessive approach Taylor Otwell took with
  Laravel
summary_image: >-
  https://prod-files-secure.s3.us-west-2.amazonaws.com/84ebb48c-616a-4f51-ae9a-991a4e0a7e9b/c2bcf002-2b8b-47b2-8f0c-6d726fa216c1/undefined_-_Imgur.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45HZZMZUHI%2F20240722%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20240722T054531Z&X-Amz-Expires=3600&X-Amz-Signature=c6ac313ceead457c4af8e78ef6aadc3b4ba6a46838f6a915d38f45f0659c3cad&X-Amz-SignedHeaders=host&x-id=GetObject
---
In the early-ish days of the PHP framework [Laravel](https://laravel.com/), the author [Taylor Otwell](https://github.com/taylorotwell) took an obsessive approach to code consistency. Not only did every method include a docblock with a description, but each description was _exactly_ three lines long, and each line was _exactly_ three characters shorter than the previous line.

### Example

![](/public/notion-mirror/84ebb48c-616a-4f51-ae9a-991a4e0a7e9b/c2bcf002-2b8b-47b2-8f0c-6d726fa216c1/undefined_-_Imgur.png)

[_Image source_](https://imgur.com/UnIUZmZ)

Not only was he obsessively documenting his code, but he was so dedicated to the aesthetics of his docblocks, that he was — I have to assume — making word selections in order to achieve it.

In a Reddit thread, he [replied](https://www.reddit.com/r/laravel/comments/20ovey/comment/cg5w2x6/?utm_source=reddit\&utm_medium=web2x\&context=3):

> It is indeed intentional. I'm not sure if it's awesome or neurotic either... :)
>
> Also, it is not just config files - it is the entire framework.
>
> Config files are the first impression of the framework once you have it installed. So, I want it to be pleasant to the eye. The symmetrical comments help with that. I don't want your first impression of the code to "appear" disorganized or something. I dunno. It's kind of crazy. I do it with all of the Laravel core code. If it doesn't look pleasing to the eye, I keep working on it until it is.

I’ve never seen anything like it before or sense.

As the project has grown, and probably started to include more contributors, it seems this pattern has relaxed, however the code is still meticulously organized.

### Sources

- <https://www.reddit.com/r/laravel/comments/3bifw5/every_doc_block_comment_is_3_characters_less_than/>
- <https://laravel-news.com/neurotic-laravel>
- <https://stackoverflow.com/questions/64772136/all-laravel-doc-blocks-are-three-lines-and-each-line-is-shorter-than-the-previou>
- <https://imgur.com/UnIUZmZ>
