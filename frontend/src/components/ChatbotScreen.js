// src/components/ChatbotScreen.js

import React, { useState } from "react";
import axios from "axios";

const BACKEND_URL = "http://localhost:5000";

function ChatbotScreen({ onFinish }) {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi, I’m your therapeutic chatbot! Take a moment before you scroll. You can tell me how you’re feeling, and I’ll adjust your social media feed to support your mental balance. Whether you’re stressed, calm, or cheerful, I’m here to help your online space reflect what you need most. So, how are you doing today?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const userMessages = messages.filter((msg) => msg.role === "user");
  const canFinish = userMessages.length > 0;

  const sendMessage = async () => {
    if (!input.trim()) return;
    setError(null);
    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await axios.post(`${BACKEND_URL}/api/chat`, {
        messages: newMessages,
      });
      setMessages([
        ...newMessages,
        { role: "assistant", content: response.data.reply },
      ]);
    } catch (e) {
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: "Sorry, there was a problem. Please try again.",
        },
      ]);
      setError(
        e.response?.data?.error || "Server error"
      );
    }
    setLoading(false);
  };

  const handleFinish = async () => {
    setLoading(true);
    setError(null);

    if (!canFinish) {
      onFinish("neutral");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${BACKEND_URL}/api/mood`, { userMessages });
      const backendMood = response.data.mood?.toLowerCase() || "neutral";
      onFinish(backendMood);
    } catch (e) {
      setError(e.response?.data?.error || "Server error");
      onFinish("neutral");
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 400, margin: "50px auto", textAlign: "left" }}>
      <div style={{ border: "1px solid #ccc", padding: 20, borderRadius: 10 }}>
        {messages.map((msg, idx) => (
          <div
            key={idx}
            style={{
              textAlign: msg.role === "user" ? "right" : "left",
              margin: "10px 0",
            }}
          >
            <span
              style={{
                display: "inline-block",
                background: msg.role === "assistant" ? "#eee" : "#aee",
                borderRadius: 10,
                padding: "10px 16px",
              }}
            >
              {msg.content}
            </span>
          </div>
        ))}
        <div style={{ marginTop: 20 }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            style={{
              width: "73%",
              fontSize: 16,
              padding: 8,
              borderRadius: 5,
              border: "1px solid #ddd",
            }}
            placeholder="Type your feeling..."
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            style={{ fontSize: 16, marginLeft: 8 }}
            disabled={loading || !input.trim()}
          >
            Send
          </button>
        </div>
        <button
          onClick={handleFinish}
          style={{
            marginTop: 20,
            fontSize: 16,
            width: "100%",
            background: "#35b",
            color: "#fff",
            border: "none",
            borderRadius: 5,
            padding: 10,
          }}
          disabled={loading || !canFinish}
        >
          {loading ? "Analyzing mood..." : "Finish Chat & Show Mood Feed"}
        </button>
        {error && (
          <div style={{ color: "red", marginTop: 10, fontSize: 14 }}>
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatbotScreen;