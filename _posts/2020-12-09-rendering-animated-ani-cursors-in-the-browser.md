---
title: "Rendering Animated .ani Cursors in the Browser"
summary: "Technical breakdown of how the NPM module ani-cursor converts .ani files into CSS animations in the browser."
github_comments_issue_id: 15
summary_image: /images/ani-cursor.png
---

::animatedCursor{url="https://archive.org/cors/tucows_169750_Dove_Flying/dove.ani" selector="body"}

*TL:DR: If you'd like to render `.ani` files in the browser, I've published [`ani-cursor`](https://www.npmjs.com/package/ani-cursor) on NPM which makes it possible.*

Windows Animated Cursor files (`.ani`) are, as the name implies, animated cursor files used by Microsoft Windows. I recently had a reason to try to get them to render on the web and it was a fun experiment so I thought I'd share how I did it.

But first, here's what the result looks like:

::youtube{token=TjaWYAq72Is}

_.ani cursors, from Super_Mario_Amp_2.wsz by [LuigiHann](https://twitter.com/luigihann), animating in the browser_

## Why?

My side project [Webamp](https://webamp.org) is an attempt to render classic Winamp [skins](https://en.wikipedia.org/wiki/Skin_(computing)) in the browser. One aspect of the UI that skins could customize, was the cursors when users hovered over elements. Skin authors did this by supplying a collection of cursor files in their skin. Winamp supported both `.cur` and `.ani` files for this purpose.

Lucky for me, browsers already support the `.cur` file type, so supporting those in Webamp was as simple as getting the cursor file as a data URI and then injecting CSS like this into the DOM:

```css
.someElement {
  cursor: url(data:image/x-win-bitmap;base64,AAAAAAA[...], auto)
}
```

However, up until recently, Webamp didn't support `.ani` files for two reasons:

1. Modern browsers don't support `.ani` files natively
2. Browsers don't support animated image formats (gif, apng) as cursors

*Source: [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Basic_User_Interface/Using_URL_values_for_the_cursor_property)*

## Browser don't support `.ani`

To get around this, we use JavaScript to parse the `.ani` file and extract the frames and metadata indicating the order and timing in which to render the frames. `.ani` files use the [RIFF](http://fileformats.archiveteam.org/wiki/RIFF) container format, and someone on NPM has already written a small library [`riff-file`](https://github.com/rochars/riff-file) that can parse RIFF in the browser. `riff-file` breaks the file into sections for us:

1. Block of 9 metadata numbers
2. A "rate" array showing for how long each frame is rendered (optional)
3. A "seq" array, showing in which order the frames should be rendered (optional)
4. An array of frames containing the raw image data for each frame

`riff-file` only gives us the byte range of each of these sections within the `.ani` file. We then use the [`byte-data`](https://github.com/rochars/byte-data) library to parse the first three sections into JavaScript numbers.

We now have enough information to construct the animation ourselves!

## Browsers don't support animated cursors

To get around this, we use a technique I discovered in a four year old [forum post](https://css-tricks.com/forums/topic/animated-cursor/). We define a CSS animation where the `cursor` property changes over time.

The result looks something like this:

```css
@keyframes ani-cursor-27 {
  0% { cursor: url(data:image/x-win-bitmap;base64,AAACAAEAIC[...]), auto; }
  9.090909090909092% { cursor: url(data:image/x-win-bitmap;base64,AAACAAEAIC[...]), auto; }
  18.181818181818183% { cursor: url(data:image/x-win-bitmap;base64,AAACAAEAI[...]), auto; }
  27.27272727272727% { cursor: url(data:image/x-win-bitmap;base64,AAACAAEAIC[...]), auto; }
  36.36363636363637% { cursor: url(data:image/x-win-bitmap;base64,AAACAAEAIC[...]), auto; }
  45.45454545454545% { cursor: url(data:image/x-win-bitmap;base64,AAACAAEAIC[...]), auto; }
  54.54545454545454% { cursor: url(data:image/x-win-bitmap;base64,AAACAAEAIC[...]), auto; }
  63.63636363636363% { cursor: url(data:image/x-win-bitmap;base64,AAACAAEAIC[...]), auto; }
  72.72727272727273% { cursor: url(data:image/x-win-bitmap;base64,AAACAAEAIC[...]), auto; }
  81.81818181818183% { cursor: url(data:image/x-win-bitmap;base64,AAACAAEAIC[...]), auto; }
  90.9090909090909% { cursor: url(data:image/x-win-bitmap;base64,AAACAAEAICA[...]), auto; }
}
#node-with-cursor:hover { animation: ani-cursor-27 1760ms step-end infinite; }
```

Another option I [prototyped](https://codesandbox.io/s/ani-web-animation-lz46u?file=/src/parseAni.js) was to use the Web Animation API to create the animation. This is a lot cleaner since it does not require constructing a CSS string at runtime. However, the CSS approach is a bit nicer for Webamp since it doesn't require us to track the actual DOM nodes of each element that has an animated cursor. 

**Note:** Safari [only recently](https://trac.webkit.org/changeset/269812/webkit) (Nov. 14th, 2020) merged support for animating the `cursor` property so this won't work in Safari until their next release. **Update:** That fix did not work for `url()` cursor values. I've filed a [followup issue](https://bugs.webkit.org/show_bug.cgi?id=221589).

## Implementation

With solutions to the above challenges in hand, we just need to implement it!

Firstly, we need a way to serialize the individual frame to a data URI. This requires base64 encoding the `UInt8Array` we get from `riff-file` and supplying the correct mime type:

```jsx
function cursorUrlFromByteArray(dataArray: Uint8Array) {
  const base64 = window.btoa(String.fromCharCode(...dataArray));;
  return `data:image/x-win-bitmap;base64,${base64}`;
}
```

Secondly, we have to take the data we parse from the `.ani` file and construct a list of keyframes and their associated percentages. If the animation includes a `seq` section, some frames may appear more than once in the animation.  

```jsx
const JIFFIES_PER_MS = 1000 / 60;
const sum = nums => reduce((total, value) => total + value, 0);

export function readAni(contents: Uint8Array): AniCursorImage {
  const ani = parseAni(contents);
  const rate = ani.rate ?? ani.images.map(() => ani.metadata.iDispRate);
  const duration = sum(rate);

  const frames = ani.images.map((image) => ({
    url: curUrlFromByteArray(image),
    percents: [] as number[],
  }));

  let elapsed = 0;
  rate.forEach((r, i) => {
    const frameIdx = ani.seq ? ani.seq[i] : i;
    frames[frameIdx].percents.push((elapsed / duration) * 100);
    elapsed += r;
  });

  return { duration: duration * JIFFIES_PER_MS, frames };
}
```

Finally, we use this data to construct our CSS string:

```jsx
let i = 0;
const uniqueId = () => i++;

export function aniCss(selector: string, ani: AniCursorImage): string {
  const animationName = `webamp-ani-cursor-${uniqueId()}`;

  const keyframes = ani.frames.map(({ url, percents }) => {
    const percent = percents.map((num) => `${num}%`).join(", ");
    return `${percent} { cursor: url(${url}), auto; }`;
  });

  return `
    @keyframes ${animationName} {
      ${keyframes.join("\n")}
    }
    ${selector}:hover {
      animation: ${animationName} ${ani.duration}ms step-end infinite;
    }
  `;
}
```

There are two small details in the CSS that we generate which are worth calling out.

Firstly, we use a `timing-function` of `step-end`. This is because discrete properties, like cursor, do not actually change at the time specified by the keyframe (10%), but rather when the animation progress has reached the midpoint *between* keyframes ([source](https://drafts.csswg.org/web-animations-1/#discrete)). Luckily the animation progress is computed using the `timing-function` so we can use `step-end` to ensure the cursor image updates immediately when each keyframe percentage is reached.

Secondly, we add a `:hover` pseudo selector so that the animation loop only runs when the cursor is visible. This helps us match Winamp's behavior where the animation always restarts when you hover over an element. It may also save some CPU cycles.

And that's about it! The full implementation can be found in the `ani-cursor` NPM module which [lives in the Webamp repository on GitHub](https://github.com/captbaritone/webamp/tree/master/packages/ani-cursor).

## Try it out

If you want to see some animated cursors rendering in your browser, check out these skins that feature animated cursors and try hovering your mouse around.

- [Super_Mario_Amp_2.wsz](https://webamp.org/?skinUrl=https://cdn.webampskins.org/skins/6e30f9e9b8f5719469809785ae5e4a1f.wsz) (by [LuigiHann](https://twitter.com/luigihann?lang=en))
- [Sonic_Attitude.wsz](https://webamp.org/?skinUrl=https://cdn.webampskins.org/skins/4cbfadd11c0e8ebec834ea0355d275c1.wsz) (by [LuigiHann](https://twitter.com/luigihann?lang=en))
- [Green Dimension v2](https://webamp.org/?skinUrl=https://cdn.webampskins.org/skins/4308a2fc648033bf5fe7c4d56a5c8823.wsz)

## Future Possibilities

**It would be cool to see someone use this library to build a website that makes a large collection of `.ani` files available online** without needing to convert them to another format server side.

Someone could create (or [find](https://archive.org/details/TOPCUR95_ZIP)) a collection of `.ani` files on the Internet Archive and then build a simple web app which pulls files directly from the Internet Archive's servers and renders them in an interesting way.

This is the approach I propose in my previous blog post [Mainlining Nostalgia: Making the Winamp Skin Museum](/blog/winamp-skin-musuem/).

If you end up taking inspiration from this post, please [get in touch](/contact/)!