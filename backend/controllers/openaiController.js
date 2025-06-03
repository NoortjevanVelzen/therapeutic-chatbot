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
    // If there are no user messages, immediately return "neutral"
    if (!Array.isArray(userMessages) || userMessages.length === 0) {
      return res.json({ mood: "neutral" });
    }

    // 1) Define exactly which single‐word moods are allowed
    const validMoods = ['happy', 'sad', ' excited', 'hopeful', 'anxious', 'calm', 'angry', 'bored', 'stressed', 'frustrated', 'worried', 'content', 'overwhelmed', 'joyful', 'lonely', 'relaxed', 'irritable', 'enthusiastic', 'fearful', 'nostalgic', 'inspired', 'embarrassed', 'proud', 'disappointed', 'determined', 'confused', 'affectionate', 'resentful', 'cheerful', 'envious', 'peaceful', 'guilty', 'surprised', 'grateful', 'ashamed', 'affectionate', 'apprehensive', 'optimistic', 'pessimistic', 'insecure', 'curious', 'relieved', 'overwhelmed', 'affectionate', 'vindictive', 'remorseful', 'optimistic', 'apprehensive'];

    // 2) Build a system prompt that tells GPT to pick ONE of those words
    const prompt = [
      {
        role: "system",
        content: `You are a mood detection assistant. The only valid outputs are exactly one of the following words (no extras, no apologies, no sentences): ${validMoods
          .map((m) => `"${m}"`)
          .join(", ")}. If the user’s message does not clearly map to one of those, respond with "neutral".`
      },
      // 3) Append only the user‐role messages, not any assistant lines
      ...userMessages
        .filter((msg) => msg.role === "user" && typeof msg.content === "string")
        .map((msg) => ({ role: "user", content: msg.content }))
    ];

    // 4) Call OpenAI with that very explicit prompt
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: prompt
    });

    // 5) Clean up what GPT returned (lowercase, strip non-letters)
    let mood = completion.choices[0].message.content.trim().toLowerCase() || "neutral";
    mood = mood.replace(/[^a-z]/gi, "");

    // 6) If GPT somehow returns something that isn’t in our list, fallback on "neutral"
    if (!validMoods.includes(mood)) {
      mood = "neutral";
    }

    // 7) Send back exactly one valid word
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

    const uploadStream = cloudinary.uploader.upload_stream(
      { resource_type: "image" },
      (err, result) => {
        if (err) {
          console.error("Cloudinary upload error:", err); // ← add this
          return res.status(500).json({ error: "Upload to Cloudinary failed", details: err.message });
        }
        res.json({ imageUrl: result.secure_url });
      }
    );

    const readableStream = new stream.PassThrough();
    readableStream.end(buffer);
    readableStream.pipe(uploadStream);
  } catch (error) {
    handleOpenAIError(res, error, "generate-image");
  }
});

module.exports = router;
