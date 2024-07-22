---
title: Compiling to AST
tags:
  - opinion
summary: >-
  A pattern for tracking location information when compiling to a high level
  language
---
While working on [Relay Resolvers](https://relay.dev/docs/guides/relay-resolvers/), I stumbled upon a nice technique for compiling to a target language. When compiling from one language to another, rather than generating text representation of target language, generate an AST of the target language and populate the AST ‘s location information/spans from the source text.



With this approach you get a number of benefits. For one, generating AST node gives you assurance that you are generating syntactically correct target language code. But if you can then pass that AST directly to modules that deal in the target language, you basically get free source mapping.


For example, if the generated code results in a type error in the target language, that type error will be reported with diagnostics pointing to the relevant parts of the user’s own code in the source language! If your compiler has an editor integration, you can even get features like “click to definition” for free.

For example, Relay Resolvers parse JavaScript docblocks to generate GraphQL schema which is then stitched together with your server’s schema. By generating GraphQL schema AST with location information that points back to the relevant fields of the docblock, type errors appear in the correct place, and even things like click-to-definition “just work”.


Here’s a demo video:


[https://twitter.com/captbaritone/status/1633293186876715008](https://twitter.com/captbaritone/status/1633293186876715008)


Our in-memory schema is populate from AST nodes, and definition locations are read from the relevant AST nodes’s location information. By feeding it derived AST with locations coming from the source docblock, validation errors appear in the right place and click to def works for free.

