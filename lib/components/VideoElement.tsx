"use client";
import React from "react";

type VideoElementProps = {
  src: string;
};

export default function VideoElement({ src }: VideoElementProps) {
  return (
    <div className="my-4 -mx-4">
      <video
        controls
        style={{
          maxWidth: "100%",
          height: "auto",
          borderRadius: "0.5rem",
        }}
        preload="metadata"
      >
        <source src={src} />
        Your browser does not support the video tag.
      </video>
    </div>
  );
}
