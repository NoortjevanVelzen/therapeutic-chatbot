// src/components/ChatbotScreen.js

import React, { useState } from "react";
import axios from "axios";
import styles from "./ChatbotScreen.module.css";

const BACKEND_URL = "http://localhost:5000";

function ChatbotScreen({ onFinish }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi, I’m your therapeutic chatbot! Take a moment before you scroll. You can tell me how you’re feeling, and I’ll adjust your social media feed to make sure that you feel mentally balanced. \n So, how are you doing today?",
    },
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
      setError(e.response?.data?.error || "Server error");
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
      const response = await axios.post(`${BACKEND_URL}/api/mood`, {
        userMessages,
      });
      const backendMood = response.data.mood?.toLowerCase() || "neutral";
      onFinish(backendMood);
    } catch (e) {
      setError(e.response?.data?.error || "Server error");
      onFinish("neutral");
    }
    setLoading(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.chatBox}>
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`${styles.message} ${
              msg.role === "user" ? styles.user : styles.assistant
            }`}
          >
            <span className={styles.bubble}>{msg.content}</span>
          </div>
        ))}

        <div className={styles.inputContainer}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            className={styles.inputField}
            placeholder="Type your feeling..."
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            className={styles.sendButton}
            disabled={loading || !input.trim()}
          >
            Send
          </button>
        </div>

        <button
          onClick={handleFinish}
          className={styles.finishButton}
          disabled={loading || !canFinish}
        >
          {loading ? "Analyzing mood..." : "Finish Chat & Show Mood Feed"}
        </button>

        {error && <div className={styles.error}>{error}</div>}
      </div>
    </div>
  );
}

export default ChatbotScreen;
