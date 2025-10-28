import { Metadata } from "next";
import { ListItem } from "../../../lib/components/ListItem";
import Link from "next/link"; // Assuming you're using Next.js

import type { JSX } from "react";

export const metadata: Metadata = {
  title: `Projects`,
  description: `A list of software side projects by Jordan Eldredge.`,
  openGraph: {
    url: "https://jordaneldredge.com/projects/",
  },
  alternates: {
    canonical: "https://jordaneldredge.com/projects/",
  },
};

export default function Projects() {
  return (
    <>
      <div className="markdown">
        <h1>Projects</h1>
        <p>
          Over the years I&rsquo;ve built a number of software side projects.
          Below are a list of the more interesting ones. For a more exhaustive
          list see my <Link href="/blog/">blog</Link>.
        </p>
        <hr />
      </div>
      <ListItem
        title="Webamp"
        url="https://webamp.org"
        summaryImage={"/images/winamp/three-windows-screenshot.png"}
      >
        <Wrapper summary="A reimplementation of Winamp 2.9 in HTML5 and Javascript.">
          <Link href="https://techcrunch.com/2018/02/09/whip-the-llamas-ass-with-this-javascript-winamp-emulator/">
            TechCrunch
          </Link>
          ,{" "}
          <Link href="https://www.vice.com/en/article/winamp-2-mp3-music-player-emulator/">
            Motherboard
          </Link>
          ,{" "}
          <Link href="https://gizmodo.com/winamp-2-has-been-immortalized-in-html5-for-your-pleasu-1655373653">
            Gizmodo
          </Link>
          , Hacker News (
          <Link href="https://news.ycombinator.com/item?id=8565665">1</Link>,{" "}
          <Link href="https://news.ycombinator.com/item?id=15314629">2</Link>,{" "}
          <Link href="https://news.ycombinator.com/item?id=16333550">3</Link>,{" "}
          <Link href="https://news.ycombinator.com/item?id=17583997">4</Link>
          ), and{" "}
          <Link href="https://github.com/captbaritone/webamp/blob/master/packages/webamp/docs/press.md">
            more
          </Link>
        </Wrapper>
      </ListItem>
      <ListItem
        title="Winamp Skin Museum"
        url="https://skins.webamp.org"
        summaryImage="/images/winamp-skin-museum.png"
      >
        <Wrapper summary="Infinite scroll through &gt;90k Winamp skins with instant search and in-browser interactive preview.">
          <Link href="https://www.theverge.com/tldr/21430347/winamp-skin-museum-nostalgia-90s-00s-internet-art-history-ui">
            The Verge
          </Link>
          ,{" "}
          <Link href="https://www.pcgamer.com/heres-an-interactive-archive-of-65000-winamp-skins-for-you-to-browse-forever/">
            PC Gamer
          </Link>
          ,{" "}
          <Link href="https://news.avclub.com/attention-digital-anthropologists-you-can-now-visit-an-1844954715">
            AV Club
          </Link>
          ,{" "}
          <Link href="https://gizmodo.com/the-winamp-skin-museum-is-x-tremely-gnarly-1844958728">
            Gizmodo
          </Link>
          ,{" "}
          <Link href="https://css-tricks.com/winamp-skin-museum/">
            CSS-Tricks
          </Link>
          , Hacker News (
          <Link href="https://news.ycombinator.com/item?id=24373699">1</Link>,{" "}
          <Link href="https://news.ycombinator.com/item?id=31703874">2</Link>,{" "}
          <Link href="https://news.ycombinator.com/item?id=30054172">3</Link>,
          and{" "}
          <Link href="https://github.com/captbaritone/webamp/blob/master/packages/webamp/docs/skin-museum-press.md">
            more
          </Link>
          )
        </Wrapper>
      </ListItem>
      <ListItem
        title="Grats"
        url="/blog/grats/"
        summaryImage="/uploads/2024/grats.png"
      >
        <Wrapper summary="Implementation-First GraphQL for TypeScript using static analysis.">
          <Link href="https://news.ycombinator.com/item?id=39635014">
            Hacker News
          </Link>
          ,{" "}
          <Link href="https://www.graphqlweekly.com/issues/345/">
            GraphQL Weekly
          </Link>
        </Wrapper>
      </ListItem>
      <ListItem
        title="Eel-Wasm"
        url="/blog/speeding-up-winamps-music-visualizer-with-webassembly/"
        summaryImage="/images/butterchurn-wasm/butterchurn.png"
        summary="An in-browser compiler which speeds up in-browser rendering of user-defined music visualizations."
      >
        <Wrapper summary="An in-browser compiler which speeds up in-browser rendering of user-defined music visualizations.">
          Presented at{" "}
          <Link href="https://www.youtube.com/watch?v=hZzjrgZb-mw">
            TS Conf 2021
          </Link>
        </Wrapper>
      </ListItem>
      <ListItem
        title="Interesting Bugs Caught by ESLint's no-constant-binary-expression"
        url="/blog/interesting-bugs-caught-by-eslints-no-constant-binary-expression/"
        summaryImage="/uploads/2024/logic-bug.webp"
      >
        <Wrapper summary="A core ESLint rule which I proposed and contributed. Has caught interesting bugs in many popular JavaScript projects.">
          <Link href="https://news.ycombinator.com/item?id=38196644">
            Hacker News
          </Link>
        </Wrapper>
      </ListItem>
    </>
  );
}

function Wrapper({
  summary,
  children,
}: {
  summary: string;

  children: React.ReactNode;
}): JSX.Element {
  return (
    <div className="markdown">
      <p>{summary}</p>
      <div className="italic">{children}</div>
    </div>
  );
}
