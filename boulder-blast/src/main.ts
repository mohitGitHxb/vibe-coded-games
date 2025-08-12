import "./style.css";
import { AsteroidBlast } from "./AsteroidBlast";

// Initialize the game when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  // Get or create canvas element
  let canvas = document.querySelector("canvas") as HTMLCanvasElement;

  if (!canvas) {
    canvas = document.createElement("canvas");

    // iOS-specific canvas configuration to prevent white patches
    const isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

    if (isIOS) {
      // Explicit canvas styling for iOS
      canvas.style.backgroundColor = "#000811";
      canvas.style.display = "block";
      canvas.style.touchAction = "none";
      (canvas.style as any).webkitTouchCallout = "none";
    }

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
