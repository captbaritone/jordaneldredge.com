---
title: "Functional JavaScript: Learn by refactoring"
summary: Learn the basics of functional programming by iteratively refactoring imperative code.
tags: ["javascript"]
---

In this blog post we'll learn some fundamentals of functional programing by
comparing it with imperative code. We'll write a function in the imperative
style, iteratively refactor it to a functional style, and compare the results.

## Imperative style

Imperative code starts with data, takes some number of steps that mutate that
data, and finally returns the mutated data.

Let's write a `titleCase()` function in the imperative style. Our function
should take a string and return a new string with the first character of each
word capitalized:

```javascript
function titleCase(headlineString) {
  var headlineWords = headlineString.split(" ");
  var titleWords = [];
  for (var i = 0; i < headlineWords.length; i++) {
    var headlineWord = headlineWords[i];
    var titleWord = headlineWord[0].toUpperCase() + headlineWord.substring(1);
    titleWords.push(titleWord);
  }
  var title = titleWords.join(" ");
  return title;
}
```

Not bad! Pretty easy to understand, right?

## Functional style

Functional code, by contrast, composes all business logic first, before the
data is even available. Only after all the logic has been defined does it
apply that logic to the data.

Logic first you say? Let's begin to refactor the imperative code we just wrote
by extracting pieces of logic into functions. We will define those functions
before the actual data is available. First, let's extract a `words()` function
that splits a string into words, and a `join()` function that joins an array of
words into a string:

```javascript
var words = (str) => str.split(" ");
var join = (arr) => arr.join(" ");

function titleCase(headlineString) {
  var headlineWords = words(headlineString);
  var titleWords = [];
  for (var i = 0; i < headlineWords.length; i++) {
    var headlineWord = headlineWords[i];
    var titleWord = headlineWord[0].toUpperCase() + headlineWord.substring(1);
    titleWords.push(titleWord);
  }
  var title = join(titleWords);
  return title;
}
```

Now let's convert our for loop into a map:

```javascript
var words = (str) => str.split(" ");
var join = (arr) => arr.join(" ");

function titleCase(headlineString) {
  var headlineWords = words(headlineString);
  var titleWords = headlineWords.map((headlineWord) => {
    return headlineWord[0].toUpperCase() + headlineWord.substring(1);
  });
  var title = join(titleWords);
  return title;
}
```

Map takes a function as an argument. Let's give that function a name and
extract it out to before our data is available:

```javascript
var words = (str) => str.split(" ");
var join = (arr) => arr.join(" ");
var capify = (word) => word[0].toUpperCase() + word.substring(1);

function titleCase(headlineString) {
  var headlineWords = words(headlineString);
  var titleWords = headlineWords.map(capify);
  var title = join(titleWords);
  return title;
}
```

Notice how the functions that we've extracted have more generic variable names.
Since these functions are decoupled from the data on which they operate, they
are more reusable and easier to reason about.

Now, even though we have most our our logic defined before we have our data,
our `titleCase` function is still imperatively operating on our data one step
at a time. Let's try nesting our functions and see how that removes some of the
"statefullness" we associate with imperative programing. This will make the
code a little hard to read for now. Don't worry, we'll come back and clean it
up later.

```javascript
var words = (str) => str.split(" ");
var join = (arr) => arr.join(" ");
var capify = (word) => word[0].toUpperCase() + word.substring(1);

function titleCase(headlineString) {
  return join(words(headlineString).map(capify));
}
```

This is already a lot less code than our original imperative attempt!

## Higher order functions

A higher order function does at least one of the following two things:

- Takes one or more functions as arguments
- Returns a function as its result

You'll notice that many of the helper functions we've extracted are basically
converting a method call to a function. Let's write a higher order function
that converts `Array.map()` to a function. It will take a function, `func`,
and return a new function. The new function will accept an array, and map
`func` over that array:

```javascript
var map = (func) => {
  return (arr) => {
    return arr.map(func);
  };
};
```

Taking advantage of the implicit return of ES6 arrow functions, we can rewrite
this as:

```javascript
var map = (func) => (arr) => arr.map(func);
```

Let's use our new `map()` function to clean up our `titleCase()` example:

```javascript
var map = (func) => (arr) => arr.map(func);
var words = (str) => str.split(" ");
var join = (arr) => arr.join(" ");
var capify = (word) => word[0].toUpperCase() + word.substring(1);
var capifyWords = map(capify);

function titleCase(headlineString) {
  return join(capifyWords(words(headlineString)));
}
```

We still have a lump of nested functions, but now at least they are nested more
simply.

## Flow()

Earlier, I promised that we would clean up the confusing set of nested
functions that remain in our `titleCase()` function. Introducing: `flow()`.

Flow is a higher order function which takes an array of functions and returns
a new function which takes a single value and successively applies the given
functions to that value.

For example, the following two statements are equivalent:

