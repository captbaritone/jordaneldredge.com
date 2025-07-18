"use client";
import React, { CSSProperties, useCallback, useState } from "react";
import { unstable_ViewTransition as ViewTransition } from "react";

import {
  FaPlay,
  FaPause,
  FaVolumeUp,
  FaVolumeMute,
  FaVolumeDown,
  FaTimes,
} from "react-icons/fa";
import {
  usePlaying,
  usePercentComplete,
  useCurrentTime,
  useDuration,
  useCurrentTrack,
  useAudioContext,
  useVolume,
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
              {/* <VolumeIcon /> */}
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

function VolumeIcon() {
  const audioState = useAudioContext();
  const volume = useVolume();
  const muted = volume === 0;
  const [showVolume, setShowVolume] = useState(false);
  function handleMouseEnter(e) {
    setShowVolume(true);
    function handleMouseLeave(e) {
      setShowVolume(false);
      e.target.removeEventListener("mouseleave", handleMouseLeave);
    }

    e.target.addEventListener("mouseleave", handleMouseLeave);
  }

  const style: CSSProperties = showVolume
    ? {
        position: "absolute",
        bottom: -20,
        height: 300,
        width: 50,
        backgroundColor: "red",
      }
    : { display: "flex" };

  return (
    <div
      style={{ position: "relative", width: 20 }}
      onMouseEnter={handleMouseEnter}
    >
      <div style={style}>
        <button className="pl-3">
          {muted ? (
            <FaVolumeMute />
          ) : volume < 0.5 ? (
            <FaVolumeDown />
          ) : (
            <FaVolumeUp />
          )}
        </button>
      </div>
      {/*
        <input
          type="range"
          max={100}
          min={0}
          value={volume * 100}
          onChange={(e) => {
            audioState.setVolume(e.target.value / 100);
          }}
          style={{
            display: showVolume ? "hidden" : "inline",
          }}
        />
        */}
    </div>
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
