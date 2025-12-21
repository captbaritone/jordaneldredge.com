"use client";
import { startTransition, useContext, useEffect, useState } from "react";
import React from "react";
import { AudioState } from "./AudioState";

const AudioContext = React.createContext<AudioState | null>(null);

export default function AudioContextProvider({ children }) {
  const [state, _setState] = useState(() => new AudioState());

  return (
    <AudioContext.Provider value={state}>{children}</AudioContext.Provider>
  );
}

export function useAudioContext(): AudioState {
  const state = useContext(AudioContext);
  if (!state) {
    throw new Error(
      "useAudioContext must be used within an AudioContextProvider",
    );
  }
  return state;
}

function useAudioSrc(): HTMLAudioElement {
  const audioContext = useAudioContext();
  return audioContext._audio;
}

export function useVolume() {
  const audioSrc = useAudioSrc();
  const [volume, setVolume] = useState(1);
  useEffect(() => {
    function handler() {
      setVolume(audioSrc.volume);
    }
    audioSrc.addEventListener("volumechange", handler);
    return () => {
      audioSrc.removeEventListener("volumechange", handler);
    };
  }, [audioSrc]);
  return volume;
}

export function usePlaying() {
  const audioSrc = useAudioSrc();
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    function handlePlay() {
      startTransition(() => {
        setPlaying(true);
      });
    }
    function handlePause() {
      setPlaying(false);
    }
    audioSrc.addEventListener("play", handlePlay);
    audioSrc.addEventListener("pause", handlePause);
    return () => {
      audioSrc.removeEventListener("play", handlePlay);
      audioSrc.removeEventListener("pause", handlePause);
    };
  }, [audioSrc]);
  return playing;
}

export function useCurrentTrack() {
  const audioContext = useAudioContext();
  const audioSrc = audioContext._audio;
  const [currentTrack, setCurrentTrack] = useState<string | null>(null);
  useEffect(() => {
    function handlePlay() {
      startTransition(() => {
        setCurrentTrack(audioContext.url());
      });
    }
    audioContext.addEventListener("urlchange", handlePlay);
    return () => {
      audioContext.removeEventListener("urlchange", handlePlay);
    };
  }, [audioSrc, audioContext]);

  return currentTrack;
}

export function useDuration() {
  const audioSrc = useAudioSrc();

  const [duration, setDuration] = useState(() => {
    // Need to handle the case that the audioSrc is null
    // during server rendering.
    const d = audioSrc?.duration;
    return Number.isNaN(d) ? 0 : d;
  });
  useEffect(() => {
    if (audioSrc == null) {
      return;
    }
    function handler() {
      const d = audioSrc.duration;
      startTransition(() => {
        setDuration(Number.isNaN(d) ? 0 : d);
      });
    }
    audioSrc.addEventListener("durationchange", handler);
    return () => {
      audioSrc.removeEventListener("durationchange", handler);
    };
  }, [audioSrc]);
  return duration;
}

export function useCurrentTime() {
  const audioSrc = useAudioSrc();
  const [currentTime, setCurrentTime] = useState(0);
  useEffect(() => {
    if (audioSrc == null) {
      return;
    }
    function handler() {
      setCurrentTime(audioSrc.currentTime);
    }
    audioSrc.addEventListener("timeupdate", handler);
    return () => {
      audioSrc.removeEventListener("timeupdate", handler);
    };
  }, [audioSrc]);
  return currentTime;
}

export function usePercentComplete() {
  const duration = useDuration();
  const currentTime = useCurrentTime();
  return currentTime / duration;
}
