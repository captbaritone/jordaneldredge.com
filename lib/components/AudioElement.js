"use client";
import React from "react";
import { FaPlay, FaPause, FaDownload } from "react-icons/fa";
import {
  AudioContext,
  usePlaying,
  useCurrentTrack,
} from "../../app/AudioContext";

export default function AudioPlayer({ src }) {
  const audioContext = React.useContext(AudioContext);
  const currentTrack = useCurrentTrack();
  const playing = usePlaying();
  const isPlaying = currentTrack?.endsWith(src) && playing;
  return (
    <div
      style={{
        width: "100%",
        backgroundColor: "lightgrey",
        borderRadius: 15,
        padding: "10px",
        margin: "10px 0px",
        display: "flex",
        alignItems: "center",
      }}
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
  return (
    <audio src={src} type="audio/mp3" controls="controls" preload="none" />
  );
}

function getFilenameFromUrl(url) {
  return url.split("/").pop();
}
