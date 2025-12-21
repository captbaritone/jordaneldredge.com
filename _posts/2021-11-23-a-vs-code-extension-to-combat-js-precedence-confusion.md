---
title: "A VSCode Extension to Clarify Operator Precedence in JS"
summary: "I wrote a VS Code extension which shows subscript parentheses in your JS code to help clarify operator precedence."
summary_image: /uploads/2024/precedence.png
tags: ["project", "javascript", "vscode"]
---

_TL;DR: I wrote a [VS Code extension](https://marketplace.visualstudio.com/items?itemName=JordanEldredge.implicit-parentheses) which shows subscript parentheses in your JS code to help clarify operator precedence._

---

![Screenshot of the extension in action](/uploads/2024/precedence.png)

Last year I worked on [an ESLint rule](https://github.com/eslint/eslint/issues/13752) which tries to detect useless null checks. It did this by understanding some of the semantics of JavaScript syntax and warning when a null check is provably useless. When I ran the rule on a large codebase, it was very interesting to see what it caught. Surprisingly, many of the errors were real bugs that made it through code review.

In fact, there was one dominant theme: **misjudging operator precedence**. Here are a few examples of the types of errors it uncovered:

```javascript
// The + will be evaluated first.
// The resulting number can never be null
a + b ?? c;

// The ! will be evaluated first.
// The resulting boolean can never be null
!foo == null;

// Author assumed they were ||ing the two ternaries.
// They were not
conditionA ? a : null || conditionB ? b : null;
```

Especially in complex nested expressions these are easy mistakes to make. I started thinking about how I could address this issue more fundamentally. How could we make it easier to understand operator precedence?

I realized that when I have a question about operator precedence, I add parentheses where I _think_ they are implicitly present and then save my file. If I was right, [Prettier](https://prettier.io/) will remove them since they are redundant. If I was wrong, the parentheses stay. Either way, my code now behaves as I expect. But this process requires that I first think to double check. _What about the cases where I don't think to double check?_

## What if Implicit Parentheses Were Always Visible?

This line of thinking led me to the idea of a VS Code editor plugin which adds the implicit parentheses as decorations. If you watch this demo carefully, you can see that the plugin inserts small subscript parentheses around expressions clarifying precedence in cases where it's non-obvious.

The plugin does not modify the actual file, but simply inserts them as decorations visible only in the editor.

![A video screen capture showing VSCode inserting subscript parentheses around subexpressions in a complex expression in order to clarify operator precedence](/images/implicit-parentheses.gif)

Taking the examples above, they would be rendered like so:

```javascript
₍a + b₎ ?? c

₍!foo₎ == null

conditionA ? a : ₍₍null || conditionB₎ ? b : null₎
```

My hope is that this minimally invasive plugin can be useful to help avoid bugs caused by precedence confusion.

If you'd like to try it for yourself, check out **[Implicit Parentheses VSCode Extension](https://marketplace.visualstudio.com/items?itemName=JordanEldredge.implicit-parentheses) in the VS Code Marketplace**. The code for the plugin can be found [on GitHub](https://github.com/captbaritone/vscode-implicit-parentheses).
