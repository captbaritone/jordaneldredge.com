import { Tweet } from "react-tweet";

export default function MyTweet({ status }) {
  const fallback = (
    <p>
      <a href={`${status}`}>Tweet</a>
    </p>
  );
  return (
    <div
      data-theme="light"
      style={{
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Tweet id={status} fallback={fallback} />
    </div>
  );
}
