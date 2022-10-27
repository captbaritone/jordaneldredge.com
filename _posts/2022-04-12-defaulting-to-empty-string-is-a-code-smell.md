---
title: '?? "" is a Code Smell'
summary: "Defaulting to empty string is a lie we tell our type checker."
github_comments_issue_id: 17
---

In typed JavaScript codebases (TypeScript/Flow) I see this pattern a lot:

```jsx
<Component prop={someValue ?? ""} />
```

It is almost always in places when someone has a _nullable_ string and wants to pass it to a component or function that expects a _non-nullable_ string. **I posit that nearly every API which expects a non-nullable string is broken if passed an empty string.**

Lets consider some examples:

- Using an empty string as an image `src` [can destroy your site](https://humanwhocodes.com/blog/2009/11/30/empty-image-src-can-destroy-your-site/).
- Using an empty string as a link `href` will create a confusingly broken link back to your home page.
- An empty accessibility label or `alt` attribute means a broken experience for anyone using a screen reader.
- Passing `''` as the non-nullable content/field prop of a React component probably leads to an oddly collapsed and broken feeling UI — otherwise the component would have allowed `null`.

It is almost always better to do one of the following two things:

1. If the component you are passing the value to _can_ render sensibly without the string value, you should make the component accept a nullable value.
2. If that component really does need a string in order to render sensibly, you should explicitly handle the potential nullability of your value by either throwing or rendering some other type of fallback.

When you find yourself tempted to write `?? ''` ask yourself, **"Am I simply tricking TypeScript into allowing me to write a bug?”**
