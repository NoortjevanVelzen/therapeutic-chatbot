import React, { useState } from "react";
import axios from "axios";

const BACKEND_URL = "http://localhost:5000";

function ChatbotScreen({ onFinish }) {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! How are you feeling today?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Chat with backend
  const sendMessage = async () => {
    if (!input.trim()) return;
    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
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
        { role: "assistant", content: "Sorry, something went wrong." },
      ]);
    }
    setInput("");
    setLoading(false);
  };

  // Mood extraction via backend
  const handleFinish = async () => {
    setLoading(true);
    const userMessages = messages.filter((msg) => msg.role === "user");
    try {
      const response = await axios.post(`${BACKEND_URL}/api/mood`, {
        userMessages,
      });
      setLoading(false);
      onFinish(response.data.mood); // Pass mood to parent
    } catch (e) {
      setLoading(false);
      onFinish("neutral");
    }
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
            disabled={loading}
          >
            Send
          </button>
        </div>
        <button
          onClick={handleFinish}
          style={{ marginTop: 20, fontSize: 16, width: "100%" }}
          disabled={loading}
        >
          {loading ? "Analyzing mood..." : "Finish Chat & Show Mood Feed"}
        </button>
      </div>
    </div>
  );
}

export default ChatbotScreen;