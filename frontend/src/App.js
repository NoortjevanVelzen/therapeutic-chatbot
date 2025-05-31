// src/App.js

import React, { useState } from "react";
import HomePage from "./components/HomePage";
import SocialMediaFeed from "./components/SocialMediaScreen"; // or wherever your feed component lives

export default function App() {
  // `started` is false at first → we show <HomePage/>.
  // Once the user clicks “Get Started”, we flip started = true and show the feed.
  const [started, setStarted] = useState(false);

  // If you want to pass `userInput` down into SocialMediaFeed, you can adjust accordingly.
  // In this example, we’ll just render the feed with no user‐typed mood at first.
  const [userInput, setUserInput] = useState("");

  if (!started) {
    // Show the Home page until the user clicks “Get Started”
    return <HomePage onGetStarted={() => setStarted(true)} />;
  }

  // Once started === true, show the SocialMediaFeed
  return (
    <div>
      {/* 
        If you still want the “input box” to live in App.js and pass it down, you could do:
        <div style={{ textAlign: "center", marginTop: 30 }}>
          <input
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="How are you feeling today?"
            style={{
              fontSize: 18,
              padding: 10,
              borderRadius: 6,
              border: "1px solid #ccc",
              width: 320,
            }}
          />
        </div>
      */}
      <SocialMediaFeed userInput={userInput} />
    </div>
  );
}