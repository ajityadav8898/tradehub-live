import React from "react";
import VideoTutorial from "../components/VideoTutorial"; // Import VideoTutorial component

const ChartBasics = () => {
  return (
    <div className="chart-basics">
      <h1>📊 Understanding TradingView Charts</h1>
      <p>Learn how to navigate and use TradingView charts efficiently.</p>
      
      {/* Add the video tutorial */}
      <VideoTutorial />
    </div>
  );
};

export default ChartBasics;
