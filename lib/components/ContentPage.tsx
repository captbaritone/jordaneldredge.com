import Markdown from "./Markdown";
import * as Data from "../data";
import RelatedContent from "./RelatedContent";
import GitHubComments from "./GitHubComments";
import DateString from "./DateString";
import PlayButton from "./PlayButton";
import Link from "next/link";
import {
  ContentDateViewTransition,
  ContentTileViewTransition,
} from "./ViewTransitions";
import { VC } from "../VC";
import { Metadata } from "next";

type ContentPageProps = {
  item: Data.Content;
  issueId?: string;
  vc: VC;
};

export function contentMetadata(content: Data.Content): Metadata {
  const summaryImage = content.summaryImage();
  return {
    title: content.title(),
    description: content.summary() || content.title(),
    twitter: {
      title: content.title(),
      images: summaryImage ? [{ url: summaryImage }] : [],
      description: content.summary() || content.title(),
    },
    openGraph: {
      url: content.url().fullyQualified(),
      title: content.title(),
      images: summaryImage ? [{ url: summaryImage }] : [],
      type: "article",
    },
    alternates: {
      canonical: content.canonicalUrl() || null,
    },
  };
}

export default async function ContentPage({
  item,
  issueId,
  vc,
}: ContentPageProps) {
  const content = item.content();
  const audio = item.ttsAudio();
  const ast = await content.ast();
  return (
    <div>
      <article>
        <div className="markdown">
          <ContentTileViewTransition id={item.id()}>
            <h1>{item.title()}</h1>
          </ContentTileViewTransition>
          <div
            className="flex flex-row text-sm  text-gray-400"
            style={{
              marginTop: "-1.4rem",
              marginBottom: "1rem",
            }}
          >
            <ContentDateViewTransition id={item.id()}>
              <div className="italic">
                <DateString date={item.dateObj()} />
              </div>
            </ContentDateViewTransition>
            {audio && (
              <>
                <div className="pl-2 pr-2">{"|"}</div>
                <PlayButton
                  audioUrl={audio.vanityUrl().path()}
                  title="Play an AI generated audio reading of this content."
                />
              </>
            )}
            {vc.canViewContentDebug() && (
              <>
                <div className="pl-2 pr-2">{"|"}</div>
                <Link href={{ pathname: item.debugUrl().path() }}>Debug</Link>
              </>
            )}
          </div>
          <Markdown ast={ast} />
        </div>
      </article>
      {issueId && <GitHubComments issue={issueId} />}
      <RelatedContent item={item} />
    </div>
  );
}
