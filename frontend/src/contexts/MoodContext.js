// src/contexts/MoodContext.js

import React, { createContext, useState, useContext } from "react";

// 1) Create the context object
const MoodContext = createContext();

// 2) Create a provider component
export function MoodProvider({ children }) {
  // Initialize mood to "neutral" by default
  const [mood, setMood] = useState("neutral");
  return (
    <MoodContext.Provider value={{ mood, setMood }}>
      {children}
    </MoodContext.Provider>
  );
}

// 3) Export a custom hook for easy consumption
export function useMood() {
  const context = useContext(MoodContext);
  if (context === undefined) {
    throw new Error("useMood must be used within a MoodProvider");
  }
  return context; // { mood, setMood }
}
