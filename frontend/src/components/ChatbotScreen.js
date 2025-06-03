// src/components/ChatbotScreen.js

import React, { useState } from "react";
import useChatbot from "../hooks/useChatbot";
import { useMood } from "../contexts/MoodContext";  // ← new import
import styles from "./ChatbotScreen.module.css";

function ChatbotScreen({ onNext }) {
  // 1) Grab setMood from context
  const { setMood } = useMood();

  // 2) Use the same hook as before, but pass it a custom "finish callback"
  //    that sets the context mood and then calls onNext()
  const { messages, loading, error, sendMessage, finishChat } =
    useChatbot(async (detectedMood) => {
      // When useChatbot calls this callback, we set the shared context
      setMood(detectedMood); // update the context
      onNext();              // notify App.js to advance to step 3
    });

  // 3) Input field for the user
  const [input, setInput] = useState("");

  // 4) Compute canFinish exactly as before
  const userMessages = messages.filter((msg) => msg.role === "user");
  const canFinish = userMessages.length > 0;

  return (
    <div className={styles.container}>
      <div className={styles.introBox}>
        <h2 className={styles.introTitle}>
          Welcome to your Therapeutic Chatbot
        </h2>
        <p className={styles.introText}>
          This chatbot helps you reflect on how you're feeling and tailors your
          social media feed to support your emotional wellbeing. Just start
          typing your thoughts, and when you're ready, click to finish and
          receive your personalized wellbeing feed.
        </p>
      </div>

      <div className={styles.chatBox}>
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`${styles.message} ${
              msg.role === "user" ? styles.user : styles.assistant
            }`}
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
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                sendMessage(input);
                setInput("");
              }
            }}
            className={styles.inputField}
            placeholder="Type your feeling..."
            disabled={loading}
          />
          <button
            onClick={() => {
              sendMessage(input);
              setInput("");
            }}
            className={styles.sendButton}
            disabled={loading || !input.trim()}
          >
            Send
          </button>
        </div>

        <button
          onClick={finishChat}
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
