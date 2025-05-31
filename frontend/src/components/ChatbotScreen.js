import React, { useState, useRef, useEffect } from "react";
import axios from "axios";

const BACKEND_URL = "http://localhost:5000";

function ChatbotScreen({ onFinish }) {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! How are you feeling today?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const chatEndRef = useRef(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

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
        e.response && e.response.data && e.response.data.error
          ? e.response.data.error
          : "Server error"
      );
    }
    setLoading(false);
  };

  const handleFinish = async () => {
    setLoading(true);
    setError(null);
    const userMessages = messages.filter((msg) => msg.role === "user");
    try {
      const response = await axios.post(`${BACKEND_URL}/api/mood`, {
        userMessages,
      });
      setLoading(false);
      onFinish(response.data.mood);
    } catch (e) {
      setLoading(false);
      setError(
        e.response && e.response.data && e.response.data.error
          ? e.response.data.error
          : "Server error"
      );
      onFinish("neutral");
    }
  };

  return (
    <div
      style={{
        maxWidth: 400,
        margin: "50px auto",
        textAlign: "left",
        display: "flex",
        flexDirection: "column",
        height: "75vh",
        minHeight: 500,
      }}
    >
      <div
        style={{
          border: "1px solid #ccc",
          borderRadius: 10,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          background: "#fafbfc",
        }}
      >
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: 20,
            marginBottom: 10,
            maxHeight: 350,
          }}
        >
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
                  maxWidth: "70%",
                  wordBreak: "break-word",
                }}
              >
                {msg.content}
              </span>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
        <div style={{ padding: "12px 20px", borderTop: "1px solid #eee" }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            style={{
              width: "72%",
              fontSize: 16,
              padding: 8,
              borderRadius: 5,
              border: "1px solid #ddd",
            }}
            placeholder="Type your feeling..."
            disabled={loading}
            autoFocus
          />
          <button
            onClick={sendMessage}
            style={{
              fontSize: 16,
              marginLeft: 8,
              padding: "8px 18px",
              background: "#1976d2",
              color: "#fff",
              border: "none",
              borderRadius: 5,
              cursor: loading || !input.trim() ? "not-allowed" : "pointer",
              opacity: loading || !input.trim() ? 0.6 : 1,
            }}
            disabled={loading || !input.trim()}
          >
            Send
          </button>
        </div>
      </div>
      <button
        onClick={handleFinish}
        style={{
          marginTop: 18,
          fontSize: 17,
          width: "100%",
          background: "#35b",
          color: "#fff",
          border: "none",
          borderRadius: 5,
          padding: 13,
          fontWeight: 500,
          boxShadow: "0 2px 8px #0001",
        }}
        disabled={loading}
      >
        {loading ? "Analyzing mood..." : "Finish Chat & Generate Mood Feed"}
      </button>
      {error && (
        <div style={{ color: "red", marginTop: 10, fontSize: 14 }}>
          {error}
        </div>
      )}
    </div>
  );
}

export default ChatbotScreen;