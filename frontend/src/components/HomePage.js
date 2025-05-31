// src/components/HomePage.js

import React from "react";

export default function HomePage({ onGetStarted }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "#f0f2f5",
        padding: "0 16px",         // Add some horizontal padding on small screens
        textAlign: "center",       // Center text for title/subtitle
      }}
    >
    
    {/* Chatbot Avatar Image (from public/chatbot-avatar.png) */}
      <img
        src="/chatbot-avatar.png"
        alt="Welcome"
        style={{
          width: 240,
          height: 240,
          borderRadius: "50%",          
          objectFit: "cover",            
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          marginBottom: "2rem",
        }}
      />

      {/* Title */}
      <h1
        style={{
          fontSize: "2rem",
          marginBottom: "0.5rem",
          color: "#333",
        }}
      >
        Therapeutic Chatbot
      </h1>

      {/* Subtitle */}
      <p
        style={{
          fontSize: "1.1rem",
          marginBottom: "2rem",
          color: "#555",
          maxWidth: 600,
          lineHeight: 1.4,
        }}
      >
        Tell me how you feel!
      </p>

      {/* “Get Started” Button */}
      <button
        onClick={onGetStarted}
        style={{
          background: "#4a90e2",
          color: "#fff",
          fontSize: 18,
          padding: "12px 24px",
          border: "none",
          borderRadius: 8,
          cursor: "pointer",
          boxShadow: "0 2px 6px rgba(0, 0, 0, 0.15)",
        }}
      >
        Get Started
      </button>
    </div>
  );
}
