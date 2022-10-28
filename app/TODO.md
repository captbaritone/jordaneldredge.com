# Migration TODO List

In order to migrate to the new version of Next, with Server components, there are several remaining things to fix:

- [ ] Get Shiki working with Next's server Webpack bundling.
- [ ] Get og tags working with overrides (how does the root page define a title that gets superceded by the nested routes?)
- [ ] Use special hook for nav link
- [ ] Find new solution to "fix a typo" link in the footer
- [ ] Ensure we are statically building all the blog post routes
- [ ] Add error boundary back to blog post
- [ ] Test 404 behavior