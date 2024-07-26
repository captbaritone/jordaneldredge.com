---
title: Lint or Keep Quiet
tags:
  - eslint
  - opinion
summary: Code review feedback that could be encoded as a lint rule, should be
notion_id: 6650a0a0-28e4-408e-a976-a467e31557da
---
Here is a general rule I like to follow, and encourage others to follow, in code review in order to reduce [bike-shedding](https://thedecisionlab.com/biases/bikeshedding):

During code review, you may not give feedback that could be encoded as a lint rule. If you don’t care enough about the issue to enable/write the lint rule, it’s not fair to ask the author to care enough to update their code.

## Advantages of writing your feedback as a lint rule:

- Ensures that nobody — including you — will ever have to manually write this feedback again
- Highlights the issue in the author’s editor as soon as they write it, shortening the feedback loop
- Ensures that the feedback is applied uniformly, including on pull requests reviewed by others and preexisting code
- Prevents bike-shedding code conventions on unrelated pull requests. If the feedback is contentious, the right place for that discussion is the issue/PR about the lint rule
- May allow the issue to be automatically fixable
