// openaiController.js

const express = require("express");
const router = express.Router();
const axios = require("axios");
const stream = require("stream");
const cloudinary = require("cloudinary").v2;
const OpenAI = require("openai");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

function handleOpenAIError(res, error, context = "") {
  console.error(`OpenAI API error (${context}):`, error?.message || error);
  res.status(500).json({ error: "OpenAI API error", details: error?.message || "Unknown error" });
}

// Chat endpoint
router.post("/chat", async (req, res) => {
  try {
    const { messages } = req.body;
    if (!Array.isArray(messages)) return res.status(400).json({ error: "Messages must be an array." });

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages
    });
    const reply = completion.choices[0]?.message?.content || "";
    res.json({ reply });
  } catch (error) {
    handleOpenAIError(res, error, "chat");
  }
});

// Mood detection endpoint
router.post("/mood", async (req, res) => {
  try {
    const { userMessages } = req.body;
    if (!Array.isArray(userMessages) || userMessages.length === 0) return res.json({ mood: "neutral" });

    const prompt = [
      {
        role: "system",
        content: `You are a mood detection assistant. Pick one mood from the list and respond only with that mood.`
      },
      ...userMessages.filter(msg => msg?.role === "user" && typeof msg.content === "string").map(msg => ({
        role: "user",
        content: msg.content
      }))
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: prompt
    });

    let mood = completion.choices[0]?.message?.content?.trim().toLowerCase() || "neutral";
    mood = mood.replace(/[^a-z]/gi, "");
    res.json({ mood });
  } catch (error) {
    handleOpenAIError(res, error, "mood");
  }
});

// Image generation + Cloudinary upload
router.post("/generate-image", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (typeof prompt !== "string") return res.status(400).json({ error: "Prompt must be a string." });

    const response = await openai.images.generate({
      prompt,
      n: 1,
      size: "1024x1024",
      model: "dall-e-3"
    });

    const imageUrl = response.data[0].url;
    const imageRes = await axios.get(imageUrl, { responseType: "arraybuffer" });
    const buffer = Buffer.from(imageRes.data, "binary");

    const uploadStream = cloudinary.uploader.upload_stream({ resource_type: "image" }, (err, result) => {
      if (err) return res.status(500).json({ error: "Upload to Cloudinary failed" });
      res.json({ imageUrl: result.secure_url });
    });

    const readableStream = new stream.PassThrough();
    readableStream.end(buffer);
    readableStream.pipe(uploadStream);
  } catch (error) {
    handleOpenAIError(res, error, "generate-image");
  }
});

module.exports = router;
