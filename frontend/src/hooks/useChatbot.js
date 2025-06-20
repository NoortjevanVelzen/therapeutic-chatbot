// src/hooks/useChatbot.js

import { useState } from "react";
import api from "../api"; // assumes you already did Step 1 (api client)

export default function useChatbot(onFinish) {
  // 1) All the state remains here
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "I'll tailor your feed to match your mood: calming content to ease your mind when you're feeling down, balanced content that resonates when you're feeling neutral, and uplifting posts that celebrate your happiness",
    },
    {
      role: "assistant",
      content: "So, tell me, how you're feeling?",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 2) Helper to send a new user message + get assistant reply
  const sendMessage = async (text) => {
    if (!text.trim()) return;
    setError(null);

    const updated = [...messages, { role: "user", content: text }];
    setMessages(updated);
    setLoading(true);

    try {
      // chatWithAI sends the entire “updated” array and returns assistant’s reply
      const reply = await api.chatWithAI(updated);
      setMessages([...updated, { role: "assistant", content: reply }]);
    } catch (e) {
      setMessages([
        ...updated,
        {
          role: "assistant",
          content: "Sorry, there was a problem. Please try again.",
        },
      ]);
      setError(e.response?.data?.error || "Server error");
    }

    setLoading(false);
  };

  // 3) Helper to finish chat: filter only user messages, call detectMood, invoke onFinish
  const finishChat = async () => {
    const userMessages = messages.filter((m) => m.role === "user");
    
    // ← Add this log to see exactly what goes to the server:
    console.log("🔍 [useChatbot] Sending to /api/mood:", userMessages);
    
    if (userMessages.length === 0) {
      onFinish("neutral");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const mood = await api.detectMood(userMessages);
      onFinish(mood);
    } catch (e) {
      setError(e.response?.data?.error || "Server error");
      onFinish("neutral");
    }

    setLoading(false);
  };

  // 4) Return everything the component needs
  return {
    messages,
    loading,
    error,
    sendMessage,
    finishChat,
  };
}