---
title: “KillsParentOnException” a lesson in API naming
tags:
  - observation
  - anecdote
  - graphql
summary: >-
  An internal Meta decorator name which taught me something important about API
  naming
notion_id: 119376e2-3751-803f-8fda-f6f8ad378507
---
One of my favorite API naming choices ever comes from Meta’s internal GraphQL server. It’s among my favorites because it taught me something really important about naming APIs.

The API is a decorator you can add to a [GraphQL](https://graphql.org/) field resolver. It causes the field to be exposed as non-nullable in the GraphQL schema, which in turn means that if an error is encountered when evaluating that resolver, the parent object will be made null.

Note that the addition of this decorator has two effects:

- It makes the field non-nullable, which makes your life easier
- It causes errors to be more destructive, which negatively impacts the reliability of your app

By choosing the name the API after the potentially non-obvious negative consequence of using the API rather than the highly desirable convince it enables, you force the users to reckon with the tradeoff they are making both in their editor and also in code review. Features which make the developers life easier at the expense of the user can be very tempting and therefore the API designer should take special pains to either not expose such APIs, or ensure the developer is held accountable for making that tradeoff when the do use it. A name like `KillsParentOnException` is one powerful way to achieve this.

I liked this API naming so much, I [copied it](https://grats.capt.dev/docs/resolvers/nullability/) in my TypeScript GraphQL tool [Grats](https://grats.capt.dev/).

API names which purposefully draw scrutiny or otherwise introduce strategic developer friction are somewhat common at Meta. One famous example is React’s [`DO_NOT_USE_OR_YOU_WILL_BE_FIRED`](https://github.com/facebook/react/blob/80bff5397bf854750dbe7c286f61654ea58938c5/src/umd/ReactUMDEntry.js#L21-L22).
