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
    console.error(`OpenAI API error (${context}):`, error.status, error.message);
    res.status(500).json({ error: 'OpenAI API error', details: error.message });
  } else {
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

// Mood extraction endpoint (supports any mood)
app.post('/api/mood', async (req, res) => {
  try {
    const { userMessages } = req.body;
    if (!userMessages || !Array.isArray(userMessages) || userMessages.length === 0) {
      return res.json({ mood: "passive" });
    }
    const moodPrompt = [
  {
    role: 'system',
    content:
      "You are a specialized mood‐detection assistant.  Given only the USER’s messages from a conversation, choose exactly one word (from the list below) that best describes their overall emotional state.  Do NOT add any extra words—reply with just that single word.Here is the list of allowed emotions (choose exactly one):happy, sad, excited, hopeful, anxious, calm, angry, bored, stressed, frustrated, worried, content, overwhelmed, joyful, lonely, relaxed, irritable, enthusiastic, fearful, nostalgic, inspired, embarrassed, proud, disappointed, determined, confused, affectionate, resentful, cheerful, envious, peaceful, guilty, surprised, grateful, ashamed, affectionate, apprehensive, optimistic, pessimistic, insecure, curious, relieved, overwhelmed, affectionate, vindictive, remorseful, optimistic, apprehensive. For example: • If the user says “I’m really stressed about my exam tomorrow,” reply with **stressed**. • If the user says “I just got a promotion and feel great!”, reply with **excited**. • If the user says “I have no idea what’s happening,” reply with **confused**. Now examine only the array of user messages, and choose one word from the list above. Reply with exactly that word (lowercase).",
  },
  ...userMessages
    .filter(
      (msg) =>
        msg &&
        typeof msg === "object" &&
        msg.role === "user" &&
        typeof msg.content === "string" &&
        msg.content.trim() !== ""
    )
    .map((msg) => ({
      role: "user",
      content: msg.content,
    })),
];
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: moodPrompt,
    });
    let mood = completion.choices[0]?.message?.content?.trim().toLowerCase() || "neutral";
    // Remove punctuation, just in case
    mood = mood.replace(/[^a-zA-Z]/g, "");
    console.log("OpenAI returned mood:", mood);
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
      size: '1024x1024',
      model: 'dall-e-3'
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