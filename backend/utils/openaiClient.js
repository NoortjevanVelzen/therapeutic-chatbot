const axios = require('axios');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Handles both chat and mood
exports.openaiChat = async (messages) => {
  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: 'gpt-4',
      messages,
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
    }
  );
  return response.data.choices[0].message.content;
};

// Handles image generation
exports.openaiImage = async (prompt) => {
  const response = await axios.post(
    'https://api.openai.com/v1/images/generations',
    {
      model: 'dall-e-2',
      prompt,
      n: 1,
      size: '512x512',
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
    }
  );
  return response.data.data.map((img) => img.url);
};