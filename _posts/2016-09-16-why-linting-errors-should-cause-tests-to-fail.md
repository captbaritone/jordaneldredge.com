---
title: Why linting errors should cause tests to fail
layout: post
summary: Making the case against allowing linting errors in master.
---

_TLDR: If you strictly enforce linting rules, code reviews will be easier,
whole classes of bugs will disappear, and your developers will be inspired
to persue a greater degree of overall code quality._

---

I recently had a discussion with a colleague who argued that:

> Linting errors should not block a pull request from being merged.

I found myself disagreeing vehemently but unable to clearly state why. I've
written this post to help clarify my thoughts on the position.

## Some specifics

At [Hearsay Social](https://hearsaysocial.com/company/careers/engineering/) we
use [GitHub pull requests](https://help.github.com/articles/about-pull-requests/)
to manage changes to our code base. When a pull request is opened, [Travis
CI](https://travis-ci.org) picks it up, and runs our test suite. The two
requirements for merging a pull request into master, our production branch,
are:

* Approval from one other engineer
* Passing Travis tests

We recently configured our Travis tests to include running
[ESLint](http://eslint.org/). This means that JavaScript code that does not
conform to our linting standards cannot be merged into master. While my
colleague and I were both in agreement that linting is valuable, it was this
change that sparked debate.

## The simplified argument

My colleague's main point against including ESLint in Travis was that, in
a case where the site is down and we need to ship a hotfix, a misaligned curly
brace should not prevent merging the fix.

I must admit that I agree with his premise. It is far more important to bring
the site back up than for master to be free of linting errors. However,
I disagree that removing linting from our test suite is the best way to address
this concern.

I would argue that in the case of a site-down hotfix, you should have
a mechanism for bypassing tests altogether. There are many types of test
failures which should not be a blocker to shipping a hotfix. For example:

* Transient test failures caused by not properly mocking out the system clock
* Test failures introduced by your package repository being down.

I don't think anyone would suggest disabling tests altogether just to avoid
the possibility that one of these errors might block a hotfix.

If you don't have a system that can work around these types of failures, you
probably should. And if you _do_ have a system that can work around these
failures, it would be appropriate to use it to work around a hypothetical
misaligned curly brace.

## Why I care so much

By putting test failures on a pedestal above linting errors, I think we
underestimate the value of linting, and the harm that linting errors can cause.

Without enforcing your linting rules as part of your tests, you are guaranteed
to end up with linting errors merged into your master branch. Let's explore
three phases of a developer's workflow and see how they are negatively affected
by this choice.

### During code review

If a reviewer can operate under the assumption that the code they are reviewing
conforms to the project's linting rules, they don't need to manually lint the
code they are reading.

For example, if the reviewer sees that the author has removed a variable
definition, they can trust that the author did not overlook a later usage of
that variable. Without the linter's assurance, the reviewer would need to
manually check the entire file for other usages of that variable.

This applies to less overt errors as well. Did the author use the right number
of spaces when they indented? If linting is automatic, the reviewer has to do
less of it manually.

### During deploy

In addition to testing for issues of style, linters check for code validity. We
should not deploy code that is invalid.

For example, calling `console.log` will cause your application to crash in
Internet Explorer 9. Despite this dire consequence, developers frequently
open pull requests that include `console.log` statements leftover from
debugging.  A linting rule like [`no-console`](http://eslint.org/docs/rules/no-console),
if enforced as part of your test suite, can give you complete confidence that
you will never encounter that particular bug in production.

### On a new feature branch

When a developer starts a new feature branch, they start their branch off of
master. This means they are starting their work on a branch that could already
have linting errors. When it's time for the developer to ship her changes, she
is now forced to choose between cleaning up somebody else's mess, or leaving
these linting errors in master.

The presence of these errors also reinforces a mentality that such errors are
acceptable in master. While a single linting failure may seem quite harmless,
the precedent it sets can be terribly damaging.

Addison Wesley Longman puts it best in his description of the [broken window
theory](https://en.wikipedia.org/wiki/Broken_windows_theory) in his book [The
Pragmatic Programmer](https://pragprog.com/book/tpp/the-pragmatic-programmer):

> One broken window, left unrepaired for any substantial length of time,
> instills in the inhabitants of the building a sense of abandonment—a sense
> that the powers that be don't care about the building.
>
> So another window gets broken. People start littering. Graffiti appears.
> Serious structural damage begins. In a relatively short space of time, the
> building becomes damaged beyond the owner's desire to fix it, and the sense
> of abandonment becomes reality.

## Conclusion

Like unit tests, the assertions your linting tool provides can be tremendously
valuable, but only if they are enforced in absolute terms and at the right
boundary. I believe that to derive the most value from a linting tool, an
organization must be steadfastly committed to not permitting linting errors to
be merged into production code.

---

_Many thanks to Garland Trice for this stimulating conversation. I've had
enormous fun thinking in depth about this question._
