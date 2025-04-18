---
title: >-
  Can’t use Shiki (and likely other Wasm-based tools) in Next 13 server
  components
tags:
  - javascript
  - staticAnalysis
  - react
  - note
summary: A bug I hit with Skiki and Next 13
notion_id: 6549b4bc-f1a0-4fed-98c1-630074c4a023
---
It seems Next 13 bundles server code using Webpack. This does not play well with [Shiki](https://github.com/shikijs/shiki) which uses `require.resolve` to [locate a Wasm file in a sibling package](https://github.com/shikijs/shiki/blob/1ad7634f729f48d55838be9b3e08134e390d7f33/packages/shiki/src/loader.ts#L58-L61) and pull it in via `fs.readFileSync`. I suspect many Wasm based packages end up needing to do something like this, since Node does not offer a first-class way to require binary Wasm code.

The error it throws is:

```text
error - unhandledRejection: Error: ENOENT: no such file or directory, open
'(sc_server)/node_modules/vscode-oniguruma/release/onig.wasm
```

**Update Nov. 14th 2014:** It looks like GitHub user [pengx17](https://github.com/pengx17) has found a solution here for there blog: <https://github.com/shikijs/shiki/pull/358#issuecomment-1294413167> the full stack of commits are [here](https://github.com/pengx17/nextjs-blog/compare/next-13-app-layout). I’m working on adapting this for my blog.
