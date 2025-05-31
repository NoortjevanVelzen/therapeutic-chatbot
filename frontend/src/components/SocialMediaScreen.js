// src/components/SocialMediaScreen.js

import React, { useState } from "react";
import axios from "axios";

const BACKEND_URL = "http://localhost:5000"; // adjust if your server runs elsewhere

/**
 * -------------------------------------------------------------
 *  DEFAULT EXPORT: SocialMediaScreen
 *
 *  - Receives `userInput` (a string) as the already‐detected mood
 *    from ChatbotScreen (via App.js).
 *  - Displays a header “Mood detected: <mood>” above the feed.
 *  - Renders <SocialMediaFeed mood={userInput} /> below.
 * -------------------------------------------------------------
 */
export default function SocialMediaScreen({ userInput }) {
  // `userInput` is already the final mood string (e.g. "happy", "sad", etc.)
  const mood = userInput?.trim().toLowerCase() || "";

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "40px 0" }}>
      {/* ─── Header / Banner ─── */}
      <div
        style={{
          marginBottom: 30,
          padding: "20px 28px",
          background: "#eaf2fc",
          borderRadius: 10,
          border: "1px solid #cfe0fc",
          textAlign: "center",
          boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
        }}
      >
        <span style={{ fontSize: 24, fontWeight: 500, color: "#2f5597" }}>
          Mood detected:&nbsp;
        </span>
        <span
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: "#1b3a93",
            textTransform: "capitalize",
          }}
        >
          {mood || "—"}
        </span>
      </div>

      {/* ─── Feed Component (pass the mood down) ─── */}
      <SocialMediaFeed mood={mood} />
    </div>
  );
}


/**
 * -------------------------------------------------------------
 *  NAMED EXPORT: SocialMediaFeed
 *
 *  - Renders a “Generate Mood Feed” button.
 *  - When clicked, it builds a simple DALL·E prompt based
 *    on the `mood` prop (string), then calls
 *    POST /api/generate-image with that prompt.
 *  - Displays the returned image once it arrives.
 * -------------------------------------------------------------
 */
export function SocialMediaFeed({ mood }) {
  const [postImageUrl, setPostImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Helper: Create a simple DALL·E prompt from the mood string.
   * Feel free to customize this however you like.
   */
  function buildPromptFromMood(mood) {
    if (!mood) {
      return "An abstract illustration capturing a neutral mood.";
    }
    // e.g. "A beautiful watercolor painting that conveys a happy mood"
    return `A beautiful illustration that conveys a ${mood} mood.`;
  }

  /**
   * Calls POST /api/generate-image with { prompt }
   * and returns the first URL in the `images` array.
   */
  async function generateImageFromPrompt(prompt) {
    const res = await axios.post(
      `${BACKEND_URL}/api/generate-image`,
      { prompt }
    );
    // The back end (openaiController.generateImage) returns { images: [ "<url>" ] }
    return res.data.images[0];
  }

  /** Handler for the “Generate Mood Feed” button */
  const handleGenerateFeed = async () => {
    if (!mood) {
      setError("No mood detected yet.");
      return;
    }

    setLoading(true);
    setError(null);
    setPostImageUrl(null);

    try {
      // 1) Build a DALL·E prompt from the mood
      const prompt = buildPromptFromMood(mood);

      // 2) Send { prompt } to your back end
      const imageUrl = await generateImageFromPrompt(prompt);

      // 3) Store the returned URL and stop loading
      setPostImageUrl(imageUrl);
    } catch (e) {
      console.error("Error generating image:", e.response?.data || e.message);
      setError("Failed to generate image. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div
      style={{
        maxWidth: 650,
        margin: "0 auto",
        padding: 24,
        background: "#fafafa",
        borderRadius: 12,
        boxShadow: "0 3px 12px rgba(0,0,0,0.08)",
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: 18, color: "#333" }}>
        Social Mood Feed
      </h2>

      <button
        onClick={handleGenerateFeed}
        disabled={loading}
        style={{
          display: "block",
          margin: "0 auto 24px auto",
          background: "#333",
          color: "#fff",
          fontSize: 18,
          padding: "10px 22px",
          border: "none",
          borderRadius: 8,
          cursor: loading ? "wait" : "pointer",
          boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
        }}
      >
        {loading ? "Generating..." : "Generate Mood Feed"}
      </button>

      {error && (
        <div style={{ color: "red", marginBottom: 20, textAlign: "center" }}>
          {error}
        </div>
      )}

      {postImageUrl && (
        <div
          style={{
            background: "#fff",
            borderRadius: 10,
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

          {/* ─── AI‐Generated Image ─── */}
          <img
            src={postImageUrl}
            alt="AI generated mood illustration"
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

          {/* ─── Caption (Using the prompt text as the “caption”) ─── */}
          <div style={{ padding: "0 16px 16px 16px" }}>
            <span style={{ fontWeight: 600, marginRight: 8 }}>AI_Generator</span>
            <span style={{ color: "#333" }}>
              {buildPromptFromMood(mood)}
            </span>
            <div style={{ marginTop: 8, color: "#999", fontSize: 14 }}>
              #{mood}vibes
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
