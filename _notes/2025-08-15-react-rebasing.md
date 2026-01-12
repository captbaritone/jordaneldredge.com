---
title: React’s useTransition and state update reordering
tags:
  - react
  - observation
  - javascript
summary: >-
  Clarifying how React will sometimes apply state updates out of order when
  using concurrent features, and a best practice which can help you avoid it.
notion_id: 250376e2-3751-8094-9429-f343b4b7746a
---
_TL;DR: React will always eventually stabilize on rendering the result of applying all state updates in chronological order. However, if a transition update is interrupted by a synchronous update, React will temporarily render the result of applying the sync update to the pre-transition value, omitting the intervening transition update._

---

React’s concurrent feature [useTransition](https://react.dev/reference/react/useTransition) allows state updates to be triggered but not flush to the DOM immediately. Instead, React will start rendering that state update in the background and wait until it can render that update with no suspense fallbacks before it shows the update to the user.

This exposes a window of time where the true state value, and the value displayed in the UI are temporarily out of sync. I’ve written about the new challenge this poses to product developers in [{transitions} = f(state)](https://jordaneldredge.com/blog/transitions-f-of-state/), but it also poses a tricky edge case to React itself:

### Consider the following series of events:

1. You have a counter who’s value is currently **2**
2. In a transition you `setState(c => c + 1)`
3. Before that transition completes and is shown to the user, you synchronously `setState(c => c * 2)`.
4. The transition from step 2 completes.

Starting in step three, React is in a bit of a bind. What value should it show the user? It can’t simply wait for the transition from step two to complete, since the user is expecting their new update to flush sync. It also can’t flush the whole transition and this new update as a unified sync update since that might trigger visible suspense fallbacks or slow renders which the developer is trying to avoid by adding the transition.

These constraints mean **React cannot always apply the state updates in strict chronological order.**

React’s solution to this conundrum (as of React 19) is to apply the state update twice. First, it applies the state update to the currently rendered value (**2**) and shows that (**4**) to the user synchronously. Then it follows up by applying the update to the pending transition value (**3**) and restarts the transition render with that updated value (**6**).

### The series of events from above will play out like so:

1. Show **2**
2. Start work to show **3** (`2 + 1`)
3. Interrupt the pending work, and show **4** (`2 * 2`)
4. Show **6** (`(2 + 1) * 2`)

So, while **4** is not actually an intermediate value in the actual/eventual ordering of events, React will show that value to the user temporarily.

### Implications

My goal with this post is to document this behavior since it can be confusing when first encountered and also helps us understand why state update functions and reducers must be pure. But in general **you can avoid hitting this edge case by not mixing update priorities used to update a given state value**. If you _always_ update a given state value synchronously or _always_ update it from within a transition, you can depend on simple chronological update ordering.
