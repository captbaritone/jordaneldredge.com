import { keyForYoutubeThumbnail } from "../data/providers/providerUtils";
import { keyUrl } from "../s3";
import { ImageViewTransition } from "./ViewTransitions";

export default function YouTube({ token, vertical = false }) {
  const summaryImage = keyUrl(keyForYoutubeThumbnail(token));
  return (
    <div className={`video-container ${vertical ? "vertical" : "horizontal"}`}>
      <ImageViewTransition id={summaryImage}>
        <iframe
          src={`https://www.youtube.com/embed/${token}`}
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="youtube-video"
        ></iframe>
      </ImageViewTransition>
    </div>
  );
}
