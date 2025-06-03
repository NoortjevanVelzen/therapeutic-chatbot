// src/App.js

import React, { useState } from "react";
import HomeScreen from "./components/HomeScreen";
import ChatbotScreen from "./components/ChatbotScreen";
import SocialMediaScreen from "./components/SocialMediaScreen";

function App() {
  // step = 1 (Home) → 2 (Chatbot) → 3 (SocialMedia)
  const [step, setStep] = useState(1);

  return (
    <div>
      {step === 1 && <HomeScreen onStart={() => setStep(2)} />}
      {step === 2 && (
        // ChatbotScreen no longer needs onFinish prop, because it can
        // call useMood().setMood(...) inside its own finishChat
        <ChatbotScreen onNext={() => setStep(3)} />
      )}
      {step === 3 && <SocialMediaScreen />}
    </div>
  );
}

export default App;
