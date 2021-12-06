---
title: Breaking into open source
summary: "A detailed guide for those who are struggling to find a way to contribute to open source."
---

For many years I put open source software on a pedestal. I wanted very badly to
contribute, but I never felt qualified to do so. I never encountered bugs in
the frameworks I used, so I couldn't work on unreported issues, and all the
open issues clearly required far more context and expertise than I had. All the
"easy" issues seemed to be fixed by a core developer far before I had a chance
to dig into them.

However, in the last year I've finally managed to find a way into the
community, and it isn't nearly as impenetrable as I had made it out to be. This
blog post contains the guidance I wish someone had given me four years ago.

## Pick a project

The key to making valuable contributions in context. As a beginner in open
source, you are going to be relatively slow at gaining context. To that end,
focus your energy on one project and try to select one that sets you up for
success. Here are some criteria to consider:

* How large is the codebase? The less code, the easier it is to have contextual
  understanding of all of its pieces.
* Do you use the project daily? A library that you depend upon at work or for
  a serious side project is a great starting place, since you will already have
  contextual awareness from the perspective of a user. Understanding the inner
  workings of the library will also pay dividends with your other work.

## Gain context

Once you've selected a project, spend at least a few weeks gaining context on
that project. You should be trying to gain technical context (how does the
software function?) as well as social context (how does the core team work?
What are their goals and norms?). Here are some ways you could go about that:

### Social context

* Does the project have any documentation about how to contribute? Read it!
* Follow ("watch") the project on GitHub. Read _all_ the incoming issues and
  pull request. I recommend getting a mobile app like [iOctocat] so that you
  can follow the discussion in near real time.
* Do they have a [Gitter] or [IRC] channel? If so, idle in that channel and
  listen to the conversations. I've found the [Gitter iOS app] very useful.
* If they have a mailing list, subscribe to it.
* Follow the main contributors on [Twitter].

### Technical context

* Read the source code. The smaller the project, the more of the code you will
  be able to internalize.
* Read the tests. Tests are often an under-loved part of the code base, and can
  be a great place to jump in and help. They also help clarify, in detail, the
  expected behavior of the software.
* Read the documentation. Does it accurately reflect the code you read? Is it
  consistent?

This step can serve multiple purposes. It will give you context but it may also
help you identify possible improvements. Read linearly but keep notes of things
to look into more deeply. Does a function look strangely constructed?  Make
a note and look into it later. Maybe there's a subtle reason it ended up that
way, or maybe you could be the one to clean it up!

## Run the project locally

Before you can start proposing changes to the projects, you need to be able to
build and run the project locally. Download the project and learn about its
build process:

* Build the project
* Run the tests and any linters
* Run any other continuous integration tests: linting, code coverage, etc.

## Finding your first issue

Your main goal for your first pull request should be to find something that is
as small and inconsequential as possible. The likelihood that you are going to
find and correctly fix a major flaw in a core code-path on your first try is
low. Instead, focus on doing something small and doing it well. Larger tasks
can come later. In the process of fixing a small bug or cleaning up a test or
documentation, you'll quickly gain the context needed to to take on and
discover larger tasks.

If you found something that was inconsistent or wrong while you were gaining
context, or setting up the project, correcting that could be a great first pull
request.

If you didn't see anything wrong, it's time to check out the issue tracker.
Some projects on GitHub use tags to notify potential contributors (you!) where
you might be able to help. Looks for tags like "needs help" or "beginner". If
your project doesn't do this, just read through a few pages of the issue
tracker and use your gut. With your newly gained context, pick the simplest
issue you can find. If it looks like something you will actually be able to
complete, comment on the issue to tell others that you are looking into it.
This will help reduce the likelihood that someone else will jump in and fix the
issue before you figure it out.

## Working on your first issue

Working on open source software is unique in that the information you have at
your disposal is quite limited. If you have a question about why something
works the way it does, you cannot wander over to the author's desk. Instead you
have other tools at your disposal:

* `git blame`. There is a _vast_ quantity of context in the git history. Open
  source projects usually have verbose commit messages which detail the
  intentions of the committer. If some code looks suspect, dig into the git
  history as deep as you need to in order to find the commit that first
  introduced it. You may need to go several commits deep before you find the
  actual commit that introduced the thing you are investigating.
