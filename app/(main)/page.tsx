import Link from "next/link";
import Image from "next/image";

export const metadata = {
  title: "About / Jordan Eldredge",
  description: "About Jordan Eldredge",
  openGraph: {
    siteName: "Jordan Eldredge",
    locale: "en_US",
    title: "About / Jordan Eldredge",
  },
  twitter: {
    creator: "@captbaritone",
    title: "About / Jordan Eldredge",
  },
  alternates: {
    types: {
      "application/rss+xml": "/feed/rss.xml",
    },
  },
};

export default async function Page() {
  return (
    <article>
      <div className="markdown">
        <h1>About</h1>
        <div className="headshot">
          <Image
            src="/images/avatar.jpg"
            className="shadow-xl rounded-xl"
            alt="Jordan Eldredge with his daughter"
            width={400}
            height={400}
          />
        </div>
        <p>
          Hello! My name is Jordan Eldredge. I am a programmer and musician
          living in the San Francisco Bay Area with my wife{" "}
          <a href="http://chelseahollow.com">Chelsea Hollow</a> and awesome
          daughter.
        </p>
        <h2>Programming</h2>
        <p>
          I've been writing software as a hobby since I was in high school.
          After college, it{" "}
          <Link href="/notes/opera-to-tech/">evolved naturally</Link> into a
          career. Since about 2009 I have been a full-time engineer. I currently
          work at Meta on the <a href="https://relay.dev/">Relay</a> team. Check
          out my <Link href="/projects">projects</Link> page or{" "}
          <a href="https://github.com/captbaritone">GitHub profile</a>.
        </p>
        <h2>Singing</h2>
        <p>
          I graduated from San Francisco State University with a Bachelors in
          Music and enjoyed a busy semi-professional singing schedule for many
          years. I've since chosen to focus more on software, but information
          about my singing can still be found on my{" "}
          <Link href="/singer">singer page</Link> or posts tagged with{" "}
          <Link href="/tag/music/">#music</Link>.
        </p>
      </div>
    </article>
  );
}
