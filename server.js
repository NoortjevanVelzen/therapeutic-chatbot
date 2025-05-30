const express = require('express');
const axios = require('axios');
const cors = require('cors');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

// POST /api/chat
app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );
    res.json({ reply: response.data.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ error: 'OpenAI Chat API error' });
  }
});

// POST /api/mood
app.post('/api/mood', async (req, res) => {
  try {
    const { userMessages } = req.body;
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

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: moodPrompt,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );
    res.json({ mood: response.data.choices[0].message.content.trim().toLowerCase() });
  } catch (error) {
    res.status(500).json({ error: 'OpenAI Mood API error' });
  }
});

// POST /api/generate-image
app.post('/api/generate-image', async (req, res) => {
  try {
    const { prompt } = req.body;
    const response = await axios.post(
      'https://api.openai.com/v1/images/generations',
      {
        model: 'dall-e-3', // Or 'dall-e-2'
        prompt,
        n: 2,
        size: '512x512',
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );
    res.json({ images: response.data.data.map((img) => img.url) });
  } catch (error) {
    res.status(500).json({ error: 'OpenAI Image API error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});