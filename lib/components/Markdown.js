import MyImage from "./MyImage";
import Link from "next/link";
import Tweet from "./Tweet";
import YouTube from "./YouTube";
import AudioElement from "./AudioElement";

import Html from "./Html";
import AniCursor from "./AniCursor";

export default function Markdown({ ast }) {
  return <MarkdownAst node={ast} />;
}

function MarkdownAst({ node }) {
  switch (node.type) {
    case "textDirective":
      switch (node.name) {
        // We don't support any text directives yet, but we want to handle false
        // positives by falling back to text.
        // e.g.: "micro:bit" gets parsed as a textDirective with name "bit".
        default:
          return <>{`:${node.name}`}</>;
      }
    case "leafDirective":
      switch (node.name) {
        case "tweet":
          return <Tweet status={node.attributes.status} />;
        case "youtube": {
          const { token, vertical } = node.attributes;
          if (token == null) {
            throw new Error(
              "Missing attribute `token` from youtube directive.",
            );
          }
          return <YouTube token={token} vertical={vertical || false} />;
        }
        case "animatedCursor":
          return (
            <AniCursor
              url={node.attributes.url}
              selector={node.attributes.selector}
            />
          );
        case "audio":
          return <AudioElement src={node.attributes.src} />;
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
      if (
        node.url.endsWith(".mp3") ||
        node.url.endsWith(".wav") ||
        node.url.endsWith(".ogg")
      ) {
        return <AudioElement src={node.url} />;
      }
      if (node.url.startsWith("/")) {
        return (
          <Link href={node.url}>
            <MarkdownChildren>{node.children}</MarkdownChildren>
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
        `${node.type} nodes should be removed by remark-inline-links`,
      );
    case "image":
      if (node.imageProps) {
        return <MyImage {...node.imageProps} alt={node.alt} />;
      }

      // eslint-disable-next-line @next/next/no-img-element
      return <img src={node.url} alt={node.alt} />;
    case "thematicBreak":
      return <hr />;
    case "break":
      return <br />;
    case "html":
      return <Html html={node.value} />;
    case "blockquote":
      return (
        <blockquote>
          <MarkdownChildren>{node.children}</MarkdownChildren>
        </blockquote>
      );
    case "inlineCode":
      return <code className="inline">{node.value}</code>;
    case "code":
      return (
        <pre className="shiki">
          <div className="code-container">
            <code>{node.value}</code>
          </div>
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
      throw new Error(`Unhandled AST node type: ${node.type}`);
  }
}

function MarkdownChildren({ children }) {
  return children.map((child, i) => {
    return <MarkdownAst node={child} key={i} />;
  });
}
