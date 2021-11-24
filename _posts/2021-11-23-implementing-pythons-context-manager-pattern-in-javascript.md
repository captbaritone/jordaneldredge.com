---
layout: post
title: "Implementing Python's Context Manager Pattern in JavaScript"
summary: "Python Context Managers are a great way to model resources with setup and teardown. Here's how to implement that pattern in JavaScript."
---

Have you ever interacted with, or designed, an API which gives the user some object which requires setup and or teardown?

These APIs often put significant burden on the caller to ensure the resource gets cleaned up correctly even in the event of errors. An example of correct usage might look something like this:

```jsx
const greeter = GreeterManager.getGreeter({for: 'Jordan'});

let greeting;
try {
  greeting = greeter.greet();
} finally {
  greeter.destroy();
}
console.log(greeting);
```

This works, but it's quite brittle. There's not a good way for the library to communicate (much less *enforce*) that the greeter needs to get cleaned up, and that it must be cleaned up even if the code using it throws.

Python has a great syntax for this type of thing. It's called a [Context Manager](https://docs.python.org/3/reference/datamodel.html#context-managers) and it allows you to define a class which models a context with setup and teardown. Code can then consume a context using the `with` keyword, and Python will ensure the resource is only accessible within the created context, and that it gets cleaned upon exiting the context.

```python
with Greeter(name="Jordan") as greeter:
    greeter.greet()
```

Sadly, JavaScript does not have this same syntax. However, you can emulate this pattern using callbacks. Let's consider how we might rewrite the previous example to use this new pattern.

```javascript
// Library exposes an API like this, or you can define your own wrapper:
function withGreeter(options, cb) {
  const greeter = GreeterManager.getGreeter(options);

  try {
    return cb(greeter);
  } finally {
    greeter.destroy();
  }
}
```

The consumer can now write code like this:

```javascript
const options = { for: "Jordan"};

const greeting = withGreeter(options, greeter => {
  return greeter.greet();
});

console.log(greeting);
```

It's definitely not as clean as Python's syntax but it does achieve the goal of allowing the library to manage the tricky business of ensuring resources get cleaned up even in the face of errors.

## Async

This pattern also works well for async code, although the syntax does get a bit more cluttered:

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

Which the consumer can call like this:

```javascript
const options = { for: "Jordan"};

const greeting = await withGreeter(options, async greeter => {
  return greeter.greet();
});

console.log(greeting);
```

## Tree Traversal

I've also found this pattern useful for maintaining state in recursive traversals where you want to set some state before traversing children, and then reset that state before you continue with the next sibling node. Note that in this case we don't actually use a context value. The callback does not take any arguments.

```javascript
class Traversal {
  _path = [];

  _withPath(name, cb) {
    this._path.node.push(name);
    cb()
    this._path.node.pop();
  }

  traverse(node) {
    this._withPath(node.name, () => {
      for(const child of node.children) {
        this.traverse(child)
      }
    });
  }
}
```

## Downsides

While this pattern has a number of nice qualities, there are some downsides to consider.

Nested context managers can get very noisy. You can end up with very indented code if you need to access to multiple contexts at once. One mitigation to this is to create a helper context manager function which composes the two:

```javascript
function withXAndY(xArgs, yArgs, cb) {
  return withX(xArgs, (x) => {
    return withY(yArgs, (y) => {
      return cb(x, y)
    })
  })
}

// Which gets used like this:
withXAndY(xArgs, yArgs, (x, y) => {
  console.log("Got X and Y", x, y)
})
```

Early returns are not possible. With a simple `try`/`finally` block, you can perform an early return from the parent function. However with this pattern, you can only early return from the callback. On multiple occasions I've opted to foregoe this pattern because it interfered with my ability to use early returns.

## Conclusion

While not perfect, I've found this pattern quite useful in my JavaScript applications, especially when writing server-side Node code. It can be useful both when defining new APIs, or as a helper wrapper around APIs that you don't control.
