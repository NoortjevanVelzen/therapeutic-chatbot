// src/App.js

import React, { useState } from "react";
import HomePage from "./components/HomePage";
import ChatbotScreen from "./components/ChatbotScreen";
import SocialMediaFeed from "./components/SocialMediaScreen";

export default function App() {
  // `stage` determines which screen to show: "home" → "chat" → "feed"
  const [stage, setStage] = useState("home");
  // We'll capture the final mood returned by ChatbotScreen
  const [finalMood, setFinalMood] = useState("");

  // 1) HOME SCREEN
  if (stage === "home") {
    return <HomePage onGetStarted={() => setStage("chat")} />;
  }

  // 2) CHATBOT SCREEN
  if (stage === "chat") {
    return (
      <ChatbotScreen
        onFinish={(detectedMood) => {
          // Save the mood and move to the feed screen
          setFinalMood(detectedMood || "");
          setStage("feed");
        }}
      />
    );
  }

  // 3) SOCIAL MEDIA FEED
  // We pass the detected mood into SocialMediaFeed as `userInput`
  if (stage === "feed") {
    return <SocialMediaFeed userInput={finalMood} />;
  }

  return null;
}
