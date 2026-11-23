import Image from "next/image";
import { THUMBNAIL_SIZES } from "./thumbnail";
import { ImageViewTransition } from "./ViewTransitions";

type Props = {
  src: string;
  poster: string;
  thumbnail?: string;
  width: number;
  height: number;
};

/**
 * A video file whose dimensions and poster frame we found while indexing. It
 * uses the same box as a YouTube embed, so a portrait video is laid out like a
 * YouTube Short.
 *
 * Like `YouTubeEmbed`, the list thumbnail is rendered underneath with the same
 * props the list uses, so the thumbnail morphs into it during navigation and
 * comes from the browser cache. For a portrait video that's the 4:3 framed
 * thumbnail, which `object-cover` crops to its sharp middle, just as the
 * YouTube embed does with a Short's thumbnail. The video sits on top,
 * transparent until its own poster has loaded.
 */
export default function VideoEmbed({
  src,
  poster,
  thumbnail = poster,
  width,
  height,
}: Props) {
  const vertical = height > width;
  return (
    <div className={`video-container ${vertical ? "vertical" : "horizontal"}`}>
      <ImageViewTransition id={thumbnail}>
        <span className="youtube-video block">
          <Image
            alt=""
            fill
            loading="eager"
            sizes={THUMBNAIL_SIZES}
            src={thumbnail}
            className="object-cover"
          />
          <video
            className="youtube-video"
            controls
            playsInline
            preload="metadata"
            poster={poster}
            src={src}
          >
            <a href={src}>Download the video</a>
          </video>
        </span>
      </ImageViewTransition>
    </div>
  );
}
