import MyImage from "./MyImage";
import Link from "next/link";
import Tweet from "./Tweet";
import YouTube from "./YouTube";
import AudioElement from "./AudioElement";

import Html from "./Html";
import AniCursor from "./AniCursor";

// Regex matching Youtube URLs and extracting the token
const YOUTUBE_REGEX =
  /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?(.+)/;

export default function Markdown({ ast, options = { expandYoutube: false } }) {
  return <MarkdownAst node={ast} options={options} />;
}

function MarkdownAst({ node, options }) {
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
          const { token } = node.attributes;
          if (token == null) {
            throw new Error(
              "Missing attribute `token` from youtube directive."
            );
          }
          return <YouTube token={token} />;
        }
        case "animatedCursor":
          return (
            <AniCursor
              url={node.attributes.url}
              selector={node.attributes.selector}
            />
          );
        case "audio":
          // return <AudioElement src={node.attributes.src} />;
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
      return (
        <MarkdownChildren options={options}>{node.children}</MarkdownChildren>
      );
    }
    case "paragraph":
      if (node.children.length === 1 && node.children[0].type === "link") {
        const linkNode = node.children[0];
        if (options.expandYoutube && YOUTUBE_REGEX.test(linkNode.url)) {
          const [, token] = YOUTUBE_REGEX.exec(linkNode.url);
          return <YouTube token={token} />;
        }
      }

      return (
        <p>
          <MarkdownChildren options={options}>{node.children}</MarkdownChildren>
        </p>
      );

    case "text":
      return node.value;
    case "link":
      if (node.url.startsWith("/")) {
        return (
          <Link href={node.url}>
            <MarkdownChildren options={options}>
              {node.children}
            </MarkdownChildren>
          </Link>
        );
      }
      return (
        <a href={node.url}>
          <MarkdownChildren options={options}>{node.children}</MarkdownChildren>
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
          <MarkdownChildren options={options}>{node.children}</MarkdownChildren>
        </blockquote>
      );
    case "inlineCode":
      return <code>{node.value}</code>;
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
          <MarkdownChildren options={options}>{node.children}</MarkdownChildren>
        </strong>
      );
    case "emphasis":
      return (
        <em>
          <MarkdownChildren options={options}>{node.children}</MarkdownChildren>
        </em>
      );
    case "list": {
      const children = (
        <MarkdownChildren options={options}>{node.children}</MarkdownChildren>
      );
      if (node.ordered) {
        return <ol>{children}</ol>;
      } else {
        return <ul>{children}</ul>;
      }
    }
    case "listItem":
      return (
        <li>
          <MarkdownChildren options={options}>{node.children}</MarkdownChildren>
        </li>
      );
    case "heading": {
      const children = (
        <MarkdownChildren options={options}>{node.children}</MarkdownChildren>
      );
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

function MarkdownChildren({ children, options }) {
  return children.map((child, i) => {
    return <MarkdownAst node={child} options={options} key={i} />;
  });
}
