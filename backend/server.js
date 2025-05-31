// server.js

// 1) Load environment variables right away:
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const axios = require("axios");

// 2) Import the entire OpenAI export:
const OpenAI = require("openai");

const app = express();
app.use(cors());
app.use(express.json());

// 3) Log whether the API key is loaded:
console.log(
  "🔑 OPENAI_API_KEY loaded? →",
  process.env.OPENAI_API_KEY ? "YES" : "NO"
);

let openai;
let isV4 = false;

// 4) Initialize OpenAI client (detecting v4 vs. v3):
try {
  // v4+ exposes Configuration & OpenAIApi as constructors
  if (
    typeof OpenAI.Configuration === "function" &&
    typeof OpenAI.OpenAIApi === "function"
  ) {
    const configuration = new OpenAI.Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });
    openai = new OpenAI.OpenAIApi(configuration);
    isV4 = true;
  } else {
    // Otherwise assume v3.x, where you do `new OpenAI({ apiKey })`
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    isV4 = false;
  }
} catch (err) {
  console.error("⛔ Could not initialize OpenAI client:", err);
  process.exit(1);
}

// -------------------------------------------------------------------------------------
// Endpoint: Generate a DALL·E prompt from a “mood”
// POST /api/generate-prompt
// Body: { "mood": "<single-word mood>" }
// -------------------------------------------------------------------------------------
app.post("/api/generate-prompt", async (req, res) => {
  try {
    const { mood } = req.body;
    if (typeof mood !== "string" || !mood.trim()) {
      return res
        .status(400)
        .json({ error: "Missing or invalid `mood` in request body." });
    }

    // Build the messages array:
    const messages = [
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
    ];

    let response;

    if (isV4 && typeof openai.createChatCompletion === "function") {
      // v4 usage:
      response = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages,
        temperature: 0.7,
        max_tokens: 100,
      });
      // In v4, the shape is response.data.choices[0].message.content
      const dallePrompt = response.data.choices[0].message.content.trim();
      return res.json({ dallePrompt });
    }

    // If we reach here, it must be v3.x. The method is openai.chat.completions.create(...)
    if (
      !isV4 &&
      openai.chat &&
      openai.chat.completions &&
      typeof openai.chat.completions.create === "function"
    ) {
      // v3 usage:
      response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages,
        temperature: 0.7,
        max_tokens: 100,
      });
      // In v3, the shape is response.choices[0].message.content
      const dallePrompt = response.choices[0].message.content.trim();
      return res.json({ dallePrompt });
    }

    // If neither branch worked, something’s wrong with the OpenAI client version:
    throw new Error("No supported createChatCompletion method found on the OpenAI client.");
  } catch (err) {
    console.error("Error in /api/generate-prompt:", err?.response?.data || err.message);
    return res.status(500).json({ error: "Failed to generate a DALL·E prompt." });
  }
});

// -------------------------------------------------------------------------------------
// Endpoint: Detect top emotion from text (via Hugging Face inference API)
// POST /api/detect-mood
// Body: { "text": "<user text>" }
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
// Endpoint: Generate DALL·E image from prompt (OpenAI)
// POST /api/generate-image
// Body: { "prompt": "<dalle prompt>", "size": "512x512" (optional) }
// -------------------------------------------------------------------------------------
app.post("/api/generate-image", async (req, res) => {
  try {
    const { prompt, size } = req.body;
    if (typeof prompt !== "string" || !prompt.trim()) {
      return res.status(400).json({ error: "Missing or invalid `prompt` in request body." });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: "OPENAI_API_KEY is not set in .env." });
    }

    // DALL·E 2 only allows n: 1 now
    let response;
    if (isV4 && typeof openai.createImage === "function") {
      response = await openai.createImage({
        prompt,
        n: 1,
        size: size || "512x512",
        model: "dall-e-2"
      });
      // In v4, it's response.data.data[0].url
      const images = response.data.data.map(img => img.url);
      return res.json({ images });
    }

    // v3 (older OpenAI SDKs)
    if (!isV4 && typeof openai.images === "object" && typeof openai.images.generate === "function") {
      response = await openai.images.generate({
        prompt,
        n: 1,
        size: size || "512x512",
        model: "dall-e-2"
      });
      // In v3, it's response.data[0].url
      const images = response.data.map(img => img.url);
      return res.json({ images });
    }

    throw new Error("No supported createImage method found on the OpenAI client.");
  } catch (err) {
    console.error("Image generation error:", err?.response?.data || err.message);
    return res.status(500).json({ error: "Failed to generate image from prompt." });
  }
});

// -------------------------------------------------------------------------------------
// Health Check
// GET /api/ping → { pong: true }
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