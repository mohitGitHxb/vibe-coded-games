import "./style.css";
import { Game } from "./core/Game";

// Initialize the game
const game = new Game();

// Start the game
game.init().then(() => {
  game.start();
});

// Handle window resize
window.addEventListener("resize", () => {
  game.resize();
});

// Clean up on page unload
window.addEventListener("beforeunload", () => {
  game.dispose();
});
