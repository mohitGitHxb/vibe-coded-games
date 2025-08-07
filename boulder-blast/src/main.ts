import "./style.css";
import { AsteroidBlast } from "./AsteroidBlast";

// Initialize the game when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  // Get or create canvas element
  let canvas = document.querySelector("canvas") as HTMLCanvasElement;

  if (!canvas) {
    canvas = document.createElement("canvas");
    const app = document.querySelector("#app");
    if (app) {
      app.appendChild(canvas);
    } else {
      document.body.appendChild(canvas);
    }
  }

  // Create and start the game
  const game = new AsteroidBlast(canvas);
  game.startGame();

  // Cleanup on page unload
  window.addEventListener("beforeunload", () => {
    game.dispose();
  });
});
