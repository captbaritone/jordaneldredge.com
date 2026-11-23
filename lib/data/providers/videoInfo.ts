import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { db } from "../../db";
import { keyUrl, upload } from "../../s3";

const execFileAsync = promisify(execFile);

export type VideoInfo = {
  width: number;
  height: number;
  posterUrl: string;
  // A 4:3 image for list thumbnails and link previews, which would otherwise
  // crop a portrait poster down to a strip across its middle. Null for
  // landscape videos, whose poster already fits.
  thumbnailUrl: string | null;
};

/**
 * Get the display dimensions of a video and a poster frame for it, so it can
 * be laid out before it loads and shown as a summary image.
 *
 * The first time we see a video we read it with ffprobe, grab a frame with
 * ffmpeg and upload that to R2. Both read the remote file with range requests,
 * so for a fast-start MP4 they only download a small part of it. The result is
 * cached in the `video_info` table so later reindexes don't touch the video.
 */
export async function ensureVideoInfo(src: string): Promise<VideoInfo> {
  const cached = GET_VIDEO_INFO.get({ src });
  if (cached != null) {
    return {
      width: cached.width,
      height: cached.height,
      posterUrl: keyUrl(cached.poster_key),
      thumbnailUrl:
        cached.thumbnail_key == null ? null : keyUrl(cached.thumbnail_key),
    };
  }

  const probe = await probeVideo(src);
  const id = hash(src);
  const posterKey = path.join("video-posters", `${id}.jpg`);
  const thumbnailKey =
    probe.height > probe.width
      ? path.join("video-posters", `${id}-thumbnail.jpg`)
      : null;
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "video-poster-"));
  try {
    const posterPath = path.join(dir, "poster.jpg");
    await extractPoster(src, probe, posterPath);
    await upload(posterKey, posterPath, "image/jpeg");
    if (thumbnailKey != null) {
      const thumbnailPath = path.join(dir, "wide.jpg");
      await widenPoster(posterPath, thumbnailPath);
      await upload(thumbnailKey, thumbnailPath, "image/jpeg");
    }
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }

  ADD_VIDEO_INFO.run({
    src,
    width: probe.width,
    height: probe.height,
    poster_key: posterKey,
    thumbnail_key: thumbnailKey,
  });
  return {
    width: probe.width,
    height: probe.height,
    posterUrl: keyUrl(posterKey),
    thumbnailUrl: thumbnailKey == null ? null : keyUrl(thumbnailKey),
  };
}

type Probe = {
  width: number;
  height: number;
  duration: number;
  hdr: boolean;
};

async function probeVideo(src: string): Promise<Probe> {
  const { stdout } = await execFileAsync("ffprobe", [
    "-v",
    "error",
    "-select_streams",
    "v:0",
    "-show_entries",
    "stream=width,height,color_transfer:stream_side_data=rotation:format=duration",
    "-of",
    "json",
    src,
  ]);
  const json = JSON.parse(stdout);
  const stream = json.streams?.[0];
  if (stream == null) {
    throw new Error(`No video stream in ${src}`);
  }
  // Phones record portrait video as landscape frames plus a rotation, which
  // players (and ffmpeg, when it grabs the poster) apply.
  const rotation = Number(
    stream.side_data_list?.find((d) => d.rotation != null)?.rotation ?? 0,
  );
  const sideways = Math.abs(rotation) % 180 === 90;
  return {
    width: sideways ? stream.height : stream.width,
    height: sideways ? stream.width : stream.height,
    duration: Number(json.format?.duration ?? 0),
    // HLG and PQ. A frame from these looks washed out unless it is tone mapped.
    hdr:
      stream.color_transfer === "arib-std-b67" ||
      stream.color_transfer === "smpte2084",
  };
}

async function extractPoster(
  src: string,
  probe: Probe,
  outputPath: string,
): Promise<void> {
  // One second in skips a fade from black, like YouTube's default thumbnail.
  const seconds = Math.min(1, probe.duration / 2);
  const filters = [
    ...(probe.hdr
      ? [
          "zscale=t=linear:npl=100",
          "format=gbrpf32le",
          "zscale=p=bt709",
          "tonemap=tonemap=hable:desat=0",
          "zscale=t=bt709:m=bt709:r=tv",
          "format=yuv420p",
        ]
      : []),
    // Big enough for a sharp poster on a 640px tall vertical video.
    "scale=w='min(1280,iw)':h='min(1280,ih)':force_original_aspect_ratio=decrease",
  ];
  await execFileAsync("ffmpeg", [
    "-v",
    "error",
    "-ss",
    String(seconds),
    "-i",
    src,
    "-frames:v",
    "1",
    "-vf",
    filters.join(","),
    "-q:v",
    "3",
    "-y",
    outputPath,
  ]);
}

/**
 * Frame a portrait poster in 4:3 the way YouTube frames a Short's `hqdefault`
 * thumbnail, which is what we show for Shorts: the whole frame in the middle,
 * over a copy of itself scaled to fill the width and dimmed to 30% brightness.
 * (Measured against YouTube's own thumbnails.) This is 960x720, twice the size
 * of `hqdefault`, so it stays sharp in link previews.
 */
async function widenPoster(
  posterPath: string,
  outputPath: string,
): Promise<void> {
  await execFileAsync("ffmpeg", [
    "-v",
    "error",
    "-i",
    posterPath,
    "-filter_complex",
    [
      "[0]scale=960:720:force_original_aspect_ratio=increase,crop=960:720,colorchannelmixer=rr=0.3:gg=0.3:bb=0.3[bg]",
      // Round the width down to even, as YouTube does: 9:16 gives 404, not 406.
      "[0]scale=trunc(oh*a/2)*2:720[fg]",
      "[bg][fg]overlay=(W-w)/2:0",
    ].join(";"),
    "-q:v",
    "3",
    "-y",
    outputPath,
  ]);
}

function hash(value: string): string {
  return createHash("sha256").update(value).digest("hex").slice(0, 32);
}

const GET_VIDEO_INFO = db.prepare<
  { src: string },
  {
    width: number;
    height: number;
    poster_key: string;
    thumbnail_key: string | null;
  }
>(`
  SELECT width, height, poster_key, thumbnail_key
  FROM video_info WHERE src = :src`);

const ADD_VIDEO_INFO = db.prepare<
  {
    src: string;
    width: number;
    height: number;
    poster_key: string;
    thumbnail_key: string | null;
  },
  void
>(`
  INSERT INTO video_info (src, width, height, poster_key, thumbnail_key)
  VALUES (:src, :width, :height, :poster_key, :thumbnail_key)`);
