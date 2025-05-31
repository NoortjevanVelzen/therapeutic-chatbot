// src/App.js

import React, { useState } from "react";
import HomeScreen from "./components/HomeScreen";
import ChatbotScreen from "./components/ChatbotScreen";
import SocialMediaScreen from "./components/SocialMediaScreen";

function App() {
  const [step, setStep] = useState(1);
  const [mood, setMood] = useState(null);

  const handleFinish = (detectedMood) => {
    // Fallback to 'neutral' if no mood is returned for any reason
    setMood(
      detectedMood && typeof detectedMood === "string" && detectedMood.trim()
        ? detectedMood.trim().toLowerCase()
        : "neutral"
    );
    setStep(3);
  };

  return (
    <div>
      {step === 1 && <HomeScreen onStart={() => setStep(2)} />}
      {step === 2 && <ChatbotScreen onFinish={handleFinish} />}
      {step === 3 && <SocialMediaScreen mood={mood} />}
    </div>
  );
}

export default App;
