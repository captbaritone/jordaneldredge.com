import Link from "next/link";
import Image from "next/image";

export const metadata = {
  title: `Projects`,
  description: `A list of software side projects by Jordan Eldredge.`,
};

export default function Projects() {
  return (
    <>
      <div className="markdown">
        <h1>Projects</h1>
        <p>
          Over the years I&rsquo;ve built a number of software side projects.
          Below are a list of the more interesting ones. For a more exhaustive
          list see my <a href="/blog/">blog</a>.
        </p>
        <hr />
      </div>
      <ListItem
        title="Webamp"
        url="https://webamp.org"
        summaryImage={"/images/winamp/three-windows-screenshot.png"}
        summary="A reimplementation of Winamp 2.9 in HTML5 and Javascript."
      >
        <i>
          <a href="https://techcrunch.com/2018/02/09/whip-the-llamas-ass-with-this-javascript-winamp-emulator/">
            TechCrunch
          </a>
          ,{" "}
          <a href="https://motherboard.vice.com/en_us/article/qvebbv/winamp-2-mp3-music-player-emulator">
            Motherboard
          </a>
          ,{" "}
          <a href="https://gizmodo.com/winamp-2-has-been-immortalized-in-html5-for-your-pleasu-1655373653">
            Gizmodo
          </a>
          , Hacker News (
          <a href="https://news.ycombinator.com/item?id=8565665">1</a>,{" "}
          <a href="https://news.ycombinator.com/item?id=15314629">2</a>,{" "}
          <a href="https://news.ycombinator.com/item?id=16333550">3</a>,{" "}
          <a href="https://news.ycombinator.com/item?id=17583997">4</a>
          ), and{" "}
          <a href="https://github.com/captbaritone/webamp/blob/master/packages/webamp/docs/press.md">
            more
          </a>
        </i>
      </ListItem>
      <ListItem
        title="Winamp Skin Museum"
        url="https://skins.webamp.org"
        summaryImage="https://jordaneldredge.com/_next/image/?url=%2Fimages%2Fwinamp-skin-museum-small.png&w=2048&q=75"
        summary="Infinite scroll through &gt;90k Winamp skins with instant search and in-browser interactive preview."
      >
        <i>
          <a href="https://www.theverge.com/tldr/21430347/winamp-skin-museum-nostalgia-90s-00s-internet-art-history-ui">
            The Verge
          </a>
          ,{" "}
          <a href="https://www.pcgamer.com/heres-an-interactive-archive-of-65000-winamp-skins-for-you-to-browse-forever/">
            PC Gamer
          </a>
          ,{" "}
          <a href="https://news.avclub.com/attention-digital-anthropologists-you-can-now-visit-an-1844954715">
            AV Club
          </a>
          ,{" "}
          <a href="https://gizmodo.com/the-winamp-skin-museum-is-x-tremely-gnarly-1844958728">
            Gizmodo
          </a>
          , <a href="https://css-tricks.com/winamp-skin-museum/">CSS-Tricks</a>,{" "}
          Hacker News (
          <a href="https://news.ycombinator.com/item?id=24373699">1</a>,{" "}
          <a href="https://news.ycombinator.com/item?id=31703874">2</a>,{" "}
          <a href="https://news.ycombinator.com/item?id=30054172">3</a>, and{" "}
          <a href="https://github.com/captbaritone/webamp/blob/master/packages/webamp/docs/skin-museum-press.md">
            more
          </a>
        </i>
      </ListItem>
      <ListItem
        title="Grats"
        url="/blog/grats/"
        summaryImage="https://jordaneldredge.com/_next/image/?url=%2Fuploads%2F2024%2Fgrats.png&w=2048&q=75"
        summary="Implementation-First GraphQL for TypeScript using static analysis."
      >
        <i>
          <a href="https://news.ycombinator.com/item?id=39635014">
            Hacker News
          </a>
          ,{" "}
          <a href="https://www.graphqlweekly.com/issues/345/">GraphQL Weekly</a>
        </i>
      </ListItem>
      <ListItem
        title="Eel-Wasm"
        url="/blog/speeding-up-winamps-music-visualizer-with-webassembly/"
        summaryImage="https://jordaneldredge.com/_next/image/?url=%2Fimages%2Fbutterchurn-wasm%2Fbutterchurn.png&w=2048&q=75"
        summary="An in-browser compiler which speeds up in-browser rendering of user-defined music visualizations."
      >
        <i>
          Presented at{" "}
          <a href="https://www.youtube.com/watch?v=hZzjrgZb-mw">TS Conf 2021</a>
        </i>
      </ListItem>
      <ListItem
        title="Interesting Bugs Caught by ESLint's no-constant-binary-expression"
        url="/blog/interesting-bugs-caught-by-eslints-no-constant-binary-expression/"
        summaryImage="https://jordaneldredge.com/_next/image/?url=%2Fuploads%2F2024%2Flogic-bug.webp&w=2048&q=75"
        summary="A core ESLint rule which I proposed and contributed. Has caught interesting bugs in many popular JavaScript projects."
      >
        <i>
          <a href="https://news.ycombinator.com/item?id=38196644">
            Hacker News
          </a>
        </i>
      </ListItem>
    </>
  );
}

type Props = React.PropsWithChildren<{
  summaryImage: string | undefined;
  title: string;
  summary: string;
  url: string;
}>;

function ListItem({ children, summaryImage, title, url, summary }: Props) {
  return (
    <>
      <div className="my-4 flex justify-between gap-4">
        <div>
          <h2 className="font-large font-semibold">
            <Link
              className="text-blue-500"
              href={url}
              style={{
                wordBreak: "break-word",
                /* Adds a hyphen where the word breaks, if supported (No Blink) */
                hyphens: "auto",
              }}
            >
              {title}
            </Link>
          </h2>
          <div className="markdown">
            <p>{summary}</p>
            <div className="italic">{children}</div>
          </div>
        </div>
        {summaryImage ? (
          <div className="h-24 md:h-32 aspect-video relative">
            <Link href={url}>
              <Image alt="" fill src={summaryImage} className="object-cover" />
            </Link>
          </div>
        ) : null}
      </div>
      <hr />
    </>
  );
}
