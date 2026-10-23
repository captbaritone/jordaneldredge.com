import { keyForYoutubeThumbnail } from "../data/providers/providerUtils";
import { keyUrl } from "../s3";
import { ImageViewTransition } from "./ViewTransitions";
import YouTubeEmbed from "./YouTubeEmbed";

export default function YouTube({ token, vertical = false }) {
  const summaryImage = keyUrl(keyForYoutubeThumbnail(token));
  return (
    <div className={`video-container ${vertical ? "vertical" : "horizontal"}`}>
      <ImageViewTransition id={summaryImage}>
        <YouTubeEmbed token={token} summaryImage={summaryImage} />
      </ImageViewTransition>
    </div>
  );
}
