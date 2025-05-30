# OpenAI Backend API

A simple Express backend to handle OpenAI chat, mood analysis, and image generation for your React app.

## Features

- `/api/chat` — Chatbot endpoint
- `/api/mood` — Mood extraction from user messages
- `/api/generate-image` — Generate images with DALL·E

## Setup

1. Create a `.env` file with your OpenAI API key: OPENAI_API_KEY=sk-your_openai_api_key_here PORT=5000
2. Install dependencies: npm install
3. Start the server: npm run dev or npm start

## Endpoints

- **POST** `/api/chat`  
  Body: `{ messages: [...] }`  
  Returns: `{ reply: "..." }`

- **POST** `/api/mood`  
  Body: `{ userMessages: [...] }`  
  Returns: `{ mood: "happy" }`

- **POST** `/api/generate-image`  
  Body: `{ prompt: "..." }`  
  Returns: `{ images: ["url1", "url2"] }`

Instructions:

1. Copy all files into a folder named backend.
2. Fill in your real OpenAI API key in .env.
3. Run npm install inside that folder.
4. Start your backend with npm run dev (for auto-reload) or npm start.
