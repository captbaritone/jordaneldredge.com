"use client";
/* eslint-disable @next/next/no-img-element */

export default function MyImage(props) {
  const { blurDataURL, alt, height, width, src, type, cachedPath } = props;

  const bestSrc = cachedPath || src;

  /*
  const loaded = useImageIsLoaded(bestSrc);
  const currentSrc = loaded ? blurDataURL : bestSrc;
  */

  return <img src={bestSrc} alt={alt} height={height} width={width} />;
}
