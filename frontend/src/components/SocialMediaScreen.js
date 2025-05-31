// src/components/SocialMediaScreen.js

import React, { useState } from "react";
import axios from "axios";

const BACKEND_URL = "http://localhost:5000";

export default function SocialMediaFeed({ userInput }) {
  // We’ll treat each “feed item” as just a { prompt } for now,
  // because the backend only returns a text prompt.
  const [feed, setFeed] = useState([]); 
  const [mood, setMood] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Step 1: Extract mood from user input
  //   ➜ Backend route is POST /api/detect-mood { text: string }
  //   Response is { mood: "<top-emotion>" }
  async function detectMood(text) {
    try {
      const res = await axios.post(`${BACKEND_URL}/api/detect-mood`, { text });
      return res.data.mood;
    } catch (e) {
      // If anything goes wrong, default to "neutral"
      return "neutral";
    }
  }

  // Step 2: Generate a DALL·E prompt based on that mood
  //   ➜ Backend route is POST /api/generate-prompt { mood: string }
  //   Response is { dallePrompt: "<text prompt>" }
  async function getPrompt(mood) {
    try {
      const res = await axios.post(`${BACKEND_URL}/api/generate-prompt`, { mood });
      return res.data.dallePrompt;
    } catch (e) {
      throw new Error("Prompt generation failed");
    }
  }

  // When the user clicks “Generate Mood Feed,” we do:
  //   1) detectMood(userInput)
  //   2) getPrompt(detectedMood)
  //   3) setFeed([{ prompt }]) so the UI can render it
  async function handleGenerateFeed() {
    setLoading(true);
    setError(null);
    setFeed([]);
    
    try {
      // 1. Determine mood (or fall back to "neutral" if no userInput)
      const extractedMood = userInput ? await detectMood(userInput) : "neutral";
      setMood(extractedMood);

      // 2. Generate a DALL·E prompt for that mood
      const promptText = await getPrompt(extractedMood);

      // 3. Update the “feed” with one item that has { prompt }
      setFeed([{ prompt: promptText }]);
    } catch (e) {
      setError("Failed to generate feed. Try again.");
      console.error(e);
    }

    setLoading(false);
  }

  return (
    <div
      style={{
        maxWidth: 600,
        margin: "40px auto",
        padding: 24,
        background: "#fafafa",
        borderRadius: 16,
        boxShadow: "0 3px 12px rgba(0,0,0,0.08)",
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: 20 }}>Social Mood Feed</h2>

      <button
        onClick={handleGenerateFeed}
        disabled={loading}
        style={{
          background: "#333",
          color: "#fff",
          fontSize: 18,
          border: "none",
          borderRadius: 8,
          padding: "12px 24px",
          margin: "0 auto 30px auto",
          display: "block",
          cursor: loading ? "wait" : "pointer",
        }}
      >
        {loading ? "Generating..." : "Generate Mood Feed"}
      </button>

      {error && <div style={{ color: "red", margin: 16 }}>{error}</div>}

      {mood && (
        <div style={{ textAlign: "center", marginBottom: 12 }}>
          Detected mood: <b>{mood}</b>
        </div>
      )}

      {feed.length > 0 && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "24px",
          }}
        >
          {feed.map((post, idx) => (
            <div
              key={idx}
              style={{
                background: "#fff",
                borderRadius: 12,
                boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
                padding: 18,
                width: 350,
              }}
            >
              {/* Since there’s no image URL yet, we simply render the prompt text */}
              <div
                style={{
                  color: "#222",
                  fontWeight: 500,
                  fontSize: 16,
                  marginBottom: 8,
                }}
              >
                {post.prompt}
              </div>
              <div style={{ color: "#999", fontSize: 13 }}>
                #{mood}vibes
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}