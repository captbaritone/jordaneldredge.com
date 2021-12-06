---
title: "Speeding Up Webamp's Music Visualizer with WebAssembly"
summary: "Writing an in-browser compiler to compile untrusted user-supplied code to fast and secure Wasm at runtime."
github_comments_issue_id: 16
summary_image: /images/butterchurn-wasm/butterchurn.png
---

[Webamp.org](http://webamp.org)'s visualizer, [Butterchurn](https://github.com/jberg/butterchurn), now uses WebAssembly (Wasm) to achieve better performance and improved security. Whereas most projects use Wasm by compiling pre-existing native code to Wasm, Butterchurn uses an in-browser compiler to compile untrusted user-supplied code to fast and secure Wasm at runtime. This blog post details why we undertook this project, the challenges we faced, the solutions we found, and the performance and security wins they unlocked.

![Webamp's music visualizer, Butterchurn](/images/butterchurn-wasm/butterchurn.png)
_Webamp's with its music visualizer Butterchurn, now powered by Wasm_

## Why Wasm?

Webamp's visualizer is provided by Butterchurn, an open source JavaScript and WebGL implementation of Winamp's infamous [Milkdrop](https://en.wikipedia.org/wiki/MilkDrop) music visualizer. Milkdrop's iconic visuals are the product of `.milk` "presets" which contain [HLSL](https://en.wikipedia.org/wiki/High-Level_Shading_Language) shader code and code written Eel, a language that Nullsoft invented. Milkdrop uses this code to convert audio signal into pixels.

Butterchurn originally worked by transpiling the HLSL shader code to WebGL code and transpiling the Eel code to JavaScript. The resulting code was then distributed as `.json` files from which Butterchurn could read the code and `eval()` it.

This worked fine for the shader code, and the fact that the JavaScript code was fast enough to run without dropping frames in most cases is a testament to the impressive state of modern JavaScript interpreters.

However, the transpiled JavaScript code still represented a significant performance bottleneck. It worked, but running Butterchurn could easily consume a majority of available CPU, draining batteries and causing computer fans to go into overdrive.

While JavaScript is *capable* of running complicated functions consisting mostly of math in a hot loop *inside* an animation loop, it's not the ideal tool for the job.

Enter WebAssembly!

In late 2019 I set out to learn more about compilers, and for me that meant trying to implement one. While searching for a compiler project which would be achievable for a novice, I hit upon the idea of compiling Eel to Wasm. It ended up being a perfect fit. Eel is a very simple language with only one data type: floating point numbers (no strings, objects, or arrays). This made it a very nice fit for Wasm which only has numeric data types. 

So, in a bid to learn how compilers work, I built [`eel-wasm`](https://github.com/captbaritone/eel-wasm) — a compiler written in TypeScript (more on that later) which converts Eel source code into the binary representation of a Wasm module. If you're curious you can try it out in this playground I made: [https://eel.capt.dev/](https://eel.capt.dev/)

![eel-wasm Playground](/images/butterchurn-wasm/eel-wasm-playground.png)

In addition to giving me a chance to learn about compilers in a hands-on way, it ended up enabling significant performance improvements in Butterchurn!

## Performance

To understand the performance impact of compiling to Wasm, we constructed a benchmark consisting of 105 presets. For each preset we rendered seven trials of 300 frames each to learn how much time was spent rendering each frame.

These times includes evaluating Eel, as well as running the framework JavaScript and WebGL shaders. In absolute terms, we found that in the JavaScript version, we spent an average of 4.17ms per frame evaluating Eel. By compiling Eel to Wasm, we were able to bring that down to 2.32ms per frame.

![frame timing improvements](/images/butterchurn-wasm/frame-timing.svg)

To understand the overall speedup, we computed the percent speedup for each preset and averaged those value. By that metric rendering with the new **Wasm version is ~72.6 faster than the JavaScript approach.**

## Speed Bumps

While `eel-wasm` has provided significant performance wins for Butterchurn, the wins were not immediate. Jordan Berg, Butterchurn's author, made an initial attempt at adopting `eel-wasm` within Butterchurn, and it showed the Wasm version being more or less performance neutral. But why?

Each preset consists of several Eel functions, some of which are run as many as a thousand times per animation frame. In between each call into Eel code, Butterchurn needs to read out the results of the previous call and reset some global values in anticipation of the next call. While the functions themselves were running *much* faster, getting values — even just numbers — into and out of Wasm ended up being surprisingly expensive and effectively canceled out our performance wins.

Jordan Berg and I went back and forth on how we might reduce the number of boundary crossings and we eventually found an interesting solution: Rewrite these hot loops in a separate Wasm module which can share [`WebAssembly.Global`](http://webassembly.Global) objects with our compiled Eel Wasm module. While boundary crossing between JavaScript and Wasm is expensive, multiple Wasm modules can share access to globals and seem to pay basically zero overhead.

The result is that Butterchurn now includes its own pre-compiled Wasm module (written in [AssemblyScript](https://www.assemblyscript.org/)) which shares globals with our compiled Eel code. This new module takes care of reading/resetting Wasm globals when we are calling our Eel functions in hot loops.

After moving the most obvious hot loops into AssemblyScript we were able achieve the 72.6% performance improvement mentioned above. Furthermore, there are still a few hot loops which contain boundary crossing. We estimate that once we convert those to AssemblyScript we will be able to achieve a full 100% performance improvement overall.

I'm bullish on this multiple Wasm module approach since not only does it allow us avoid the cost of boundary crossings, but in the future it will allow us to iteratively convert *other* performance sensitive pieces of Butterchurn's JavaScript to Wasm.

## Running the Compiler in the Browser

Earlier I promised to explain why I wrote the compiler in TypeScript. This was because we wanted to be able to run the compiler in the browser. This is an unusual choice, so I wanted to explain our motivations:

Firstly, Milkdrop features an in-app preset editor which lets users create and edit presets by modifying code directly within the the visualizer window. We would like to support this feature in Webamp in the future and it would require being able to locally compile/interpret Eel code.

![Milkdrop's integrated editor](/images/butterchurn-wasm/milkdrop-editor.png)
_Milkdrop's built-in preset editor_

Secondly, Webamp currently supports loading any of the presets from the collection of >40,000 presets that Jordan Berg has [amassed over on the Internet Archive](https://archive.org/details/milkdrops). We wanted to be able to iterate on the compiler without having to regenerate artifacts for each of these presets each time.

Interestingly, including an Eel compiler as part of the runtime is also what Milkdrop itself does. Milkdrop has a number of inline [`__asm()`](https://docs.microsoft.com/en-us/cpp/assembler/inline/asm?view=msvc-160) blocks which its compiler glues together at runtime to construct the user's program.

While I briefly explored writing the compiler in Rust and compiling it (the compiler) to Wasm, I decided against that approach for now since the compiler was simpler to write in TypeScript. Also, Eel programs are quite small, so compiler performance was less important than bundle size. That said, it might be fun to explore rewriting `eel-wasm` in Rust!

## Security

To be honest, my original motivation for writing this compiler was not performance. I was skeptical that Wasm would significantly out-perform JIT optimized JavaScript that was mostly performing math operations. While I'm happy to have been proven wrong, my original motivation was to take advantage of the Wasm sandbox.

Previously, in order to render a preset, Webamp would need to get a pre-processed `.json` file which contained the JavaScript representation of the Eel code as a string. It would then need to `eval()` that JavaScript.

This was fine for the default presets, but we also support loading a preset via a query param like: [`https://webamp.org/?butterchurnPresetUrl=https://example.com/preset.json`](https://webamp.org/?butterchurnPresetUrl=https://archive.org/cors/md_raron_dark_side_of_the_moon_pink_floyd/md_raron_dark_side_of_the_moon_pink_floyd.json). This allows the Internet Archive to generate a link for each of its 40k presets which will open Webamp with that preset. However, it also amounted to a XSS security hole where someone could create a Webamp link that referenced a preset file containing malicious JavaScript which would then be executed in the context of webamp.org. This prevented us from safely enabling features like Dropbox integration which lets you stream files directly from your Dropbox account.

With the adoption of `eel-wasm` we can still support rendering arbitrary presets, but the untrusted code is executed within the Wasm sandbox so we have strong guarantees that it can't read or write any data that it's not explicitly passed.

## Thanks

I want to give a huge thanks to Jordan Berg, the author of Butterchurn, for answering my endless questions about the Eel language and how Milkdrop uses it and for doing the hard work of integrating `eel-wasm` into Butterchurn.

---

If you'd like to hear more, I gave a talk entitled [*Faster, Safer: Compiling Untrusted Code to WebAssembly in the Browser*](/blog/faster-safer-compiling-untrusted-code-to-web-assembly-in-the-browser) in which I expanded upon some of the ideas in this post.