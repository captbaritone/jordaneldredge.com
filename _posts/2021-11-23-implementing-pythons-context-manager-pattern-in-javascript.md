---
layout: post
title: "Implementing Python's Context Manager Pattern in JavaScript"
summary: "Python Context Managers are a great way to model resources with setup and teardown. Here's how to implement that pattern in JavaScript."
---

Have you ever interacted with, or designed, an API which gives the user some object which requires setup and or teardown? What if some portion of that setup/teardown is async?

These APIs often put significant burden on the caller to ensure the resource gets cleaned up correctly even in the event of errors. An example of correct usage might look something like this:

```jsx
const greeter = await GreeterManager.getGreeter({for: 'Jordan'});

let greeting;
try {
  greeting = await greeter.greet();
} finally {
  await greeter.destroy();
}
console.log(greeting);
```

This works, but it's quite brittle. There's not a good way for the library to communicate (much less *enforce*) that the greeter needs to get cleaned up, and that it must be cleaned up even if the code using it throws.

Python has a great syntax for this type of thing. It's called a [Context Manager](https://docs.python.org/3/reference/datamodel.html#context-managers) and it allows you to define a class which models a context with setup and teardown. Code can then consume a context using the `with` keyword, and Python will ensure the resource is only accessible within the created context, and that it gets cleaned upon leaving the context.

```python
with Greeter(name="Jordan") as greeter:
    greeter.greet()
```

Sadly, JavaScript does not have this same syntax. However, you can emulate this pattern using callbacks. Let's consider how we might rewrite the previous example to use this new pattern.

```javascript
// Library exposes an API like this, or you can define your own wrapper:
async function withGreeter(options, cb) {
  const greeter = await GreeterManager.getGreeter(options);

  try {
    return await cb(greeter);
  } finally {
    await greeter.destroy();
  }
}
```

The consumer can now write code like this:

```javascript
const options = { for: "Jordan"};

const greeting = await withGreeter(options, async greeter => {
  return greeter.greet();
});

console.log(greeting);
```

It's definitely not as clean as Python's syntax (the `async`/`await`s really do clutter things up) but it does achieve the goal of allowing the library to manage the tricky business of ensuring resources get cleaned up even in the face of errors.

I've found this pattern quite useful in my JavaScript applications, especially when writing server-side Node code. It can be useful both when defining new APIs, or as a helper wrapper around APIs that you don't control.
