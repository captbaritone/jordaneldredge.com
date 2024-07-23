"use client";
/* eslint-disable @next/next/no-img-element */
import { useState, useEffect } from "react";

function preloadImg(url) {
  return new Promise((resolve, reject) => {
    let img = document.createElement("img");
    function load() {
      resolve();
      cleanup();
    }
    function error() {
      reject();
      cleanup();
    }
    function cleanup() {
      img.removeEventListener("load", load);
      img.removeEventListener("error", error);
      img = null;
    }
    img.addEventListener("load", load);
    img.addEventListener("error", error);
    img.src = url;
  });
}

function useImageIsLoaded(url) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let disposed = false;
    preloadImg(url)
      .then(() => {
        if (!disposed) {
          setLoaded(true);
        }
      })
      .catch(() => {
        if (!disposed) {
          setLoaded(false);
        }
      });
    return () => {
      disposed = true;
    };
  }, [url]);

  return loaded;
}

export default function MyImage(props) {
  const { blurDataURL, alt, height, width, src, type, cachedPath } = props;

  const bestSrc = cachedPath || src;

  /*
  const loaded = useImageIsLoaded(bestSrc);
  const currentSrc = loaded ? blurDataURL : bestSrc;
  */

  return <img src={bestSrc} alt={alt} height={height} width={width} />;
}
