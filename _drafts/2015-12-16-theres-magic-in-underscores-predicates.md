---
layout: post
title: "theres-magic-in-underscores-predicates"
date: "2015-12-16 20:15:33 -0800"
---

Many of [Underscore](http://underscorejs.org/)'s functions have extra magic
which allows you to notate common use cases in a very terse, readable style.

Any of functions that take a `predicate` or `iteratee` argument have magic
powers which make the most common type of predicate functions very easy to
write.

While the documenation simply indicates that the argument should be a function,
under the hood other data types are accepted and transformed into useful common
predicate functions.

## Object

If you pass an object:

    _.reject(users, {type: 'trial'});
    // ==
    _.reject(users, _.matcher({type: 'trial'}));
    // ==
    _.reject(users, function(user) { return user.type == 'trial'; });

## Key

If you pass something that is not an object or function :

    _.reject(users, 'disabled');
    // ==
    _.reject(users, _.property('disabled'));
    // ==
    _.reject(users, function(user) { return user.disabled; });

## Omit

If you omit the predicate all together:

    _.every([user.hasEmail(), user.hasUserName()]);
    // ==
    _.every([user.hasEmail(), user.hasUserName()], _.identity);
    // ==
    _.every([user.hasEmail(), user.hasUserName()], function(value) { return value; });



