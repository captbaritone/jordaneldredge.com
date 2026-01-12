---
title: The Challenges with Client Controlled Nullability
tags:
  - graphql
  - opinion
summary: >-
  Explaining some of the non-obvious problems with the Client Controlled
  Nullability GraphQL spec RFC 
notion_id: dabcf1d7-b292-42b7-b17c-a92b76c38698
---
My first project when I joined the [Relay](https://relay.dev/) team was a [`@required`](https://relay.dev/docs/guides/required-directive/) directive which allowed client fragments to declaratively specify how to handle the possibility of null values. It was fully implemented in the client (runtime + compiler).

At around the same time, engineers at Yelp and Netflix were exploring a similar declarative syntax which would be handled on the server. This later evolved into the [Client Controlled Nullability](https://github.com/graphql/graphql-wg/blob/main/rfcs/ClientControlledNullability.md) (CCN) GraphQL spec proposal.

Both solutions have significant down sides which are not immediately apparent to those who have not spent considerable time thinking about it. At the same time, the appeal of such a feature is immediately obvious. This creates tension. My goal with this post is to help explain why a client controlled nullability solution is more problematic than it seems at first blush. I’ll close with what we are currently exploring as an alternative solution.

## The client is flying blind

Because servers are [encouraged](https://graphql.org/learn/best-practices/#nullability) to default to typing fields as nullable in order to absorb errors, our schemas do not tell us if a field is expected to be null or if it will only be null in the case of errors. This means that if client code/queries are making destructive assertions about expecting fields to be non-null they are doing so based on an implicit expectation about how that server resolver is implemented (and will continue to be implemented!).

What we really want is some mechanism for the schema to encode which fields the client can expect to be non-null during normal operation. This will require unbundling error handling from nullability. More on this in the closing section.

## The problems with implementing client controlled nullability on the server

The GraphQL spec does not have a concept of smart clients. So, unlike `@required` the CCN proposal, being a GraphQL spec proposal, was forced to implement the behavior on the server. This introduces additional downsides.

The broad idea is that the client could specify that a field was required, and if it happened to be null at runtime the server would bubble that null value up to the first parent that was not required and typed as nullable. The below challenges are the reason that we opted to implement `@required` as a client feature.

### It forces fragment coupling

While a request for data on a given object in the graph may be expressed in the query text as a set of fragments spread into that selection, in the JSON response there is only one object. The fragments get merged. This means if one fragment requires a given field, but a sibling fragment does not require a field the server must treat the field as required, the more constrained of the two. The result is that any two fragments spread into the same position must agree upon the nullability of that field. This becomes viral because you must match the nullability of not just the fragments that are spread alongside you, but all the fragments spread alongside _them_ and so on.

This is particularly bad in large codebases where fragments are being used to provide encapsulation and composability.

### It’s destructive to data

Just like fragments must agree upon the nullability of a field in their definition, they must also share the same result object at runtime. This means a field being marked as non-nullable in one fragment has the potential to destroy that object in the response (due to null bubbling) for all sibling fragments. Add in nested non-nullable markings and you may end up destroying large portions of your response thanks to a few fragments even if the components/modules that defined those fragments are only conditionally rendered/invoked.

The destruction of data in the response is particularly poisonous for clients which maintain a normalized client cache since it forces them to nullify data in their store that is not necessarily null on the server, or should even be null in other queries.

## Looking ahead

Having recognized these problems, we eventually identified that one key blocker to having a fundamentally good solution here is GraphQL’s coupling of nullability and error handling. If we could unbundle those concepts we could have a chance at a schema that models the true nullability of fields as implemented on the server. In other words, the nullability of a resolver method on the server could be propagated all the way through the types seen by client code.

A breakdown of that idea can be found [here](https://github.com/graphql/graphql-wg/discussions/1394). This observation has lead to a number of [discussions](https://github.com/graphql/graphql-wg/discussions/1410) and [proposals](https://github.com/graphql/graphql-spec/pull/1065) about how we could get there. Additionally, the [sub-working group](https://github.com/graphql/nullability-wg/tree/main) originally formed to explore CCN has now directed its attention to this semantic nullability approach.
