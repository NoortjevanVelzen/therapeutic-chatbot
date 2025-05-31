// src/components/SocialMediaScreen.js

import React, { useState } from "react";
import axios from "axios";

const BACKEND_URL = "http://localhost:5000";

function getMoodDescription(mood) {
  return `This feed is based on your detected mood: ${mood}. Enjoy images that reflect this feeling!`;
}

/**
 * This will be your “wrapper” component.
 * It renders a bit of text (the “header”), then the SocialMediaFeed below.
 */
export default function SocialMediaScreen({ mood }) {
  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: "44px 0" }}>
      {/* ─── Text Header / Description ─── */}
      <div
        style={{
          marginBottom: 32,
          padding: "18px 30px",
          background: "#f3f7ff",
          borderRadius: 12,
          border: "1px solid #dbeafe",
          fontSize: 20,
          color: "#183153",
          textAlign: "center",
          boxShadow: "0 2px 8px #0001",
        }}
      >
        <span style={{ fontWeight: 500, fontSize: 22, color: "#375bb6" }}>
          Mood detected:{" "}
        </span>
        <span
          style={{
            fontWeight: 700,
            fontSize: 22,
            textTransform: "capitalize",
          }}
        >
          {mood}
        </span>
        <div style={{ marginTop: 12, fontSize: 17 }}>
          {getMoodDescription(mood)}
        </div>
      </div>

      {/* ─── Render the feed component below the text ─── */}
      <SocialMediaFeed mood={mood} />
    </div>
  );
}

/*
 * This generates the “Generate Mood Feed” button, API calls, and displays the post.
 */
export function SocialMediaFeed({ mood }) {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function getPrompt(mood) {
    const res = await axios.post(`${BACKEND_URL}/api/generate-prompt`, { mood });
    return res.data.dallePrompt;
  }

  async function getImage(prompt) {
    const res = await axios.post(`${BACKEND_URL}/api/generate-image`, { prompt });
    return res.data.images[0];
  }

  const handleGenerateFeed = async () => {
    setLoading(true);
    setError(null);
    setPost(null);

    try {
      const extractedMood = mood || "neutral";
      const promptText = await getPrompt(extractedMood);
      const imageUrl = await getImage(promptText);

      setPost({ mood: extractedMood, prompt: promptText, imageUrl });
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
          {/* Header (avatar + username) */}
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

          {/* AI‐generated image */}
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

          {/* Icon bar (like / comment / share) */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "8px 16px",
              gap: 16,
            }}
          >
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

          {/* Caption */}
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