```javascript
flow([a, b, c]);

(value) => c(b(a(value)));
```

Flow [can be found in lodash](https://lodash.com/docs/4.16.6#flow), but for the
purposes of this exercise, we can write our own flow function by using
`Array.reduce()`:

```javascript
var flow = (funcs) => {
  return (initialValue) => {
    return funcs.reduce((value, func) => {
      return func(value);
    }, initialValue);
  };
};
```

Using implicit returns:

```javascript
var flow = (funcs) => (initialValue) =>
  funcs.reduce((value, func) => func(value), initialValue);
```

Let's try using flow in our `titleCase()` example:

```javascript
var map = (func) => (arr) => arr.map(func);
var words = (str) => str.split(" ");
var join = (arr) => arr.join(" ");
var capify = (word) => word[0].toUpperCase() + word.substring(1);
var capifyWords = map(capify);

var titleCase = flow([words, capifyWords, join]);
```

Much better! It has turned our nest of unreadable nested functions into
a readable "flow" of logic.

## Method()

If you look for common patterns in our existing code, you'll see that many of
our functions are just about converting method calls into functions. Let's
abstract that pattern! We'll define a higher-order `method()` function which
takes a method name and an argument. It will then return a function which takes
an object and calls the given method on that object with the given argument:

```javascript
var method = (func, arg) => {
  return (obj) => {
    return obj[func](arg);
  };
};
```

Now that we see how it works, we can clean it up with implicit return:

```javascript
var method = (func, arg) => (obj) => obj[func](arg);
```

Let's use our new `method()` function to simplify our `titleCase()` example:

```javascript
var method = (func, arg) => (obj) => obj[func](arg);
var map = (func) => (arr) => arr.map(func);
var words = method("split", " ");
var join = method("join", " ");
var capify = (word) => word[0].toUpperCase() + word.substring(1);
var capifyWords = map(capify);

var titleCase = flow([words, capifyWords, join]);
```

Notice how our `word()` and `join()` functions can now be defined without any
variable names, which makes them even more generic and declarative. With
functional programming we can focus on _what_ we're doing rather than _how_
we're doing it.

## capifyWords is just a method call!

Since `capifyWords` is really just calling `.map()`, which is a method, with
a specific argument, we can create it using our higher order `method()`, and
get rid of our `map()` function:

```javascript
var method = (func, arg) => (obj) => obj[func](arg);
var words = method("split", " ");
var join = method("join", " ");
var capify = (word) => word[0].toUpperCase() + word.substring(1);
var capifyWords = method("map", capify);

var titleCase = flow([words, capifyWords, join]);
```

We can read the that last line as:

> `titleCase` is a function which splits its value into words, `capify`s those
> words, and then joins them back together.

That's pretty readable, and it clearly communicates the program's intent rather
than its implementation details.

## Compare the two

### Before

```javascript
function titleCase(headlineString) {
  var headlineWords = headlineString.split(" ");
  var titleWords = [];
  for (var i = 0; i < headlineWords.length; i++) {
    var headlineWord = headlineWords[i];
    var titleWord = headlineWord[0].toUpperCase() + headlineWord.substring(1);
    titleWords.push(titleWord);
  }
  var title = titleWords.join(" ");
  return title;
}
```

### After

```javascript
var method = (func, arg) => (obj) => obj[func](arg);
var words = method("split", " ");
var join = method("join", " ");
var capify = (word) => word[0].toUpperCase() + word.substring(1);
var capifyWords = method("map", capify);

var titleCase = flow([words, capifyWords, join]);
```

Our new code is six lines instead of eleven. It avoids having
implementation-specific variable names, and reads in terms of the problem it's
solving rather than in terms of implementation details. It's very declarative!

## Prologue: Reusability

Another benefit of composing our business logic out of smaller, data-agnostic,
functions is that we can reuse those small functions. Let's see how difficult
it would be to create five other similar functions:

```javascript
var lowerCase = method("toLowerCase");
var upperCase = method("toUpperCase");
var studlyCase = flow([words, capifyWords, method("join", "")]);
var kebabCase = flow([lowerCase, words, method("join", "-")]);
var snakeCase = flow([lowerCase, words, method("join", "_")]);
```

Take a second to read though these and figure out how they work. See how we are
making novel use of our existing vocabulary of functions? Notice how we can
even use our first new function, `lowerCase()` as a component of later
functions like `kebabCase`!

Imagine doing this in an imperative style! We would have ended up with five
more eleven line functions instead of five one line functions!

I hope this post as piqued your interest in functional programing in
JavaScript! If you want to learn more, check out these links:

- [Hey Underscore, You're Doing It Wrong!](https://www.youtube.com/watch?v=m3svKOdZijA)
- [Ramda](http://ramdajs.com/)
- [lodash-fp](https://github.com/lodash/lodash/wiki/FP-Guide)
