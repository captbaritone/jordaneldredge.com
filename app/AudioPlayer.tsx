"use client";
import React, { useCallback } from "react";
import { ViewTransition } from "react";

import {
  FaPlay,
  FaPause,
  FaTimes,
} from "react-icons/fa";
import {
  usePlaying,
  usePercentComplete,
  useCurrentTime,
  useDuration,
  useCurrentTrack,
  useAudioContext,
} from "./AudioContext";

function getFilenameFromUrl(url) {
  return url.split("/").pop();
}

// Returns time in the format of "mm:ss" with padded zeros
function formatSeconds(sec: number) {
  return new Date(sec * 1000).toISOString().substr(14, 5);
}

export default function AudioPlayer() {
  const audioState = useAudioContext();
  const playing = usePlaying();
  const currentTime = useCurrentTime();
  const duration = useDuration();
  const currentTrack = useCurrentTrack();
  if (currentTrack == null || duration === 0 || currentTrack === "") {
    return null;
  }
  return (
    <ViewTransition enter="slide-up" exit="slide-down">
      <div
        style={{
          position: "fixed",
          width: "100%",
          bottom: 0,
          borderTop: "1px solid lightgrey",
          background: "white",
        }}
      >
        <div className="max-w-2xl mx-auto p-3 text-sm">
          <div className="flex align items-center">
            <div className="flex flex-row align items-center w-full">
              <button
                className="pr-3"
                onClick={() => {
                  if (playing) {
                    audioState.pause();
                  } else {
                    audioState.resume();
                  }
                }}
              >
                {playing ? <FaPause title="Pause" /> : <FaPlay title="Play" />}
              </button>
              <div className="whitespace-nowrap font-mono">
                {formatSeconds(currentTime)}
              </div>
              <Progress />
              <div className="whitespace-nowrap font-mono">
                {formatSeconds(duration)}
              </div>
            </div>
            <div className="whitespace-nowrap pl-5">
              {currentTrack && getFilenameFromUrl(currentTrack)}
            </div>
            {
              <button className="pl-3" onClick={() => audioState.stop()}>
                <FaTimes />
              </button>
            }
          </div>
        </div>
      </div>
    </ViewTransition>
  );
}


function Progress() {
  const percentComplete = usePercentComplete();
  const audioState = useAudioContext();

  const handleClick = useCallback(
    (e) => {
      if (audioState == null) {
        return;
      }
      const { width, left } = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - left;
      const percent = x / width;
      audioState.setProgressPercent(percent);
    },
    [audioState],
  );
  return (
    <div className="px-2 w-full">
      <div className="py-2" onClick={handleClick}>
        <div
          style={{
            width: "100%",
            height: 3,
            borderTop: 10,
            borderBottom: 10,
            backgroundColor: "lightgrey",
          }}
        >
          <div
            style={{
              width: `${percentComplete * 100}%`,
              height: "100%",
              backgroundColor: "black",
            }}
          />
        </div>
      </div>
    </div>
  );
}
