---
title: "Implementation-First GraphQL"
summary: "Defining a meaningful distinction within code-first GraphQL server libraries."
tags: ["graphql", "implementationFirst", "talk"]
# github_comments_issue_id: 18
---

When considering different libraries for implementing a GraphQL server, the options are traditionally divided into two categories: “schema-first” and “code-first”. While this binary is helpful, I believe it’s worth further clarifying that a subset of code-first libraries are also “Implementation-first”. In this post I’ll review what schema-first and code-first mean in the ecosystem, and then describe what I mean by implementation-first and the advantages inherent in that approach.

## Schema-first

With a schema-first approach you start by manually authoring your schema using GraphQL’s [Schema Definition Language](https://www.apollographql.com/docs/apollo-server/schema/schema/#the-schema-definition-language) (SDL). You then, secondarily, implement resolvers to match this schema. For example, you might write schema that looks like this:

```graphql
type Query {
  hello(name: String): String
}
```

And an implementation like this:

```tsx
class Query {
  hello(args) {
    return `hello, ${name || "World"}`;
  }
}
```

This approach comes with the responsibility of keeping the two in sync. In some typed languages, [tools exist](https://the-guild.dev/graphql/codegen) to assist in this task. For example, by generating interface types from your SDL that define the expected shapes of your resolvers.

## Code-first

With a code-first approach, your _code_ defines the schema. This means that your code implements your GraphQL server but is also capable of emitting an SDL file describing the schema it implements.

There are several methods of achieving a code-first GraphQL implementation. In the JavaScript/TypeScript ecosystem, most look something like this example using [Pothos](https://pothos-graphql.dev/):

```tsx
builder.queryType({
  fields: (t) => ({
    hello: t.string({
      args: {
        name: t.arg.string(),
      },
      resolve: (parent, { name }) => `hello, ${name || "World"}`,
    }),
  }),
});
```

Note how the API here looks very much like a [builder pattern](https://en.wikipedia.org/wiki/Builder_pattern) API for constructing SDL. While your schema definition now _lives_ in your code, you are still writing explicit schema definitions. It’s just that now they are written in an imperative code API instead of SDL.

## Implementation-first

But not all code-first solutions ask you to explicitly define your schema. There are code-first GraphQL solutions which instead extract your SDL schema from the _implementation_ itself. I believe this approach deserves a distinct label. I propose “implementation-first”.

Because GraphQL's type system is simple, most typed languages can natively express all the GraphQL shapes and primitive types. An implementation-first approach allows you to write your resolver functions as vanilla typed code and your GraphQL library is able to _infer_ the corresponding GraphQL schema from that code and its type annotations.

The example from above might look something like this, using the Python implementation-first library [Strawberry](https://strawberry.rocks/):

```python
@strawberry.type
class Query:

    @strawberry.field
    def hello(self, name: Optional[str]) -> str:
        return f"Hello {name || 'World'}!"
```

Note how the `@strawberry` decorators just tell the library _which_ classes/properties/methods to expose in the graph, but the GraphQL names and types of those things can be inferred from the implementation itself.

## What’s the difference?

The main difference between implementation-first and non-implementation-first approaches is **duplication**, and duplication’s ever-present companion: (de)**synchronization**. When a solution is _not_ implementation-first, you end up with duplication. You must declare the existence of your type/field/argument, and then you must, _additionally_, implement it! With that duplication comes repetition, but also the risk of mismatches!

While some typed languages can employ clever to types to catch these mismatches, the nuisance of keeping them in sync is still present.

Finally, implementation-first libraries just _feel_ different. There’s a sense of lightness and simplicity that comes from the fact that you are _just writing code_. No need to remember your libraries special syntax for describing how to type a non-nullable string argument. Just add an argument, and type it! The existence of the SDL schema starts to fade away into an implementation detail and you’re left with a simple sense of type safety. “I return a string here, and it comes out on my client as a string”.

Server code, with its databases, models, ORMs, etc. is already prone to repetitive definitions of data shapes. Implementation-first GraphQL can help avoid piling on yet another redeclaration and make your GraphQL server feel like a natural extension of your existing codebase.

## Why _not_ choose implementation-first?

While I personally believe that implementation-first is the platonic ideal of a GraphQL server implementation, it may not always be a viable choice.

For example, untyped languages have no way to specify what GraphQL type a given resolver is expected to return. Further, some _typed_ languages, like TypeScript, are expressive enough, but the types are not inspectable at runtime. This means that the only way build an implementation-first approach is by relying on a build step, and build steps can add friction to a development process.

## Conclusion

While the implementation-first approach to authoring a GraphQL server is not possible in all languages, when it _is_ possible, I believe it has many advantages. It reduces duplication, mitigates the risk of desynchronization, and removes mental overhead. I hope that when you are evaluating the GraphQL server library options available to you, you will take a moment to consider which ones are implementation-first, and the benefits that may imply.

---

_Update Oct. 2024_: Erik Wrede's 2024 GraphQL conf talk _Why You Should Use Implementation-First to Build Your GraphQL Schema_ does a great job of expanding upon the ideas in this post:

::youtube{token=ZilgUSmo_hA}
