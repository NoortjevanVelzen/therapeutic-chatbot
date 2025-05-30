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

  useEffect(() => {
    async function fetchImages() {
      setLoading(true);
      const prompt = moodPrompts[mood] || moodPrompts["neutral"];
      try {
        const response = await axios.post(`${BACKEND_URL}/api/generate-image`, {
          prompt,
        });
        setImages(response.data.images);
      } catch (e) {
        setImages([]);
      }
      setLoading(false);
    }
    fetchImages();
  }, [mood]);

  return (
    <div style={{ maxWidth: 700, margin: "50px auto", textAlign: "center" }}>
      <h2>Here's your mood feed!</h2>
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
          {images.map((img, idx) => (
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
          ))}
        </div>
      )}
    </div>
  );
}

export default SocialMediaScreen;