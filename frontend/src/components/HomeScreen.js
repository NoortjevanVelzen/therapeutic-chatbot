import React from "react";
import styles from "./HomeScreen.module.css";

function HomeScreen({ onStart }) {
  return (
    <div className={styles.homeContainer}>
      <img
        src="/chatbot-avatar.png"
        alt="Chatbot Avatar"
        className={styles.avatar}
      />
      <h1 className={styles.title}>Therapeutic Chatbot</h1>
      <p className={styles.subtitle}>Tell me how you feel!</p>
      <button onClick={onStart} className={styles.startButton}>
        Get Started
      </button>
    </div>
  );
}

export default HomeScreen;
