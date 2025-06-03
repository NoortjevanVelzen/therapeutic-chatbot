// src/index.js (or wherever you do ReactDOM.render)

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { MoodProvider } from "./contexts/MoodContext";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  // Now every component under <App> can use the mood context
  <MoodProvider>
    <App />
  </MoodProvider>
);
