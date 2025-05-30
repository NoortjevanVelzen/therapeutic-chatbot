import React from "react";

// Mock images for each mood
const moodImages = {
  happy: [
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80",
  ],
  sad: [
    "https://images.unsplash.com/photo-1465101178521-c1a9136a3c8b?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=400&q=80",
  ],
  excited: [
    "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&w=400&q=80",
  ],
  neutral: [
    "https://images.unsplash.com/photo-1519985176271-adb1088fa94c?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=400&q=80",
  ],
};

function SocialMediaScreen({ mood }) {
  const images = moodImages[mood] || moodImages["neutral"];

  return (
    <div style={{ maxWidth: 700, margin: "50px auto", textAlign: "center" }}>
      <h2>Here's your mood feed!</h2>
      <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 20 }}>
        {images.map((img, idx) => (
          <div key={idx} style={{ border: "1px solid #ddd", borderRadius: 10, padding: 10 }}>
            <img src={img} alt={`mood img ${idx}`} style={{ width: 200, height: 200, objectFit: "cover", borderRadius: 10 }} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default SocialMediaScreen;