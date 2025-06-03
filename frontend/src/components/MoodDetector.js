// src/components/MoodDetector.js

import React, { useState } from "react";
import axios from "axios";

const BACKEND_URL = "https://therapeutic-chatbot-2.onrender.com";

export default function MoodDetector() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  async function detectMood() {
    setLoading(true);
    setResult(null);
    try {
      const res = await axios.post(`${BACKEND_URL}/api/mood`, { text: input });
      setResult(res.data);
    } catch (e) {
      setResult({ error: "Detection failed." });
    }
    setLoading(false);
  }

  return (
    <div style={{ maxWidth: 500, margin: "40px auto", textAlign: "center" }}>
      <h2>ML Mood Detector</h2>
      <textarea
        rows={3}
        value={input}
        onChange={e => setInput(e.target.value)}
        style={{ width: "100%", fontSize: 16, marginBottom: 12 }}
        placeholder="Type your message..."
      />
      <br />
      <button onClick={detectMood} disabled={loading || !input} style={{ fontSize: 16, padding: "8px 24px" }}>
        {loading ? "Detecting..." : "Detect Mood"}
      </button>
      {result && (
        <div style={{ marginTop: 18 }}>
          {result.error ? (
            <span style={{ color: "red" }}>{result.error}</span>
          ) : (
            <div>
              <b>Detected mood:</b> {result.mood}
              <div style={{ marginTop: 8 }}>
                <b>All scores:</b>
                <pre style={{ textAlign: "left", background: "#eee", padding: 8, borderRadius: 6 }}>
                  {JSON.stringify(result.scores, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}