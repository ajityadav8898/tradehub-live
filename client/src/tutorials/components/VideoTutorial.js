import React from "react";
// import '../styles/VideoTutorial.css';

const VideoTutorial = () => {
  return (
    <div className="video-container">
      <h2>📌 TradingView Chart Tutorial</h2>
      <iframe
        width="100%"
        height="450"
        src="https://youtu.be/4Wdo9QKs9p4?si=YGpToToEv0UnMDfO"
        title="TradingView Tutorial"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
    </div>
  );
};

export default VideoTutorial;
