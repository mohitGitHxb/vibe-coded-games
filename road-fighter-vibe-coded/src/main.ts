// ...existing imports...

import { GameEngine } from "./core/GameEngine";

async function initGame() {
  try {
    const gameContainer = document.getElementById("gameContainer");
    const uiContainer = document.getElementById("ui");

    if (!gameContainer || !uiContainer) {
      throw new Error("Required DOM elements not found");
    }

    // Create click-to-start overlay for audio activation
    const startOverlay = document.createElement("div");
    startOverlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.9);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      z-index: 10000;
      color: white;
      font-family: 'Courier New', monospace;
      text-align: center;
    `;

    startOverlay.innerHTML = `
      <h1 style="font-size: 48px; color: #00ff00; margin-bottom: 20px; text-shadow: 0 0 20px #00ff00;">
        🏁 ROAD FIGHTER 🏁
      </h1>
      <p style="font-size: 24px; margin-bottom: 40px;">
        High-speed racing with attitude!
      </p>
      <button id="start-game" style="
        font-size: 32px;
        padding: 20px 40px;
        background: linear-gradient(45deg, #ff0000, #ff6600);
        color: white;
        border: none;
        border-radius: 10px;
        cursor: pointer;
        font-family: 'Courier New', monospace;
        font-weight: bold;
        box-shadow: 0 0 30px rgba(255, 0, 0, 0.5);
        transition: all 0.3s ease;
      ">
        🚗 START ENGINES 🚗
      </button>
      <p style="font-size: 16px; margin-top: 30px; opacity: 0.7;">
        Use ARROW KEYS or WASD to steer • Avoid traffic • Reach checkpoints in time!
      </p>
    `;

    document.body.appendChild(startOverlay);

    // Add hover effect
    const startButton = document.getElementById("start-game")!;
    startButton.addEventListener("mouseenter", () => {
      startButton.style.transform = "scale(1.1)";
      startButton.style.boxShadow = "0 0 40px rgba(255, 0, 0, 0.8)";
    });

    startButton.addEventListener("mouseleave", () => {
      startButton.style.transform = "scale(1)";
      startButton.style.boxShadow = "0 0 30px rgba(255, 0, 0, 0.5)";
    });

    // Initialize game engine
    const gameEngine = new GameEngine(gameContainer, uiContainer);

    // Start game on button click
    startButton.addEventListener("click", () => {
      document.body.removeChild(startOverlay);
      gameEngine.start();
    });
  } catch (error) {
    console.error("Failed to initialize game:", error);
  }
}

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initGame);
} else {
  initGame();
}
