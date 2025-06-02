// server.js

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

const openaiRoutes = require("./openaiController");

const app = express();

// ─── CORS SETUP ────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: [
      "http://localhost:3000",                 // React dev server
      "https://digital-detoxery.netlify.app"   // Your Netlify frontend
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

// ─── MIDDLEWARE ─────────────────────────────────────────────────────────────
app.use(express.json());

// ─── ROUTES ──────────────────────────────────────────────────────────────────
app.use("/api", openaiRoutes);

// Optional: Health check endpoint
app.get("/api/ping", (req, res) => {
  res.json({ pong: true });
});

// 404 fallback
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

// ─── START SERVER ───────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  if (!process.env.OPENAI_API_KEY) {
    console.error("WARNING: OPENAI_API_KEY is not set! The API will not work.");
  }
  console.log(`OpenAI backend running on port ${PORT}`);
});
