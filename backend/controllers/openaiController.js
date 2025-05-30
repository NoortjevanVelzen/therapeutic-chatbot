const { openaiChat, openaiImage } = require('../utils/openaiClient');

// Chat endpoint
exports.chatWithOpenAI = async (req, res) => {
  try {
    const { messages } = req.body;
    const reply = await openaiChat(messages);
    res.json({ reply });
  } catch (error) {
    console.error('OpenAI Chat API error:', error?.response?.data || error.message);
    res.status(500).json({ error: 'OpenAI Chat API error', details: error?.response?.data || error.message });
  }
};

// Mood extraction endpoint
exports.extractMood = async (req, res) => {
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
    const mood = await openaiChat(moodPrompt);
    res.json({ mood: mood.trim().toLowerCase() });
  } catch (error) {
    console.error('OpenAI Mood API error:', error?.response?.data || error.message);
    res.status(500).json({ error: 'OpenAI Mood API error', details: error?.response?.data || error.message });
  }
};

// Image generation endpoint
exports.generateImage = async (req, res) => {
  try {
    const { prompt } = req.body;
    const images = await openaiImage(prompt);
    res.json({ images });
  } catch (error) {
    console.error('OpenAI Image API error:', error?.response?.data || error.message);
    res.status(500).json({ error: 'OpenAI Image API error', details: error?.response?.data || error.message });
  }
};