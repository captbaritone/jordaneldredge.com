const VIDEO_EXTENSIONS = [".mp4", ".mov", ".webm", ".avi", ".mkv", ".m4v", ".ogv"];

/**
 * Whether a URL points at a video file, judged by its extension. Ignores case
 * (phones save `.MOV`) and any query string or fragment (signed URLs).
 */
export function isVideoUrl(url: string): boolean {
  const pathname = url.split(/[?#]/)[0].toLowerCase();
  return VIDEO_EXTENSIONS.some((ext) => pathname.endsWith(ext));
}
