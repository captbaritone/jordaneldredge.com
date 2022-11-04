export default function YouTube({ token }) {
  return (
    <div className="video-container">
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
