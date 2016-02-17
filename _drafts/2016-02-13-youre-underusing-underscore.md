---
title: "You're under-using Underscore"
layout: post
---

For the last four months I've been reviewing every JavaScript pull request at
work and simultaneously contributing to [Underscore](http://underscorejs.org/).
Not surprisingly, I found my most common comments were regarding under-usage of
Underscore's functionality.

Of course I'm a programmer, so I want to automate everything, including my code
reviews. To that end, I've written an [ESLint
plugin](https://github.com/captbaritone/eslint-plugin-underscore) which
catches most of these common errors.

This blog post explains the most common mistakes I found. Each mistake links
to the corresponding linting rule, so you can automatically find all the
instances of this mistake in your code, and (hopefully) fix them.

## Iteratee shorthand syntax

Many Underscore collection functions accept an "iteratee" argument that gets
called on each element. To facilitate some common use cases, Underscore
passes the argument through [`_.iteratee`](http://underscorejs.org/#iteratee),
which esnentially overloads this argument. If, instead of a function, you pass
a string, and object or nothing, you get a special kind of function. This is
achieved by

This is a somewhat recent addition to Underscore, and it's not very well
documented. Not taking advantage of these shorthand syntaxes, and instead
writing out an anonymous function by hand, is the most common group of
mis-uses.

### Identity shorthand

Instead of passing a function that returns each value untransformed, you may
omit the function argument all-together:

    // BAD
    _.max(scores, function(n){
        return n;
    });

    // BETTER!
    _.max(scores);

Rule: [identity-shorthand](https://github.com/captbaritone/eslint-plugin-underscore/blob/master/docs/rules/identity-shorthand.md)

### Property acessor

Instead of passing a function which returns a single property for each item,
pass the key name:

    // BAD
    _.filter(users, function(user){
        return user.isAdmin;
    });

    // BETTER!
    _.filter(users, 'isAdmin');

Rule: [prop-shorthand](https://github.com/captbaritone/eslint-plugin-underscore/blob/master/docs/rules/prop-shorthand.md)

### Matcher shorthand

Instead of passing a function which tests the value of one or more property of
each item, pass a "matcher" object:


    // BAD
    _.filter(books, function(book){
        return book.type === 'hardcover' && book.avaliable === true;
    });

    // BETTER!
    _.filter(books, {type: 'hardcover', avaliable: true});

Rule: [matches-shorthand](https://github.com/captbaritone/eslint-plugin-underscore/blob/master/docs/rules/matches-shorthand.md)

## Use shorthand-specific functions

In a few cases Underscore has a special function for when you use one of these
shorthand styles. In these cases, the special name is generally more
descriptive:

### Pluck

When you are using the property accessor syntax with `_.map`, instead call it
`_.pluck()`:


    // BAD
    var ids = _.map(posts, 'id');

    // BETTER!
    var ids = _.pluck(posts, 'id');

Rule: [prefer-pluck](https://github.com/captbaritone/eslint-plugin-underscore/blob/master/docs/rules/prefer-pluck.md)

### Where

When you are using the matcher syntax with `_.filter`, instead call it
`_.where()`:


    // BAD
    var admins = _.filter(users, {type: 'admin'});

    // BETTER!
    var admins = _.where(users, {type: 'admin'});

Rule: [prefer-where](https://github.com/captbaritone/eslint-plugin-underscore/blob/master/docs/rules/prefer-where.md)

### Findwhere

When you are using the matcher syntax with `_.find`, instead call it
`_.findWhere()`:


    // BAD
    _.find(post, {id: 123});

    // BETTER!
    _.findWhere(post, {id: 123});

Rule: [prefer-findwhere](https://github.com/captbaritone/eslint-plugin-underscore/blob/master/docs/rules/prefer-findwhere.md)

### Compact

When you are using the "identity" syntax (passing nothing) with `_.filter`,
instead call it `_.compact()`:


    // BAD
    _.filter(suggestions);

    // BETTER!
    _.compact(suggestions);

Rule: [prefer-compact](https://github.com/captbaritone/eslint-plugin-underscore/blob/master/docs/rules/prefer-compact.md)

## Manual methods

In many cases, people simply don't know that an "Underscore already has
a function to do that!".

### Map

If you find yourself writing an `_.each` that just calls `.push()` for each
item in a collection, instead you should use `_.map`:

    // BAD
    var doubled = [];
    _.each(numbers, function(n) {
        doubled.push(n * 2);
    });

    // BETTER!
    var dubled = _.map(numbers, function(n) {
        return n * 2;
    });

Rule: [prefer-map](https://github.com/captbaritone/eslint-plugin-underscore/blob/master/docs/rules/prefer-map.md)

### Invoke

If you find yourself writing a `_.map` that calls a method on each item in
a collection, instead use `_.invoke`:

    // BAD
    var upperCase = _.map(names, function(name) {
        return name.toUpperCase()
    });

    // BETTER!
    var upperCase = _.invoike(names, 'toUpperCase');

Rule: [prefer-invoke](https://github.com/captbaritone/eslint-plugin-underscore/blob/master/docs/rules/prefer-invoke.md)

### Reject

If you find yourself writing a `_.filter` that uses an `!` in its iteratee,
instead use `_.reject`:

    // BAD
    var uncommented = _.filter(notes, function(note) {
        return !note.hasComments();
    });

    // BETTER!
    var uncommented = _.reject(notes, function(note) {
        return note.hasComments();
    });

Rule: [prefer-reject](https://github.com/captbaritone/eslint-plugin-underscore/blob/master/docs/rules/prefer-reject.md)

## Conclusion

Underscore is a powerful and expressive library. It's easy to overlook lesser
known functions or syntaxes. However, using the most idiomatic function makes
your code easier to understand.
