---
title: 'One way "curl pipe sh" install scripts can be dangerous [proof of concept]'
summary: "One way in which 'curl pipe sh' install scripts can be dangerous."
tags: ["security"]
---

I have seen [several](http://pow.cx/) [sites](http://getcomposer.org/download/) recently that
offer a one-line installation that looks something like this:

```bash
curl -s example.com/install | sh
```

While I appreciated the elegance, it set off warning bells. Despite this
initial reaction I couldn't come up with a reason **why** it was any less
secure than other installation methods. In fact, I read a very logical argument
that this method was actually **more** secure from the highly respected [Paul
Irish](http://paulirish.com/):

::tweet{status=242665829659979776}

Today I realized at least once case that could validate those initial warning
bells. Take a look at this proof of concept:

```bash
curl -s https://jordaneldredge.com/projects/curl-proof/install/ | sh
```

I'll wait while you paste the script URL into your browser and make sure it's
not going to do anything naughty&#8230;

Now that you're **sure** the line is safe to run, paste it into your shell (I
dare ya!). Or, if you are a big wimp, have it output to the console instead of
`sh` like so:

```bash
curl -s https://jordaneldredge.com/projects/curl-proof/install/
```

As you can see Curl returned a different script than the one you saw in your
browser. This is achieved by checking for Curl's user-agent and, when found,
serving a different file.

Of course, the whole point is pretty much moot because the install script is
probably installing lots of other code that you haven't reviewed, so you
wouldn't be running this code unless you already trusted the author. However,
be aware that you may be lulling yourself into a false sense of security
because you **appear** to have the code right in front of you.
