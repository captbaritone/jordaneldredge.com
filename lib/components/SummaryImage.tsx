"use client";
import Image from "next/image";
import { useState } from "react";
import { THUMBNAIL_SIZES } from "./thumbnail";

type Props = {
  src: string;
  alt: string;
  width: number;
  height: number;
  unoptimized: boolean;
};

/**
 * An article's copy of its summary image, which the list thumbnail morphs into
 * during navigation. The full-size image is rarely loaded by the time the view
 * transition snapshots the new page, so the morph would land on an empty box.
 *
 * Behind it we render the thumbnail with the same props the list used, so the
 * browser resolves the same URL and serves it from cache. The full image
 * covers it once it loads, and the thumbnail is then removed so it can't show
 * through transparent images.
 */
export default function SummaryImage({
  src,
  alt,
  width,
  height,
  unoptimized,
}: Props) {
  const [loaded, setLoaded] = useState(false);
  return (
    <span className="relative block">
      {loaded ? null : (
        <Image
          aria-hidden
          alt=""
          fill
          loading="eager"
          sizes={THUMBNAIL_SIZES}
          src={src}
          className="object-cover"
        />
      )}
      <Image
        priority={true}
        unoptimized={unoptimized}
        src={src}
        alt={alt}
        width={width}
        height={height}
        className="relative"
        onLoad={() => setLoaded(true)}
      />
    </span>
  );
}
