import React, { useState } from "react";

// Simple keyword mood detector
function detectMood(text) {
  const happyWords = ["happy", "good", "great", "awesome", "fantastic"];
  const sadWords = ["sad", "bad", "down", "unhappy", "depressed"];
  const excitedWords = ["excited", "thrilled", "pumped", "enthusiastic"];
  const lower = text.toLowerCase();

  if (happyWords.some((w) => lower.includes(w))) return "happy";
  if (sadWords.some((w) => lower.includes(w))) return "sad";
  if (excitedWords.some((w) => lower.includes(w))) return "excited";
  return "neutral";
}

function ChatbotScreen({ onFinish }) {
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hi! How are you feeling today?" },
  ]);
  const [input, setInput] = useState("");
  const [detectedMood, setDetectedMood] = useState(null);

  const sendMessage = () => {
    if (!input.trim()) return;
    const newMessages = [...messages, { from: "user", text: input }];
    setMessages(newMessages);

    // Detect mood
    const mood = detectMood(input);
    setDetectedMood(mood);

    // Bot responds
    let botMsg = "";
    if (mood === "happy") botMsg = "Glad to hear you're feeling happy!";
    else if (mood === "sad") botMsg = "Sorry to hear that. I'm here for you.";
    else if (mood === "excited") botMsg = "Awesome! Excitement is contagious!";
    else botMsg = "Thanks for sharing how you feel!";

    setMessages([...newMessages, { from: "bot", text: botMsg }]);

    setInput("");
    setTimeout(() => {
      onFinish(mood);
    }, 1500); // Move to next screen after response
  };

  return (
    <div style={{ maxWidth: 400, margin: "50px auto", textAlign: "left" }}>
      <div style={{ border: "1px solid #ccc", padding: 20, borderRadius: 10 }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{ textAlign: msg.from === "user" ? "right" : "left", margin: "10px 0" }}>
            <span
              style={{
                display: "inline-block",
                background: msg.from === "bot" ? "#eee" : "#aee",
                borderRadius: 10,
                padding: "10px 16px",
              }}
            >
              {msg.text}
            </span>
          </div>
        ))}
        <div style={{ marginTop: 20 }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            style={{ width: "73%", fontSize: 16, padding: 8, borderRadius: 5, border: "1px solid #ddd" }}
            placeholder="Type your feeling..."
          />
          <button onClick={sendMessage} style={{ fontSize: 16, marginLeft: 8 }}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatbotScreen;