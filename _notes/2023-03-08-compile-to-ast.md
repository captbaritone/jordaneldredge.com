---
title: Compiling to AST
tags:
  - opinion
  - staticAnalysis
summary: >-
  A pattern for tracking location information when compiling to a high level
  language
notion_id: d505aa52-71d5-4599-841f-6a0511ed1582
summary_image: >-
  https://pub-d4cecb3d578a4c0a8939680792e49682.r2.dev/notion-mirror/84ebb48c-616a-4f51-ae9a-991a4e0a7e9b/61fdbc2d-408f-4219-a2fb-af9c141e3547/Screenshot_2025-01-05_at_2.47.01_PM.png
---
While working on [Relay Resolvers](https://relay.dev/docs/guides/relay-resolvers/), and later [Grats](https://jordaneldredge.com/blog/grats/) (both of which extract GraphQL schema definitions from JavaScript source code) I stumbled upon a nice technique for compiling from one high level language to another high level language. Rather than generating a text representation of target language, generate an [AST](https://en.wikipedia.org/wiki/Abstract_syntax_tree) of the target language and _populate the AST‘s location information/spans from the source text_.

With this approach you get a number of benefits. For one, generating AST node gives you assurance that you are generating syntactically correct target language code. But if you can then pass that AST directly to modules that deal in the target language, you basically get free source mapping.

For example, if the generated code results in a type error in the target language, that type error will be reported with diagnostics pointing to the relevant parts of the user’s own code in the source language! If your compiler has an editor integration, you can even get features like “click to definition” for free.

For example, Grats parses TypeScript code to generate GraphQL schema. By generating GraphQL schema AST with location information that points back to the TypeScript code, type errors appear in the correct place. Here’s an example from Grats of a GraphQL validation error (created by `graphql-js`) reporting errors blamed to the source TypeScript code:

![Screenshot\_2025-01-05\_at\_2.47.01\_PM.png](https://pub-d4cecb3d578a4c0a8939680792e49682.r2.dev/notion-mirror/84ebb48c-616a-4f51-ae9a-991a4e0a7e9b/61fdbc2d-408f-4219-a2fb-af9c141e3547/Screenshot_2025-01-05_at_2.47.01_PM.png)

Even things like click-to-definition “just work”. Here’s a demo video of Relay Resolvers:

<https://twitter.com/captbaritone/status/1633293186876715008>
