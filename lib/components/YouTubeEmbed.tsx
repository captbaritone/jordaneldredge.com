"use client";
import Image from "next/image";
import { useState, useSyncExternalStore } from "react";
import { THUMBNAIL_SIZES } from "./thumbnail";

type Props = {
  token: string;
  summaryImage: string;
};

/**
 * A YouTube embed that shows its thumbnail until the player has loaded.
 *
 * The list thumbnail morphs into this element during navigation. The player
 * paints black while it loads, so the morph used to land on a black box.
 * Instead the thumbnail sits underneath, rendered with the same props the list
 * used so it comes from the browser cache, and the iframe fades in over it once
 * it loads.
 *
 * The iframe is only mounted on the client: if it were server rendered it
 * could finish loading before hydration, its onLoad would never fire, and it
 * would stay hidden. Without JavaScript the thumbnail links to the video.
 */
export default function YouTubeEmbed({ token, summaryImage }: Props) {
  // False while server rendering and hydrating, true after.
  const mounted = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
  const [loaded, setLoaded] = useState(false);
  return (
    <span className="youtube-video block">
      <a
        href={`https://www.youtube.com/watch?v=${token}`}
        tabIndex={mounted ? -1 : undefined}
        aria-hidden={mounted ? true : undefined}
      >
        <Image
          alt="Watch on YouTube"
          fill
          loading="eager"
          sizes={THUMBNAIL_SIZES}
          src={summaryImage}
          className="object-cover"
        />
      </a>
      {mounted ? (
        <iframe
          src={`https://www.youtube.com/embed/${token}`}
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="youtube-video"
          style={{ opacity: loaded ? 1 : 0, transition: "opacity 200ms" }}
          onLoad={() => setLoaded(true)}
        ></iframe>
      ) : null}
    </span>
  );
}

function noopSubscribe() {
  return () => {};
}
