"use client";
import { FaPauseCircle, FaPlayCircle } from "react-icons/fa";
import {
  useAudioContext,
  useCurrentTrack,
  usePlaying,
} from "../../app/AudioContext";

type Props = {
  audioUrl: string;
  title: string;
};

export default function PlayButton({ audioUrl, title }: Props) {
  const audioContext = useAudioContext();
  if (!audioContext) {
    throw new Error("Audio context not found");
  }
  const currentTrack = useCurrentTrack();
  const playing = usePlaying();
  const isPlaying = currentTrack?.endsWith(audioUrl) && playing;
  return (
    <button
      title={title}
      className="flex items-center text-gray-400"
      onClick={() => {
        if (isPlaying) {
          audioContext.pause();
        } else {
          audioContext.play(audioUrl);
        }
      }}
    >
      <span className="text-s pr-1">
        {isPlaying ? (
          <FaPauseCircle title="Pause" />
        ) : (
          <FaPlayCircle title="Play" />
        )}
      </span>{" "}
      Listen
    </button>
  );
}
