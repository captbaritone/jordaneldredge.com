"use client";
import { useContext, useEffect, useState } from "react";
import React from "react";

class AudioState extends EventTarget {
  _url = null;
  constructor() {
    super();
    this._audio = typeof window !== "undefined" ? new window.Audio() : null;
  }

  url() {
    return this._url;
  }

  pause() {
    this._audio.pause();
  }

  resume() {
    this._audio.play();
  }

  play(src) {
    this._audio.src = src;
    this._url = src;
    this.dispatchEvent(new CustomEvent("urlchange"));
    this._audio.play();
  }

  stop() {
    this._audio.pause();
    this._url = null;
    this.dispatchEvent(new CustomEvent("urlchange"));
  }

  toggleMute() {
    this._audio.volume = 0;
  }

  setVolume(volume) {
    this._audio.volume = volume;
  }

  setProgressPercent(percent) {
    this._audio.currentTime = this._audio.duration * percent;
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
  const audioContext = useContext(AudioContext);
  const audioSrc = audioContext._audio;
  const [currentTrack, setCurrentTrack] = useState(null);
  useEffect(() => {
    function handlePlay() {
      setCurrentTrack(audioContext.url());
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
    const d = audioSrc.duration;
    return Number.isNaN(d) ? 0 : d;
  });
  useEffect(() => {
    if (audioSrc == null) {
      return;
    }
    function handler() {
      const d = audioSrc.duration;
      setDuration(Number.isNaN(d) ? 0 : d);
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
