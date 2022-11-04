"use client";
import { Tweet } from "react-twitter-widgets";
import ErrorBoundary from "./ErrorrBoundary";

export default function MyTweet({ status }) {
  const fallback = (
    <p>
      <a href={`${status}`}>Tweet</a>
    </p>
  );
  return (
    <ErrorBoundary fallback={fallback}>
      <Tweet tweetId={status} options={{ align: "center", theme: "light" }} />
    </ErrorBoundary>
  );
}
