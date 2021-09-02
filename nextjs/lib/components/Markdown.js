import Image from "next/image";
import Link from "next/link";
import { Tweet } from "react-twitter-widgets";
import { useEffect, useState } from "react";

function AniCursor({ url, selector }) {
  const [css, setCss] = useState(null);
  useEffect(() => {
    const binaryPromise = fetch(url).then((response) => response.arrayBuffer());
    const aniCursorPromise = import("ani-cursor");
    Promise.all([binaryPromise, aniCursorPromise]).then(
      ([binary, aniCursor]) => {
        const data = new Uint8Array(binary);

        setCss(aniCursor.convertAniBinaryToCSS(selector, data));
      }
    );
  }, [url, selector]);

  useEffect(() => {
    const style = document.createElement("style");
    style.innerText = css;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, [css]);
  return null;
}

export default function Markdown({ ast }) {
  return <MarkdownAst node={ast} />;
}

function MarkdownAst({ node }) {
  switch (node.type) {
    case "leafDirective":
      switch (node.name) {
        case "tweet":
          return <Tweet tweetId={node.attributes.status} />;
        case "youtube":
          return (
            <div className="video-container">
              <iframe
                src={`https://www.youtube.com/embed/${node.attributes.token}?modestbranding=1&rel=0`}
                frameBorder="0"
                allowFullScreen
                className="youtube-video"
              ></iframe>
            </div>
          );
        case "animatedCursor":
          return (
            <AniCursor
              url={node.attributes.url}
              selector={node.attributes.selector}
            />
          );
        case "audio":
          return (
            <audio
              src={node.attributes.src}
              type="audio/mp3"
              controls="controls"
              preload="none"
            />
          );

        default:
          throw new Error(`Unknown directive: ${node.name}`);
      }
    case "root": {
      return <MarkdownChildren>{node.children}</MarkdownChildren>;
    }
    case "paragraph":
      return (
        <p>
          <MarkdownChildren>{node.children}</MarkdownChildren>
        </p>
      );

    case "text":
      return node.value;
    case "link":
      if (node.url.startsWith("/")) {
        return (
          <Link href={node.url} as="a">
            <MarkdownChildren>{node.children}</MarkdownChildren>
          </Link>
        );
        return (
          <Link href={node.url} as="a">
            <a>
              <MarkdownChildren>{node.children}</MarkdownChildren>
            </a>
          </Link>
        );
      }
      return (
        <a href={node.url}>
          <MarkdownChildren>{node.children}</MarkdownChildren>
        </a>
      );

    case "linkReference":
    case "imageReference":
    case "definition":
      throw new Error(
        `${node.type} nodes should be removed by remark-inline-links`
      );
    case "image":
      if (node.imageProps) {
        return <Image {...node.imageProps} placeholder="blur" alt={node.alt} />;
      }

      return <img src={node.url} alt={node.alt} />;
    case "thematicBreak":
      return <hr />;
    case "break":
      return <br />;
    case "html":
      return <span dangerouslySetInnerHTML={{ __html: node.value }} />;
    case "blockquote":
      return (
        <blockquote>
          <MarkdownChildren>{node.children}</MarkdownChildren>
        </blockquote>
      );
    case "inlineCode":
      return <code>{node.value}</code>;
    case "code":
      return (
        <pre>
          <code>{node.value}</code>
        </pre>
      );
    case "strong":
      return (
        <strong>
          <MarkdownChildren>{node.children}</MarkdownChildren>
        </strong>
      );
    case "emphasis":
      return (
        <em>
          <MarkdownChildren>{node.children}</MarkdownChildren>
        </em>
      );
    case "list": {
      const children = <MarkdownChildren>{node.children}</MarkdownChildren>;
      if (node.ordered) {
        return <ol>{children}</ol>;
      } else {
        return <ul>{children}</ul>;
      }
    }
    case "listItem":
      return (
        <li>
          <MarkdownChildren>{node.children}</MarkdownChildren>
        </li>
      );
    case "heading": {
      const children = <MarkdownChildren>{node.children}</MarkdownChildren>;
      switch (node.depth) {
        case 1:
          return <h1>{children}</h1>;
        case 2:
          return <h2>{children}</h2>;
        case 3:
          return <h3>{children}</h3>;
        case 4:
          return <h4>{children}</h4>;

        default:
          throw new Error(`Unhandled heading depth: ${node.depth}`);
      }
    }
    default:
      console.log(node);
      throw new Error(`Unhandled AST node type: ${node.type}`);
  }
}

function MarkdownChildren({ children }) {
  return children.map((child, i) => {
    return <MarkdownAst node={child} key={i} />;
  });
}
