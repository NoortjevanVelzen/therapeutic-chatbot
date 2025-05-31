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

    // Validate that userMessages is a non-empty array of objects each having a .content string
    if (
      !Array.isArray(userMessages) ||
      userMessages.length === 0 ||
      typeof userMessages[userMessages.length - 1].content !== "string"
    ) {
      return res
        .status(400)
        .json({ error: "Missing or invalid `userMessages` in request body." });
    }

    // Build a prompt that includes a list of 100 common emotions:
    const emotionList = [
      "admiration", "adoration", "affection", "agitation", "agony", "alarm",
      "amazement", "amusement", "anger", "anguish", "annoyance", "anxiety",
      "apprehension", "arousal", "astonishment", "awe", "aversion", "awfulness",
      "boredom", "calmness", "cautiousness", "cheerfulness", "compassion",
      "confidence", "confusion", "contempt", "contentment", "courage", "covetousness",
      "craving", "cruelty", "curiosity", "delight", "despair", "desire", "despondency",
      "desperation", "disappointment", "disgust", "disillusionment", "disquiet",
      "doubt", "ecstasy", "embarrassment", "empathy", "enmity", "envy", "euphoria",
      "exasperation", "excitement", "fear", "fondness", "forgiveness", "fright",
      "frustration", "generosity", "gentleness", "guilt", "happiness", "hatred",
      "hope", "horror", "hostility", "humiliation", "hurt", "impatience",
      "indifference", "infatuation", "insecurity", "insult", "interest", "irritation",
      "jealousy", "joy", "kindness", "loneliness", "love", "lust", "melancholy",
      "misery", "nostalgia", "optimism", "panic", "passion", "pity", "pleasure",
      "pride", "rage", "regret", "relief", "remorse", "resentment", "sadness",
      "satisfaction", "scorn", "self-pity", "serenity", "shock", "shame", "sorrow",
      "sympathy", "tenderness", "terror", "thankfulness", "trust", "wonder", "worry"
    ];

    // Construct the system message, embedding the list of 100 emotions:
    const systemMessage = {
      role: "system",
      content:
        `You are a mood detection assistant. Given only the USER's messages from a conversation, determine the user's overall mood. ` +
        `Below is a list of 100 common emotion words. Choose exactly one word from this list (no synonyms, no extra words) that best matches the user's overall emotional state. ` +
        `Reply with that single emotion word only (lowercase). The 100 emotions are:\n\n` +
        emotionList.join(", ") +
        "."
    };

    // Turn each user message into a “user” role entry:
    const promptMessages = [
      systemMessage,
      ...userMessages.map((msg) => ({
        role: "user",
        content: msg.content
      }))
    ];

    // Ask OpenAI to classify the userMessages into one of the above 100 emotions:
    const rawMood = await openaiChat(promptMessages);
    const mood = rawMood.trim().toLowerCase();

    // If GPT returns something not in our list, fallback to “neutral”:
    if (!emotionList.includes(mood)) {
      return res.json({ mood: "neutral" });
    }

    return res.json({ mood });
  } catch (error) {
    console.error(
      "OpenAI Mood API error:",
      error?.response?.data || error.message
    );
    res
      .status(500)
      .json({
        error: "OpenAI Mood API error",
        details: error?.response?.data || error.message
      });
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