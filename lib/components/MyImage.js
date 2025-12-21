"use client";
/* eslint-disable @next/next/no-img-element */

export default function MyImage(props) {
  const { blurDataURL: _blurDataURL, alt, height, width, src, type: _type, cachedPath } = props;

  const bestSrc = cachedPath || src;

  /*
  const loaded = useImageIsLoaded(bestSrc);
  const currentSrc = loaded ? blurDataURL : bestSrc;
  */

  return <img src={bestSrc} alt={alt} height={height} width={width} />;
}
