---
title: Avoid “straw that broke the camels back” lint rules
tags:
  - eslint
  - opinion
summary: A class of lint rules that I think are best to avoid
notion_id: 4dfb59e7-22ff-4cd7-93bc-97f8ca2b7062
---
Some lint rules set a threshold or limit on some metric. For example, cyclomatic complexity, nesting depth or number of arguments. I’ve found these rules tend to end up being fundamentally frustrating for all involved.

The problem is that the moment these lint rules trigger tends to be unrelated to the introduction of the actual problem and thus the person who triggers the issue is not really suitably responsible for resolving the issue.

Many of these lint rules are trying to programmatically ensure some degree of code quality, a proposition magnetically attractive to us software engineers. That said, such programmatic assessments of code quality generally tend to be too narrowly focused and frequently miss the context or extenuating circumstances in which the infractions occur. This only serves to magnify the frustration of triggering them.

In practice such infractions generally tend to be an indicator of code quality problems rather than the actual source of said problems. With that in mind, I’d suggest that such rules are better used as part of a tool to identify hotspots within the codebase which might need refactoring or code quality investment. Once the hot spots are identified, humans should be responsible for determining what the _actual_ problem is, and coming up with a plan remediate it at its source, not just [treat the easily observable symptom](https://jordaneldredge.com/notes/surface-nits/).
