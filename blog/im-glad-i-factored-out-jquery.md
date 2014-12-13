/*
Title: I'm glad I factored out jQuery
Description:
Author: Jordan Eldredge
Date: 2014/12/13
*/

*This post is the first in an ongoing series about things I learned from my
recent [Winamp2-js](http://jordaneldredge.com/projects/winamp2-js/) project.*

Like many of us, I rejected javascript as a dark art until jQuery arrived and
finally made it usable. At that point I started writing javascript exclusively
in jQuery and never looked back... until recently.

As I was working on Winamp2-js, using jQuery, I realized that I was only using
jQuery for a few very simple things: selecting DOM elements and performing
simple CSS manipulation. As an exercise I decided to try removing it.

To my surprise, the process was painless. Selecting DOM elements with
`document.getElementById()` was actually perfect for this project, and
modifying element's classes via `element.classList` felt logical and clean.

The resulting code not only loaded faster, since it didn't need to load jQuery,
but it was more explicate and was simpler to work on. By removing a layer of
abstraction, I was able to make my code feel more taut. I trusted it better,
because I could see everything it was doing.

However, the benefits to my code paled compared to the benefits to me as a
developer. By giving raw javascript a chance, I not only gained a better
understanding of the functionality jQuery actually provides, but I learned that
javascript's interface is not nearly as problematic as I had convinced myself
it was during all those years of blind rejection.
