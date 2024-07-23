---
title: Avoid name-spacing GraphQL mutation fields
tags:
  - graphql
  - opinion
summary: Explaining why nesting your mutations inside GraphQL types is problematic
---
A pattern I’ve seen recommended in GraphQL schema design is to define special mutation types in order to group your mutation fields into namespaces. Something like this:

```graphql
type Mutation {
  users: UserMutation
  groups: GroupMutation
}

type UserMutation {
  createUser(name: String!): User
  deleteUser(id: ID!): Bool
}

type GroupMutation {
  createGroup(name: String!): Group
}
```

Unfortunately this is a pattern is not compatible with the GraphQL specification:

> \[…] the resolution of fields other than top-level mutation fields must always be side effect-free and idempotent

— [Normal and Serial Execution](https://spec.graphql.org/draft/#sel-GANRNDABiEBuHxyV)

## Unstable ordering

The GraphQL specification enforces serial execution of all direct fields on `Mutation` in order to ensure the order of side effects is stable and predictable. For all other types, fields within a selection may be [executed in parallel](https://spec.graphql.org/draft/#CompleteValue\(\)) leading to unpredictable ordering of side effects within a single mutation. This could lead to very confusing bugs.

## Limiting side effects to mutations

If you define a new type as a mutation namespace, there’s no static grantee that that type won’t be reachable from a query. You must have some policy (explicit or implicit) that nobody ever constructs an edge from a non-mutation type to this mutation type. If you limit your side effect fields to just root files on `Mutation`, then you can be sure that only a mutation operation will trigger side effects.
