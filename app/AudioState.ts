"use client";

export class AudioState extends EventTarget {
  _audio: HTMLAudioElement | null;
  _url: null | string = null;
  constructor() {
    super();
    if (typeof window !== "undefined") {
      this._audio = new window.Audio();
    } else {
      this._audio = null;
    }
  }

  audio() {
    if (!this._audio) {
      throw new Error("Audio is not available");
    }
    return this._audio;
  }

  url() {
    return this._url;
  }

  pause() {
    this.audio().pause();
  }

  resume(): Promise<void> {
    return this.audio().play();
  }

  play(src: string): Promise<void> {
    this.audio().src = src;
    this._url = src;
    this.dispatchEvent(new CustomEvent("urlchange"));
    return this.audio().play();
  }

  stop() {
    this.audio().pause();
    this._url = null;
    this.dispatchEvent(new CustomEvent("urlchange"));
  }

  toggleMute() {
    this.audio().volume = 0;
  }

  setVolume(volume: number) {
    this.audio().volume = volume;
  }

  setProgressPercent(percent: number) {
    this.audio().currentTime = this.audio().duration * percent;
  }
}
