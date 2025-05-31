import React, { useState } from "react";
import axios from "axios";

const BACKEND_URL = "http://localhost:5000";

export default function SocialMediaFeed({ userInput }) {
  const [feed, setFeed] = useState([]); // {prompt, image}
  const [mood, setMood] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Step 1: Extract mood from user input
  async function detectMood(text) {
    try {
      const res = await axios.post(`${BACKEND_URL}/api/extract-mood`, { text });
      return res.data.mood;
    } catch (e) {
      return "neutral";
    }
  }

  // Step 2: Generate creative prompt for that mood
  async function getPrompt(mood) {
    const res = await axios.post(`${BACKEND_URL}/api/generate-prompt`, { mood });
    return res.data.prompt;
  }

  // Step 3: Generate image from that prompt
  async function getImage(prompt) {
    const res = await axios.post(`${BACKEND_URL}/api/generate-image`, { prompt });
    return res.data.images[0];
  }

  // Generate the feed (1 post, can repeat for more)
  async function handleGenerateFeed() {
    setLoading(true);
    setError(null);
    setFeed([]);
    try {
      // 1. Extract mood from user input (or use passed-in mood)
      const extractedMood = userInput ? await detectMood(userInput) : "neutral";
      setMood(extractedMood);

      // 2. Generate prompt
      const prompt = await getPrompt(extractedMood);

      // 3. Generate image
      const image = await getImage(prompt);

      setFeed([{ prompt, image }]);
    } catch (e) {
      setError("Failed to generate feed. Try again.");
    }
    setLoading(false);
  }

  return (
    <div style={{
      maxWidth: 600,
      margin: "40px auto",
      padding: 24,
      background: "#fafafa",
      borderRadius: 16,
      boxShadow: "0 3px 12px rgba(0,0,0,0.08)"
    }}>
      <h2 style={{ textAlign: "center", marginBottom: 20 }}>
        Social Mood Feed
      </h2>
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
          cursor: loading ? "wait" : "pointer"
        }}
      >
        {loading ? "Generating..." : "Generate Mood Feed"}
      </button>
      {error && <div style={{ color: "red", margin: 16 }}>{error}</div>}
      {mood && <div style={{ textAlign: "center", marginBottom: 12 }}>Detected mood: <b>{mood}</b></div>}
      {feed.length > 0 && (
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "24px"
        }}>
          {feed.map((post, idx) => (
            <div key={idx} style={{
              background: "#fff",
              borderRadius: 12,
              boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
              padding: 18,
              width: 350
            }}>
              <img
                src={post.image}
                alt="Mood post"
                style={{
                  width: "100%",
                  borderRadius: 10,
                  objectFit: "cover",
                  aspectRatio: "1/1",
                  marginBottom: 14
                }}
              />
              <div style={{ color: "#222", fontWeight: 500, fontSize: 16, marginBottom: 8 }}>
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