export default function YouTube({ token, vertical = false }) {
  return (
    <div className={`video-container ${vertical ? "vertical" : "horizontal"}`}>
      <iframe
        src={`https://www.youtube.com/embed/${token}`}
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="youtube-video"
      ></iframe>
    </div>
  );
}
