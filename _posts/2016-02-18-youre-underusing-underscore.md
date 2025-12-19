---
title: "You're underusing Underscore"
summary: "Ten common mistakes people make when using Underscore, and a linting tool to detect them."
tags: ["opinion", "javascript", "eslint"]
---

_Update 2023-09-17: I've come to regret this blog post a bit. Since ES6 the built in mechanism for these patterns are good enough and generally preferable to Underscore or Lodash._

_I think I was overly interested in policing easy-to-spot surface details during code review when I wrote this post and the corresponding lint rule. I highly recommend [Beyond Pep8](/notes/surface-nits/) which addresses this common dysfunction._

_That said, I learned a lot from writing these lint rules, so it wasn't a total loss._

---

For the last four months I've been reviewing every JavaScript pull request at
[work](http://hearsaysocial.com/) and simultaneously contributing to
[Underscore](http://underscorejs.org/). Not surprisingly, I found my most
common review comments were pointing out ways in which my colleagues could be
making better use of Underscore's functionality.

Most of these comments were pointing out ways in which Underscore's API could
help the developer write the same code in a simpler, more readable, less
error-prone way.

As a programmer I love automating things, including my code reviews. To that
end, I've written an [ESLint](http://eslint.org/) plugin,
[eslint-plugin-underscore](https://github.com/captbaritone/eslint-plugin-underscore),
which aims to help you spot most of these common errors.

This blog post explains the most common mistakes I found. Each mistake links
to the corresponding linting rule, so you can automatically find all the
instances of the mistake in your code and, hopefully, fix them.

## Iteratee shorthand syntax

Many Underscore collection functions accept an "iteratee" argument that gets
called on each item. To facilitate some common use cases, Underscore passes the
argument through [`_.iteratee`](http://underscorejs.org/#iteratee), which
essentially means this argument is
[overloaded](https://en.wikipedia.org/wiki/Function_overloading). If instead of
a function, you pass a string, object, or nothing; you get a special kind of
function. Here are the three types of shorthand:

### Identity shorthand

Instead of passing a function that returns each value untransformed, you may
omit the function argument all-together:

```javascript
// BAD
_.max(scores, function (n) {
  return n;
});

// BETTER!
_.max(scores);
```

Rule: [identity-shorthand](https://github.com/captbaritone/eslint-plugin-underscore/blob/master/docs/rules/identity-shorthand.md)

### Property shorthand

Instead of passing a function which returns a single property for each item,
pass the key name:

```javascript
// BAD
_.filter(users, function (user) {
  return user.isAdmin;
});

// BETTER!
_.filter(users, "isAdmin");
```

Rule: [prop-shorthand](https://github.com/captbaritone/eslint-plugin-underscore/blob/master/docs/rules/prop-shorthand.md)

### Matcher shorthand

Instead of passing a function which tests the value of one or more property of
each item, pass a "matcher" object:

```javascript
// BAD
_.filter(books, function (book) {
  return book.type === "hardcover" && book.available === true;
});

// BETTER!
_.filter(books, { type: "hardcover", available: true });
```

Rule: [matches-shorthand](https://github.com/captbaritone/eslint-plugin-underscore/blob/master/docs/rules/matches-shorthand.md)

## Use shorthand-specific functions

In a few cases Underscore has a special function for when you use one of these
shorthand styles. In these cases, the special name is generally more
descriptive:

### Pluck

When you are using the property accessor syntax with `_.map`, instead call it
`_.pluck()`:

```javascript
// BAD
var ids = _.map(posts, "id");

// BETTER!
var ids = _.pluck(posts, "id");
```

Rule: [prefer-pluck](https://github.com/captbaritone/eslint-plugin-underscore/blob/master/docs/rules/prefer-pluck.md)

### Where

When you are using the matcher syntax with `_.filter`, instead call it
`_.where()`:

```javascript
// BAD
var admins = _.filter(users, { type: "admin" });

// BETTER!
var admins = _.where(users, { type: "admin" });
```

Rule: [prefer-where](https://github.com/captbaritone/eslint-plugin-underscore/blob/master/docs/rules/prefer-where.md)

### Findwhere

When you are using the matcher syntax with `_.find`, instead call it
`_.findWhere()`:

```javascript
// BAD
_.find(post, { id: 123 });

// BETTER!
_.findWhere(post, { id: 123 });
```

Rule: [prefer-findwhere](https://github.com/captbaritone/eslint-plugin-underscore/blob/master/docs/rules/prefer-findwhere.md)

### Compact

When you are using the "identity" syntax (passing nothing) with `_.filter`,
instead call it `_.compact()`:

```javascript
// BAD
_.filter(suggestions);

// BETTER!
_.compact(suggestions);
```

Rule: [prefer-compact](https://github.com/captbaritone/eslint-plugin-underscore/blob/master/docs/rules/prefer-compact.md)

## Manual methods

In many cases, people simply don't know that "Underscore already has a function
to do that!". Here are a few examples of functions people frequently forget
about, and when to use them:

### Map

If you find yourself writing an `_.each` that just calls `.push()` for each
item in a collection, instead you should use `_.map`:

```javascript
// BAD
var doubled = [];
_.each(numbers, function (n) {
  doubled.push(n * 2);
});

// BETTER!
var doubled = _.map(numbers, function (n) {
  return n * 2;
});
```

Rule: [prefer-map](https://github.com/captbaritone/eslint-plugin-underscore/blob/master/docs/rules/prefer-map.md)

### Invoke

If you find yourself writing a `_.map` that calls a method on each item in
a collection, instead use `_.invoke`:

```javascript
// BAD
var upperCase = _.map(names, function (name) {
  return name.toUpperCase();
});

// BETTER!
var upperCase = _.invoke(names, "toUpperCase");
```

Rule: [prefer-invoke](https://github.com/captbaritone/eslint-plugin-underscore/blob/master/docs/rules/prefer-invoke.md)

### Reject

If you find yourself writing a `_.filter` that uses an `!` in its iteratee,
instead use `_.reject`:

```javascript
// BAD
var uncommented = _.filter(notes, function (note) {
  return !note.hasComments();
});

// BETTER!
var uncommented = _.reject(notes, function (note) {
  return note.hasComments();
});
```

Rule: [prefer-reject](https://github.com/captbaritone/eslint-plugin-underscore/blob/master/docs/rules/prefer-reject.md)

## Conclusion

When using any library, the more idiomatically you can use it the better. When
you can take advantage of higher-order concepts, it simplifies your code, and
makes it simpler to reason about.

While I hope this article has expanded your knowledge of Underscore's API,
nobody can remember everything! For those times when you forget, I hope you
can incorporate
[eslint-plugin-underscore](https://github.com/captbaritone/eslint-plugin-underscore)
into your work-flow. That way I can perpetually (and automatically!) nag you
about your underuse of Underscore.

### Thanks

Many thanks to the engineers at [Wix](http://www.wix.com/) for
[eslint-plugin-lodash](https://github.com/wix/eslint-plugin-lodash). My plugin
began as a fork of theirs, and it gave me a great head-start.
