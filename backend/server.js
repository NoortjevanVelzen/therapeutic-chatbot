// server.js

// 1) Load .env at the very top:
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const axios = require("axios");

// 2) Import everything from the openai package:
const OpenAI = require("openai");

const app = express();
app.use(cors());
app.use(express.json());

// 3) Log whether the API key is loaded (for sanity check):
console.log(
  "🔑 OPENAI_API_KEY loaded? →",
  process.env.OPENAI_API_KEY ? "YES" : "NO"
);

let openai;

// 4) Initialize the OpenAI client in a version‐agnostic way:
try {
  // If the package exposes Configuration & OpenAIApi (v4+), use that:
  if (typeof OpenAI.Configuration === "function" && typeof OpenAI.OpenAIApi === "function") {
    const configuration = new OpenAI.Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });
    openai = new OpenAI.OpenAIApi(configuration);

  } else {
    // Otherwise, assume v3.x where you simply call `new OpenAI()`:
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
} catch (err) {
  console.error("⛔ Could not initialize OpenAI client:", err);
  process.exit(1);
}

// -------------------------------------------------------------------------------------
// Example Endpoint #1: Generate a DALL·E prompt from a “mood”
// -------------------------------------------------------------------------------------
app.post("/api/generate-prompt", async (req, res) => {
  try {
    const { mood } = req.body;
    if (typeof mood !== "string" || !mood.trim()) {
      return res.status(400).json({ error: "Missing or invalid `mood` in request body." });
    }

    // Use whichever method openai supports (v3 vs. v4). 
    // Both v3 and v4 clients expose createChatCompletion with the same signature.
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are an assistant that crafts detailed prompts for DALL·E. " +
            "When given a single-word mood (e.g. \"serene\", \"euphoric\", \"nostalgic\"), " +
            "you must produce one concise but vivid DALL·E prompt that visually conveys that mood.",
        },
        {
          role: "user",
          content: `Mood: ${mood.trim()}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 100,
    });

    // The choice format is identical in v3 and v4:
    const dallePrompt = response.data.choices[0].message.content.trim();
    return res.json({ dallePrompt });
  } catch (err) {
    console.error("Error in /api/generate-prompt:", err?.response?.data || err.message);
    return res.status(500).json({ error: "Failed to generate a DALL·E prompt." });
  }
});

// -------------------------------------------------------------------------------------
// Example Endpoint #2: Detect top emotion from text via Hugging Face
// -------------------------------------------------------------------------------------
app.post("/api/detect-mood", async (req, res) => {
  try {
    const { text } = req.body;
    if (typeof text !== "string" || !text.trim()) {
      return res.status(400).json({ error: "Missing or invalid `text` in request body." });
    }

    if (!process.env.HF_TOKEN) {
      return res.status(500).json({ error: "HF_TOKEN is not set in .env." });
    }

    const hfResponse = await axios.post(
      "https://api-inference.huggingface.co/models/j-hartmann/emotion-english-distilroberta-base",
      { inputs: text.trim() },
      {
        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    const emotions = hfResponse.data[0];
    const topEmotion = emotions.reduce((best, curr) =>
      curr.score > best.score ? curr : best
    );

    return res.json({ mood: topEmotion.label, scores: emotions });
  } catch (err) {
    console.error("Mood detection error:", err?.response?.data || err.message);
    return res.status(500).json({ error: "Failed to detect mood from text." });
  }
});

// -------------------------------------------------------------------------------------
// Health Check
// -------------------------------------------------------------------------------------
app.get("/api/ping", (_req, res) => {
  res.json({ pong: true });
});

// -------------------------------------------------------------------------------------
// Start server
// -------------------------------------------------------------------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Backend listening on port ${PORT}`);
});