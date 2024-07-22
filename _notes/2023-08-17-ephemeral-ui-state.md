---
title: On ephemeral UI, fragile app state, and anxiety
tags:
  - opinion
  - javascript
  - react
summary: >-
  Ephemeral UI make us nervous because we’ve learned that there’s a high
  likelihood lose our state by accident
summary_image: >-
  https://prod-files-secure.s3.us-west-2.amazonaws.com/84ebb48c-616a-4f51-ae9a-991a4e0a7e9b/2d5211c8-c670-4e1e-a4e3-03db6a74bef1/Untitled.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45HZZMZUHI%2F20240722%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20240722T031329Z&X-Amz-Expires=3600&X-Amz-Signature=1dc7636957508f2f35a103d4a7c9c0e3bc86ca2b08dc575da73daacf92e39c57&X-Amz-SignedHeaders=host&x-id=GetObject
---
Is there a name for the steadily increasing anxiety you feel as you build up state (form inputs, navigation stack) in an ephemeral UI (modal, popover)?


Me filling out step ten of an account creation form in a modal inside a pop-over on a website spawned inside the Facebook app’s browser on my phone:


![](https://prod-files-secure.s3.us-west-2.amazonaws.com/84ebb48c-616a-4f51-ae9a-991a4e0a7e9b/2d5211c8-c670-4e1e-a4e3-03db6a74bef1/Untitled.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45HZZMZUHI%2F20240722%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20240722T031329Z&X-Amz-Expires=3600&X-Amz-Signature=1dc7636957508f2f35a103d4a7c9c0e3bc86ca2b08dc575da73daacf92e39c57&X-Amz-SignedHeaders=host&x-id=GetObject)

