// The `sizes` of the summary image thumbnail in list views. SummaryImage
// renders the thumbnail again with the same value, so the browser picks the
// same srcset candidate and serves it from cache. Keep this in a plain module:
// a value exported from a "use client" file reaches server components as a
// client reference, not as the string.
export const THUMBNAIL_SIZES = "(max-width: 768px) 171px, 228px";
