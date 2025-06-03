// src/api/index.js

import axios from "axios";

const BACKEND_URL = "https://therapeutic-chatbot-2.onrender.com";

// 1) Chat with OpenAI and return the assistant’s reply
async function chatWithAI(messages) {
  const res = await axios.post(
    `${BACKEND_URL}/api/chat`,
    { messages },
    {
      headers: { "Content-Type": "application/json" },
    }
  );
  return res.data.reply;
}

// 2) Send only userMessages to /api/mood and return a single‐word mood
async function detectMood(userMessages) {
  const res = await axios.post(
    `${BACKEND_URL}/api/mood`,
    { userMessages },
    {
      headers: { "Content-Type": "application/json" },
    }
  );
  // normalize to lowercase string; fallback to "neutral"
  return (res.data.mood || "neutral").toLowerCase();
}

// 3) Send a prompt to /api/generate-image and return the image URL
async function generateImage(prompt) {
  const res = await axios.post(
    `${BACKEND_URL}/api/generate-image`,
    { prompt },
    {
      headers: { "Content-Type": "application/json" },
    }
  );
  return res.data.imageUrl;
}

export default {
  chatWithAI,
  detectMood,
  generateImage,
};