* Pull Request history. If the commit message does not answer your question,
  you can use the commit SHA hash to track down the GitHub pull request that
  included that commit. This will give you additional information like feedback
  that the committer was responding to which lead to her final commit.
* The issue tracker. Get good at searching the project's issue tracker. Often
  things that appear "wrong" to a newbie but are actually intentional will have
  multiple closed issues which contain defenses of the current approach.

## Writing your patch

All this work, and you're finally ready to actually write your code! Take this
opportunity to slow down and write your most elegant code. The distributed
(across time and geography) nature of open source software development, means
that projects must lean more heavily on the code for communication. As Steve
McConnell says in his book _[Code Complete]_:

> Write programs for people first, computers second

This is never more true than in open source. Your code _must_ be able to speak
for itself. You won't get the opportunity to explain or defend it to the person
reviewing your change. They must be able to read the code and intuitively
understand your intentions.

### Conform to the project's code style

Some projects document their code style as part of their contribution
guidelines. Others have linting tasks you can run to check your code. Either
way, make sure that your code blends in with its surroundings. The entire
project should appear as if it were written by a single individual. Pay special
attention to:

* Naming conventions
* Spacing, layout
* Code organization

### Prioritize testing

If you are fixing a bug, be sure to include a regression test that ensures the
bug is not reintroduced. If you are adding functionality, write tests for as
many edge cases as you can think of. This will be a benefit to the project as
a whole, but it will also greatly increase the likely hood of your patch
getting merged.

The person reviewing your patch will probably not manually test your code.
Instead they will rely on existing tests to assure themselves you didn't break
anything. Similarly, they will not give you the benefit of the doubt that _you_
manually tested anything. Instead they will look for tests. Again, your code
must speak for itself. Don't _tell_ the reviewer that you tested something,
_show_ them, by including an automated test.

## Your commit/pull request message

As I said before, the nature of open source is such that you do not have direct
access to the author of the code. Similarly, future developers will not have
access to you! This means artifacts like commit messages and pull request
messages are doubly important. Give as much detail as possible in your commit
message. Put as much care into your commit message as you do into your code,
_if not more_. You should include:

* Your reasoning for why you chose the approach you did.
* Other approaches you considered, and why you rejected them.
* Results of any research you did.
* Links to related issues, pull requests or discussion.

__Bonus points:__ Construct a narrative of how the project ended up in its
current situation. When was the bug/inconsistency introduced? Do you have
a hypothesis as to what lead to the mistake?

## Opening your first pull request

Here's where all your social context will begin to pay its biggest dividends.

You only get one chance at a first impression. Expect the standards to be very
high. Expect to get critical feedback or even an outright rejection. Think
about opening your pull request as starting a conversation with a proposal.
Expect your choices to be challenged. Be ready to defend them, but be equally
ready to incorporate feedback. If you put significant effort into your pull
request, you will most likely at least receive some kind of critical feedback.
Even if your pull request is rejected this is not failure! In fact, critical
feedback is an opportunity to learn, and grow as a developer. Take it
seriously, internalize it, and try again!

## Success!

If you follow this advice, after an attempt or two, you will most likely get
a pull request merged into your favorite project! Awesome! I can say from
personal experience that there is something illogically thrilling about knowing
you were able to give back to a project you use every day.

The context you gained from this entire process will create a feedback loop.
Often in the course of working on one issue, you will notice something else
that you could do. If not, you are now deeply familiar with one part of the
code base. Keep your eyes open for related issues, and pretty soon _you'll_ be
the expert jumping in to fix things before the other newbies have a chance to
dig in and figure out what's causing the bug.

[iOctocat]: https://ioctocat.com/
[Gitter]: https://gitter.im/
[IRC]: https://en.wikipedia.org/wiki/Internet_Relay_Chat
[Gitter iOS App]: https://search.itunes.apple.com/WebObjects/MZContentLink.woa/wa/link?mt=8&path=apps%2fgitter
[Twitter]: https://twitter.com
[Code Complete]: http://cc2e.com/
