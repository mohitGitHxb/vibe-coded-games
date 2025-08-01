import { type GameState } from "../utils/Types";
import { GAME_CONFIG } from "../utils/Constants";

export class HUD {
  private hudElement!: HTMLDivElement;
  private speedElement!: HTMLDivElement;
  private distanceElement!: HTMLDivElement;
  private livesElement!: HTMLDivElement;
  private scoreElement!: HTMLDivElement;
  private roadInfoElement!: HTMLDivElement;
  private trafficInfoElement!: HTMLDivElement;
  private activeEffectsElement!: HTMLDivElement;

  constructor() {
    this.createHUD();
  }

  private createHUD(): void {
    // Create main HUD container
    this.hudElement = document.createElement("div");
    this.hudElement.id = "hud";
    this.hudElement.style.cssText = `
      position: fixed;
      top: 20px;
      left: 20px;
      color: white;
      font-family: 'Courier New', monospace;
      font-size: 18px;
      font-weight: bold;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
      z-index: 1000;
      pointer-events: none;
    `;

    // Speed display
    this.speedElement = document.createElement("div");
    this.speedElement.style.marginBottom = "10px";

    // Distance display
    this.distanceElement = document.createElement("div");
    this.distanceElement.style.marginBottom = "10px";

    // Lives display
    this.livesElement = document.createElement("div");
    this.livesElement.style.marginBottom = "10px";

    // Score display
    this.scoreElement = document.createElement("div");
    this.scoreElement.style.marginBottom = "10px";

    // Road info display
    this.roadInfoElement = document.createElement("div");
    this.roadInfoElement.style.marginBottom = "10px";
    this.roadInfoElement.style.fontSize = "16px";

    // Traffic info display
    this.trafficInfoElement = document.createElement("div");
    this.trafficInfoElement.style.marginBottom = "10px";
    this.trafficInfoElement.style.fontSize = "16px";

    // Active effects display
    this.activeEffectsElement = document.createElement("div");
    this.activeEffectsElement.style.marginBottom = "10px";
    this.activeEffectsElement.style.fontSize = "14px";
    this.activeEffectsElement.style.color = "#ffff00";

    // Assemble HUD
    this.hudElement.appendChild(this.speedElement);
    this.hudElement.appendChild(this.distanceElement);
    this.hudElement.appendChild(this.livesElement);
    this.hudElement.appendChild(this.scoreElement);
    this.hudElement.appendChild(this.roadInfoElement);
    this.hudElement.appendChild(this.trafficInfoElement);
    this.hudElement.appendChild(this.activeEffectsElement);

    // Add to DOM
    document.body.appendChild(this.hudElement);
  }

  public update(gameState: GameState): void {
    // Convert speed from m/s to km/h for display
    const speedKmh = Math.round(gameState.speed * 3.6);
    this.speedElement.textContent = `SPEED: ${speedKmh} KM/H`;

    // Display distance in kilometers
    const distanceKm = (gameState.distance / 1000).toFixed(1);
    this.distanceElement.textContent = `DISTANCE: ${distanceKm} KM`;

    // Display lives with color coding
    this.livesElement.textContent = `LIVES: ${gameState.lives}`;
    if (gameState.lives <= 1) {
      this.livesElement.style.color = "#ff4444"; // Red when low
    } else if (gameState.lives <= 2) {
      this.livesElement.style.color = "#ffff44"; // Yellow when medium
    } else {
      this.livesElement.style.color = "#ffffff"; // White when safe
    }

    // Display score with multiplier
    let scoreText = `SCORE: ${gameState.score.toLocaleString()}`;
    if (
      gameState.currentScoreMultiplier &&
      gameState.currentScoreMultiplier > 1
    ) {
      scoreText += ` (${gameState.currentScoreMultiplier}x)`;
    }
    this.scoreElement.textContent = scoreText;

    // Display road information
    if (gameState.isInTransition) {
      const progress = Math.round(gameState.transitionProgress * 100);
      this.roadInfoElement.textContent = `ROAD: ${gameState.currentLanes} → ${gameState.nextLanes} LANES (${progress}%)`;
      this.roadInfoElement.style.color = "#ffff00"; // Yellow during transition

      // Add blinking effect during transition
      if (progress < 50) {
        this.roadInfoElement.style.opacity =
          Math.sin(Date.now() * 0.01) > 0 ? "1" : "0.5";
      } else {
        this.roadInfoElement.style.opacity = "1";
      }
    } else {
      this.roadInfoElement.textContent = `ROAD: ${gameState.currentLanes} LANES`;
      this.roadInfoElement.style.color = "#ffffff"; // White when stable
      this.roadInfoElement.style.opacity = "1";
    }

    // Display traffic information
    const densityPercent = Math.round(gameState.trafficDensity * 100);
    this.trafficInfoElement.textContent = `TRAFFIC: ${densityPercent}%`;

    // Color code traffic density
    if (densityPercent >= 80) {
      this.trafficInfoElement.style.color = "#ff4444"; // Red - heavy traffic
    } else if (densityPercent >= 50) {
      this.trafficInfoElement.style.color = "#ffff44"; // Yellow - moderate traffic
    } else {
      this.trafficInfoElement.style.color = "#44ff44"; // Green - light traffic
    }

    // Display active effects
    this.updateActiveEffectsDisplay(gameState);
  }

