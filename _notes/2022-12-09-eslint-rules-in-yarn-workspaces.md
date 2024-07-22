---
title: Creating project-specific ESLint rules in a Yarn workspace
tags:
  - eslint
summary: >-
  How to create custom project-specific lint rules for a repository that is
  using Yarn Workspaces where ESLint is run from the workspace root
---
I recently needed to figure out how to create custom project-specific lint rules for a repository that is using [Yarn workspaces](https://classic.yarnpkg.com/lang/en/docs/workspaces/) where ESLint is run from the workspace root.

- [Create an ESLint plugin](https://eslint.org/docs/latest/developer-guide/working-with-plugins#create-a-plugin) as a private (`”private”: true` in its package.json) in the workspace (parallel with other packages) and define the ESLint rules there.
- Add a dependency on that package to your workspace’s root package.json using the `link:<path>` syntax. Mine looked like: `"eslint-plugin-relay-internal": "link:./packages/eslint-plugin-relay-internal",`
- Reference the package normally in the workspace’s eslintrc.

You can see the PR here: [https://github.com/facebook/relay/pull/4147](https://github.com/facebook/relay/pull/4147)

