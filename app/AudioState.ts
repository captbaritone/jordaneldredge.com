"use client";

export class AudioState extends EventTarget {
  _audio: HTMLAudioElement;
  _url: null | string = null;
  constructor() {
    super();
    if (typeof window === "undefined") {
      throw new Error("AudioState can only be used in a browser environment");
    }
    this._audio = new window.Audio();
  }

  url() {
    return this._url;
  }

  pause() {
    this._audio.pause();
  }

  resume(): Promise<void> {
    return this._audio.play();
  }

  play(src: string): Promise<void> {
    this._audio.src = src;
    this._url = src;
    this.dispatchEvent(new CustomEvent("urlchange"));
    return this._audio.play();
  }

  stop() {
    this._audio.pause();
    this._url = null;
    this.dispatchEvent(new CustomEvent("urlchange"));
  }

  toggleMute() {
    this._audio.volume = 0;
  }

  setVolume(volume: number) {
    this._audio.volume = volume;
  }

  setProgressPercent(percent: number) {
    this._audio.currentTime = this._audio.duration * percent;
  }
}
