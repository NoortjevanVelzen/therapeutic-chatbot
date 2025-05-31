// src/components/SocialMediaScreen.js

import React, { useState } from "react";
import axios from "axios";

const BACKEND_URL = "http://localhost:5000";

export default function SocialMediaFeed({ userInput }) {
  const [post, setPost] = useState(null);   // { imageUrl, prompt, mood }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 1) Extract mood from user input
  async function detectMood(text) {
    try {
      const res = await axios.post(`${BACKEND_URL}/api/detect-mood`, { text });
      return res.data.mood;
    } catch (e) {
      return "neutral";
    }
  }

  // 2) Generate a DALL·E prompt from that mood
  async function getPrompt(mood) {
    const res = await axios.post(`${BACKEND_URL}/api/generate-prompt`, { mood });
    return res.data.dallePrompt;
  }

  // 3) Generate an image from that prompt
  async function getImage(prompt) {
    const res = await axios.post(`${BACKEND_URL}/api/generate-image`, { prompt });
    // Assume backend returns { images: [ "https://…url…" ] }
    return res.data.images[0];
  }

  // Called when you click “Generate Mood Feed”
  const handleGenerateFeed = async () => {
    setLoading(true);
    setError(null);
    setPost(null);

    try {
      // If userInput is empty, default mood to “neutral”
      const extractedMood = userInput ? await detectMood(userInput) : "neutral";

      // Create a text prompt based on that mood:
      const promptText = await getPrompt(extractedMood);

      // Generate an AI image from the prompt:
      const imageUrl = await getImage(promptText);

      // Build the “post” object:
      setPost({
        mood: extractedMood,
        prompt: promptText,
        imageUrl,
      });
    } catch (e) {
      console.error("Error generating post:", e);
      setError("Failed to generate feed. Please try again.");
    }

    setLoading(false);
  };

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

      {post && (
        <div
          style={{
            background: "#fff",
            borderRadius: 12,
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            overflow: "hidden",
          }}
        >
          {/* ─── Header (Avatar + Username) ─── */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "12px 16px",
              borderBottom: "1px solid #eee",
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                backgroundImage: `url("https://i.pravatar.cc/150?img=12")`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                marginRight: 12,
              }}
            />
            <span style={{ fontWeight: 600, fontSize: 16 }}>AI_Generator</span>
          </div>

          {/* ─── Image ─── */}
          <img
            src={post.imageUrl}
            alt="AI generated"
            style={{
              width: "100%",
              display: "block",
              objectFit: "cover",
              maxHeight: 500,
            }}
          />

          {/* ─── Icon Bar (Like / Comment / Share) ─── */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "8px 16px",
              gap: 16,
            }}
          >
            {/* Simple placeholders for like/comment/share icons */}
            <span role="img" aria-label="like" style={{ fontSize: 24, cursor: "pointer" }}>
              ❤️
            </span>
            <span role="img" aria-label="comment" style={{ fontSize: 24, cursor: "pointer" }}>
              💬
            </span>
            <span role="img" aria-label="share" style={{ fontSize: 24, cursor: "pointer" }}>
              📤
            </span>
          </div>

          {/* ─── Caption (Prompt or Hashtags) ─── */}
          <div style={{ padding: "0 16px 16px 16px" }}>
            <span style={{ fontWeight: 600, marginRight: 8 }}>AI_Generator</span>
            <span style={{ color: "#333" }}>{post.prompt}</span>
            <div style={{ marginTop: 8, color: "#999", fontSize: 14 }}>
              #{post.mood}vibes
            </div>
          </div>
        </div>
      )}
    </div>
  );
}