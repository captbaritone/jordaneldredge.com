"use client";
import { useContext, useEffect, useState } from "react";
import React from "react";

class AudioState {
  constructor() {
    this._audio = typeof window !== "undefined" ? new window.Audio() : null;
  }

  pause() {
    this._audio.pause();
  }

  resume(src) {
    this._audio.play();
  }

  play(src) {
    this._audio.src = src;
    this._audio.play();
  }

  toggleMute() {
    this._audio.volume = 0;
  }

  setVolume(volume) {
    this._audio.volume = volume;
  }

  setProgressPercent(percent) {
    this._audio.currentTime = (this._audio.duration * percent) / 100;
  }
}

export const AudioContext = React.createContext(null);

export default function AudioContextProvider({ children }) {
  const [state, _] = useState(() => new AudioState());

  return (
    <AudioContext.Provider value={state}>{children}</AudioContext.Provider>
  );
}

export function useAudioContext() {
  return useContext(AudioContext);
}

function useAudioSrc() {
  const audioContext = useContext(AudioContext);
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
      setPlaying(true);
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
  const audioSrc = useAudioSrc();
  const [currentTrack, setCurrentTrack] = useState(null);
  useEffect(() => {
    function handlePlay() {
      setCurrentTrack(audioSrc.src);
    }
    audioSrc.addEventListener("play", handlePlay);
    return () => {
      audioSrc.removeEventListener("play", handlePlay);
    };
  }, [audioSrc]);

  return currentTrack;
}

export function useDuration() {
  const audioSrc = useAudioSrc();

  const [duration, setDuration] = useState(0);
  useEffect(() => {
    if (audioSrc == null) {
      return;
    }
    function handler() {
      setDuration(audioSrc.duration);
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

export function usePercentComplete(audioSrc) {
  const duration = useDuration(audioSrc);
  const currentTime = useCurrentTime(audioSrc);
  return currentTime / duration;
}
