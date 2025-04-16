---
title: "{transitions} = f(state)"
slug: "transitions-f-of-state"
summary: "Thinking about the React component tree as modeling a state machine can help clarify the implications of asynchronous updates and React’s concurrent features."
summary_image: /uploads/2025/transitions-f-of-state.png
tags:
  - javascript
  - react
  - observations
---

_This post has been discussed on [Hacker News](https://news.ycombinator.com/item?id=43615624) and [translated into Korean](https://ricki-lee.medium.com/%EB%B2%88%EC%97%AD-%EC%83%81%ED%83%9C-%EC%A0%84%EC%9D%B4-f-%EC%83%81%ED%83%9C-08b98e781779)._

_TL;DR: Thinking about the React component tree as modeling a state machine can help clarify the implications of asynchronous updates and React’s concurrent features._

---

A [state machine](https://developer.mozilla.org/en-US/docs/Glossary/State_machine) is a formal way of describing a stateful system which changes over time. It generally consists of explicitly defining the states that the system can be in, as well as defining a [state transition table](https://en.wikipedia.org/wiki/State-transition_table) which enumerates the set of valid transitions (updates which put the machine in a new state) for each discrete state.

A React application can be thought of as modeling a [state machine](https://developer.mozilla.org/en-US/docs/Glossary/State_machine). Each render takes a state and produces the UI for that state. This is the famous `UI = f(state)` mental model of React. But, for complex applications, formally enumerating a transition table is often not feasible. When the number of possible states is not finite, a table will not suffice and we must instead define a _mapping_: a conceptual function which takes in a state and returns the set of valid transitions for that state.

If you look closely, each React application actually already defines a version of this function. **Developers implicitly define the set of transitions that are valid for a user to take in each state by the event handlers that their components bind into the DOM when rendering that state.**

We can say that the React component tree not only defines _UI_ as a function of state, but also defines _the set of valid transitions_ for the state with that same function. More succinctly:

```
{transitions} = f(state)
```

## For example

A Todo app might support a state update `complete(todoId)` which marks a todo as completed. It would be an error for a user to “complete” a todo which has previously been deleted. At best it would result in showing the user an error popup, and at worst would result in a “TypeError: Cannot set properties of undefined” JavaScript error. In state machine terms, `complete(x)` is not a valid transition for a state that does not include a todo with the id `x`.

The React programming model gives us an intuitive way to guard against this type of error. So intuitive, that we often don’t even think about _needing_ to guard against these kinds of errors. If the only way to trigger the `complete(todoId)` update is from the “Complete” button in the `<Todo />` component, simply removing a todo from our state when it’s deleted automatically ensures we never render a “Complete” button for a deleted todo, and that ensures the user cannot trigger this invalid update.

Note that the above depends upon JavaScript being single-threaded with a blocking UI. When we update the state of the application synchronously, we can trust that _before the browser yields to more user input, it will first flush these state changes to the UI._

## Asynchronous updates

With asynchronous updates, we no-longer get this guard for free. Consider the case where deleting a todo requires making a network request to an API. If a user deletes a todo, and we wait to update our application state until _after_ that network request completes, there will be a period of time when the deleted todo’s “Complete” button is still rendered on the page and clickable, even though it’s no-longer a valid update for the user to perform.

Preventing the user from performing an invalid update no longer happens automatically. Instead it requires some additional work, but we have two good options:

1. Optimistically delete the todo from our local state ensuring the todo is not rendered at all while the network request is in flight.
2. Mark the todo as “pending” in our state while the network request is in flight and disable the “Complete” button while a todo is pending.

If we flush this optimistic or pending state update synchronously, `{transitions} = f(state)` ensures we’ve prevented the user from being able to trigger the invalid update.

## Concurrent updates

Some of React’s concurrent mode features, for example [startTransition](https://react.dev/reference/react/startTransition), allow you to perform state updates which intentionally _do not_ flush to the DOM before yielding to the user. Similar to asynchronous updates this leaves a window of time where the UI may allow the user to trigger an update which we know to be invalid.

This means that if we perform a state update which will change which updates are valid, we will need to pair it with an optimistic or pending update which flushes synchronously.

For this reason, many of React’s concurrent features include built-in support for either an `isPending` flag ([useTransition](https://react.dev/reference/react/useTransition), [useActionState](https://react.dev/reference/react/useActionState) and [useFormStatus](https://react.dev/reference/react-dom/hooks/useFormStatus) or an optimistic update that is paired with the low priority update ([useOptimistic](https://react.dev/reference/react/useOptimistic)).

## Conclusion

`{transitions} = f(state)` is a useful mental model for thinking about how your application guards against letting users trigger invalid updates. It helps clarify which updates are safe to apply asynchronously or concurrently, and which updates need to be paired with a synchronous update in order to guard against letting the user trigger invalid actions. It also helps clarify the role that your React components play in enforcing these guards, such as which components will need to render differently when a piece of state is in a pending state.

---

_Thanks to Evan Yeung for the conversations which lead to this observation and to Joe Savona, Jordan Brown, Jack Pope and Rick Hanlon for reading early drafts of this post._
