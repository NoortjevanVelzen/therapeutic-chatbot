import React, { useState, useEffect } from "react";
import axios from "axios";

const BACKEND_URL = "http://localhost:5000";

const moodPrompts = {
  happy: "A vibrant, colorful scene with sunshine and smiling people, digital art",
  sad: "A rainy day, blue tones, a person looking thoughtful, digital painting",
  excited: "A dynamic celebration with fireworks, bright lights, digital art",
  neutral: "A calm landscape with soft lighting and pastel colors, digital painting",
};

function SocialMediaScreen({ mood }) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchImages() {
      setLoading(true);
      setError(null);
      setImages([]);
      const prompt = moodPrompts[mood] || moodPrompts["neutral"];
      try {
        const response = await axios.post(`${BACKEND_URL}/api/generate-image`, {
          prompt,
        });
        setImages(response.data.images || []);
      } catch (e) {
        setImages([]);
        setError(
          e.response && e.response.data && e.response.data.error
            ? e.response.data.error
            : "Image generation failed."
        );
      }
      setLoading(false);
    }
    fetchImages();
  }, [mood]);

  return (
    <div style={{ maxWidth: 700, margin: "50px auto", textAlign: "center" }}>
      <h2>Here's your mood feed!</h2>
      {error && (
        <div style={{ color: "red", margin: 16 }}>{error}</div>
      )}
      {loading ? (
        <p>Generating images...</p>
      ) : (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: 20,
          }}
        >
          {images.length > 0 ? (
            images.map((img, idx) => (
              <div
                key={idx}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: 10,
                  padding: 10,
                }}
              >
                <img
                  src={img}
                  alt={`mood img ${idx}`}
                  style={{
                    width: 200,
                    height: 200,
                    objectFit: "cover",
                    borderRadius: 10,
                  }}
                />
              </div>
            ))
          ) : (
            <div style={{ color: "#666" }}>No images generated.</div>
          )}
        </div>
      )}
    </div>
  );
}

export default SocialMediaScreen;