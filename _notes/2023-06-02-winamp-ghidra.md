---
title: Disassembling Winamp with Ghidra to find the Maki interpreter
tags:
  - winamp
summary: Sharing my n00b attempt at disassembling the Winamp binary
summary_image: >-
  https://prod-files-secure.s3.us-west-2.amazonaws.com/84ebb48c-616a-4f51-ae9a-991a4e0a7e9b/699a3d15-bbbe-41c0-b824-5219276d04d3/Screenshot_2023-06-01_at_11.05.42_PM.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45HZZMZUHI%2F20240722%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20240722T054531Z&X-Amz-Expires=3600&X-Amz-Signature=bd8b6279611004fa196e1540f9f89c05bfa816adf417b284b6296a65cf864550&X-Amz-SignedHeaders=host&x-id=GetObject
---
So called “Modern” Winamp skins are scripted using a custom scripting language called Maki which compiles to a custom byte code.

To learn more about this byte code, I attempted to locate the byte code interpreter in the Winamp binary. Here are the septs I followed to find the Maki interpreter in the Winamp binary using Ghidra:

- Install Winamp (5.666)
- Find the install directory in Program Files
- Find the `plugins` directory
- Open gen\_ff.dll plugin (the one in charge of rendering the UI) in [Ghidra](https://ghidra-sre.org/)
- Search strings for “division” and find “Division by zero”
- Select that option to jump to the data section offset where the string is
- Right click the offset number and select “Show all References to Address”
- Find the name of the enclosing function that uses the string
- Right click the name and select “References” > “Find references to FUN\_\<FUNCTION\_NUMBER>”
- Jump to the one reference
- This function is the interpreter
- 🎉

## The branch for multiplication

![](/public/notion-mirror/84ebb48c-616a-4f51-ae9a-991a4e0a7e9b/699a3d15-bbbe-41c0-b824-5219276d04d3/Screenshot_2023-06-01_at_11.05.42_PM.png)
