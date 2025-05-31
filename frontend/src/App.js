import React, { useState } from "react";
import SocialMediaFeed from "./components/SocialMediaScreen";

export default function App() {
  const [userInput, setUserInput] = useState("");

  return (
    <div>
      <div style={{ textAlign: "center", marginTop: 30 }}>
        <input
          value={userInput}
          onChange={e => setUserInput(e.target.value)}
          placeholder="How are you feeling today?"
          style={{
            fontSize: 18,
            padding: 10,
            borderRadius: 6,
            border: "1px solid #ccc",
            width: 320
          }}
        />
      </div>
      <SocialMediaFeed userInput={userInput} />
    </div>
  );
}