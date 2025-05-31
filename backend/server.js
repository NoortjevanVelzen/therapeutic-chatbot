const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// --- OpenAI v4+ Initialization ---
const OpenAI = require('openai');
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Helper: Standard API error handler
function handleOpenAIError(res, error, context = "") {
  if (error.status) {
    // OpenAI error with HTTP response
    console.error(`OpenAI API error (${context}):`, error.status, error.message);
    res.status(500).json({ error: 'OpenAI API error', details: error.message });
  } else {
    // Network or other error
    console.error(`OpenAI API error (${context}):`, error.message);
    res.status(500).json({ error: 'OpenAI API error', details: error.message });
  }
}

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid input: messages must be an array.' });
    }
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages,
    });
    const reply = completion.choices[0]?.message?.content || "";
    res.json({ reply });
  } catch (error) {
    handleOpenAIError(res, error, "chat");
  }
});

// Mood extraction endpoint
app.post('/api/mood', async (req, res) => {
  try {
    const { userMessages } = req.body;
    if (!userMessages || !Array.isArray(userMessages)) {
      return res.status(400).json({ error: 'Invalid input: userMessages must be an array.' });
    }
    const moodPrompt = [
      {
        role: 'system',
        content:
          "You are a mood detection assistant. Given only the USER's messages from a conversation, determine the user's overall mood. Reply with a single word: happy, sad, excited, or neutral.",
      },
      ...userMessages.map((msg) => ({
        role: 'user',
        content: msg.content,
      })),
    ];
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: moodPrompt,
    });
    const mood = completion.choices[0]?.message?.content?.trim().toLowerCase() || "neutral";
    res.json({ mood });
  } catch (error) {
    handleOpenAIError(res, error, "mood");
  }
});

// Image generation endpoint
app.post('/api/generate-image', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: 'Invalid input: prompt must be a string.' });
    }
    const response = await openai.images.generate({
      prompt,
      n: 1,
      size: '512x512',
      model: 'dall-e-2'
    });
    const images = response.data.map(img => img.url);
    res.json({ images });
  } catch (error) {
    handleOpenAIError(res, error, "generate-image");
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  if (!process.env.OPENAI_API_KEY) {
    console.error("WARNING: OPENAI_API_KEY is not set! The API will not work.");
  }
  console.log(`OpenAI backend running on port ${PORT}`);
});
