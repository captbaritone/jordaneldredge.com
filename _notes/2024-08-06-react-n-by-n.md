---
title: How the React model tames N by N code complexity
tags:
  - javascript
  - react
  - observation
summary: Explaining how exactly the UI = f(state) model tames code complexity
notion_id: d2e97d43-b5f8-461d-aa92-97a3af00025a
---
[React’s](https://react.dev/) programming model reduces code complexity in multiple ways (yay component composition!) but one aspect that I think is under appreciated is how the the `UI = f(state)` model enables app complexity to scale linearly, where previous approaches scaled exponentially.

With UI frameworks like jQuery that rely on user-defined code imperatively updating the DOM, you need to write code that implements the transition from every possible state to every other possible state. This leads to code that get exponentially more complex as the number of states in your application grows. React, on the other hand, generically solves the DOM update problem via virtual DOM diffing. This allows your code to scale linearly. When you want to add a new state to your app, you simply write code for how thats state gets rendered `O(states)` and not code for mutating the DOM to get to that state from every other possible state `O(states^2)`.

Internalizing this has helped me understand when React is going to be a necessary tool to bound code complexity, and when a simpler tool might be sufficient. It also helps me understand which other libraries/UI models are going to have similar properties to React and therefore might be viable alternatives for bounding complexity.
