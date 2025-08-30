import React from "react";
import { Content } from "../../../../../lib/data";
import { SiteUrl } from "../../../../../lib/data/SiteUrl";
import { TagSet } from "../../../../../lib/data/TagSet";
import { notFound } from "next/navigation";
import Link from "next/link";
import ReindexButton from "./ReindexButton";
import { Bytes } from "../../../../../lib/components/Bytes";
import { VC } from "../../../../../lib/VC";

export default async function DebugContent(props) {
  const params = await props.params;
  // Create viewer context
  const vc = await VC.create();
  
  // Check if user can view content debug
  if (!vc.canViewContentDebug()) {
    notFound();
  }
  
  const item = Content.getBySlug(vc, params.slug);
  if (item == null) {
    notFound();
  }

  const audio = item.ttsAudio();

  const { content, metadata, ...rest } = item._item;

  return (
    <div className="markdown pb-4">
      {item.pageType() === "note" && <ReindexButton slug={item.slug()} />}
      <Section title={<>Debug Content ({item.id()})</>}>
        <table>
          <tbody>
            <Row label="ID" value={item.id()} />
            <Row label="Page Type" value={item.pageType()} />
            <Row label="URL" value={<Url url={item.url()} />} />
            <Row label="Canonical URL" value={item.canonicalUrl()} />
            <Row
              label="Markdown URL"
              value={<Url url={item.markdownUrl()} />}
            />
            <Row label="Slug" value={item.slug()} />
            <Row label="Title" value={item.title()} />
            <Row label="Date" value={item.date()} />
            <Row label="Summary" value={item.summary()} />
            <Row label="Summary Image" value={item.summaryImage()} />
            <Row label="Show in lists" value={item.showInLists().toString()} />
            <Row label="Feed ID" value={item.feedId()} />
            <Row label="Filename" value={item.serializedFilename()} />
            <Row label="Tags" value={<Tags tags={item.tagSet()} />} />
            <Row
              label="Comment Issue"
              value={
                item.githubCommentsIssueId() && (
                  <a
                    href={`https://github.com/captbaritone/jordaneldredge.com/issues/${item.githubCommentsIssueId()}`}
                  >
                    #{item.githubCommentsIssueId()}
                  </a>
                )
              }
            />
          </tbody>
        </table>
      </Section>
      <Section title="Metadata">
        <RawObject object={item.metadata()} />
      </Section>
      {audio && (
        <Section title="Audio">
          <table>
            <tbody>
              <Row label="Audio URL" value={audio.url()} />
              <Row label="Vanity URL" value={<Url url={audio.vanityUrl()} />} />
              <Row
                label="Byte Length"
                value={<Bytes bytes={audio.byteLength()} />}
              />
              <Row
                label="Last Updated"
                value={new Date(audio.lastUpdated()).toUTCString()}
              />
            </tbody>
          </table>
        </Section>
      )}
      <Section title="Content">
        <pre className="overflow-auto text-wrap text-xs">
          {item.content().markdownString()}
        </pre>
      </Section>
      <Section title="Raw Content DB Row">
        <p>
          <em>Content and Metadata have been omitted</em>
        </p>
        <RawObject object={rest} />
      </Section>
    </div>
  );
}

function Section({ children, title }) {
  return (
    <div>
      <h2>{title}</h2>
      {children}
    </div>
  );
}

function RawObject({ object }: { object: Object }) {
  const entries = Object.entries(object);
  if (entries.length === 0) {
    return <em>Empty</em>;
  }
  return (
    <table>
      <tbody>
        {entries.map(([key, value]) => {
          return (
            <tr key={key}>
              <td>{key}</td>
              <td>{value}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function Url({ url }: { url: SiteUrl }) {
  if (url == null) {
    return "<none>";
  }
  return <Link href={{ pathname: url.path() }}>{url.path()}</Link>;
}

function Tags({ tags }: { tags: TagSet }) {
  return (
    <Join separator={", "}>
      {tags.tags().map((tag, i) => {
        return (
          <Link key={i} href={{ pathname: tag.url().path() }}>
            {tag.name()}
          </Link>
        );
      })}
    </Join>
  );
}

function Join({ children, separator }) {
  const childrenArray = React.Children.toArray(children);
  return (
    <>
      {childrenArray.map((child, index) => (
        <React.Fragment key={index}>
          {child}
          {index < childrenArray.length - 1 && separator}
        </React.Fragment>
      ))}
    </>
  );
}

function Row({ label, value }) {
  return (
    <tr>
      <td>{label}</td>
      <td>{value ?? "<none>"}</td>
    </tr>
  );
}
