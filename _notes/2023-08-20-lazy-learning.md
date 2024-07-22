---
title: Eager vs Lazy Learning
tags:
  - observation
summary: An observation about the way I learn
---
I’ve observed a parallel between eager/lazy evaluation in computing and different approaches to learning. In this model, learning can be thought of as compute-intensive work that results in storing the resulting knowledge in a cache.


```javascript
knowledgeCache[topic] = learn(topic)
```


Thinking about learning in this way can be helpful in intentionally structuring your career, a project, or even the tiny problems that make up our daily work.


## Lazy


As a self-taught programmer, I find that most of my learning is “lazy”. I set out to build something concrete and along the way encounter problems which I don’t know how to solve (a cache-miss). I then do research and learn (compute) just enough knowledge to solve that specific problem.


```javascript
function getKnowledge(topic) {
  if(knowledgeCache[topic] == null) {
    knowledgeCache[topic] = learn(topic)
  }
  return knowledgeCache[topic]
}
```


## Eager


In contrast, a university computer science education can be thought of as “eager” learning. You front-load learning a broad set of topics (warm the cache). Four years later, when you take on building something concrete, many of the problems you encounter will be familiar to you, and you’ll be able to solve them without needing further learning (cache hit).


```javascript
function attendCollege() {
  knowledgeCache['algorithms'] = learn('algorithms')
  knowledgeCache['databases'] = learn('databases')
  knowledgeCache['compilers'] = learn('compilers')
  knowledgeCache['networking'] = learn('networking')
}
```


## Tradeoffs


Just like eager vs lazy computation, eager vs lazy learning has tradeoffs.


Lazy learning is externally motivated. This ensures knowledge is always contextualized by a concrete problem it solves. Personally, I find that this context helps me more deeply internalize what I’m learning which leads to better retention.


Eager learning, on the other hand, gives you a broad survey of the space, which can help the learner know where to look for a specific answer. This can help avoid the failure mode where a problem has a well-known name and set of solutions, but you either don’t know that name exists or don’t recognize that your problem is an example of that name.


Aside: I highly recommend Vjeux’s [blog post](https://blog.vjeux.com/2017/epita/my-cs-degree-at-epita-was-worth-it.html) about the value he derived from his CS degree.


## Conclusion


Of course, in reality the relationships between these two types of learnings are fractal. Sometimes when working on a project, you decide to eagerly learn about a relevant topic before you start work. Conversely, a college course may include projects that force you to lazily learn something in order to make progress.


Just like when we design an algorithm, we think about the tradeoffs between an eager vs lazy approach, when structuring our careers at each fractal granularity, it can be helpful to consider both approaches to learning and which approach’s tradeoffs would be optimal.

