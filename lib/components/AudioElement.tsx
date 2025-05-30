"use client";
import React from "react";
import { FaPlay, FaPause, FaDownload } from "react-icons/fa";
import {
  useAudioContext,
  usePlaying,
  useCurrentTrack,
} from "../../app/AudioContext";

export default function AudioPlayer({ src }) {
  const audioContext = useAudioContext();
  const currentTrack = useCurrentTrack();
  const playing = usePlaying();
  const isPlaying = currentTrack?.endsWith(src) && playing;
  const bgColor = isPlaying ? "bg-gray-200" : "bg-gray-100";
  return (
    <div
      className={`${bgColor} rounded-xl px-2 py-3 flex items-center my-4 -mx-4 text-sm`}
    >
      {isPlaying ? (
        <button
          className="px-3 text-xl"
          onClick={() => audioContext.pause()}
          title="Pause"
        >
          <FaPause />
        </button>
      ) : (
        <button
          className="px-3 text-xl"
          onClick={() => audioContext.play(src)}
          title="Play"
        >
          <FaPlay />
        </button>
      )}

      <div style={{ flexGrow: 1 }}>{getFilenameFromUrl(src)}</div>
      <a className="px-3 text-xl" title="Download" href={src} download>
        <FaDownload />
      </a>
    </div>
  );
}

function getFilenameFromUrl(url) {
  return url.split("/").pop();
}