  private updateActiveEffectsDisplay(gameState: GameState): void {
    const effects: string[] = [];

    // Safety check - ensure activeEffects exists
    if (!gameState.activeEffects) {
      this.activeEffectsElement.textContent = "";
      this.activeEffectsElement.style.opacity = "0";
      return;
    }

    if (gameState.activeEffects.speedBoost?.active) {
      const timeLeft = Math.ceil(
        gameState.activeEffects.speedBoost.timeRemaining
      );
      effects.push(`🚀 SPEED BOOST: ${timeLeft}s`);
    }

    if (gameState.activeEffects.invincibility?.active) {
      const timeLeft = Math.ceil(
        gameState.activeEffects.invincibility.timeRemaining
      );
      effects.push(`🛡️ INVINCIBLE: ${timeLeft}s`);
    }

    if (gameState.activeEffects.scoreMultiplier?.active) {
      const timeLeft = Math.ceil(
        gameState.activeEffects.scoreMultiplier.timeRemaining
      );
      const multiplier = gameState.activeEffects.scoreMultiplier.multiplier;
      effects.push(`💰 SCORE ${multiplier}X: ${timeLeft}s`);
    }

    this.activeEffectsElement.textContent = effects.join(" | ");

    // Add blinking effect for active effects
    if (effects.length > 0) {
      this.activeEffectsElement.style.opacity =
        Math.sin(Date.now() * 0.005) > 0 ? "1" : "0.7";
    } else {
      this.activeEffectsElement.style.opacity = "0";
    }
  }

  public showInstructions(): void {
    const instructionsElement = document.createElement("div");
    instructionsElement.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: white;
      font-family: 'Courier New', monospace;
      font-size: 24px;
      text-align: center;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
      z-index: 1001;
      background: rgba(0,0,0,0.7);
      padding: 20px;
      border-radius: 10px;
    `;
    instructionsElement.innerHTML = `
      <h2>ENDLESS ROAD FIGHTER</h2>
      <p>Use <strong>A/D</strong> or <strong>←/→</strong> to steer</p>
      <p>Avoid traffic and collect power-ups!</p>
      <p>🔵 Speed Boost • 🟡 Invincibility • 🟣 Score Multiplier</p>
      <p>Survive as long as possible!</p>
      <p><small>Press any key to start</small></p>
    `;
    instructionsElement.id = "instructions";

    document.body.appendChild(instructionsElement);

    // Remove instructions on any key press
    const removeInstructions = () => {
      const element = document.getElementById("instructions");
      if (element) {
        element.remove();
      }
      window.removeEventListener("keydown", removeInstructions);
    };

    window.addEventListener("keydown", removeInstructions);
  }

  public showGameOver(gameState: GameState): void {
    const gameOverElement = document.createElement("div");
    gameOverElement.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: white;
      font-family: 'Courier New', monospace;
      font-size: 24px;
      text-align: center;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
      z-index: 1001;
      background: rgba(0,0,0,0.8);
      padding: 30px;
      border-radius: 10px;
      border: 2px solid #ff4444;
    `;

    const distanceKm = (gameState.distance / 1000).toFixed(1);
    const speedKmh = Math.round(gameState.speed * 3.6);

    gameOverElement.innerHTML = `
      <h2 style="color: #ff4444; margin-bottom: 20px;">GAME OVER</h2>
      <p>Final Score: <strong>${gameState.score.toLocaleString()}</strong></p>
      <p>Distance: <strong>${distanceKm} KM</strong></p>
      <p>Top Speed: <strong>${speedKmh} KM/H</strong></p>
      <p style="margin-top: 20px;"><small>Press <strong>R</strong> to restart</small></p>
    `;
    gameOverElement.id = "gameOver";

    document.body.appendChild(gameOverElement);
  }

  public dispose(): void {
    if (this.hudElement && this.hudElement.parentNode) {
      this.hudElement.parentNode.removeChild(this.hudElement);
    }

    // Remove any game over screens
    const gameOverElement = document.getElementById("gameOver");
    if (gameOverElement) {
      gameOverElement.remove();
    }
  }
}
