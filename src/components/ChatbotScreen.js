import React, { useState } from "react";
import axios from "axios";

const OPENAI_API_KEY = "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"; // Replace with your key

async function getOpenAIResponse(messages) {
  const response = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    {
      model: "gpt-3.5-turbo",
      messages,
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
    }
  );
  return response.data.choices[0].message.content.trim();
}

async function extractMood(userMessages) {
  // Prepare a system prompt and messages array for mood extraction
  const moodPrompt = [
    {
      role: "system",
      content:
        "You are a mood detection assistant. Given only the USER's messages from a conversation, determine the user's overall mood. Reply with a single word: happy, sad, excited, or neutral.",
    },
    ...userMessages.map((msg) => ({
      role: "user",
      content: msg.content,
    })),
  ];
  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: moodPrompt,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
      }
    );
    return response.data.choices[0].message.content.trim().toLowerCase();
  } catch (error) {
    return "neutral";
  }
}

function ChatbotScreen({ onFinish }) {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! How are you feeling today?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setLoading(true);
    const botReply = await getOpenAIResponse(newMessages);
    setMessages([...newMessages, { role: "assistant", content: botReply }]);
    setInput("");
    setLoading(false);
  };

  const handleFinish = async () => {
    setLoading(true);
    // Filter out only user messages
    const userMessages = messages.filter((msg) => msg.role === "user");
    const mood = await extractMood(userMessages);
    setLoading(false);
    onFinish(mood);
  };

  return (
    <div style={{ maxWidth: 400, margin: "50px auto", textAlign: "left" }}>
      <div style={{ border: "1px solid #ccc", padding: 20, borderRadius: 10 }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{ textAlign: msg.role === "user" ? "right" : "left", margin: "10px 0" }}>
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
            style={{ width: "73%", fontSize: 16, padding: 8, borderRadius: 5, border: "1px solid #ddd" }}
            placeholder="Type your feeling..."
            disabled={loading}
          />
          <button onClick={sendMessage} style={{ fontSize: 16, marginLeft: 8 }} disabled={loading}>
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