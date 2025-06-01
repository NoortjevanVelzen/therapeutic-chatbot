import React from "react";

function HomeScreen({ onStart }) {
  return (
    <div
      style={{
        textAlign: "center",
        marginTop: "100px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "0 16px",
      }}
    >
      <img
        src="/chatbot-avatar.png"
        alt="Chatbot Avatar"
        style={{
          width: 200,
          height: 200,
          borderRadius: "50%",
          objectFit: "cover",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          marginBottom: "2rem",
        }}
      />
      <h1 style={{ fontSize: "2rem", color: "#333", marginBottom: "0.5rem" }}>
        Therapeutic Chatbot
      </h1>
      <p style={{ fontSize: "1.1rem", color: "#555", marginBottom: "2rem" }}>
        Tell me how you feel!
      </p>
      <button
        onClick={onStart}
        style={{
          backgroundColor: "#4a90e2",
          color: "white",
          fontSize: "1.2rem",
          padding: "12px 24px",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          boxShadow: "0 2px 6px rgba(0, 0, 0, 0.15)",
        }}
      >
        Get Started
      </button>
    </div>
  );
}

export default HomeScreen;