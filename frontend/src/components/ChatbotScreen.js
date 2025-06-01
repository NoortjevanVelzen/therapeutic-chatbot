// src/components/ChatbotScreen.js

import React, { useState } from "react";
import axios from "axios";
import styles from "./ChatbotScreen.module.css";

const BACKEND_URL = "https://therapeutic-chatbot-2.onrender.com";

function ChatbotScreen({ onFinish }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "I’ll adjust your feed to match: soothing content to help you relax, inspiring stories and light news when you're feeling neutral, and joyful posts that celebrate your happiness.",
    },
    {
      role: "assistant",
      content: "So, tell me, how you're feeling?",
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
      <div className={styles.introBox}>
        <h2 className={styles.introTitle}>Welcome to your Therapeutic Chatbot</h2>
        <p className={styles.introText}>
          This chatbot helps you reflect on how you're feeling and tailors your social media feed to support your emotional wellbeing. Just start typing your thoughts, and when you're ready, click to finish and receive your personalized wellbeing feed.
        </p>
      </div>

      <div className={styles.chatBox}>
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`${styles.message} ${msg.role === "user" ? styles.user : styles.assistant}`}
        >
            {msg.role === "assistant" && (
              <img
                src="/chatbot-avatar.png"
                alt="Chatbot"
                className={styles.avatarSmall}
              />
            )}
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
          {loading ? "Analyzing mood..." : "Create My Wellbeing Feed"}
        </button>

        {error && <div className={styles.error}>{error}</div>}
      </div>
    </div>
  );
}

export default ChatbotScreen;

