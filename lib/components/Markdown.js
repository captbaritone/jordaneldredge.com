import MyImage from "./MyImage";
import Link from "next/link";
import Tweet from "./Tweet";
import YouTube from "./YouTube";
import AudioElement from "./AudioElement";

import Html from "./Html";
import AniCursor from "./AniCursor";
import Image from "next/image";

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
      // The audio element has <div>s in it, which will cause hydration issues
      // if nested within a <p> tag, so we check here and hoist the audio
      // element out of the <p> tag if it is the only child.
      if (node.children.length === 1 && isAudioLink(node.children)) {
        return <AudioElement src={node.children[0].url} />;
      }
      return (
        <p>
          <MarkdownChildren>{node.children}</MarkdownChildren>
        </p>
      );

    case "text":
      return node.value;
    case "link": {
      if (isAudioLink(node)) {
        return <AudioElement src={node.url} />;
      }
      const url = node.url.replace(/^https:\/\/jordaneldredge\.com/i, "");
      if (url.startsWith("/")) {
        return (
          <Link href={{ pathname: url }}>
            <MarkdownChildren>{node.children}</MarkdownChildren>
          </Link>
        );
      }
      return (
        <a href={url}>
          <MarkdownChildren>{node.children}</MarkdownChildren>
        </a>
      );
    }

    case "linkReference":
    case "imageReference":
    case "definition":
      return null;
      throw new Error(
        `${node.type} nodes should be removed by remark-inline-links`,
      );
    case "image":
      if (node.imageProps) {
        return (
          <Image
            src={node.url}
            alt={node.alt}
            width={node.imageProps.width}
            height={node.imageProps.height}
          />
        );
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
    case "delete":
      return (
        <del>
          <MarkdownChildren>{node.children}</MarkdownChildren>
        </del>
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
      const id = getHeadingId(node);
      const children = (
        <>
          <MarkdownChildren>{node.children}</MarkdownChildren>{" "}
          <AnchorLink id={id} />
        </>
      );
      switch (node.depth) {
        case 1:
          return <h1 id={id}>{children}</h1>;
        case 2:
          return <h2 id={id}>{children}</h2>;
        case 3:
          return <h3 id={id}>{children}</h3>;
        case 4:
          return <h4 id={id}>{children}</h4>;
        case 5:
          return <h5 id={id}>{children}</h5>;
        case 6:
          return <h6 id={id}>{children}</h6>;

        default:
          throw new Error(`Unhandled heading depth: ${node.depth}`);
      }
    }
    case "table": {
      return <MarkdownTable node={node} />;
    }
    default:
      throw new Error(`Unhandled AST node type: ${node.type}`);
  }
}

function MarkdownTable({ node }) {
  const [headerNode, ...rows] = node.children;
  return (
    <table>
      <thead>
        <tr>
          {headerNode.children.map((row, i) => (
            <th key={i}>
              <MarkdownChildren>{row.children}</MarkdownChildren>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i}>
            {row.children.map((cell, i) => (
              <td key={i}>
                <MarkdownChildren>{cell.children}</MarkdownChildren>
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function MarkdownChildren({ children }) {
  return children.map((child, i) => {
    return <MarkdownAst node={child} key={i} />;
  });
}

function AnchorLink({ id }) {
  if (!id) {
    return null;
  }
  return (
    <a href={`#${id}`} className="anchor-link">
      #
    </a>
  );
}

function getHeadingId(node) {
  if (node.children.length === 1 && node.children[0].type === "text") {
    const text = node.children[0].value;
    return text.replace(/[^a-zA-Z0-9]+/g, "-").toLowerCase();
  }
  return null;
}

function isAudioLink(node) {
  return (
    node.type === "link" &&
    (node.url.endsWith(".mp3") ||
      node.url.endsWith(".wav") ||
      node.url.endsWith(".ogg"))
  );
}
