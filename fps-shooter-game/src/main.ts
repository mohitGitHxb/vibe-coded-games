import "./style.css";
import { Game } from "./game/Game.js";

// Clear the default Vite content
document.querySelector<HTMLDivElement>("#app")!.innerHTML = "";

// Initialize the game
const game = new Game();

// Start the game initialization
game.initialize().catch((error) => {
  console.error("Failed to start game:", error);
  document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
    <div style="text-align: center; padding: 50px; font-family: Arial, sans-serif;">
      <h1>Failed to Load Game</h1>
      <p>Please check console for details</p>
    </div>
  `;
});

// Cleanup on page unload
window.addEventListener("beforeunload", () => {
  game.destroy();
});
