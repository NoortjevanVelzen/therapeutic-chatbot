import React from "react";

function HomeScreen({ onStart }) {
  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>Welcome!</h1>
      <button onClick={onStart} style={{ fontSize: "2rem", padding: "1rem 2rem" }}>
        Start
      </button>
    </div>
  );
}

export default HomeScreen;