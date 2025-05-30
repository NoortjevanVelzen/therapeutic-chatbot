import React, { useState } from "react";
import HomeScreen from "./components/HomeScreen";
import ChatbotScreen from "./components/ChatbotScreen";
import SocialMediaScreen from "./components/SocialMediaScreen";

function App() {
  const [step, setStep] = useState(1);
  const [mood, setMood] = useState("");

  return (
    <div>
      {step === 1 && <HomeScreen onStart={() => setStep(2)} />}
      {step === 2 && (
        <ChatbotScreen
          onFinish={(detectedMood) => {
            setMood(detectedMood);
            setStep(3);
          }}
        />
      )}
      {step === 3 && <SocialMediaScreen mood={mood} />}
    </div>
  );
}

export default App;